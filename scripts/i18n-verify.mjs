#!/usr/bin/env node

/**
 * i18n Validation Script
 * Validates that all locale files have matching keys
 * Fails build if any missing keys are found
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '../apps/web/messages');
const ALLOWED_MISSING_KEYS = new Set(['_comment', '_description']);
const EXIT_ON_ERROR = true;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Get all keys from an object recursively
 */
function getAllKeys(obj, prefix = '') {
  const keys = new Set();
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    // Skip allowed meta keys
    if (ALLOWED_MISSING_KEYS.has(key)) {
      continue;
    }
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively get keys from nested objects
      const nestedKeys = getAllKeys(value, fullKey);
      nestedKeys.forEach(k => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }
  
  return keys;
}

/**
 * Load and parse a JSON file
 */
function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`❌ Failed to load ${filePath}: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Compare two sets of keys and return differences
 */
function compareKeySets(baseKeys, compareKeys, name) {
  const missing = [...baseKeys].filter(key => !compareKeys.has(key));
  const extra = [...compareKeys].filter(key => !baseKeys.has(key));
  
  return { missing, extra };
}

/**
 * Main validation function
 */
function validateI18n() {
  log('🔍 Validating i18n files...', 'blue');
  
  // Check if locales directory exists
  if (!fs.existsSync(LOCALES_DIR)) {
    log(`❌ Locales directory not found: ${LOCALES_DIR}`, 'red');
    process.exit(1);
  }
  
  // Get all locale files
  const localeFiles = fs.readdirSync(LOCALES_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => path.basename(file, '.json'));
  
  if (localeFiles.length < 2) {
    log(`❌ Need at least 2 locale files for comparison. Found: ${localeFiles.join(', ')}`, 'red');
    process.exit(1);
  }
  
  log(`📁 Found locales: ${localeFiles.join(', ')}`, 'cyan');
  
  // Load all locale data
  const locales = {};
  let hasErrors = false;
  
  for (const locale of localeFiles) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const data = loadJsonFile(filePath);
    
    if (!data) {
      hasErrors = true;
      continue;
    }
    
    locales[locale] = data;
    log(`✅ Loaded ${locale}.json`, 'green');
  }
  
  if (hasErrors) {
    log('❌ Failed to load some locale files', 'red');
    process.exit(1);
  }
  
  // Use first locale as base (typically English)
  const baseLocale = localeFiles[0];
  const baseKeys = getAllKeys(locales[baseLocale]);
  
  log(`🔑 Base locale (${baseLocale}) has ${baseKeys.size} keys`, 'cyan');
  
  // Compare all other locales against base
  let totalMissing = 0;
  let totalExtra = 0;
  
  for (const locale of localeFiles) {
    if (locale === baseLocale) continue;
    
    const compareKeys = getAllKeys(locales[locale]);
    const { missing, extra } = compareKeySets(baseKeys, compareKeys, locale);
    
    if (missing.length > 0 || extra.length > 0) {
      log(`\n📊 ${locale.toUpperCase()} vs ${baseLocale.toUpperCase()}:`, 'yellow');
      
      if (missing.length > 0) {
        log(`  ❌ Missing keys (${missing.length}):`, 'red');
        missing.forEach(key => log(`    - ${key}`, 'red'));
        totalMissing += missing.length;
      }
      
      if (extra.length > 0) {
        log(`  ⚠️  Extra keys (${extra.length}):`, 'yellow');
        extra.forEach(key => log(`    - ${key}`, 'yellow'));
        totalExtra += extra.length;
      }
    } else {
      log(`✅ ${locale.toUpperCase()}: Perfect match`, 'green');
    }
  }
  
  // Summary
  log('\n📈 Summary:', 'blue');
  log(`  Base locale: ${baseLocale} (${baseKeys.size} keys)`, 'cyan');
  log(`  Missing keys: ${totalMissing}`, totalMissing > 0 ? 'red' : 'green');
  log(`  Extra keys: ${totalExtra}`, totalExtra > 0 ? 'yellow' : 'green');
  
  // Check for empty translations
  let emptyTranslations = 0;
  for (const [locale, data] of Object.entries(locales)) {
    const keys = getAllKeys(data);
    for (const key of keys) {
      const parts = key.split('.');
      let value = data;
      for (const part of parts) {
        value = value[part];
      }
      
      if (typeof value === 'string' && value.trim() === '') {
        log(`  ⚠️  Empty translation: ${locale}.${key}`, 'yellow');
        emptyTranslations++;
      }
    }
  }
  
  if (emptyTranslations > 0) {
    log(`  Empty translations: ${emptyTranslations}`, 'yellow');
  }
  
  // Final result
  const hasIssues = totalMissing > 0 || emptyTranslations > 0;
  
  if (hasIssues) {
    log('\n❌ i18n validation FAILED!', 'red');
    log('Please fix the missing keys or empty translations before proceeding.', 'red');
    
    if (EXIT_ON_ERROR) {
      process.exit(1);
    }
  } else {
    log('\n✅ i18n validation PASSED!', 'green');
    log('All locales are in sync and properly translated.', 'green');
  }
}

/**
 * Generate a report of all keys for documentation
 */
function generateKeyReport() {
  log('\n📋 Generating key report...', 'blue');
  
  const enPath = path.join(LOCALES_DIR, 'en.json');
  const enData = loadJsonFile(enPath);
  
  if (!enData) {
    log('❌ Could not load en.json for report generation', 'red');
    return;
  }
  
  const keys = getAllKeys(enData);
  const sortedKeys = [...keys].sort();
  
  const reportPath = path.join(__dirname, '../reports/i18n-keys.txt');
  const report = [
    '# i18n Keys Report',
    `Generated: ${new Date().toISOString()}`,
    `Total keys: ${keys.length}`,
    '',
    '## All Keys:',
    ...sortedKeys.map(key => `- ${key}`),
  ].join('\n');
  
  // Ensure reports directory exists
  const reportsDir = path.dirname(reportPath);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, report);
  log(`📄 Key report saved to: ${reportPath}`, 'green');
}

// Run validation
if (process.argv.includes('--report')) {
  generateKeyReport();
} else {
  validateI18n();
  
  // Also generate report if requested
  if (process.argv.includes('--generate-report')) {
    generateKeyReport();
  }
}
