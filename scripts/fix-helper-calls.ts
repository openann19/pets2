#!/usr/bin/env tsx
/**
 * Fix Helper Function Calls
 * Removes Theme parameter from helper function calls
 */

import fg from "fast-glob";
import * as fs from "node:fs";
import prettier from "prettier";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");

const patterns = [
  {
    regex: /getTextColor\(Theme,\s*'([^']+)'\)/g,
    replacement: "getTextColor('$1')",
  },
  {
    regex: /getBackgroundColor\(Theme,\s*'([^']+)'\)/g,
    replacement: "getBackgroundColor('$1')",
  },
  {
    regex: /getBorderColor\(Theme,\s*'([^']+)'\)/g,
    replacement: "getBorderColor('$1')",
  },
  {
    regex: /getPrimaryColor\(Theme,\s*(\d+)\)/g,
    replacement: "getPrimaryColor($1)",
  },
  {
    regex: /getSecondaryColor\(Theme,\s*(\d+)\)/g,
    replacement: "getSecondaryColor($1)",
  },
  {
    regex: /getNeutralColor\(Theme,\s*(\d+)\)/g,
    replacement: "getNeutralColor($1)",
  },
  {
    regex: /getStatusColor\(Theme,\s*'([^']+)'\)/g,
    replacement: "getStatusColor('$1')",
  },
  {
    regex: /createBorderStyle\(Theme,\s*'([^']+)',\s*(\d+)\)/g,
    replacement: "createBorderStyle('$1', $2)",
  },
  {
    regex: /createBorderStyle\(Theme,\s*'([^']+)'\)/g,
    replacement: "createBorderStyle('$1')",
  },
  {
    regex: /createTextStyle\(Theme,\s*'([^']+)'\)/g,
    replacement: "createTextStyle('$1')",
  },
  {
    regex: /createBackgroundStyle\(Theme,\s*'([^']+)'\)/g,
    replacement: "createBackgroundStyle('$1')",
  },
  {
    regex: /createShadowStyle\(Theme,\s*'([^']+)'\)/g,
    replacement: "createShadowStyle('$1')",
  },
];

async function formatFile(filePath: string, code: string) {
  const cfg = (await prettier.resolveConfig(process.cwd())) ?? {};
  return prettier.format(code, { ...cfg, filepath: filePath });
}

async function fixFile(filePath: string) {
  let code = fs.readFileSync(filePath, "utf8");
  let modified = false;

  for (const pattern of patterns) {
    if (pattern.regex.test(code)) {
      code = code.replace(pattern.regex, pattern.replacement);
      modified = true;
    }
  }

  if (modified) {
    if (WRITE) {
      const formatted = await formatFile(filePath, code).catch(() => code);
      fs.writeFileSync(filePath, formatted, "utf8");
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`📝 Would fix: ${filePath}`);
    }
  }

  return modified;
}

async function run() {
  const files = await fg(["apps/mobile/src/**/*.{ts,tsx}"], { absolute: true });
  let count = 0;

  for (const file of files) {
    const modified = await fixFile(file);
    if (modified) count++;
  }

  console.log(`\n🔧 Summary: ${count} files ${WRITE ? "fixed" : "would be fixed"}`);
  if (!WRITE) {
    console.log("💡 Run with --write to apply changes");
  }
}

run().catch(console.error);
