import fs from "fs/promises";
import path from "path";
import fg from "fast-glob";

type PerfBudget = {
  cold_start_ms: Record<string, number>;
  tti_ms: Record<string, number>;
  js_heap_mb: number;
  fps_drop_pct: number;
  bundle_js_kb: number;
  bundle_assets_kb: number;
  network_requests_count: number;
};

const MOBILE_SRC = path.join(process.cwd(), "src");
const REPORTS_DIR = path.join(process.cwd(), "../../reports");
const PERF_BUDGET_PATH = path.join(REPORTS_DIR, "perf_budget.json");
const DASHBOARD_PATH = path.join(REPORTS_DIR, "perf_dashboard.json");

const toKb = (bytes: number): number => Math.round((bytes / 1024) * 100) / 100;

async function readPerfBudget(): Promise<PerfBudget | null> {
  try {
    const raw = await fs.readFile(PERF_BUDGET_PATH, "utf-8");
    return JSON.parse(raw) as PerfBudget;
  } catch (error) {
    console.warn("⚠️  No perf budget file found, skipping budget comparison.");
    return null;
  }
}

async function computeScreens(): Promise<{ count: number; heavy: Array<{ file: string; lines: number }> }> {
  const screenFiles = await fg("screens/**/*.tsx", { cwd: MOBILE_SRC, absolute: true });

  const heavyScreens: Array<{ file: string; lines: number }> = [];

  await Promise.all(
    screenFiles.map(async (file) => {
      const contents = await fs.readFile(file, "utf-8");
      const lineCount = contents.split("\n").length;
      if (lineCount >= 400) {
        heavyScreens.push({ file: path.relative(MOBILE_SRC, file), lines: lineCount });
      }
    }),
  );

  heavyScreens.sort((a, b) => b.lines - a.lines);

  return {
    count: screenFiles.length,
    heavy: heavyScreens.slice(0, 8),
  };
}

async function computeBundleEstimate(): Promise<{ jsBytes: number; assetBytes: number }> {
  const codePatterns = ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"];
  const assetPatterns = ["assets/**/*.{png,jpg,jpeg,webp,gif,svg}"];

  const codeFiles = await fg(codePatterns, { cwd: MOBILE_SRC, absolute: true, dot: false });
  const assetFiles = await fg(assetPatterns, { cwd: MOBILE_SRC, absolute: true, dot: false });

  let jsBytes = 0;
  let assetBytes = 0;

  await Promise.all(
    codeFiles.map(async (file) => {
      const stat = await fs.stat(file);
      jsBytes += stat.size;
    }),
  );

  await Promise.all(
    assetFiles.map(async (file) => {
      const stat = await fs.stat(file);
      assetBytes += stat.size;
    }),
  );

  return { jsBytes, assetBytes };
}

async function computeAnimatedLists(): Promise<{ flatListCount: number; flashListCount: number }> {
  const files = await fg("**/*.{ts,tsx}", { cwd: MOBILE_SRC, absolute: true });

  let flatListCount = 0;
  let flashListCount = 0;

  await Promise.all(
    files.map(async (file) => {
      const contents = await fs.readFile(file, "utf-8");
      if (contents.includes("FlatList")) flatListCount += 1;
      if (contents.includes("FlashList")) flashListCount += 1;
    }),
  );

  return { flatListCount, flashListCount };
}

async function run() {
  const [screens, bundle, lists, perfBudget] = await Promise.all([
    computeScreens(),
    computeBundleEstimate(),
    computeAnimatedLists(),
    readPerfBudget(),
  ]);

  const dashboard = {
    generatedAt: new Date().toISOString(),
    screens: {
      total: screens.count,
      heavy: screens.heavy,
    },
    bundle: {
      jsKb: toKb(bundle.jsBytes),
      assetKb: toKb(bundle.assetBytes),
    },
    virtualization: lists,
    perfBudget,
  };

  await fs.mkdir(REPORTS_DIR, { recursive: true });
  await fs.writeFile(DASHBOARD_PATH, JSON.stringify(dashboard, null, 2));

  console.log("📊 Generated perf dashboard:");
  console.log(JSON.stringify(dashboard, null, 2));
}

run().catch((error) => {
  console.error("❌ Failed to generate perf dashboard", error);
  process.exitCode = 1;
});


