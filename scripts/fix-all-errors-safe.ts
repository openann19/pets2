#!/usr/bin/env node
/**
 * Safe TypeScript Error Fixer
 * Tackles multiple error categories with conservative fixes
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
  moduleImports: 0,
  alertFixes: 0,
  overrideFixes: 0,
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

    // Pattern: import { TypeName } where TypeName is only used as a type
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

// 3. Fix module import issues (TS2305, TS2614)
function fixModuleImports() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    const fixes = [
      // Remove tokens import (doesn't exist in design-tokens)
      { from: /^import\s+{\s*tokens[^}]*}\s+from\s+['"]@pawfectmatch\/design-tokens['"];?\s*$/gm, to: "// tokens import removed - not exported from design-tokens" },
      // Fix Colors import (should be default)
      { from: /^import\s+{\s*Colors\s*}\s+from\s+['"]\.\.\/styles\/GlobalStyles['"]/gm, to: "import Colors from '../styles/GlobalStyles'" },
      // Fix useRippleEffect import (should be default)
      { from: /^import\s+{\s*useRippleEffect\s*}\s+from\s+['"]([^'"]+useUnifiedAnimations)['"]/gm, to: "import useRippleEffect from '$1'" },
      // Fix useShimmerEffect import (should be default)
      { from: /^import\s+{\s*useShimmerEffect\s*}\s+from\s+['"]([^'"]+useUnifiedAnimations)['"]/gm, to: "import useShimmerEffect from '$1'" },
    ];

    fixes.forEach(({ from, to }) => {
      if (from.test(content)) {
        const count = (content.match(from) || []).length;
        content = content.replace(from, to);
        changed = true;
        stats.moduleImports += count;
      }
    });

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 4. Fix alert() calls (TS2304) - add Alert import and replace
function fixAlertCalls() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Check if file has alert() calls but no Alert import
    if (/\balert\s*\(/g.test(content) && !/\bAlert\b/.test(content)) {
      // Find first import from react-native and add Alert
      const rnImportMatch = content.match(/^import\s+{([^}]+)}\s+from\s+['"]react-native['"]/m);
      
      if (rnImportMatch) {
        const imports = rnImportMatch[1];
        if (!imports.includes("Alert")) {
          content = content.replace(
            /^(import\s+{)([^}]+)(}\s+from\s+['"]react-native['"])/m,
            "$1 Alert,$2$3"
          );
          changed = true;
        }
      } else {
        // Add new import at the top
        const firstImportIndex = content.search(/^import/m);
        if (firstImportIndex >= 0) {
          content = content.slice(0, firstImportIndex) + 
            "import { Alert } from 'react-native';\n" + 
            content.slice(firstImportIndex);
          changed = true;
        }
      }
      
      // Replace alert() with Alert.alert()
      content = content.replace(/\balert\s*\(/g, "Alert.alert(");
      changed = true;
      stats.alertFixes++;
    }

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 5. Fix override modifier (TS4114)
function fixOverrideModifier() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Add override to lifecycle methods in class components
    const overrideMethods = [
      "componentDidMount",
      "componentDidUpdate", 
      "componentWillUnmount",
      "componentDidCatch",
    ];

    overrideMethods.forEach((method) => {
      const regex = new RegExp(`^(\\s+)(${method}\\s*\\([^)]*\\)\\s*{)`, "gm");
      const matches = content.match(regex);
      
      if (matches && !content.includes(`override ${method}`)) {
        content = content.replace(regex, `$1override $2`);
        changed = true;
        stats.overrideFixes++;
      }
    });

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 6. Comment out missing module imports (TS2307)
function commentOutMissingImports() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  const missingModules = [
    "../EliteButton",
    "../EliteHeader",
    "../GlassContainer",
    "../FadeInUp",
    "../components/AnimatedButton",
  ];

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    missingModules.forEach((module) => {
      const escapedModule = module.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`^(import\\s+.+from\\s+['"]${escapedModule}['"];?)$`, "gm");
      
      if (regex.test(content)) {
        content = content.replace(regex, "// $1 // FIXME: Module not found");
        changed = true;
        stats.moduleImports++;
      }
    });

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// Main execution
async function main() {
  const mode = DRY_RUN ? "DRY-RUN" : "WRITE";
  // eslint-disable-next-line no-console
  console.log(`🔧 Safe TypeScript Error Fixer (${mode})...\n`);

  try {
    // eslint-disable-next-line no-console
    console.log("1️⃣  Fixing Theme property access...");
    fixThemePropertyAccess();

    // eslint-disable-next-line no-console
    console.log("2️⃣  Fixing type-only imports...");
    fixTypeImports();

    // eslint-disable-next-line no-console
    console.log("3️⃣  Fixing module imports...");
    fixModuleImports();

    // eslint-disable-next-line no-console
    console.log("4️⃣  Fixing alert() calls...");
    fixAlertCalls();

    // eslint-disable-next-line no-console
    console.log("5️⃣  Adding override modifiers...");
    fixOverrideModifier();

    // eslint-disable-next-line no-console
    console.log("6️⃣  Commenting out missing imports...");
    commentOutMissingImports();

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    // eslint-disable-next-line no-console
    console.log("\n✅ Fixes Applied:\n");
    // eslint-disable-next-line no-console
    console.log(`  • Property access fixes: ${stats.propertyAccess}`);
    // eslint-disable-next-line no-console
    console.log(`  • Type import fixes: ${stats.typeImports}`);
    // eslint-disable-next-line no-console
    console.log(`  • Module import fixes: ${stats.moduleImports}`);
    // eslint-disable-next-line no-console
    console.log(`  • Alert fixes: ${stats.alertFixes}`);
    // eslint-disable-next-line no-console
    console.log(`  • Override modifier fixes: ${stats.overrideFixes}`);
    // eslint-disable-next-line no-console
    console.log(`\n📊 Total fixes: ${total}`);

    if (DRY_RUN) {
      // eslint-disable-next-line no-console
      console.log("\n💡 Run with --write to apply changes:");
      // eslint-disable-next-line no-console
      console.log("   pnpm exec tsx scripts/fix-all-errors-safe.ts --write");
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
