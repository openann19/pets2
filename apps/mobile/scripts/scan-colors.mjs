#!/usr/bin/env node

/**
 * Color Scanning Script
 * Scans for hardcoded colors (hex, rgb, rgba, named colors) in components
 * 
 * Usage: pnpm mobile:scan:colors
 * Output: reports/color_scan.json
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const reportsDir = join(rootDir, 'reports');

if (!existsSync(reportsDir)) {
  mkdirSync(reportsDir, { recursive: true });
}

// Color patterns
const HEX_PATTERN = /#([0-9a-fA-F]{3,8})\b/gi;
const RGBA_PATTERN = /rgba?\([^)]+\)/gi;
const HSLA_PATTERN = /hsla?\([^)]+\)/gi;
const NAMED_COLORS = /\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey|transparent)\b/gi;

// Ignore patterns
const IGNORE_PATTERNS = [
  'node_modules',
  '__tests__',
  '__mocks__',
  '.test.',
  '.spec.',
  'design-tokens',
  'theme/types.ts',
  'theme/contracts.ts',
  'theme/base-theme.ts',
  'theme/resolve.ts',
  'theme/adapters.ts',
];

function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function scanFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for hex colors
    const hexMatches = [...line.matchAll(HEX_PATTERN)];
    hexMatches.forEach(match => {
      // Skip if it's a comment
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return;
      }
      issues.push({
        line: lineNum,
        type: 'hex',
        value: match[0],
        code: line.trim(),
      });
    });

    // Check for rgba/rgb
    const rgbaMatches = [...line.matchAll(RGBA_PATTERN)];
    rgbaMatches.forEach(match => {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return;
      }
      issues.push({
        line: lineNum,
        type: 'rgba',
        value: match[0],
        code: line.trim(),
      });
    });

    // Check for hsla/hsl
    const hslaMatches = [...line.matchAll(HSLA_PATTERN)];
    hslaMatches.forEach(match => {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return;
      }
      issues.push({
        line: lineNum,
        type: 'hsla',
        value: match[0],
        code: line.trim(),
      });
    });

    // Check for named colors (but allow theme.colors.white etc.)
    const namedMatches = [...line.matchAll(NAMED_COLORS)];
    namedMatches.forEach(match => {
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return;
      }
      // Skip if it's part of theme.colors.X or theme.palette.X
      if (line.includes('theme.colors.') || line.includes('theme.palette.')) {
        return;
      }
      issues.push({
        line: lineNum,
        type: 'named',
        value: match[0],
        code: line.trim(),
      });
    });
  });

  return issues;
}

console.log('🔍 Scanning for hardcoded colors...\n');

const componentFiles = globSync('**/*.{tsx,ts,jsx,js}', {
  cwd: srcDir,
  absolute: false,
});

const results = {
  scanDate: new Date().toISOString(),
  totalFiles: 0,
  filesWithIssues: 0,
  totalIssues: 0,
  files: {},
  summary: {
    hex: 0,
    rgba: 0,
    hsla: 0,
    named: 0,
  },
};

componentFiles.forEach(file => {
  const filePath = join(srcDir, file);
  
  if (shouldIgnoreFile(filePath)) {
    return;
  }

  results.totalFiles++;
  const issues = scanFile(filePath);

  if (issues.length > 0) {
    results.filesWithIssues++;
    results.totalIssues += issues.length;
    results.files[file] = issues;

    issues.forEach(issue => {
      results.summary[issue.type] = (results.summary[issue.type] || 0) + 1;
    });
  }
});

// Write report
const outputPath = join(reportsDir, 'color_scan.json');
writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`✅ Scan complete!`);
console.log(`   Files scanned: ${results.totalFiles}`);
console.log(`   Files with issues: ${results.filesWithIssues}`);
console.log(`   Total issues: ${results.totalIssues}`);
console.log(`\n   Breakdown:`);
console.log(`   - Hex colors: ${results.summary.hex}`);
console.log(`   - RGB/RGBA: ${results.summary.rgba}`);
console.log(`   - HSL/HSLA: ${results.summary.hsla}`);
console.log(`   - Named colors: ${results.summary.named}`);
console.log(`\n   Report saved to: ${outputPath}`);

if (results.totalIssues > 0) {
  process.exit(1);
}

