#!/usr/bin/env node

// Lightweight code graph and exports inventory generator (no external deps)
// Scans mobile and packages source trees and writes /reports/code_graph.json
// and /reports/exports_inventory.json at the repo root.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

const repoRoot = (() => {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    try { if (existsSync(join(dir, 'package.json'))) return dir; } catch {}
    dir = dirname(dir);
  }
  return process.cwd();
})();

const targets = [
  join(repoRoot, 'apps', 'mobile', 'src'),
  ...(() => {
    const pkgsRoot = join(repoRoot, 'packages');
    try {
      return readdirSync(pkgsRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => join(pkgsRoot, d.name, 'src'))
        .filter((p) => existsSync(p));
    } catch { return []; }
  })(),
];

const reportsDir = join(repoRoot, 'reports');
if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

function walk(dir) {
  const out = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) out.push(...walk(p));
      else if (/(\.ts|\.tsx)$/.test(e.name)) out.push(p);
    }
  } catch {}
  return out;
}

const files = targets.flatMap((t) => walk(t));

// Build nodes and edges
const nodes = new Set();
const edges = [];

const importRegex = /import\s+(?:[^'";]+\s+from\s+)?['"]([^'"\n]+)['"];?|import\(['"]([^'"\n]+)['"]\)/g;
const exportRegexes = [
  { kind: 'function', rx: /export\s+function\s+(\w+)/g },
  { kind: 'const', rx: /export\s+const\s+(\w+)/g },
  { kind: 'class', rx: /export\s+class\s+(\w+)/g },
  { kind: 'type', rx: /export\s+type\s+(\w+)/g },
  { kind: 'interface', rx: /export\s+interface\s+(\w+)/g },
  { kind: 'enum', rx: /export\s+enum\s+(\w+)/g },
  { kind: 'default', rx: /export\s+default\s+/g },
];

const modules = [];

for (const file of files) {
  nodes.add(file.replace(repoRoot + '/', ''));
  const rel = file.replace(repoRoot + '/', '');
  const content = (() => { try { return readFileSync(file, 'utf8'); } catch { return ''; } })();

  // Imports → edges
  let m;
  importRegex.lastIndex = 0;
  while ((m = importRegex.exec(content)) !== null) {
    const spec = m[1] ?? m[2];
    if (!spec) continue;
    edges.push({ from: rel, to: spec });
  }

  // Exports inventory
  const mod = { file: rel, exports: [] };
  for (const { kind, rx } of exportRegexes) {
    if (kind === 'default') {
      if (rx.test(content)) mod.exports.push({ name: 'default', kind });
      continue;
    }
    let e;
    const rxg = new RegExp(rx.source, 'g');
    while ((e = rxg.exec(content)) !== null) {
      mod.exports.push({ name: e[1] ?? kind, kind });
    }
  }
  modules.push(mod);
}

const codeGraph = {
  generatedAt: new Date().toISOString(),
  nodes: Array.from(nodes).map((id) => ({ id, file: id })),
  edges,
};

const exportsInventory = {
  generatedAt: new Date().toISOString(),
  modules,
};

writeFileSync(join(reportsDir, 'code_graph.json'), JSON.stringify(codeGraph, null, 2));
writeFileSync(join(reportsDir, 'exports_inventory.json'), JSON.stringify(exportsInventory, null, 2));

console.log(`✅ Wrote ${join(reportsDir, 'code_graph.json')}`);
console.log(`✅ Wrote ${join(reportsDir, 'exports_inventory.json')}`);


