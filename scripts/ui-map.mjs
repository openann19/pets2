#!/usr/bin/env node
/*
 * UI Navigation Mapper
 * Parses React Navigation configuration to produce:
 * - docs/screen_inventory.json
 * - docs/navigation_graph.svg (simple graph)
 * - docs/ui_audit_report.md (Screens Inventory section)
 *
 * Zero external deps; regex-based parsing with clear assumptions logged.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.join(__dirname, '..'));
const APP_TSX = path.join(ROOT, 'apps/mobile/src/App.tsx');
const TAB_NAV = path.join(ROOT, 'apps/mobile/src/navigation/BottomTabNavigator.tsx');
const TYPES_TS = path.join(ROOT, 'apps/mobile/src/navigation/types.ts');
const APP_CONFIG = path.join(ROOT, 'apps/mobile/app.config.cjs');
const DOCS_DIR = path.join(ROOT, 'docs');

async function readFileSafe(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return '';
  }
}

function extractStackScreens(appTsx) {
  const names = new Set();
  const re = /<Stack\.Screen\s+name="([^"]+)"/g;
  let m;
  while ((m = re.exec(appTsx))) names.add(m[1]);
  return Array.from(names);
}

function extractTabScreens(tabTsx) {
  const names = new Set();
  const re = /<Tab\.Screen\s+name="([^"]+)"/g;
  let m;
  while ((m = re.exec(tabTsx))) names.add(m[1]);
  return Array.from(names);
}

function extractTypeMap(typesTs, typeName) {
  const re = new RegExp(`export\\s+type\\s+${typeName}\\s*=\\s*\\{([\\s\\S]*?)\\};`);
  const m = typesTs.match(re);
  if (!m) return {};
  const body = m[1];
  // Parse "Key: Type;" entries (permits inline objects and unions by capturing until semicolon)
  const entries = {};
  const lineRe = /(\w+):\s*([\s\S]*?);/g;
  let lm;
  while ((lm = lineRe.exec(body))) {
    const key = lm[1];
    const type = lm[2].trim();
    entries[key] = type;
  }
  return entries;
}

function extractSchemeAndHost(appConfig) {
  const schemeMatch = appConfig.match(/\bscheme:\s*'([^']+)'/);
  const scheme = schemeMatch ? schemeMatch[1] : null;
  const hostMatch = appConfig.match(/host:\s*'([^']+)'/);
  const host = hostMatch ? hostMatch[1] : 'pawfectmatch.com';
  return { scheme, host };
}

function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function buildInventory({ stackScreens, tabScreens, rootTypeMap, tabTypeMap, scheme, host }) {
  const prefixes = [];
  if (scheme) prefixes.push(`${scheme}://`);
  prefixes.push(`https://${host}`);

  const screens = [];
  const add = (name, category, paramType) => {
    const hasParams = paramType && paramType !== 'undefined';
    const suggestedPath = `/${toKebab(name)}${hasParams ? '/:params' : ''}`;
    screens.push({
      name,
      category,
      params: paramType || 'undefined',
      linking: {
        prefixes,
        suggestedPath,
        note: 'No explicit linking config found; suggested path derived from route name.'
      }
    });
  };

  // Root stack screens
  for (const name of stackScreens) add(name, 'root', rootTypeMap[name]);
  // Tab screens
  for (const name of tabScreens) add(name, 'tab', tabTypeMap[name]);

  return { prefixes, screens };
}

function buildSvgGraph(stackScreens, tabScreens) {
  // Simple left-to-right layout
  const node = (id, x, y) => `  <g id="${id}"><circle cx="${x}" cy="${y}" r="18" fill="#eef" stroke="#99c"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="10" fill="#223">${id}</text></g>`;
  const edge = (a, b) => `  <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#88a" stroke-width="1.5" marker-end="url(#arrow)"/>`;

  const width = 1000;
  const height = 400;
  const positions = {};

  positions.Root = { x: 80, y: 60 };
  positions.Home = { x: 220, y: 60 };

  const tabY0 = 140;
  tabScreens.forEach((name, i) => {
    positions[`tab:${name}`] = { x: 220 + i * 120, y: tabY0 };
  });

  const stackY0 = 260;
  stackScreens.forEach((name, i) => {
    positions[`stack:${name}`] = { x: 80 + (i % 7) * 130, y: stackY0 + Math.floor(i / 7) * 80 };
  });

  const nodes = [node('Root', positions.Root.x, positions.Root.y), node('Home', positions.Home.x, positions.Home.y)];
  tabScreens.forEach((name) => {
    const p = positions[`tab:${name}`];
    nodes.push(node(name, p.x, p.y));
  });
  stackScreens.forEach((name) => {
    const p = positions[`stack:${name}`];
    nodes.push(node(name, p.x, p.y));
  });

  const edges = [edge(positions.Root, positions.Home)];
  tabScreens.forEach((name) => {
    edges.push(edge(positions.Home, positions[`tab:${name}`]));
  });
  stackScreens.forEach((name) => {
    edges.push(edge(positions.Root, positions[`stack:${name}`]));
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#88a" />
    </marker>
  </defs>
${edges.join('\n')}
${nodes.join('\n')}
</svg>`;
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

async function appendScreensInventoryToReport(inventory) {
  const file = path.join(DOCS_DIR, 'ui_audit_report.md');
  const lines = [];
  lines.push('## Screens Inventory');
  lines.push('');
  lines.push(`Prefixes: ${inventory.prefixes.join(', ')}`);
  lines.push('');
  for (const s of inventory.screens) {
    lines.push(`- ${s.name} (${s.category}) – params: ${s.params}`);
  }
  lines.push('');
  lines.push('_Generated by scripts/ui-map.mjs_');

  let existing = '';
  try { existing = await fs.readFile(file, 'utf8'); } catch {}
  const hasSection = existing.includes('## Screens Inventory');
  const output = hasSection ? existing.replace(/## Screens Inventory[\s\S]*?(?=\n## |$)/, lines.join('\n') + '\n') : `${existing}\n\n${lines.join('\n')}\n`;
  await fs.mkdir(DOCS_DIR, { recursive: true });
  await fs.writeFile(file, output.trimStart(), 'utf8');
}

async function main() {
  const [appTsx, tabTsx, typesTs, appConfig] = await Promise.all([
    readFileSafe(APP_TSX),
    readFileSafe(TAB_NAV),
    readFileSafe(TYPES_TS),
    readFileSafe(APP_CONFIG)
  ]);

  const stackScreens = extractStackScreens(appTsx);
  const tabScreens = extractTabScreens(tabTsx);
  const rootTypeMap = extractTypeMap(typesTs, 'RootStackParamList');
  const tabTypeMap = extractTypeMap(typesTs, 'TabParamList');
  const { scheme, host } = extractSchemeAndHost(appConfig);

  const inventory = buildInventory({ stackScreens, tabScreens, rootTypeMap, tabTypeMap, scheme, host });

  const inventoryFile = path.join(DOCS_DIR, 'screen_inventory.json');
  const svgFile = path.join(DOCS_DIR, 'navigation_graph.svg');

  await writeJson(inventoryFile, inventory);
  const svg = buildSvgGraph(stackScreens, tabScreens);
  await fs.writeFile(svgFile, svg, 'utf8');
  await appendScreensInventoryToReport(inventory);

  // eslint-disable-next-line no-console
  console.log(`Wrote: ${path.relative(ROOT, inventoryFile)}, ${path.relative(ROOT, svgFile)}, docs/ui_audit_report.md`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});


