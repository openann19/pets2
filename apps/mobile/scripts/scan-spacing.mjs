#!/usr/bin/env node

/**
 * Spacing Scanning Script
 * Scans for hardcoded spacing values (padding, margin, gap) that should use theme tokens
 * 
 * Usage: pnpm mobile:scan:spacing
 * Output: reports/spacing_scan.json
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

// Patterns for spacing properties
const SPACING_PROPERTIES = /(padding|margin|gap|top|bottom|left|right|inset)\s*:\s*(\d+)\b/gi;
const RAW_NUMERIC = /:\s*(\d{2,})\s*[,;]/g; // catches numeric values >= 10

// Ignore patterns
const IGNORE_PATTERNS = [
  'node_modules',
  '__tests__',
  '__mocks__',
  '.test.',
  '.spec.',
  'design-tokens',
  'theme/',
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
    
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return;
    }

    // Check for spacing properties with raw numbers
    const spacingMatches = [...line.matchAll(SPACING_PROPERTIES)];
    spacingMatches.forEach(match => {
      const property = match[1];
      const value = parseInt(match[2], 10);
      
      // Skip if it's part of theme.spacing.X or already using theme
      if (line.includes('theme.spacing.') || line.includes('spacing.')) {
        return;
      }
      
      // Flag values >= 4 (should use spacing tokens)
      if (value >= 4) {
        issues.push({
          line: lineNum,
          property,
          value,
          code: line.trim(),
        });
      }
    });

    // Check for large numeric values that might be spacing
    const numericMatches = [...line.matchAll(RAW_NUMERIC)];
    numericMatches.forEach(match => {
      const value = parseInt(match[1], 10);
      
      // Skip if it's part of theme or dimensions
      if (line.includes('theme.') || line.includes('Dimensions') || line.includes('width') || line.includes('height')) {
        return;
      }
      
      // Flag values that are common spacing sizes (4, 8, 16, 24, 32, 48, etc.)
      const commonSpacings = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96];
      if (commonSpacings.includes(value) && value >= 4) {
        issues.push({
          line: lineNum,
          property: 'unknown',
          value,
          code: line.trim(),
          suggestion: `Consider using theme.spacing.${getSpacingToken(value)}`,
        });
      }
    });
  });

  return issues;
}

function getSpacingToken(value) {
  const mapping = {
    4: 'xs',
    8: 'sm',
    12: 'sm',
    16: 'md',
    20: 'md',
    24: 'lg',
    32: 'xl',
    40: 'xl',
    48: '2xl',
    64: '3xl',
    80: '3xl',
    96: '4xl',
  };
  return mapping[value] || value.toString();
}

console.log('🔍 Scanning for hardcoded spacing values...\n');

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
    padding: 0,
    margin: 0,
    gap: 0,
    other: 0,
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
      const prop = issue.property.toLowerCase();
      if (prop.includes('padding')) {
        results.summary.padding++;
      } else if (prop.includes('margin')) {
        results.summary.margin++;
      } else if (prop.includes('gap')) {
        results.summary.gap++;
      } else {
        results.summary.other++;
      }
    });
  }
});

// Write report
const outputPath = join(reportsDir, 'spacing_scan.json');
writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`✅ Scan complete!`);
console.log(`   Files scanned: ${results.totalFiles}`);
console.log(`   Files with issues: ${results.filesWithIssues}`);
console.log(`   Total issues: ${results.totalIssues}`);
console.log(`\n   Breakdown:`);
console.log(`   - Padding: ${results.summary.padding}`);
console.log(`   - Margin: ${results.summary.margin}`);
console.log(`   - Gap: ${results.summary.gap}`);
console.log(`   - Other: ${results.summary.other}`);
console.log(`\n   Report saved to: ${outputPath}`);

if (results.totalIssues > 0) {
  process.exit(1);
}

