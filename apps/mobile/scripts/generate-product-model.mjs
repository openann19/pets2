#!/usr/bin/env node

/**
 * Generate Product Model and Navigation Graph for apps/mobile
 * - product_model.json: entities (from packages/core), screens, journeys
 * - navigation_graph.json: nodes (screens) and edges (navigation relationships)
 *
 * Output location: <repo>/reports/
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

const repoRoot = (() => {
  // When executed from apps/mobile
  const cwd = process.cwd();
  // If current working dir ends with apps/mobile, go up two levels
  if (cwd.endsWith('/apps/mobile')) return resolve(cwd, '../..');
  // Otherwise, try to locate repo root by presence of package.json
  let dir = cwd;
  while (dir !== dirname(dir)) {
    try {
      if (existsSync(join(dir, 'package.json'))) return dir;
    } catch {}
    dir = dirname(dir);
  }
  return cwd;
})();

const mobileRoot = existsSync(join(repoRoot, 'apps', 'mobile'))
  ? join(repoRoot, 'apps', 'mobile')
  : repoRoot;

const srcDir = join(mobileRoot, 'src');
const screensDir = join(srcDir, 'screens');
const navigationDir = join(srcDir, 'navigation');
const coreTypesFile = join(repoRoot, 'packages', 'core', 'src', 'types', 'models.ts');

const reportsDir = join(repoRoot, 'reports');
if (!existsSync(reportsDir)) mkdirSync(reportsDir, { recursive: true });

/**
 * Utilities
 */
function walkDir(dir, filterExts = ['.ts', '.tsx']) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDir(full, filterExts));
    } else {
      if (filterExts.some(ext => entry.name.endsWith(ext))) files.push(full);
    }
  }
  return files;
}

function readSafe(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

/**
 * Extract entities from core models
 */
function extractEntities() {
  const content = readSafe(coreTypesFile);
  if (!content) return [];

  const entityRegex = /export\s+type\s+(\w+)\s*=\s*\{[\s\S]*?\n\};/g;
  const propRegex = /\s*(\w+)\??:\s*([^;]+);/g;
  const entities = [];
  let m;
  while ((m = entityRegex.exec(content)) !== null) {
    const [block, name] = m;
    const props = [];
    let p;
    while ((p = propRegex.exec(block)) !== null) {
      props.push({ name: p[1], type: p[2].trim() });
    }
    entities.push({ name, properties: props });
  }
  return entities;
}

/**
 * Extract declared Stack screens from App.tsx
 */
function extractStackScreens() {
  const appFile = join(srcDir, 'App.tsx');
  const content = readSafe(appFile);
  const screenRegex = /<Stack\.Screen\s+name=\"([A-Za-z0-9_]+)\"/g;
  const names = new Set();
  let m;
  while ((m = screenRegex.exec(content)) !== null) {
    names.add(m[1]);
  }
  return Array.from(names);
}

/**
 * Extract BottomTab screens
 */
function extractTabScreens() {
  const file = join(navigationDir, 'BottomTabNavigator.tsx');
  const content = readSafe(file);
  const tabRegex = /<Tab\.Screen\s+name=\"([A-Za-z0-9_]+)\"/g;
  const names = new Set();
  let m;
  while ((m = tabRegex.exec(content)) !== null) {
    names.add(m[1]);
  }
  return Array.from(names);
}

/**
 * Build screens inventory from filesystem
 */
function listScreens() {
  const files = walkDir(screensDir, ['.tsx']);
  return files
    .filter((f) => !f.includes('__tests__'))
    .map((f) => ({
      name: f.split('/').pop()?.replace(/\.tsx$/, '') ?? f,
      path: f.replace(mobileRoot + '/', ''),
      lines: (() => {
        try { return readFileSync(f, 'utf8').split('\n').length; } catch { return 0; }
      })(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Build navigation graph (nodes + edges)
 */
function buildNavigationGraph() {
  const stack = extractStackScreens();
  const tabs = extractTabScreens();
  const nodes = new Set([...stack, ...tabs]);
  const edges = [];

  // Link Home (stack) to tab children, if Home uses BottomTabNavigator
  if (stack.includes('Home') && tabs.length > 0) {
    for (const t of tabs) {
      edges.push({ from: 'Home', to: t, relation: 'tab' });
    }
  }

  // Heuristic: common flows
  if (nodes.has('Swipe') && nodes.has('Matches')) edges.push({ from: 'Swipe', to: 'Matches', relation: 'navigate' });
  if (nodes.has('Matches') && nodes.has('Chat')) edges.push({ from: 'Matches', to: 'Chat', relation: 'navigate' });
  if (nodes.has('Settings') && nodes.has('PrivacySettings')) edges.push({ from: 'Settings', to: 'PrivacySettings', relation: 'navigate' });

  return { nodes: Array.from(nodes).map((n) => ({ id: n })), edges };
}

/**
 * Build product model JSON
 */
function buildProductModel() {
  const entities = extractEntities();
  const screens = listScreens();
  const stackScreens = extractStackScreens();
  const tabScreens = extractTabScreens();
  const journeys = [
    {
      id: 'auth',
      name: 'Authentication',
      screens: stackScreens.filter((s) => ['Login', 'Register', 'ForgotPassword', 'ResetPassword'].includes(s)),
    },
    {
      id: 'swipe-match-chat',
      name: 'Swipe → Match → Chat',
      screens: ['Swipe', 'Matches', 'Chat'].filter((s) => stackScreens.includes(s) || tabScreens.includes(s)),
    },
    {
      id: 'gdpr',
      name: 'GDPR: Privacy & Account',
      screens: ['Settings', 'PrivacySettings', 'DeactivateAccount'].filter((s) => stackScreens.includes(s)),
    },
    {
      id: 'premium',
      name: 'Premium Subscription',
      screens: ['Premium', 'Subscription', 'ManageSubscription', 'PremiumSuccess', 'PremiumCancel'].filter((s) => stackScreens.includes(s)),
    },
    {
      id: 'adoption',
      name: 'Adoption Flow',
      screens: ['AdoptionManager', 'AdoptionApplication'].filter((s) => stackScreens.includes(s)),
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    app: 'apps/mobile',
    entities,
    screens,
    navigation: {
      stackScreens,
      tabScreens,
    },
    journeys,
  };
}

function main() {
  const productModel = buildProductModel();
  const navGraph = buildNavigationGraph();

  const productPath = join(reportsDir, 'product_model.json');
  const navPath = join(reportsDir, 'navigation_graph.json');

  writeFileSync(productPath, JSON.stringify(productModel, null, 2));
  writeFileSync(navPath, JSON.stringify(navGraph, null, 2));

  // Minimal console output for CI
  console.log(`✅ Wrote ${productPath}`);
  console.log(`✅ Wrote ${navPath}`);
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.error('❌ Failed to generate product model/navigation graph:', err);
  process.exit(1);
}


