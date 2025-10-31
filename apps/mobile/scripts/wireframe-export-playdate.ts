#!/usr/bin/env tsx

/**
 * WIREFRAME EXPORT - PLAYDATE DISCOVERY
 * Script to export Playdate Discovery screen wireframe to HTML
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { quickExportPlaydateDiscovery } from '../src/utils/wireframeExport';

async function main() {
  try {
    console.log('🎨 Generating Playdate Discovery wireframe...');

    const html = await quickExportPlaydateDiscovery();

    const outputPath = join(process.cwd(), 'wireframes', 'playdate-discovery.html');
    writeFileSync(outputPath, html, 'utf-8');

    console.log('✅ Wireframe exported to:', outputPath);
    console.log('📱 Open in browser to view interactive wireframe');

  } catch (error) {
    console.error('❌ Failed to export wireframe:', error);
    process.exit(1);
  }
}

main();
