#!/usr/bin/env node
/**
 * Automated fix for deprecated waitForNextUpdate pattern
 * Replaces waitForNextUpdate with modern waitFor pattern
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

const TEST_PATTERN = '**/*.test.{ts,tsx}';
const MOBILE_DIR = 'apps/mobile/src';

async function findTestFiles() {
  const files = await glob(TEST_PATTERN, {
    cwd: MOBILE_DIR,
    absolute: true,
  });
  return files;
}

function fixWaitForNextUpdate(content) {
  let modified = content;
  let changeCount = 0;

  // Pattern 1: const { result, waitForNextUpdate } = renderHook(...)
  const pattern1 = /const\s*\{\s*([^,}]+),\s*waitForNextUpdate\s*\}\s*=\s*renderHook\(/g;
  if (pattern1.test(modified)) {
    modified = modified.replace(pattern1, (match, rest) => {
      changeCount++;
      // Extract variable names, remove waitForNextUpdate
      const vars = rest.split(',').map(v => v.trim()).filter(v => v !== 'waitForNextUpdate').join(', ');
      return `const { ${vars} } = renderHook(`;
    });
  }

  // Pattern 2: await waitForNextUpdate()
  const pattern2 = /await\s+waitForNextUpdate\(\);/g;
  if (pattern2.test(modified)) {
    // Need context - this is more complex, requires understanding what's being tested
    // For now, we'll add a comment and suggest manual fix
    modified = modified.replace(pattern2, (match) => {
      changeCount++;
      return `// TODO: Replace with waitFor pattern\n    // await waitFor(() => { expect(result.current).toBe(...); });`;
    });
  }

  // Ensure waitFor is imported if waitForNextUpdate was used
  if (changeCount > 0 && !modified.includes('waitFor') && modified.includes('@testing-library/react-native')) {
    const importPattern = /from\s+['"]@testing-library\/react-native['"];?/;
    if (importPattern.test(modified)) {
      modified = modified.replace(importPattern, (match) => {
        if (!match.includes('waitFor')) {
          return match.replace(
            /import\s+\{([^}]+)\}/,
            (m, imports) => {
              const importsList = imports.split(',').map(i => i.trim());
              if (!importsList.includes('waitFor')) {
                importsList.push('waitFor');
              }
              return `import { ${importsList.join(', ')} }`;
            }
          );
        }
        return match;
      });
    }
  }

  return { modified, changeCount };
}

async function main() {
  console.log('🔧 Fixing deprecated waitForNextUpdate patterns...\n');

  const files = await findTestFiles();
  let totalChanges = 0;
  let filesModified = 0;

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf8');

      if (content.includes('waitForNextUpdate')) {
        const { modified, changeCount } = fixWaitForNextUpdate(content);

        if (changeCount > 0) {
          writeFileSync(file, modified);
          filesModified++;
          totalChanges += changeCount;
          console.log(`✅ Fixed ${file} (${changeCount} changes)`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n✅ Complete! Modified ${filesModified} files, ${totalChanges} total changes`);
  console.log('⚠️  Note: Some waitForNextUpdate replacements may need manual review');
}

main().catch(console.error);

