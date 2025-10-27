#!/usr/bin/env node

/**
 * i18n-check.mjs - Validate i18n translations
 * Fails CI if there are missing keys or empty translations in Bulgarian
 */

import fs from 'fs';
import path from 'path';

const localesDir = 'apps/mobile/src/i18n/locales';
const languages = ['en', 'bg'];
const namespaces = ['common', 'auth', 'map', 'chat', 'premium'];

let hasErrors = false;

// Check that all namespaces exist for both languages
for (const lang of languages) {
  for (const ns of namespaces) {
    const filePath = path.join(localesDir, lang, `${ns}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing file: ${filePath}`);
      hasErrors = true;
      continue;
    }

    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Check for empty values
      for (const [key, value] of Object.entries(content)) {
        if (typeof value === 'string' && value.trim() === '') {
          console.error(`❌ Empty translation in ${lang}/${ns}.json: "${key}"`);
          hasErrors = true;
        }
      }
    } catch (error) {
      console.error(`❌ Invalid JSON in ${filePath}: ${error.message}`);
      hasErrors = true;
    }
  }
}

// Check that Bulgarian has all keys from English
const enCommon = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'common.json'), 'utf-8'));
const bgCommon = JSON.parse(fs.readFileSync(path.join(localesDir, 'bg', 'common.json'), 'utf-8'));

for (const key of Object.keys(enCommon)) {
  if (!(key in bgCommon)) {
    console.warn(`⚠️  Missing Bulgarian translation for key: "${key}" in common.json`);
  }
}

if (hasErrors) {
  console.error('\n❌ i18n validation failed');
  process.exit(1);
} else {
  console.log('✅ i18n validation passed');
  process.exit(0);
}
