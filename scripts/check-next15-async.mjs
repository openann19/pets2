#!/usr/bin/env node
/**
 * Next 15 Async API Scanner
 * Reports lines where cookies()/headers()/draftMode() are used *without* `await`
 * (quick heuristic: same-line check, ignores imports and comments).
 *
 * Usage:
 *   node scripts/check-next15-async.mjs apps/web apps/admin
 *
 * Exit code:
 *   0 when clean, 1 when any suspicious usages are found.
 */
import { globby } from 'globby';
import fs from 'node:fs/promises';
import path from 'node:path';

const roots = process.argv.slice(2);
if (roots.length === 0) {
  console.log('Usage: node scripts/check-next15-async.mjs <paths...>');
  process.exit(0);
}

const exts = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs'];
const patterns = roots.map((r) => `${r.replace(/\/$/, '')}/**/*.{${exts.join(',')}}`);
const files = await globby(patterns, {
  gitignore: true,
  ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'],
});

const callRegexes = [
  { name: 'cookies()', re: /\bcookies\s*\(\s*\)/ },
  { name: 'headers()', re: /\bheaders\s*\(\s*\)/ },
  { name: 'draftMode()', re: /\bdraftMode\s*\(\s*\)/ },
];

const importLine = /^\s*import\s+.*from\s+['"]next\/headers['"]/;
const commentLine = /^\s*\/\/|^\s*\/\*|^\s*\*/;

let issues = [];

for (const file of files) {
  const content = await fs.readFile(file, 'utf8');
  const lines = content.split(/\r?\n/);
  let importsNextHeaders = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (importLine.test(line)) importsNextHeaders = true;
    if (commentLine.test(line)) continue;
    if (!importsNextHeaders && !line.includes('next-async')) {
      // If file doesn't even touch next/headers or our wrapper, skip
      continue;
    }
    for (const pat of callRegexes) {
      if (pat.re.test(line)) {
        // Ignore import lines
        if (/^\s*import\b/.test(line)) continue;
        // If already awaited on the same line, skip
        if (/\bawait\s+.*\b(cookies|headers|draftMode)\s*\(/.test(line)) continue;
        // If returned directly in async func (e.g., `return cookies()`), flag it (should be `return await cookies()` in some cases)
        issues.push({
          file,
          line: i + 1,
          code: line.trim(),
          api: pat.name,
        });
      }
    }
  }
}

if (issues.length) {
  console.log('\n⚠️  Potential non-awaited Next 15 server API calls found:\n');
  for (const it of issues) {
    const rel = path.relative(process.cwd(), it.file);
    console.log(`${rel}:${it.line}: ${it.api}  ->  ${it.code}`);
  }
  console.log(
    '\nFix by adding `await` (or import from "@/lib/next-async" which is explicitly async).'
  );
  process.exit(1);
} else {
  console.log('✅ No suspicious cookies()/headers()/draftMode() usages found.');
}

