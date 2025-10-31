#!/usr/bin/env node
/**
 * Add typecheck scripts to packages missing them
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function findPackages() {
  const packages = [];
  const appsDir = join(rootDir, 'apps');
  const packagesDir = join(rootDir, 'packages');

  function scanDir(dir) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const pkgPath = join(dir, entry.name, 'package.json');
          try {
            if (statSync(pkgPath).isFile()) {
              packages.push(pkgPath);
            }
          } catch {
            // Skip if package.json doesn't exist
          }
        }
      }
    } catch {
      // Skip if directory doesn't exist
    }
  }

  scanDir(appsDir);
  scanDir(packagesDir);
  return packages;
}

function hasTypeScriptFiles(pkgDir) {
  try {
    function scanRecursive(dir, depth = 0) {
      if (depth > 5) return false; // Limit depth
      let hasTsConfig = false;
      let hasTsFiles = false;

      try {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === 'node_modules' || entry.name === 'dist') continue;

          if (entry.isDirectory() && depth < 3) {
            const result = scanRecursive(join(dir, entry.name), depth + 1);
            hasTsConfig = hasTsConfig || result.hasTsConfig;
            hasTsFiles = hasTsFiles || result.hasTsFiles;
          } else if (entry.isFile()) {
            if (entry.name.startsWith('tsconfig') && entry.name.endsWith('.json')) {
              hasTsConfig = true;
            }
            if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
              hasTsFiles = true;
            }
          }

          if (hasTsConfig && hasTsFiles) break;
        }
      } catch {
        // Ignore errors
      }

      return { hasTsConfig, hasTsFiles };
    }

    const result = scanRecursive(pkgDir);
    return result.hasTsConfig || result.hasTsFiles;
  } catch {
    return false;
  }
}

function main() {
  const packages = findPackages();

  console.log(`Found ${packages.length} package.json files\n`);

  let added = 0;
  let skipped = 0;

  for (const fullPath of packages) {
    try {
      const content = readFileSync(fullPath, 'utf-8');
      const pkg = JSON.parse(content);
      const pkgName = pkg.name || fullPath.replace(rootDir, '');

      // Check if typecheck or type-check exists
      const hasTypecheck = pkg.scripts?.typecheck || pkg.scripts?.['type-check'];

      if (hasTypecheck) {
        console.log(`⏭️  ${pkgName}: Already has typecheck script`);
        skipped++;
        continue;
      }

      // Try to detect TypeScript usage
      const pkgDir = dirname(fullPath);
      const hasTS = hasTypeScriptFiles(pkgDir);

      if (!hasTS) {
        console.log(`⏭️  ${pkgName}: No TypeScript files detected`);
        skipped++;
        continue;
      }

      // Add typecheck script
      if (!pkg.scripts) {
        pkg.scripts = {};
      }

      // Use type-check to match turbo convention
      pkg.scripts['type-check'] = 'tsc --noEmit';
      if (!pkg.scripts.typecheck) {
        pkg.scripts.typecheck = 'tsc --noEmit';
      }

      writeFileSync(fullPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`✅ ${pkgName}: Added typecheck script`);
      added++;
    } catch (error) {
      console.error(`❌ Error processing ${fullPath}: ${error.message}`);
    }
  }

  console.log(`\n✅ Done! Added: ${added}, Skipped: ${skipped}`);
}

main();
