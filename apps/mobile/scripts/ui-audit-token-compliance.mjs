#!/usr/bin/env node
/**
 * UI Audit: Token Compliance Scanner
 * 
 * Detects divergences from design tokens (colors, spacing, radii, typography).
 * Scans for hardcoded values, magic numbers, and non-compliant token usage.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

const SRC_DIR = path.join(rootDir, 'apps/mobile/src');
const THEME_CONTRACTS = path.join(rootDir, 'apps/mobile/src/theme/contracts.ts');

/**
 * Load theme token definitions
 */
function loadThemeTokens() {
  const content = fs.readFileSync(THEME_CONTRACTS, 'utf-8');
  
  // Extract spacing tokens
  const spacingMatch = content.match(/SpacingScale\s*=\s*\{([^}]+)\}/s);
  const spacingTokens = spacingMatch 
    ? spacingMatch[1].match(/'(\w+)':/g)?.map(m => m.replace(/'/g, '').replace(':', '')) || []
    : ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];
  
  // Extract radii tokens
  const radiiMatch = content.match(/RadiiScale\s*=\s*\{([^}]+)\}/s);
  const radiiTokens = radiiMatch
    ? radiiMatch[1].match(/'(\w+)':/g)?.map(m => m.replace(/'/g, '').replace(':', '')) || []
    : ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'pill', 'full'];
  
  return {
    spacing: spacingTokens,
    radii: radiiTokens,
    colors: {
      semantic: ['bg', 'surface', 'overlay', 'border', 'onBg', 'onSurface', 'onMuted', 'primary', 'onPrimary', 'success', 'danger', 'warning', 'info'],
      deprecated: ['text.primary', 'text.secondary', 'colors.gray', 'colors.white', 'colors.neutral'],
    },
  };
}

/**
 * Scan file for token violations
 */
function scanFile(filePath, tokens) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];
  
  // Skip test files and node_modules
  if (filePath.includes('__tests__') || filePath.includes('node_modules')) {
    return violations;
  }
  
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for hardcoded spacing values (px numbers)
    const spacingViolations = line.match(/(?:padding|margin|gap|spacing):\s*(\d+)(px)?/gi);
    if (spacingViolations) {
      spacingViolations.forEach(match => {
        const value = match.match(/(\d+)/)?.[1];
        if (value && !line.includes('theme.spacing')) {
          violations.push({
            type: 'hardcoded_spacing',
            line: lineNum,
            value: match.trim(),
            severity: 'medium',
            suggestion: `Use theme.spacing token instead of ${value}px`,
          });
        }
      });
    }
    
    // Check for hardcoded radius values
    const radiusViolations = line.match(/(?:borderRadius|radius):\s*(\d+)(px)?/gi);
    if (radiusViolations) {
      radiusViolations.forEach(match => {
        const value = match.match(/(\d+)/)?.[1];
        if (value && !line.includes('theme.radii')) {
          violations.push({
            type: 'hardcoded_radius',
            line: lineNum,
            value: match.trim(),
            severity: 'medium',
            suggestion: `Use theme.radii token instead of ${value}px`,
          });
        }
      });
    }
    
    // Check for deprecated color patterns
    tokens.colors.deprecated.forEach(pattern => {
      if (line.includes(pattern) && !line.includes('//') && !line.includes('deprecated')) {
        violations.push({
          type: 'deprecated_color',
          line: lineNum,
          value: pattern,
          severity: 'high',
          suggestion: `Replace ${pattern} with semantic color token (theme.colors.onSurface, theme.colors.surface, etc.)`,
        });
      }
    });
    
    // Check for magic numbers in calculations
    const magicNumberViolations = line.match(/spacing\.\w+\s*[\*\+\-]\s*\d+/g);
    if (magicNumberViolations) {
      magicNumberViolations.forEach(match => {
        violations.push({
          type: 'spacing_calculation',
          line: lineNum,
          value: match.trim(),
          severity: 'low',
          suggestion: 'Prefer semantic spacing tokens over calculations (e.g., spacing.xl instead of spacing.lg * 2)',
        });
      });
    }
    
    // Check for hex colors (should use theme tokens)
    const hexColors = line.match(/#[0-9A-Fa-f]{6}/g);
    if (hexColors && !line.includes('theme.colors') && !line.includes('//')) {
      hexColors.forEach(color => {
        violations.push({
          type: 'hardcoded_color',
          line: lineNum,
          value: color,
          severity: 'high',
          suggestion: `Replace ${color} with theme.colors token`,
        });
      });
    }
    
    // Check for rgba/rgb colors
    const rgbColors = line.match(/(?:rgba?|rgb)\([^)]+\)/gi);
    if (rgbColors && !line.includes('theme.colors') && !line.includes('theme.utils.alpha') && !line.includes('//')) {
      rgbColors.forEach(color => {
        violations.push({
          type: 'hardcoded_color',
          line: lineNum,
          value: color,
          severity: 'high',
          suggestion: `Replace ${color} with theme.colors token or theme.utils.alpha()`,
        });
      });
    }
  });
  
  return violations;
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip node_modules, __tests__, and test files
    if (entry.name === 'node_modules' || entry.name === '__tests__' || 
        entry.name.includes('.test.') || entry.name.includes('.spec.')) {
      continue;
    }
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

/**
 * Scan all source files
 */
function scanAllFiles(tokens) {
  const files = scanDirectory(SRC_DIR);
  
  const results = {
    totalFiles: files.length,
    violations: [],
    byFile: {},
    byType: {},
    summary: {
      high: 0,
      medium: 0,
      low: 0,
    },
  };
  
  for (const filePath of files) {
    const violations = scanFile(filePath, tokens);
    const relativePath = path.relative(SRC_DIR, filePath);
    
    if (violations.length > 0) {
      results.violations.push(...violations.map(v => ({ ...v, file: relativePath })));
      results.byFile[relativePath] = violations;
      
      violations.forEach(v => {
        if (!results.byType[v.type]) {
          results.byType[v.type] = [];
        }
        results.byType[v.type].push({ ...v, file: relativePath });
        
        if (v.severity === 'high') results.summary.high++;
        else if (v.severity === 'medium') results.summary.medium++;
        else results.summary.low++;
      });
    }
  }
  
  return results;
}

/**
 * Generate compliance report
 */
function generateReport() {
  const tokens = loadThemeTokens();
  const results = scanAllFiles(tokens);
  
  const report = {
    generatedAt: new Date().toISOString(),
    tokens: {
      spacing: tokens.spacing,
      radii: tokens.radii,
      colors: tokens.colors,
    },
    compliance: {
      totalFiles: results.totalFiles,
      filesWithViolations: Object.keys(results.byFile).length,
      complianceRate: ((results.totalFiles - Object.keys(results.byFile).length) / results.totalFiles * 100).toFixed(2) + '%',
    },
    violations: {
      summary: results.summary,
      byType: Object.entries(results.byType).map(([type, violations]) => ({
        type,
        count: violations.length,
        severity: violations[0]?.severity || 'unknown',
        examples: violations.slice(0, 5),
      })),
      byFile: Object.entries(results.byFile).map(([file, violations]) => ({
        file,
        count: violations.length,
        violations: violations.slice(0, 10), // Limit per file
      })),
    },
    recommendations: [
      'Replace all hardcoded spacing values with theme.spacing tokens',
      'Replace all hardcoded radius values with theme.radii tokens',
      'Replace deprecated color patterns (theme.colors.text.*) with semantic tokens',
      'Remove magic number calculations in favor of semantic tokens',
      'Use theme.utils.alpha() for opacity variations instead of rgba()',
    ],
  };
  
  return report;
}

// Generate and save
const report = generateReport();
const outputPath = path.join(rootDir, 'docs/ui_audit_token_compliance.json');

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

console.log('✅ Token compliance report generated:', outputPath);
console.log(`   Files scanned: ${report.compliance.totalFiles}`);
console.log(`   Files with violations: ${report.compliance.filesWithViolations}`);
console.log(`   Compliance rate: ${report.compliance.complianceRate}`);
console.log(`   High severity: ${report.violations.summary.high}`);
console.log(`   Medium severity: ${report.violations.summary.medium}`);
console.log(`   Low severity: ${report.violations.summary.low}`);

