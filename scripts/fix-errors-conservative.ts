#!/usr/bin/env node
/**
 * Conservative TypeScript Error Fixer
 * Only applies proven safe fixes
 */

import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOBILE_DIR = path.join(__dirname, "../apps/mobile");
const DRY_RUN = !process.argv.includes("--write");

const stats = {
  propertyAccess: 0,
  typeImports: 0,
  tokenImports: 0,
  total: 0,
};

// 1. Fix incorrect Theme property access (TS2339)
function fixThemePropertyAccess() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    const fixes = [
      // Fix Theme.colors.shadow → Theme.shadow
      { from: /Theme\.colors\.shadow/g, to: "Theme.shadow" },
      // Fix Theme.colors.glass → Theme.glass  
      { from: /Theme\.colors\.glass/g, to: "Theme.glass" },
      // Fix Theme.colors.glow → Theme.glow
      { from: /Theme\.colors\.glow/g, to: "Theme.glow" },
      // Fix Theme.shadows.glow → Theme.glow
      { from: /Theme\.shadows\.glow/g, to: "Theme.glow" },
      // Fix Theme.colors.gradients → Theme.gradients
      { from: /Theme\.colors\.gradients/g, to: "Theme.gradients" },
      // Fix Theme.typography.fontWeight.regular → normal
      { from: /Theme\.typography\.fontWeight\.regular/g, to: "Theme.typography.fontWeight.normal" },
    ];

    fixes.forEach(({ from, to }) => {
      if (from.test(content)) {
        const count = (content.match(from) || []).length;
        content = content.replace(from, to);
        changed = true;
        stats.propertyAccess += count;
      }
    });

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 2. Fix type-only imports (TS1484)
function fixTypeImports() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    const typeOnlyPatterns = [
      { from: /^import\s+{\s*PetFormData\s*}\s+from/gm, to: "import type { PetFormData } from" },
      { from: /^import\s+{\s*PhotoData\s*}\s+from/gm, to: "import type { PhotoData } from" },
      { from: /^import\s+{\s*CallData\s*}\s+from/gm, to: "import type { CallData } from" },
    ];

    typeOnlyPatterns.forEach(({ from, to }) => {
      if (from.test(content)) {
        const count = (content.match(from) || []).length;
        content = content.replace(from, to);
        changed = true;
        stats.typeImports += count;
      }
    });

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 3. Remove non-existent tokens import (TS2305)
function removeTokensImport() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Remove entire line with tokens import
    const tokenImportRegex = /^import\s+{\s*tokens[^}]*}\s+from\s+['"]@pawfectmatch\/design-tokens['"];?\s*\n/gm;
    
    if (tokenImportRegex.test(content)) {
      const count = (content.match(tokenImportRegex) || []).length;
      content = content.replace(tokenImportRegex, "");
      changed = true;
      stats.tokenImports += count;
    }

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// Main execution
async function main() {
  const mode = DRY_RUN ? "DRY-RUN" : "WRITE";
  // eslint-disable-next-line no-console
  console.log(`🛡️  Conservative TypeScript Error Fixer (${mode})...\n`);

  try {
    // eslint-disable-next-line no-console
    console.log("1️⃣  Fixing Theme property access...");
    fixThemePropertyAccess();

    // eslint-disable-next-line no-console
    console.log("2️⃣  Fixing type-only imports...");
    fixTypeImports();

    // eslint-disable-next-line no-console
    console.log("3️⃣  Removing tokens imports...");
    removeTokensImport();

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    // eslint-disable-next-line no-console
    console.log("\n✅ Fixes Applied:\n");
    // eslint-disable-next-line no-console
    console.log(`  • Property access fixes: ${stats.propertyAccess}`);
    // eslint-disable-next-line no-console
    console.log(`  • Type import fixes: ${stats.typeImports}`);
    // eslint-disable-next-line no-console
    console.log(`  • Tokens import removals: ${stats.tokenImports}`);
    // eslint-disable-next-line no-console
    console.log(`\n📊 Total fixes: ${total}`);

    if (DRY_RUN) {
      // eslint-disable-next-line no-console
      console.log("\n💡 Run with --write to apply changes:");
      // eslint-disable-next-line no-console
      console.log("   pnpm exec tsx scripts/fix-errors-conservative.ts --write");
    } else {
      // eslint-disable-next-line no-console
      console.log("\n✨ Changes applied successfully!");
      // eslint-disable-next-line no-console
      console.log("   Run: pnpm --dir apps/mobile tsc --noEmit");
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
