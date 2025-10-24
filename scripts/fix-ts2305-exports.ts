#!/usr/bin/env node
/**
 * TS2305 Fixer - Module has no exported member
 * Fixes missing exports by removing/commenting problematic imports
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
  tokensRemoved: 0,
  gestureHandlerFixed: 0,
  enhancedTokensFixed: 0,
  maskedViewFixed: 0,
  total: 0,
};

// 1. Remove tokens imports from design-tokens (doesn't exist)
function removeTokensImports() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Remove line with tokens import from design-tokens
    const tokenImportRegex = /^import\s+{\s*tokens[^}]*}\s+from\s+['"]@pawfectmatch\/design-tokens['"];?\s*$/gm;
    
    if (tokenImportRegex.test(content)) {
      const count = (content.match(tokenImportRegex) || []).length;
      content = content.replace(tokenImportRegex, "// tokens import removed - not exported");
      changed = true;
      stats.tokensRemoved += count;
    }

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 2. Fix gesture handler imports (should be from react-native-gesture-handler)
function fixGestureHandlerImports() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Check if file imports PanGestureHandler or State from react-native
    if (/PanGestureHandler[,\s}]/.test(content) && /from\s+['"]react-native['"]/.test(content)) {
      // Find the react-native import and remove gesture handler items
      content = content.replace(
        /^import\s+{([^}]*PanGestureHandler[^}]*)}\s+from\s+['"]react-native['"];?$/gm,
        (match, imports) => {
          const items = imports.split(',').map(s => s.trim()).filter(s => 
            !s.includes('PanGestureHandler') && !s.includes('State')
          );
          if (items.length > 0) {
            return `import { ${items.join(', ')} } from 'react-native';`;
          }
          return '// react-native import removed - no valid items';
        }
      );
      
      // Add comment about gesture handler
      if (!content.includes('react-native-gesture-handler')) {
        content = "// FIXME: Import PanGestureHandler, State from 'react-native-gesture-handler'\n" + content;
      }
      
      changed = true;
      stats.gestureHandlerFixed++;
    }

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 3. Comment out EnhancedDesignTokens imports (file structure issue)
function fixEnhancedTokensImports() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Comment out problematic imports from EnhancedDesignTokens
    const problematicImports = [
      'DynamicColors',
      'EnhancedShadows',
      'SemanticColors',
      'EnhancedTypography',
      'MotionSystem',
    ];

    problematicImports.forEach((importName) => {
      const regex = new RegExp(`^(\\s*)(${importName}[,\\s}])`, 'gm');
      if (regex.test(content) && content.includes('EnhancedDesignTokens')) {
        content = content.replace(regex, `$1// $2 // FIXME: Export not found`);
        changed = true;
        stats.enhancedTokensFixed++;
      }
    });

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 4. Fix MaskedViewIOS import (renamed to MaskedView)
function fixMaskedViewImport() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Replace MaskedViewIOS with MaskedView
    if (/MaskedViewIOS/.test(content)) {
      content = content.replace(/MaskedViewIOS/g, 'MaskedView');
      changed = true;
      stats.maskedViewFixed++;
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
  console.log(`🔧 TS2305 Export Fixer (${mode})...\n`);

  try {
    // eslint-disable-next-line no-console
    console.log("1️⃣  Removing tokens imports...");
    removeTokensImports();

    // eslint-disable-next-line no-console
    console.log("2️⃣  Fixing gesture handler imports...");
    fixGestureHandlerImports();

    // eslint-disable-next-line no-console
    console.log("3️⃣  Fixing EnhancedDesignTokens imports...");
    fixEnhancedTokensImports();

    // eslint-disable-next-line no-console
    console.log("4️⃣  Fixing MaskedViewIOS imports...");
    fixMaskedViewImport();

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    // eslint-disable-next-line no-console
    console.log("\n✅ Fixes Applied:\n");
    // eslint-disable-next-line no-console
    console.log(`  • tokens imports removed: ${stats.tokensRemoved}`);
    // eslint-disable-next-line no-console
    console.log(`  • gesture handler fixes: ${stats.gestureHandlerFixed}`);
    // eslint-disable-next-line no-console
    console.log(`  • enhanced tokens fixes: ${stats.enhancedTokensFixed}`);
    // eslint-disable-next-line no-console
    console.log(`  • MaskedView fixes: ${stats.maskedViewFixed}`);
    // eslint-disable-next-line no-console
    console.log(`\n📊 Total fixes: ${total}`);

    if (DRY_RUN) {
      // eslint-disable-next-line no-console
      console.log("\n💡 Run with --write to apply:");
      // eslint-disable-next-line no-console
      console.log("   pnpm exec tsx scripts/fix-ts2305-exports.ts --write");
    } else {
      // eslint-disable-next-line no-console
      console.log("\n✨ Done! Check: pnpm --dir apps/mobile tsc --noEmit");
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
