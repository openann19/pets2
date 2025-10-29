#!/usr/bin/env node

/**
 * Gap Auditor (apps/mobile)
 * - Flags god components/services by LOC thresholds
 * - Detects screens not registered in navigation
 * - Compares GDPR client routes vs contract in AGENTS.md
 * Output: <repo>/reports/gap_log.yaml
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

const repoRoot = (() => {
  const cwd = process.cwd();
  if (cwd.endsWith('/apps/mobile')) return resolve(cwd, '../..');
  let dir = cwd;
  while (dir !== dirname(dir)) {
    try { if (existsSync(join(dir, 'package.json'))) return dir; } catch {}
    dir = dirname(dir);
  }
  return cwd;
})();

const mobileRoot = existsSync(join(repoRoot, 'apps', 'mobile'))
  ? join(repoRoot, 'apps', 'mobile')
  : repoRoot;

const srcDir = join(mobileRoot, 'src');
const screensDir = join(srcDir, 'screens');
const servicesDir = join(srcDir, 'services');
const appFile = join(srcDir, 'App.tsx');
const gdprServiceFile = join(servicesDir, 'gdprService.ts');
const reportsDir = join(repoRoot, 'reports');
if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

function walk(dir, exts = ['.ts', '.tsx']) {
  const out = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((ext) => e.name.endsWith(ext))) out.push(p);
  }
  return out;
}

function fileLines(path) {
  try { return readFileSync(path, 'utf8').split('\n').length; } catch { return 0; }
}

function extractStackScreens() {
  try {
    const content = readFileSync(appFile, 'utf8');
    const rx = /<Stack\.Screen\s+name=\"([A-Za-z0-9_]+)\"/g;
    const names = new Set();
    let m;
    while ((m = rx.exec(content)) !== null) names.add(m[1]);
    return Array.from(names);
  } catch { return []; }
}

function extractGdprClientRoutes() {
  try {
    const content = readFileSync(gdprServiceFile, 'utf8');
    const rx = /request<[^>]*>\(\s*['"]([^'"\)]+)['"]/g;
    const endpoints = new Set();
    let m;
    while ((m = rx.exec(content)) !== null) endpoints.add(m[1]);
    return Array.from(endpoints);
  } catch { return []; }
}

function main() {
  const gaps = [];

  // 1) God components/services
  const threshold = 400;
  const candidates = [];
  if (existsSync(servicesDir)) candidates.push(...walk(servicesDir));
  if (existsSync(screensDir)) candidates.push(...walk(screensDir));
  for (const f of candidates) {
    if (f.includes('__tests__')) continue;
    const loc = fileLines(f);
    if (loc > threshold) {
      gaps.push({
        id: `god-${f.replace(mobileRoot + '/', '').replace(/\W+/g, '-')}`,
        severity: 'high',
        area: 'mobile',
        context: `${f.replace(mobileRoot + '/', '')} exceeds ${threshold} LOC (${loc}). Consider refactor into focused modules.`,
        acceptance: [
          'LOC < 400 or justified with architectural note',
          'Unit tests cover extracted modules',
        ],
      });
    }
  }

  // 2) Unreachable screens (not registered in App stack)
  const registered = new Set(extractStackScreens());
  const screenFiles = existsSync(screensDir) ? walk(screensDir, ['.tsx']) : [];
  for (const f of screenFiles) {
    const name = f.split('/').pop()?.replace(/\.tsx$/, '') ?? '';
    if (!name) continue;
    if (!registered.has(name) && !f.includes('__tests__')) {
      gaps.push({
        id: `unreachable-${name.toLowerCase()}`,
        severity: 'medium',
        area: 'mobile',
        context: `Screen ${name} not found in App navigator. Verify route registration or remove dead code.`,
        acceptance: [
          'Screen is reachable from a registered route',
          'Or explicitly deprecated and removed',
        ],
      });
    }
  }

  // 3) GDPR endpoints divergence
  const clientEndpoints = extractGdprClientRoutes();
  const expected = new Set([
    '/api/users/delete-account',
    '/api/users/export-data',
    '/api/users/confirm-deletion',
  ]);
  const mismatches = [];
  for (const ep of clientEndpoints) {
    if (ep.includes('/users/request-export')) mismatches.push({ found: ep, expected: '/api/users/export-data' });
    if (ep.includes('/users/cancel-deletion')) mismatches.push({ found: ep, expected: '/api/users/confirm-deletion' });
  }
  if (mismatches.length > 0) {
    gaps.push({
      id: 'gdpr-contract-drift',
      severity: 'critical',
      area: 'contracts',
      context: 'GDPR client routes differ from AGENTS.md contract. Align with live backend.',
      acceptance: [
        'DELETE /users/delete-account returns { success, message, gracePeriodEndsAt }',
        'GET /users/export-data available and documented',
        'POST /users/confirm-deletion implemented or client updated to match server'
      ],
      contracts: { expected: Array.from(expected), client: clientEndpoints, diffs: mismatches },
    });
  }

  // Emit YAML
  const yaml = [
    '# gap_log.yaml — generated by gap-auditor',
    `generatedAt: ${new Date().toISOString()}`,
    'gaps:',
    ...gaps.map((g) => {
      const lines = [];
      lines.push(`  - id: ${g.id}`);
      lines.push(`    severity: ${g.severity}`);
      lines.push(`    area: ${g.area}`);
      lines.push('    context: |');
      lines.push(`      ${g.context}`);
      if (Array.isArray(g.acceptance)) {
        lines.push('    acceptance:');
        for (const a of g.acceptance) lines.push(`      - ${a}`);
      }
      if (g.contracts) {
        lines.push('    contracts:');
        lines.push('      expected:');
        for (const e of g.contracts.expected) lines.push(`        - ${e}`);
        lines.push('      client:');
        for (const c of g.contracts.client) lines.push(`        - ${c}`);
        lines.push('      diffs:');
        for (const d of g.contracts.diffs) lines.push(`        - found: ${d.found}\n          expected: ${d.expected}`);
      }
      return lines.join('\n');
    }),
    '',
  ].join('\n');

  const out = join(reportsDir, 'gap_log.yaml');
  writeFileSync(out, yaml);
  console.log(`✅ Wrote ${out}`);
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.error('❌ Gap audit failed:', err);
  process.exit(1);
}


