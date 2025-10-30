#!/usr/bin/env node

/**
 * i18n Diff Script
 * Compares locales for completeness
 * Updates reports/i18n_diff.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const LOCALES_DIR = join(process.cwd(), 'locales');
const REPORT_FILE = join(process.cwd(), 'reports', 'i18n_diff.json');

console.log('🔍 Diffing locales...\n');

const enFile = join(LOCALES_DIR, 'en', 'common.json');
const esFile = join(LOCALES_DIR, 'es', 'common.json');

let enKeys = {};
let esKeys = {};

try {
  enKeys = JSON.parse(readFileSync(enFile, 'utf8'));
} catch (error) {
  console.log('⚠️  Could not read en/common.json');
}

try {
  esKeys = JSON.parse(readFileSync(esFile, 'utf8'));
} catch (error) {
  console.log('⚠️  Could not read es/common.json');
}

// Flatten keys
const flattenKeys = (obj, prefix = '') => {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
};

const enKeysList = flattenKeys(enKeys);
const esKeysList = flattenKeys(esKeys);

const missingInES = enKeysList.filter(k => !esKeysList.includes(k));
const extraInES = esKeysList.filter(k => !enKeysList.includes(k));

const report = JSON.parse(readFileSync(REPORT_FILE, 'utf8'));
report.missingKeys = missingInES;
report.extraKeys = extraInES;
report.localeStatus.en = {
  totalKeys: enKeysList.length,
  translatedKeys: enKeysList.length,
  missingKeys: 0,
  coverage: 100
};
report.localeStatus.es = {
  totalKeys: enKeysList.length,
  translatedKeys: esKeysList.length,
  missingKeys: missingInES.length,
  coverage: missingInES.length === 0 ? 100 : ((esKeysList.length / enKeysList.length) * 100).toFixed(1)
};

writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
console.log(`✅ English: ${enKeysList.length} keys`);
console.log(`✅ Spanish: ${esKeysList.length} keys (${missingInES.length} missing)`);
console.log(`Coverage: ${report.localeStatus.es.coverage}%`);

process.exit(missingInES.length > 0 ? 1 : 0);

