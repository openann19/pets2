#!/usr/bin/env tsx
/**
 * Comment out EnhancedDesignTokens imports that don't exist
 */

import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOBILE_DIR = path.join(__dirname, "../apps/mobile");
const DRY_RUN = !process.argv.includes("--write");

async function main() {
  const files = await fg(["src/**/*.{ts,tsx}"], { 
    cwd: MOBILE_DIR, 
    absolute: true 
  });

  let stats = { filesChanged: 0, importsCommented: 0 };

  for (const file of files) {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Find and comment out EnhancedDesignTokens imports
    const enhancedImportRegex = /^(import\s*{\s*[^}]*}\s*from\s*['"][^'"]*EnhancedDesignTokens['"];?)$/gm;
    
    content = content.replace(enhancedImportRegex, (match) => {
      stats.importsCommented++;
      changed = true;
      return `// ${match} // FIXME: EnhancedDesignTokens exports missing`;
    });

    if (changed) {
      stats.filesChanged++;
      if (!DRY_RUN) {
        fs.writeFileSync(file, content, "utf-8");
      }
    }
  }

  console.log(`fix-enhanced-tokens: ${stats.filesChanged} files changed`);
  console.log(`  Imports commented: ${stats.importsCommented}`);
  console.log(DRY_RUN ? "ℹ️ dry-run (use --write)" : "✅ changes written");
}

main().catch(console.error);