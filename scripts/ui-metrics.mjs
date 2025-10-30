#!/usr/bin/env node
/**
 * UI Metrics Collector (Android-first, zero deps)
 * - TTI: `am start -W` on deeplink
 * - FPS/Jank: `dumpsys gfxinfo`
 * - Memory: `dumpsys meminfo`
 *
 * Examples:
 *   node scripts/ui-metrics.mjs --screen Home --out home --duration 6
 *   node scripts/ui-metrics.mjs --deeplink "pawfectmatch://profile/user-123" --out profile --sample 8000
 *   node scripts/ui-metrics.mjs --package com.pawfectmatch.premium --out smoke --duration 5 --fail-on-budget
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const ROOT = path.resolve(path.join(__dirname, '..'));
const APP_CONFIG = path.join(ROOT, 'apps/mobile/app.config.cjs');
const OUT_DIR = path.join(ROOT, 'docs/ui_media/metrics');

const toKebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function which(cmd) {
  return new Promise((resolve) => {
    const p = spawn(process.platform === 'win32' ? 'where' : 'which', [cmd]);
    p.on('exit', (code) => resolve(code === 0));
  });
}
function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    let out = '', err = '';
    const p = spawn(cmd, args, { ...opts });
    p.stdout?.on('data', (d) => (out += d.toString()));
    p.stderr?.on('data', (d) => (err += d.toString()));
    p.on('error', reject);
    p.on('exit', (code) => resolve({ code, stdout: out, stderr: err }));
  });
}
async function readText(file) { try { return await fs.readFile(file, 'utf8'); } catch { return ''; } }

function parseArgs() {
  const argv = process.argv.slice(2);
  const cfg = {
    screen: null, deeplink: null, out: null,
    duration: 6, sample: null, pkg: null,
    failOnBudget: false
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--screen') cfg.screen = argv[++i];
    else if (a === '--deeplink') cfg.deeplink = argv[++i];
    else if (a === '--out') cfg.out = argv[++i];
    else if (a === '--duration') cfg.duration = Number(argv[++i]);
    else if (a === '--sample') cfg.sample = Number(argv[++i]);
    else if (a === '--package' || a === '--pkg') cfg.pkg = argv[++i];
    else if (a === '--fail-on-budget') cfg.failOnBudget = true;
  }
  if (!cfg.out) cfg.out = (cfg.screen && toKebab(cfg.screen)) || 'metrics';
  if (!cfg.sample) cfg.sample = Math.max(1000, cfg.duration * 1000);
  return cfg;
}

function parseAppConfig(txt) {
  const scheme = txt.match(/\bscheme:\s*['"]([^'"]+)['"]/)?.[1] ?? 'pawfectmatch';
  const host = txt.match(/\bhost:\s*['"]([^'"]+)['"]/)?.[1] ?? 'pawfectmatch.com';
  const pkg = txt.match(/\bandroid:\s*\{[\s\S]*?package:\s*'([^']+)'/)?.[1] ?? 'com.pawfectmatch.premium';
  return { scheme, host, pkg };
}
function deriveDeeplink({ scheme, screen, provided }) {
  if (provided) return provided;
  if (screen) return `${scheme}://${toKebab(screen)}`;
  throw new Error('Provide --screen or --deeplink');
}

async function resetGfxinfo(pkg) {
  await run('adb', ['shell', 'dumpsys', 'gfxinfo', pkg, '--reset']).catch(() => {});
  await run('adb', ['shell', 'dumpsys', 'gfxinfo', pkg, 'reset']).catch(() => {});
}
function parseAmStartW(txt) {
  const num = (k) => (txt.match(new RegExp(`${k}:\\s*(\\d+)`))?.[1] ? Number(txt.match(new RegExp(`${k}:\\s*(\\d+)`))[1]) : null);
  return { thisTimeMs: num('ThisTime'), totalTimeMs: num('TotalTime'), waitTimeMs: num('WaitTime') };
}
function parseGfxinfo(txt) {
  const n = (re) => { const m = txt.match(re); return m ? Number(m[1]) : null; };
  const totalFrames = n(/Total frames rendered:\s*(\d+)/);
  const jankyFrames = n(/Janky frames:\s*(\d+)/);
  const jankPercent = n(/Janky frames:\s*\d+\s*\(([\d.]+)%\)/);
  const p50 = n(/50th percentile:\s*([\d.]+)ms/);
  const p90 = n(/90th percentile:\s*([\d.]+)ms/);
  const p95 = n(/95th percentile:\s*([\d.]+)ms/);
  const p99 = n(/99th percentile:\s*([\d.]+)ms/);
  return { totalFrames, jankyFrames, jankPercent, percentilesMs: { p50, p90, p95, p99 } };
}
function parseMeminfo(txt) {
  const kb = (() => {
    const a = txt.match(/TOTAL PSS:\s*(\d+)\s*kB/i);
    const b = txt.match(/TOTAL\s+(\d+)\s*KB/i);
    return a ? Number(a[1]) : b ? Number(b[1]) : null;
  })();
  const javaHeapKb = (() => txt.match(/Java Heap:\s*(\d+)\s*kB/i)?.[1] ? Number(txt.match(/Java Heap:\s*(\d+)\s*kB/i)[1]) : null)();
  const totalPssMB = kb ? Math.round((kb / 1024) * 10) / 10 : null;
  const javaHeapMB = javaHeapKb ? Math.round((javaHeapKb / 1024) * 10) / 10 : null;
  return { totalPssMB, javaHeapMB };
}

async function collectAndroid({ pkg, deeplink, durationSec, sampleMs }) {
  if (!(await which('adb'))) throw new Error('adb not found. Install Android SDK platform-tools.');

  // cold-ish open for TTI
  const { stdout: amOut } = await run('adb', ['shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', deeplink]);
  const tti = parseAmStartW(amOut);

  // reset stats + sample window
  await resetGfxinfo(pkg);
  await sleep(sampleMs);

  const gfx = await run('adb', ['shell', 'dumpsys', 'gfxinfo', pkg]);
  const gfxParsed = parseGfxinfo(gfx.stdout || gfx.stderr || '');
  const mem = await run('adb', ['shell', 'dumpsys', 'meminfo', pkg]);
  const memParsed = parseMeminfo(mem.stdout || mem.stderr || '');

  const fps = gfxParsed.totalFrames != null && durationSec > 0
    ? Math.round((gfxParsed.totalFrames / durationSec) * 10) / 10
    : null;

  return {
    platform: 'android',
    package: pkg,
    deeplink,
    durationSec,
    ttiMs: tti.totalTimeMs ?? null,
    framesTotal: gfxParsed.totalFrames,
    framesJanky: gfxParsed.jankyFrames,
    jankPercent: gfxParsed.jankPercent,
    fps,
    percentilesMs: gfxParsed.percentilesMs,
    memory: memParsed,
    collectedAt: new Date().toISOString()
  };
}

async function main() {
  const args = parseArgs();
  await fs.mkdir(OUT_DIR, { recursive: true });

  const cfgText = await readText(APP_CONFIG);
  const app = parseAppConfig(cfgText);
  const pkg = args.pkg || app.pkg;
  const deeplink = deriveDeeplink({ scheme: app.scheme, screen: args.screen, provided: args.deeplink });

  let result;
  if (os.platform() === 'darwin') {
    // prefer Android even on macOS if adb exists
    if (!(await which('adb'))) throw new Error('No adb available; iOS metrics not implemented to keep results reliable.');
    result = await collectAndroid({ pkg, deeplink, durationSec: args.duration, sampleMs: args.sample });
  } else {
    result = await collectAndroid({ pkg, deeplink, durationSec: args.duration, sampleMs: args.sample });
  }

  const outFile = path.join(OUT_DIR, `${toKebab(args.out)}.json`);
  await fs.writeFile(outFile, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Wrote ${path.relative(ROOT, outFile)}`);

  if (args.failOnBudget) {
    const budgets = { ttiMs: 1500, minFps: 58, maxJankPct: 5, p95Ms: 16 };
    const p95 = result.percentilesMs?.p95 ?? null;
    const fails = [];
    if (result.ttiMs != null && result.ttiMs > budgets.ttiMs) fails.push(`TTI ${result.ttiMs}ms > ${budgets.ttiMs}ms`);
    if (result.fps != null && result.fps < budgets.minFps) fails.push(`FPS ${result.fps} < ${budgets.minFps}`);
    if (result.jankPercent != null && result.jankPercent > budgets.maxJankPct) fails.push(`Jank ${result.jankPercent}% > ${budgets.maxJankPct}%`);
    if (p95 != null && p95 > budgets.p95Ms) fails.push(`p95 frame ${p95}ms > ${budgets.p95Ms}ms`);
    if (fails.length) {
      console.error('Budget failures:', fails.join('; '));
      process.exit(2);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
