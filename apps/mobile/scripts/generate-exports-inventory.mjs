#!/usr/bin/env node

/**
 * Exports Inventory Script
 * Analyzes exports using ts-prune
 * Generates reports/exports_inventory.json
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const OUTPUT_FILE = join(process.cwd(), 'reports', 'exports_inventory.json');

console.log('📦 Analyzing exports...\n');

try {
  // Use ts-prune to find unused exports
  execSync('npx ts-prune > /tmp/ts-prune-output.txt 2>&1', { stdio: 'inherit', cwd: process.cwd() });
  
  let unusedExports = [];
  
  try {
    const output = require('fs').readFileSync('/tmp/ts-prune-output.txt', 'utf8');
    // Parse output
    const lines = output.split('\n').filter(l => l.includes(':'));
    unusedExports = lines.map(line => {
      const parts = line.split(':');
      return {
        file: parts[0],
        export: parts[1]
      };
    });
  } catch (error) {
    console.log('⚠️  Could not parse ts-prune output');
  }

  const inventory = {
    timestamp: new Date().toISOString(),
    totalExports: 0,
    unusedExports,
    warnings: [],
    recommendations: []
  };

  if (unusedExports.length > 0) {
    inventory.warnings.push({
      severity: 'medium',
      message: `${unusedExports.length} potentially unused exports found`
    });
    inventory.recommendations.push('Review unused exports and remove if truly unused');
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(inventory, null, 2));
  console.log(`✅ Export inventory generated: ${OUTPUT_FILE}`);
  console.log(`Found ${unusedExports.length} potentially unused exports`);
  
} catch (error) {
  console.log('⚠️  ts-prune not installed, creating placeholder report');
  const placeholder = {
    timestamp: new Date().toISOString(),
    totalExports: 0,
    unusedExports: [],
    note: 'Install ts-prune to analyze exports'
  };
  writeFileSync(OUTPUT_FILE, JSON.stringify(placeholder, null, 2));
}

process.exit(0);

