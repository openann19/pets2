#!/usr/bin/env node

/**
 * Theme Auto-Fix Script
 * Automatically fixes common theme migration issues where possible
 * 
 * Usage: pnpm fix:theme:write
 * 
 * ⚠️ WARNING: This script makes automated changes. Review diffs before committing.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');

// Color mappings (common hex colors to semantic tokens)
const COLOR_MAPPINGS = {
  '#ffffff': 'theme.colors.surface',
  '#fff': 'theme.colors.surface',
  '#000000': 'theme.colors.onSurface',
  '#000': 'theme.colors.onSurface',
  '#333333': 'theme.colors.onSurface',
  '#333': 'theme.colors.onSurface',
  '#666666': 'theme.colors.onMuted',
  '#666': 'theme.colors.onMuted',
  '#999999': 'theme.colors.onMuted',
  '#999': 'theme.colors.onMuted',
  '#e5e5e5': 'theme.colors.border',
  '#e5e7eb': 'theme.colors.border',
  '#f3f4f6': 'theme.colors.bg',
  '#f9fafb': 'theme.colors.bg',
  white: 'theme.colors.surface',
  black: 'theme.colors.onSurface',
};

// Spacing mappings (common values to tokens)
const SPACING_MAPPINGS = {
  4: 'theme.spacing.xs',
  8: 'theme.spacing.sm',
  12: 'theme.spacing.sm',
  16: 'theme.spacing.md',
  20: 'theme.spacing.md',
  24: 'theme.spacing.lg',
  32: 'theme.spacing.xl',
  40: 'theme.spacing.xl',
  48: 'theme.spacing.2xl',
  64: 'theme.spacing.3xl',
  80: 'theme.spacing.3xl',
  96: 'theme.spacing.4xl',
};

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

function needsThemeImport(content) {
  return !content.includes("import { useTheme }") && 
         !content.includes("from '@mobile/theme'") &&
         !content.includes("from '@/theme'");
}

function hasThemeHook(content) {
  return content.includes('const theme = useTheme()') ||
         content.includes('const {') && content.includes('} = useTheme()');
}

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;
  const lines = content.split('\n');

  // Check if we need to add useTheme import
  if (needsThemeImport(content)) {
    // Find the last import statement
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, "import { useTheme } from '@mobile/theme';");
      modified = true;
    }
  }

  // Check if we need to add theme hook
  if (!hasThemeHook(content) && needsThemeImport(content) === false) {
    // Find the component function start
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('export') && (lines[i].includes('function') || lines[i].includes('const') && lines[i].includes('='))) {
        // Find the first non-comment line after function declaration
        let j = i + 1;
        while (j < lines.length && (lines[j].trim().startsWith('//') || lines[j].trim() === '' || lines[j].trim().startsWith('{') && lines[j].trim() === '{')) {
          j++;
        }
        lines.splice(j, 0, '  const theme = useTheme();');
        modified = true;
        break;
      }
    }
  }

  // Replace colors
  Object.entries(COLOR_MAPPINGS).forEach(([oldColor, newToken]) => {
    // Match exact color values in style objects
    const colorPattern = new RegExp(`(backgroundColor|color|borderColor|shadowColor)\\s*:\\s*['"]${oldColor.replace('#', '')}['"]`, 'gi');
    if (colorPattern.test(content)) {
      content = content.replace(colorPattern, (match, prop) => {
        return `${prop}: ${newToken}`;
      });
      modified = true;
    }
  });

  // Replace spacing values (more conservative - only in padding/margin/gap)
  Object.entries(SPACING_MAPPINGS).forEach(([oldValue, newToken]) => {
    const spacingPattern = new RegExp(`(padding|margin|gap)\\s*:\\s*${oldValue}\\b`, 'gi');
    if (spacingPattern.test(content)) {
      content = content.replace(spacingPattern, (match, prop) => {
        return `${prop}: ${newToken}`;
      });
      modified = true;
    }
  });

  if (modified) {
    writeFileSync(filePath, lines.join('\n'), 'utf-8');
    return true;
  }

  return false;
}

console.log('🔧 Running theme auto-fix...\n');
console.log('⚠️  WARNING: This will modify files. Review diffs before committing.\n');

const componentFiles = globSync('**/*.{tsx,jsx}', {
  cwd: srcDir,
  absolute: false,
});

let fixedCount = 0;
const fixedFiles = [];

componentFiles.forEach(file => {
  const filePath = join(srcDir, file);
  
  if (shouldIgnoreFile(filePath)) {
    return;
  }

  if (fixFile(filePath)) {
    fixedCount++;
    fixedFiles.push(file);
  }
});

console.log(`✅ Auto-fix complete!`);
console.log(`   Files modified: ${fixedCount}`);
if (fixedFiles.length > 0) {
  console.log(`\n   Modified files:`);
  fixedFiles.forEach(f => console.log(`   - ${f}`));
}
console.log(`\n⚠️  Please review changes with: git diff`);

