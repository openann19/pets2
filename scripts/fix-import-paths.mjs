#!/usr/bin/env node
/**
 * Automated fix for common import path issues
 * - File casing conflicts
 * - Wrong path aliases
 * - Missing extensions
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const MOBILE_DIR = 'apps/mobile/src';
const FIXES = [
  // Casing fixes
  {
    pattern: /from\s+['"]@\/services\/premiumService['"]/g,
    replacement: "from '@/services/PremiumService'",
    description: 'premiumService → PremiumService',
  },
  {
    pattern: /from\s+['"]@mobile\/theme['"]/g,
    replacement: "from '@/theme'",
    description: '@mobile/theme → @/theme',
  },
  {
    pattern: /from\s+['"]\.\.\/theme\/unified-theme['"]/g,
    replacement: "from '@/theme'",
    description: '../theme/unified-theme → @/theme',
  },
  // Function name fixes
  {
    pattern: /useReducedMotion\(\)/g,
    replacement: 'useReduceMotion()',
    description: 'useReducedMotion → useReduceMotion',
    context: 'hooks',
  },
];

async function findSourceFiles() {
  const files = await glob('**/*.{ts,tsx}', {
    cwd: MOBILE_DIR,
    absolute: true,
    ignore: ['**/node_modules/**', '**/__tests__/**', '**/*.test.*'],
  });
  return files;
}

async function findTestFiles() {
  const files = await glob('**/*.test.{ts,tsx}', {
    cwd: MOBILE_DIR,
    absolute: true,
  });
  return files;
}

function applyFixes(content, filePath) {
  let modified = content;
  let changeCount = 0;
  const appliedFixes = [];

  for (const fix of FIXES) {
    // Skip context-specific fixes if context doesn't match
    if (fix.context === 'hooks' && !filePath.includes('hooks')) {
      continue;
    }

    if (fix.pattern.test(modified)) {
      modified = modified.replace(fix.pattern, fix.replacement);
      changeCount++;
      appliedFixes.push(fix.description);
    }
  }

  return { modified, changeCount, appliedFixes };
}

async function main() {
  console.log('🔧 Fixing import path issues...\n');

  const sourceFiles = await findSourceFiles();
  const testFiles = await findTestFiles();
  const allFiles = [...sourceFiles, ...testFiles];

  let totalChanges = 0;
  let filesModified = 0;

  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf8');
      const { modified, changeCount, appliedFixes } = applyFixes(content, file);

      if (changeCount > 0) {
        writeFileSync(file, modified);
        filesModified++;
        totalChanges += changeCount;
        console.log(`✅ Fixed ${file}`);
        appliedFixes.forEach(fix => console.log(`   - ${fix}`));
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n✅ Complete! Modified ${filesModified} files, ${totalChanges} total changes`);
}

main().catch(console.error);

