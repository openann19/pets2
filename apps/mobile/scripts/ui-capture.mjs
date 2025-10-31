#!/usr/bin/env node
/**
 * UI Audit: UI Capture Script (Stub)
 * 
 * Deeplinks into routes, waits for idle, captures PNG/GIF to docs/ui_media/.
 * Note: This is a stub - actual implementation would require Detox/E2E setup.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

const MEDIA_DIR = path.join(rootDir, 'docs/ui_media');
const INVENTORY_PATH = path.join(rootDir, 'docs/ui_audit_screens_inventory.json');

/**
 * Generate capture manifest
 */
function generateCaptureManifest() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.warn('⚠️  Screens inventory not found. Run ui-audit-screens-inventory.mjs first.');
    return;
  }
  
  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf-8'));
  
  const manifest = {
    generatedAt: new Date().toISOString(),
    screens: inventory.screens.all.map(screen => ({
      name: screen,
      deeplink: inventory.deeplinks[screen] || null,
      outputPath: `docs/ui_media/screenshots/${screen}.png`,
      gifPath: `docs/ui_media/gifs/${screen}.gif`,
      status: 'pending',
    })),
    instructions: [
      'This script requires Detox/E2E setup for actual execution',
      'For each screen:',
      '  1. Navigate via deeplink',
      '  2. Wait for idle (no pending network requests)',
      '  3. Capture screenshot',
      '  4. Perform key interactions',
      '  5. Record GIF (10-15s)',
      '  6. Save artifacts to docs/ui_media/',
    ],
  };
  
  const manifestPath = path.join(MEDIA_DIR, 'capture_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('✅ Capture manifest generated:', manifestPath);
  console.log(`   Screens to capture: ${manifest.screens.length}`);
  console.log('   Note: Actual capture requires Detox/E2E setup');
}

generateCaptureManifest();

