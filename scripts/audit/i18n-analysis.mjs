#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const findings = [];

// Load locale files for comparison
let locales = {};
try {
  const bgContent = readFileSync(join(root, 'apps/mobile/src/i18n/locales/bg/common.json'), 'utf8');
  const enContent = readFileSync(join(root, 'apps/mobile/src/i18n/locales/en/common.json'), 'utf8');
  locales.bg = JSON.parse(bgContent);
  locales.en = JSON.parse(enContent);
} catch (error) {
  // Locale files not found
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for hardcoded strings in JSX/TSX
    const jsxStringRegex = />([^<]{10,})</;
    const stringMatch = line.match(jsxStringRegex);
    
    if (stringMatch && !line.includes('t(') && !line.includes('{') && !line.includes('//') && !line.includes('/*')) {
      const hardcodedString = stringMatch[1].trim();
      
      // Skip if it's just whitespace, numbers, or common technical terms
      if (hardcodedString.length > 10 && 
          !hardcodedString.match(/^\d+$/) && 
          !hardcodedString.match(/^[A-Z_]+$/) &&
          !hardcodedString.includes('className') &&
          !hardcodedString.includes('style') &&
          !hardcodedString.includes('data-') &&
          !hardcodedString.includes('aria-')) {
        
        findings.push({
          id: `AUD-I18N-${String(findings.length + 1).padStart(5, '0')}`,
          severity: 'P2',
          category: 'i18n',
          file: filePath.replace(root + '/', ''),
          line: lineNum,
          code: line.trim(),
          problem: 'Hardcoded string in UI component',
          evidence: `Hardcoded text "${hardcodedString}" should use t() function for internationalization`,
          fix: `Replace hardcoded string with t('key') and add to locale files`,
          autofix: {
            type: 'manual',
            snippet: `Replace "${hardcodedString}" with {t('some.key')}`
          },
          blast_radius: 'Local',
          confidence: 0.8,
          tags: ['i18n', 'bulgarian', 'localization'],
          owner: filePath.includes('mobile') ? 'mobile' : 'web'
        });
      }
    }
    
    // Check for English/Bulgarian hardcoded labels
    if ((line.includes('English') || line.includes('Bulgarian') || line.includes('български')) && 
        !line.includes('t(') && !line.includes('//') && !line.includes('/*')) {
      findings.push({
        id: `AUD-I18N-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'i18n',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Hardcoded language labels',
        evidence: 'Language names should use i18n system',
        fix: 'Replace with t("language.english") and t("language.bulgarian")',
        autofix: {
          type: 'manual',
          snippet: 'Use t("language.english") and t("language.bulgarian")'
        },
        blast_radius: 'Local',
        confidence: 0.9,
        tags: ['i18n', 'language-switcher'],
        owner: filePath.includes('mobile') ? 'mobile' : 'web'
      });
    }
    
    // Check for missing t() import
    if (content.includes('t(') && !content.includes('useTranslation') && !content.includes('import.*t')) {
      findings.push({
        id: `AUD-I18N-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P1',
        category: 'i18n',
        file: filePath.replace(root + '/', ''),
        line: 1,
        code: 'Missing useTranslation import',
        problem: 'File uses t() but missing useTranslation import',
        evidence: 't() function requires useTranslation hook',
        fix: 'Add import { useTranslation } from "react-i18next";',
        autofix: {
          type: 'codemod',
          snippet: 'Add import at top: import { useTranslation } from "react-i18next";'
        },
        blast_radius: 'Local',
        confidence: 0.9,
        tags: ['i18n', 'react-i18next'],
        owner: filePath.includes('mobile') ? 'mobile' : 'web'
      });
    }
  });
}

function traverse(dir) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git') && !item.includes('dist') && !item.includes('build')) {
      traverse(fullPath);
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.jsx'))) {
      analyzeFile(fullPath);
    }
  }
}

// Analyze mobile and web source directories
['apps/mobile/src', 'apps/web/src'].forEach(dir => {
  try {
    traverse(join(root, dir));
  } catch (error) {
    // Skip if directory doesn't exist
  }
});

// Check for missing keys between locales
if (locales.bg && locales.en) {
  const bgKeys = new Set(Object.keys(locales.bg));
  const enKeys = new Set(Object.keys(locales.en));
  
  const missingInBg = [...enKeys].filter(key => !bgKeys.has(key));
  const missingInEn = [...bgKeys].filter(key => !enKeys.has(key));
  
  missingInBg.forEach(key => {
    findings.push({
      id: `AUD-I18N-${String(findings.length + 1).padStart(5, '0')}`,
      severity: 'P1',
      category: 'i18n',
      file: 'apps/mobile/src/i18n/locales/bg/common.json',
      line: 1,
      code: `Missing key: ${key}`,
      problem: 'Translation key missing in Bulgarian locale',
      evidence: `Key "${key}" exists in English but not Bulgarian`,
      fix: `Add Bulgarian translation for "${key}"`,
      autofix: {
        type: 'manual',
        snippet: `"${key}": "Bulgarian translation needed"`
      },
      blast_radius: 'Module',
      confidence: 1.0,
      tags: ['i18n', 'missing-translation'],
      owner: 'mobile'
    });
  });
  
  missingInEn.forEach(key => {
    findings.push({
      id: `AUD-I18N-${String(findings.length + 1).padStart(5, '0')}`,
      severity: 'P1',
      category: 'i18n',
      file: 'apps/mobile/src/i18n/locales/en/common.json',
      line: 1,
      code: `Missing key: ${key}`,
      problem: 'Translation key missing in English locale',
      evidence: `Key "${key}" exists in Bulgarian but not English`,
      fix: `Add English translation for "${key}"`,
      autofix: {
        type: 'manual',
        snippet: `"${key}": "English translation needed"`
      },
      blast_radius: 'Module',
      confidence: 1.0,
      tags: ['i18n', 'missing-translation'],
      owner: 'mobile'
    });
  });
}

// Output findings as JSONL
findings.forEach(finding => {
  console.log(JSON.stringify(finding));
});
