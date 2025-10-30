#!/usr/bin/env node
// Fails if a root screen from docs/screen_inventory.json is missing in linking.ts.

import { promises as fs } from 'node:fs';

const inv = JSON.parse(await fs.readFile('docs/screen_inventory.json','utf8'));
const linkingSrc = await fs.readFile('apps/mobile/src/navigation/linking.ts','utf8');
const cfg = linkingSrc.replace(/\s+/g,' ');

const missing = inv.screens
  .filter(s => !/tab/i.test(s.category)) // ignore tab entries (covered inside MainTabs)
  .filter(s => !new RegExp(`\\b${s.name}\\b`).test(cfg));

if (missing.length) {
  console.error('❌ Missing linking config for:', missing.map(m=>m.name).join(', '));
  process.exit(1);
}
console.log('✅ Linking config covers all root screens.');
