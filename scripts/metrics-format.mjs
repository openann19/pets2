#!/usr/bin/env node
/**
 * Normalize metrics JSONs into a stable summary for PR comments.
 * Usage: node scripts/metrics-format.mjs <metricsDir> <outFile>
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

const [,, dirArg, outArg] = process.argv;
const DIR = dirArg || 'docs/ui_media/metrics';
const OUT = outArg || 'formatted-metrics.json';

const files = (await fs.readdir(DIR).catch(()=>[])).filter(f => f.endsWith('.json'));
const rows = [];
for (const f of files) {
  try {
    const raw = JSON.parse(await fs.readFile(path.join(DIR,f),'utf8'));
    const name = path.basename(f).replace(/^metrics-?/,'').replace(/\.json$/,'');

    const ttiMs = raw.ttiMs ?? raw.tti?.totalTimeMs ?? null;
    const fps = raw.fps ?? null;
    const jankPercent = raw.jankPercent ?? raw.gfx?.jankPercent ?? null;
    const framesTotal = raw.framesTotal ?? raw.gfx?.totalFrames ?? null;
    const framesJanky = raw.framesJanky ?? raw.gfx?.jankyFrames ?? null;
    const p95FrameMs = raw.percentilesMs?.p95 ?? raw.gfx?.p95ms ?? null;

    const totalPssMB = raw.memory?.totalPssMB ?? (raw.mem?.totalPssKb ? Math.round((raw.mem.totalPssKb/1024)*10)/10 : null);
    const javaHeapMB = raw.memory?.javaHeapMB ?? (raw.mem?.javaHeapKb ? Math.round((raw.mem.javaHeapKb/1024)*10)/10 : null);

    rows.push({ name, ttiMs, fps, jankPercent, framesTotal, framesJanky, p95FrameMs, memory: { totalPssMB, javaHeapMB } });
  } catch {}
}

await fs.writeFile(OUT, JSON.stringify(rows, null, 2), 'utf8');
console.log(`Wrote ${OUT} (${rows.length} entries)`);
