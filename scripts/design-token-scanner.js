#!/usr/bin/env node

/**
 * Design Token Compliance Scanner
 * Scans the codebase for hardcoded colors and design values that should use design tokens
 */

import fs from 'fs';
import path from 'path';

// Design tokens from tokens.json
const DESIGN_TOKENS = {
  colors: {
    brand: {
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      accent: '#FFD700'
    },
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.08)',
      medium: 'rgba(255, 255, 255, 0.12)',
      heavy: 'rgba(255, 255, 255, 0.16)',
      'dark-light': 'rgba(0, 0, 0, 0.08)',
      'dark-medium': 'rgba(0, 0, 0, 0.12)',
      'dark-heavy': 'rgba(0, 0, 0, 0.16)'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  }
};

// Tailwind color mappings from the config
const TAILWIND_COLORS = {
  primary: ['#ec4899', '#db2777', '#be185d', '#9d174d', '#831843', '#500724'],
  secondary: ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#082f49'],
  purple: ['#a855f7', '#9333ea', '#7c3aed', '#6b21b6', '#581c87', '#3b0764'],
  success: ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#451a03'],
  error: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a'],
  neutral: ['#ffffff', '#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717', '#0a0a0a']
};

// Patterns to detect hardcoded colors
const COLOR_PATTERNS = [
  // Hex colors
  /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g,
  // RGB/RGBA colors
  /rgba?\([^)]+\)/g,
  // HSL colors
  /hsl\([^)]+\)/g
];

// Files to scan
const SCAN_PATHS = [
  'apps/web/src',
  'apps/mobile/src'
];

const IGNORE_PATHS = [
  'node_modules',
  'dist',
  'build',
  '.next',
  '.expo',
  'coverage'
];

function shouldIgnorePath(filePath) {
  return IGNORE_PATHS.some(ignorePath => filePath.includes(ignorePath));
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    const patterns = COLOR_PATTERNS;
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const color = match[0];
        if (!isDesignTokenColor(color)) {
          violations.push({
            type: 'hardcoded-color',
            value: color,
            line: getLineNumber(content, match.index),
            suggestion: getColorSuggestion(color)
          });
        }
      }
    });

    // Check for hardcoded Tailwind colors that should use design tokens
    Object.entries(TAILWIND_COLORS).forEach(([tokenName, colors]) => {
      colors.forEach(color => {
        const colorPattern = new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        let match;
        while ((match = colorPattern.exec(content)) !== null) {
          violations.push({
            type: 'tailwind-hardcoded',
            value: color,
            token: tokenName,
            line: getLineNumber(content, match.index),
            suggestion: `Use ${tokenName}-500 or appropriate design token`
          });
        }
      });
    });

    return violations;
  } catch {
    return [];
  }
}

function isDesignTokenColor(color) {
  // Check if color matches any design token value
  const allTokenValues = Object.values(DESIGN_TOKENS.colors).flatMap(category =>
    typeof category === 'object' ? Object.values(category) : [category]
  );

  return allTokenValues.some(tokenValue =>
    tokenValue.toLowerCase() === color.toLowerCase()
  );
}

function getColorSuggestion(color) {
  // Find closest matching design token
  const suggestions = [];

  // Check brand colors
  Object.entries(DESIGN_TOKENS.colors.brand).forEach(([name, value]) => {
    if (colorsSimilar(color, value)) {
      suggestions.push(`${name} (${value})`);
    }
  });

  // Check neutral colors
  Object.entries(DESIGN_TOKENS.colors.neutral).forEach(([name, value]) => {
    if (colorsSimilar(color, value)) {
      suggestions.push(`neutral-${name} (${value})`);
    }
  });

  return suggestions.length > 0 ? `Consider using: ${suggestions.join(', ')}` : 'Replace with appropriate design token';
}

function colorsSimilar(color1, color2) {
  // Simple similarity check - in a real implementation, you'd convert to HSL and compare
  return color1.toLowerCase() === color2.toLowerCase();
}

function getLineNumber(content, index) {
  const lines = content.substring(0, index).split('\n');
  return lines.length;
}

function scanDirectory(dirPath) {
  const results = [];

  function scan(dir) {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (shouldIgnorePath(fullPath)) {
        return;
      }

      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.js') || item.endsWith('.jsx'))) {
        const violations = scanFile(fullPath);
        if (violations.length > 0) {
          results.push({
            file: path.relative(process.cwd(), fullPath),
            violations
          });
        }
      }
    });
  }

  scan(dirPath);
  return results;
}

function generateReport(results) {
  console.log('🔍 Design Token Compliance Report');
  console.log('=====================================\n');

  if (results.length === 0) {
    console.log('✅ No hardcoded colors found! All design tokens are properly used.');
    return;
  }

  let totalViolations = 0;

  results.forEach(result => {
    console.log(`📁 ${result.file}`);
    result.violations.forEach(violation => {
      totalViolations++;
      console.log(`  ❌ Line ${violation.line}: ${violation.value}`);
      console.log(`     ${violation.suggestion}`);
      if (violation.token) {
        console.log(`     Use design token: ${violation.token}`);
      }
      console.log('');
    });
  });

  console.log(`📊 Summary: ${totalViolations} violations found across ${results.length} files`);
  console.log('\n💡 Recommendations:');
  console.log('  1. Replace hardcoded colors with design tokens from @pawfectmatch/design-tokens');
  console.log('  2. Use CSS custom properties for dynamic theming');
  console.log('  3. Run this scanner regularly in CI/CD pipeline');
  console.log('  4. Consider adding ESLint rules for design token compliance');
}

// Run the scanner
console.log('🔍 Scanning for design token compliance...\n');

const allResults = [];
SCAN_PATHS.forEach(scanPath => {
  if (fs.existsSync(scanPath)) {
    const results = scanDirectory(scanPath);
    allResults.push(...results);
  } else {
    console.log(`⚠️  Path not found: ${scanPath}`);
  }
});

generateReport(allResults);

// Exit with error code if violations found (for CI/CD)
if (allResults.length > 0) {
  process.exit(1);
}
