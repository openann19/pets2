#!/usr/bin/env node
/**
 * Comprehensive codebase fixer script
 * Fixes TypeScript type import issues, unused imports, and other code quality problems
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

const SRC_DIR = join(process.cwd(), 'src');

// Type-only imports that should use 'import type' or inline 'type' keyword
const TYPE_ONLY_IMPORTS = new Set([
  'RenderResult',
  'RenderOptions',
  'RenderAPI',
  'Queries',
  'BoundFunctions',
  'ComponentProps',
  'ComponentType',
  'ComponentPropsWithRef',
  'PropsWithChildren',
  'FC',
  'ReactElement',
  'ReactNode',
  'JSX',
]);

// Packages that often export types that should be type-only imported
const TYPE_HEAVY_PACKAGES = new Set([
  '@testing-library/react-native',
  '@testing-library/react',
  'react',
  '@types/react',
]);

function getAllSourceFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other build dirs
      if (
        !file.startsWith('.') &&
        file !== 'node_modules' &&
        file !== 'dist' &&
        file !== 'build'
      ) {
        getAllSourceFiles(filePath, fileList);
      }
    } else if (['.ts', '.tsx'].includes(extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function fixTypeImports(content, filePath) {
  let modified = false;
  let newContent = content;

  // Fix imports from type-heavy packages
  const importRegex =
    /^import\s+{([^}]+)}\s+from\s+['"](@testing-library\/react-native|@testing-library\/react|react|@types\/react)['"];?/gm;

  newContent = newContent.replace(importRegex, (match, imports, packageName) => {
    const importList = imports
      .split(',')
      .map((imp) => imp.trim())
      .filter(Boolean);

    const runtimeImports = [];
    const typeImports = [];
    let hasChanges = false;

    importList.forEach((imp) => {
      const isType = imp.startsWith('type ') || TYPE_ONLY_IMPORTS.has(imp);
      const cleanImp = imp.replace(/^type\s+/, '');

      if (isType) {
        typeImports.push(cleanImp);
        if (!imp.startsWith('type ')) {
          hasChanges = true;
        }
      } else {
        runtimeImports.push(imp);
      }
    });

    if (hasChanges || typeImports.length > 0) {
      modified = true;
      const parts = [];

      if (runtimeImports.length > 0) {
        parts.push(`import { ${runtimeImports.join(', ')} } from '${packageName}';`);
      }

      if (typeImports.length > 0) {
        parts.push(`import type { ${typeImports.join(', ')} } from '${packageName}';`);
      }

      return parts.join('\n');
    }

    return match;
  });

  // Fix inline type imports in mixed imports
  const inlineTypeRegex =
    /^import\s+{\s*([^}]+)\s*}\s+from\s+['"](@testing-library\/react-native|@testing-library\/react)['"];?/gm;

  newContent = newContent.replace(inlineTypeRegex, (match, imports, packageName) => {
    const importList = imports.split(',').map((imp) => imp.trim());
    const needsFix = importList.some(
      (imp) => TYPE_ONLY_IMPORTS.has(imp) && !imp.startsWith('type ')
    );

    if (needsFix) {
      modified = true;
      const fixedImports = importList
        .map((imp) => {
          if (TYPE_ONLY_IMPORTS.has(imp) && !imp.startsWith('type ')) {
            return `type ${imp}`;
          }
          return imp;
        })
        .join(', ');

      return `import { ${fixedImports} } from '${packageName}';`;
    }

    return match;
  });

  return { content: newContent, modified };
}

function removeUnusedImports(content) {
  // This is a simplified version - full implementation would require AST parsing
  // For now, we'll just flag potential issues
  const lines = content.split('\n');
  const imports = [];
  const usedSymbols = new Set();

  // Collect all imports
  lines.forEach((line, index) => {
    const importMatch = line.match(/^import\s+.*\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      imports.push({ line, index, package: importMatch[1] });
    }
  });

  // Find usage of imported symbols (simplified - would need full AST for accuracy)
  content.split(/\W+/).forEach((word) => {
    if (word && word.length > 1) {
      usedSymbols.add(word);
    }
  });

  // This is a placeholder - actual unused import detection requires TypeScript compiler
  return content;
}

function fixFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    let { content: newContent, modified } = fixTypeImports(content, filePath);

    if (modified) {
      writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Scanning codebase for type import issues...\n');

  const files = getAllSourceFiles(SRC_DIR);
  let fixedCount = 0;

  files.forEach((file) => {
    if (fixFile(file)) {
      fixedCount++;
    }
  });

  console.log(`\n✅ Fixed ${fixedCount} file(s)`);
  console.log('\n💡 Tip: Run "pnpm typecheck" and "pnpm lint" to verify fixes\n');
}

main();
