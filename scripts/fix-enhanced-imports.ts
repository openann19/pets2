#!/usr/bin/env tsx
/**
 * Uncomment and fix EnhancedDesignTokens imports
 * Point them to the new RN-safe facade
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

  let stats = { filesFixed: 0, importsRestored: 0 };

  for (const file of files) {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Remove FIXME comments and uncomment imports
    content = content.replace(/\/\/ FIXME: EnhancedDesignTokens exports missing\s*\n/g, '');
    
    // Uncomment the import lines
    content = content.replace(/^\/\/ (import\s*{[^}]*}\s*from\s*['"][^'"]*EnhancedDesignTokens['"];?)$/gm, '$1');
    
    // Fix the import path to use relative path
    content = content.replace(
      /from\s*['"][^'"]*EnhancedDesignTokens['"];?/g, 
      `from '../styles/EnhancedDesignTokens';`
    );

    // Count restored imports
    const importMatches = content.match(/import\s*{[^}]*}\s*from\s*['"][^'"]*EnhancedDesignTokens['"];?/g);
    if (importMatches) {
      stats.importsRestored += importMatches.length;
      changed = true;
    }

    if (changed) {
      stats.filesFixed++;
      if (!DRY_RUN) {
        fs.writeFileSync(file, content, "utf-8");
      }
    }
  }

  console.log(`fix-enhanced-imports: ${stats.filesFixed} files fixed`);
  console.log(`  Imports restored: ${stats.importsRestored}`);
  console.log(DRY_RUN ? "ℹ️ dry-run (use --write)" : "✅ changes written");
}

main().catch(console.error);