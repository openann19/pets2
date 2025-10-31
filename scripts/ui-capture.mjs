#!/usr/bin/env node
/*
 * UI Capture Tool
 * - Deeplink into a route and capture PNG and short video (MP4 → optional GIF via ffmpeg)
 * - Prioritizes Android (adb). On macOS, uses xcrun simctl for iOS.
 *
 * Usage examples:
 *   node scripts/ui-capture.mjs --screen Home --out home --duration 6
 *   node scripts/ui-capture.mjs --deeplink "pawfectmatch://profile/user-123" --out profile --duration 8
 *
 * Outputs saved under docs/ui_media/
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const ROOT = path.resolve(path.join(__dirname, '..'));
const MEDIA_DIR = path.join(ROOT, 'docs/ui_media');

function toKebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase();
}

function which(cmd) {
  return new Promise((resolve) => {
    const proc = spawn(process.platform === 'win32' ? 'where' : 'which', [cmd]);
    proc.on('exit', (code) => resolve(code === 0));
  });
}

async function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { screen: null, deeplink: null, out: null, duration: 6 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--screen') out.screen = args[++i];
    else if (a === '--deeplink') out.deeplink = args[++i];
    else if (a === '--out') out.out = args[++i];
    else if (a === '--duration') out.duration = Number(args[++i]);
  }
  if (!out.out) out.out = (out.screen && toKebab(out.screen)) || 'capture';
  if (!out.deeplink && out.screen) {
    // Suggested, due to no explicit linking config found in app config.
    out.deeplink = `pawfectmatch://${toKebab(out.screen)}`;
  }
  if (!out.deeplink) {
    throw new Error('Provide --screen or --deeplink');
  }
  return out;
}

async function ensureDirs() {
  await fs.mkdir(MEDIA_DIR, { recursive: true });
}

async function captureAndroid({ deeplink, out, duration }) {
  const hasAdb = await which('adb');
  if (!hasAdb) throw new Error('adb not found. Ensure Android SDK platform-tools are installed.');

  // Launch deeplink
  await run('adb', ['shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', deeplink]);

  // Allow UI to settle
  await new Promise((r) => setTimeout(r, 1500));

  const png = path.join(MEDIA_DIR, `${out}.png`);
  const mp4 = path.join(MEDIA_DIR, `${out}.mp4`);
  const tmpMp4 = `/sdcard/Download/${out}.mp4`;

  // Screenshot
  const ss = spawn('adb', ['exec-out', 'screencap', '-p']);
  const ws = (await fs.open(png, 'w')).createWriteStream();
  ss.stdout.pipe(ws);
  await new Promise((resolve, reject) => {
    ss.on('error', reject);
    ss.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`screencap exited ${code}`))));
  });

  // Short video
  const rec = spawn('adb', ['shell', 'screenrecord', `--time-limit=${Math.max(3, duration)}`, tmpMp4]);
  await new Promise((resolve) => rec.on('exit', () => resolve()));
  await run('adb', ['pull', tmpMp4, mp4]);
  await run('adb', ['shell', 'rm', '-f', tmpMp4]).catch(() => {});

  // Optional GIF via ffmpeg (if present)
  if (await which('ffmpeg')) {
    const gif = path.join(MEDIA_DIR, `${out}.gif`);
    await run('ffmpeg', ['-y', '-i', mp4, '-vf', 'fps=10,scale=540:-1:flags=lanczos', gif]);
  }

  return { png, mp4 };
}

async function captureIOS({ deeplink, out, duration }) {
  if (os.platform() !== 'darwin') throw new Error('iOS capture requires macOS. Use Android/adb on CI.');
  const hasSimctl = await which('xcrun');
  if (!hasSimctl) throw new Error('xcrun not found');

  // Open deeplink in simulator
  await run('xcrun', ['simctl', 'openurl', 'booted', deeplink]);
  await new Promise((r) => setTimeout(r, 1500));

  const png = path.join(MEDIA_DIR, `${out}.png`);
  const mp4 = path.join(MEDIA_DIR, `${out}.mp4`);
  await run('xcrun', ['simctl', 'io', 'booted', 'screenshot', png]);
  const rec = spawn('xcrun', ['simctl', 'io', 'booted', 'recordVideo', mp4]);
  await new Promise((r) => setTimeout(r, Math.max(3, duration) * 1000));
  rec.kill('SIGINT');

  if (await which('ffmpeg')) {
    const gif = path.join(MEDIA_DIR, `${out}.gif`);
    await run('ffmpeg', ['-y', '-i', mp4, '-vf', 'fps=10,scale=540:-1:flags=lanczos', gif]);
  }
  return { png, mp4 };
}

async function main() {
  const cfg = parseArgs();
  await ensureDirs();

  const preferAndroid = os.platform() !== 'darwin';
  const result = preferAndroid
    ? await captureAndroid(cfg).catch(async (e) => {
        // Fallback to iOS if on macOS
        if (os.platform() === 'darwin') return captureIOS(cfg);
        throw e;
      })
    : await captureIOS(cfg).catch(async () => captureAndroid(cfg));

  // eslint-disable-next-line no-console
  console.log(`Saved to ${path.relative(ROOT, result.png)} and ${path.relative(ROOT, result.mp4)}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});


