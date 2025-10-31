#!/usr/bin/env tsx

/**
 * WIREFRAME DESIGN TOKENS GENERATOR
 * Script to generate design tokens documentation
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { WireframeExporter } from '../src/utils/wireframeExport';

function main() {
  try {
    console.log('🎨 Generating design tokens documentation...');

    const tokens = WireframeExporter.generateDesignTokens();

    const outputPath = join(process.cwd(), 'docs', 'DESIGN_TOKENS.md');
    writeFileSync(outputPath, tokens, 'utf-8');

    console.log('✅ Design tokens exported to:', outputPath);
    console.log('📋 Use this file for design system documentation');

  } catch (error) {
    console.error('❌ Failed to generate design tokens:', error);
    process.exit(1);
  }
}

main();
