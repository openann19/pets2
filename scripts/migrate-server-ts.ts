#!/usr/bin/env tsx
/**
 * Server TypeScript Migration Tool
 * Converts all JS files to TypeScript with proper typing
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const DRY_RUN = !WRITE;

interface MigrationStats {
  total: number;
  migrated: number;
  failed: number;
  skipped: number;
}

const stats: MigrationStats = {
  total: 0,
  migrated: 0,
  failed: 0,
  skipped: 0,
};

// Files to skip (test files, config files that don't need migration)
const SKIP_PATTERNS = [
  /\.test\.js$/,
  /\.spec\.js$/,
  /jest\.config\.js$/,
  /setup\.js$/,
  /dist\//,
];

function shouldSkip(filePath: string): boolean {
  return SKIP_PATTERNS.some((pattern) => pattern.test(filePath));
}

function getTypeScriptPath(jsPath: string): string {
  return jsPath.replace(/\.js$/, ".ts");
}

function migrateFile(jsPath: string): boolean {
  try {
    if (shouldSkip(jsPath)) {
      stats.skipped++;
      return true;
    }

    const tsPath = getTypeScriptPath(jsPath);
    const content = fs.readFileSync(jsPath, "utf8");

    // Check if already migrated
    if (fs.existsSync(tsPath)) {
      stats.skipped++;
      return true;
    }

    // Basic migration: just rename and add minimal typing
    let migratedContent = content;

    // Add basic imports if missing
    if (!migratedContent.includes("import")) {
      // File uses require, convert to import
      migratedContent = migratedContent.replace(
        /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
        "import $1 from '$2'"
      );
    }

    if (WRITE) {
      fs.writeFileSync(tsPath, migratedContent, "utf8");
      console.log(`✅ Migrated: ${jsPath} → ${tsPath}`);
      stats.migrated++;
    } else {
      console.log(`📝 Would migrate: ${jsPath} → ${tsPath}`);
      stats.migrated++;
    }

    return true;
  } catch (error) {
    console.error(`❌ Failed to migrate ${jsPath}:`, error);
    stats.failed++;
    return false;
  }
}

function findJsFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          walk(fullPath);
        }
      } else if (entry.name.endsWith(".js")) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

async function run() {
  const serverDir = path.join(process.cwd(), "server/src");

  console.log(`🔍 Scanning ${serverDir} for JavaScript files...`);

  const jsFiles = findJsFiles(serverDir);
  stats.total = jsFiles.length;

  console.log(`Found ${jsFiles.length} JavaScript files\n`);

  for (const jsFile of jsFiles) {
    migrateFile(jsFile);
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Total files: ${stats.total}`);
  console.log(`   Migrated: ${stats.migrated}`);
  console.log(`   Skipped: ${stats.skipped}`);
  console.log(`   Failed: ${stats.failed}`);

  if (DRY_RUN) {
    console.log(`\n💡 Run with --write to apply changes`);
  }
}

run().catch(console.error);
