#!/usr/bin/env tsx

/**
 * WIREFRAME EXPORT - PET PROFILE
 * Script to export Enhanced Pet Profile screen wireframe to HTML
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { quickExportPetProfile } from '../src/utils/wireframeExport';

async function main() {
  try {
    console.log('🎨 Generating Enhanced Pet Profile wireframe...');

    const html = await quickExportPetProfile();

    const outputPath = join(process.cwd(), 'wireframes', 'enhanced-pet-profile.html');
    writeFileSync(outputPath, html, 'utf-8');

    console.log('✅ Wireframe exported to:', outputPath);
    console.log('📱 Open in browser to view interactive wireframe');

  } catch (error) {
    console.error('❌ Failed to export wireframe:', error);
    process.exit(1);
  }
}

main();
