#!/usr/bin/env node

/**
 * Scan for UI violations: raw colors, raw spacings, Theme namespace usage
 * 
 * Usage: pnpm mobile:scan:ui
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '../src');

// Color patterns
const HEX_PATTERN = /#([0-9a-fA-F]{3,8})\b/gi;
const RGBA_PATTERN = /rgba?\(/gi;
const HSLA_PATTERN = /hsla?\(/gi;

// Spacing patterns
const RAW_SPACING_PATTERN = /(padding|margin|gap)\s*:\s*(\d+)\b/gi;
const RAW_NUMERIC_PATTERN = /:\s*(\d{2,})\s*[,;]/g; // catches large numeric values

let violations = [];

function shouldIgnoreFile(filePath) {
  const ignorePatterns = [
    'node_modules',
    '__tests__',
    '__mocks__',
    'design-tokens',
    'unified-theme',
    'theme/Provider',
    'theme/rnTokens',
    'resolve.ts',
    '.test.ts',
    '.config.',
    'jest.setup',
    'setupTests',
  ];
  
  return ignorePatterns.some(pattern => filePath.includes(pattern));
}

function scanForColors(content, filePath) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for hex colors
    const hexMatches = line.match(HEX_PATTERN);
    if (hexMatches) {
      hexMatches.forEach(match => {
        violations.push({
          file: filePath,
          line: index + 1,
          type: 'raw-color',
          message: `Raw hex color: ${match}`,
          code: line.trim(),
        });
      });
    }
    
    // Check for rgba/hsla
    const rgbaMatches = line.match(RGBA_PATTERN);
    if (rgbaMatches) {
      violations.push({
        file: filePath,
        line: index + 1,
        type: 'raw-color',
        message: `Raw color function detected`,
        code: line.trim(),
      });
    }
  });
}

function scanForSpacing(content, filePath) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for raw spacing values
    if (RAW_SPACING_PATTERN.test(line)) {
      const matches = line.match(RAW_SPACING_PATTERN);
      if (matches) {
        matches.forEach(match => {
          const value = match.match(/\d+/);
          if (value && parseInt(value[0]) > 4) {
            violations.push({
              file: filePath,
              line: index + 1,
              type: 'raw-spacing',
              message: `Raw spacing value: ${match}`,
              code: line.trim(),
            });
          }
        });
      }
    }
  });
}

function scanDirectory(dir, depth = 0) {
  if (depth > 10) return; // Prevent infinite recursion
  
  const entries = fs.readdirSync(dir);
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry);
    
    if (shouldIgnoreFile(fullPath)) {
      return;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, depth + 1);
    } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.tsx'))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        scanForColors(content, fullPath.replace(SRC_DIR, 'src'));
        scanForSpacing(content, fullPath.replace(SRC_DIR, 'src'));
      } catch (error) {
        console.error(`Error reading ${fullPath}:`, error.message);
      }
    }
  });
}

function generateReport() {
  console.log('\n🔍 UI Violations Scan Report');
  console.log('='.repeat(60));
  
  if (violations.length === 0) {
    console.log('\n✅ No violations found!\n');
    return 0;
  }
  
  const byType = violations.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {});
  
  console.log(`\nTotal violations: ${violations.length}`);
  console.log(`  - Raw colors: ${byType['raw-color'] || 0}`);
  console.log(`  - Raw spacing: ${byType['raw-spacing'] || 0}`);
  
  console.log('\n📋 Violations by file:\n');
  
  const byFile = violations.reduce((acc, v) => {
    if (!acc[v.file]) acc[v.file] = [];
    acc[v.file].push(v);
    return acc;
  }, {});
  
  Object.entries(byFile).forEach(([file, violations]) => {
    console.log(`\n${file}:`);
    violations.slice(0, 5).forEach(v => {
      console.log(`  Line ${v.line}: ${v.message}`);
      console.log(`    ${v.code.substring(0, 80)}...`);
    });
    if (violations.length > 5) {
      console.log(`  ... and ${violations.length - 5} more`);
    }
  });
  
  console.log('\n❌ Scan failed. Please fix violations or update the ignore patterns.\n');
  
  return 1;
}

// Run scan
console.log('🔍 Scanning for UI violations...\n');
scanDirectory(SRC_DIR);

const exitCode = generateReport();
process.exit(exitCode);
