#!/usr/bin/env node

/**
 * i18n Extraction Script
 * Scans src/ for t('key') and hardcoded strings
 * Generates reports/i18n_diff.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { join } from 'path';

const SRC_DIR = join(process.cwd(), 'src');
const OUTPUT_FILE = join(process.cwd(), 'reports', 'i18n_diff.json');

console.log('🌍 Extracting i18n keys...\n');

const foundKeys = new Set();
const hardcodedStrings = [];

const files = globSync('**/*.{ts,tsx}', { cwd: SRC_DIR, absolute: false });

files.forEach(file => {
  const content = readFileSync(join(SRC_DIR, file), 'utf8');
  
  // Find t('key') calls
  const matches = content.match(/t\(['"]([^'"]+)['"]/g);
  if (matches) {
    matches.forEach(match => {
      const key = match.match(/['"]([^'"]+)['"]/)[1];
      foundKeys.add(key);
    });
  }

  // Detect hardcoded strings (basic heuristic)
  const hardcodedMatches = content.match(/(['"][A-Z][^'"]{10,}['"])/g);
  if (hardcodedMatches) {
    hardcodedMatches.forEach(match => {
      hardcodedStrings.push({ file, string: match });
    });
  }
});

const result = {
  lastRun: new Date().toISOString(),
  coverage: 0,
  totalKeys: foundKeys.size,
  extractedKeys: Array.from(foundKeys),
  missingKeys: [],
  extraKeys: [],
  localeStatus: {
    en: {
      totalKeys: 0,
      translatedKeys: 0,
      missingKeys: 0,
      coverage: 0
    },
    es: {
      totalKeys: 0,
      translatedKeys: 0,
      missingKeys: 0,
      coverage: 0
    }
  },
  issues: {
    hardcodedStrings,
    missingTranslations: [],
    incompleteLocales: []
  }
};

writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
console.log(`✅ Extracted ${foundKeys.size} i18n keys`);
console.log(`⚠️  Found ${hardcodedStrings.length} potentially hardcoded strings`);
console.log(`Report: ${OUTPUT_FILE}`);

process.exit(0);

