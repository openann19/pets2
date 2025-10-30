#!/usr/bin/env node
/**
 * fix-jsx-ext.mjs
 * -----------------------------------------------------------
 * Finds test files written as `.ts` that contain JSX and renames
 * them to `.tsx`. Creates a manifest for easy revert.
 *
 * Modes:
 *  - default (check): scan + report; exit 1 if fixes needed
 *  - --write        : perform renames and write manifest
 *  - --revert       : revert from last manifest
 *
 * Heuristics:
 *  - Targets only test files: *.test.ts, *.spec.ts, *.e2e.ts, __tests__/*.ts
 *  - JSX detection via robust regexes for tags/fragments/self-closing tags
 *  - Skips common junk dirs: node_modules, .git, dist, build, coverage, android, ios, .expo, .next, out
 */
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CWD = process.cwd();

const args = new Set(process.argv.slice(2));
const WRITE = args.has('--write');
const REVERT = args.has('--revert');

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage',
  'android', 'ios', '.expo', '.next', 'out', '.turbo', '.vercel'
]);

const REPORTS_DIR = path.join(CWD, 'reports');
const MANIFEST = path.join(REPORTS_DIR, 'fix-jsx-ext-renames.json');

function isCandidateTestFile(fp) {
  const bn = path.basename(fp);
  if (!bn.endsWith('.ts')) return false;                     // we only care about .ts
  if (!/\.(test|spec|e2e)\.ts$/.test(bn) && !/__tests__/.test(fp)) return false;
  return true;
}

// Best-effort JSX detector for TS:
//  - component tags: <View ...>, <MyComp>, <Foo.Bar>
//  - fragments: <> ... </>
//  - self-closing tags: <Xxx />
function looksLikeJSX(source) {
  // quick bail: angle bracket typical in generics? we'll try to filter a bit
  if (!source.includes('<')) return false;

  const tag = /<([A-Za-z][\w.\-]*)(\s[^<>]*?)?>[\s\S]*?<\/\1>/m; // <X ...>...</X>
  const selfClosing = /<([A-Za-z][\w.\-]*)(\s[^<>]*?)?\/>/m;     // <X ... />
  const fragment = /<>\s*[\s\S]*?\s*<\/>/m;                      // <>...</>
  const svgXml = /<svg[\s>]|<path[\s>]|<g[\s>]/m;                // common in tests too

  // Heuristic exclusions for TS generics like `<T>() => ...`:
  const genericFn = /<\s*[A-Z][A-Za-z0-9_,\s<>]*>\s*\(/m;

  if (genericFn.test(source)) {
    // not definitive, but keeps many FP low
    // still allow if we clearly see a closing tag or fragment
    return fragment.test(source) || tag.test(source) || selfClosing.test(source) || svgXml.test(source);
  }
  return fragment.test(source) || tag.test(source) || selfClosing.test(source) || svgXml.test(source);
}

async function walk(dir, acc = []) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const fp = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (IGNORE_DIRS.has(ent.name)) continue;
      await walk(fp, acc);
    } else if (ent.isFile()) {
      acc.push(fp);
    }
  }
  return acc;
}

async function loadManifest() {
  try {
    const raw = await fs.readFile(MANIFEST, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveManifest(entries) {
  await fs.mkdir(REPORTS_DIR, { recursive: true });
  const payload = {
    createdAt: new Date().toISOString(),
    cwd: CWD,
    renames: entries
  };
  await fs.writeFile(MANIFEST, JSON.stringify(payload, null, 2));
}

async function revertFromManifest() {
  const m = await loadManifest();
  if (!m || !Array.isArray(m.renames) || m.renames.length === 0) {
    console.error('No valid manifest found to revert:', MANIFEST);
    process.exit(1);
  }
  let reverted = 0, skipped = 0, failed = 0;
  for (const { from, to } of m.renames) {
    try {
      // revert means to <- from  (original .ts path is "to" in manifest)
      // We stored { from: oldPath (.ts), to: newPath (.tsx) }
      if (await exists(to)) {
        if (await exists(from)) {
          // conflict: both exist, skip
          console.warn('⚠️  Skip (conflict exists):', to, '->', from);
          skipped++;
        } else {
          await fs.rename(to, from);
          reverted++;
        }
      } else {
        console.warn('⚠️  Skip (missing current file):', to);
        skipped++;
      }
    } catch (e) {
      console.error('❌ Failed to revert', to, '->', from, e?.message);
      failed++;
    }
  }
  console.log(`\n↩️  Revert summary: reverted=${reverted} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

async function exists(fp) {
  try { await fs.access(fp); return true; } catch { return false; }
}

function toTsx(fp) {
  const parsed = path.parse(fp);
  return path.join(parsed.dir, parsed.name + '.tsx');
}

async function main() {
  if (REVERT) {
    return revertFromManifest();
  }

  const all = await walk(CWD);
  const candidates = all.filter(isCandidateTestFile);

  let scanned = 0, flagged = 0;
  const offenders = [];

  for (const fp of candidates) {
    scanned++;
    try {
      const buf = await fs.readFile(fp);
      const src = buf.toString('utf8');
      if (looksLikeJSX(src)) {
        flagged++;
        offenders.push(fp);
      }
    } catch (e) {
      console.warn('⚠️  Read failed (skipping):', fp, e?.message);
    }
  }

  if (!WRITE) {
    console.log('\n🔎 JSX-in-.ts Test Scan (dry run)\n--------------------------------');
    console.log('Repo:', CWD);
    console.log('Scanned test files:', scanned);
    console.log('Needs rename (.ts -> .tsx):', flagged);
    if (flagged) {
      console.log('\nFiles:');
      offenders.forEach(f => console.log('  -', path.relative(CWD, f)));
      console.log('\n💡 Run with --write to apply renames, or add to CI to block new offenders.');
      process.exit(1); // fail in check mode if there's work to do
    } else {
      console.log('\n✅ No JSX found in .ts test files. You are good.');
      return;
    }
  }

  // WRITE mode
  const renames = [];
  let done = 0, skipped = 0, failed = 0, conflicts = 0;

  for (const from of offenders) {
    const to = toTsx(from);
    try {
      if (await exists(to)) {
        console.warn('⚠️  Conflict (target exists), skipping:', path.relative(CWD, to));
        conflicts++; skipped++; continue;
      }
      await fs.rename(from, to);
      renames.push({ from, to });
      done++;
    } catch (e) {
      console.error('❌ Rename failed:', from, '->', to, e?.message);
      failed++;
    }
  }

  if (renames.length) {
    await saveManifest(renames);
  }

  console.log('\n✍️  JSX-in-.ts Test Fix (write mode)\n------------------------------------');
  console.log('Renamed:', done);
  console.log('Conflicts:', conflicts);
  console.log('Skipped:', skipped);
  console.log('Failed:', failed);
  console.log('Manifest:', renames.length ? MANIFEST : '—');

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});

