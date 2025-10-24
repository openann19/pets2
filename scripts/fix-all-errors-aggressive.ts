#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Fixer
 * Tackles multiple error categories aggressively
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
  styleArrays: 0,
  glyphMap: 0,
  colorPaths: 0,
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
      { from: /import\s+{\s*PetFormData\s*}/g, to: "import type { PetFormData }" },
      { from: /import\s+{\s*PhotoData\s*}/g, to: "import type { PhotoData }" },
      { from: /import\s+{\s*CallData\s*}/g, to: "import type { CallData }" },
      { from: /import\s+{\s*User\s*}/g, to: "import type { User }" },
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
      { from: /import\s+{\s*tokens[^}]*}\s+from\s+['"]@pawfectmatch\/design-tokens['"]/g, to: "// tokens import removed" },
      // Fix Colors import
      { from: /{\s*Colors\s*}\s+from\s+['"]\.\.\/styles\/GlobalStyles['"]/g, to: "Colors from '../styles/GlobalStyles'" },
      // Fix useRippleEffect/useShimmerEffect imports (should be default)
      { from: /{\s*useRippleEffect\s*}\s+from\s+['"]([^'"]+useUnifiedAnimations)['"]/g, to: "useRippleEffect from '$1'" },
      { from: /{\s*useShimmerEffect\s*}\s+from\s+['"]([^'"]+useUnifiedAnimations)['"]/g, to: "useShimmerEffect from '$1'" },
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

// 4. Fix style array type issues (TS2559)
function fixStyleArrays() {
  const files = fg.sync("src/**/*.tsx", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Fix style={[...]} → style={{...[...] as any}}
    const styleArrayRegex = /style=\{(\[[^\]]+\])\}/g;
    const matches = content.match(styleArrayRegex);

    if (matches) {
      matches.forEach((match) => {
        if (!match.includes("as any") && !match.includes("StyleSheet.flatten")) {
          const replacement = match.replace(/style=\{(\[[^\]]+\])\}/, "style={StyleSheet.flatten($1)}");
          content = content.replace(match, replacement);
          changed = true;
          stats.styleArrays++;
        }
      });

      // Add StyleSheet import if needed
      if (changed && !content.includes("import { StyleSheet") && !content.includes("from 'react-native'")) {
        content = content.replace(
          /from ['"]react-native['"]/,
          ", StyleSheet } from 'react-native'"
        );
      }
    }

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 5. Fix alert() calls (TS2304)
function fixAlertCalls() {
  const files = fg.sync("src/**/*.{ts,tsx}", { cwd: MOBILE_DIR, absolute: true });

  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Check if file has alert() calls
    if (/\balert\s*\(/g.test(content)) {
      // Add Alert import if not present
      if (!content.includes("import") || !content.includes("Alert")) {
        // Find the first import statement
        const firstImportMatch = content.match(/^import\s+/m);
        if (firstImportMatch) {
          const insertPos = content.indexOf(firstImportMatch[0]);
          content = content.slice(0, insertPos) + "import { Alert } from 'react-native';\n" + content.slice(insertPos);
          changed = true;
        }
      }
      
      // Replace alert() with Alert.alert()
      if (!/Alert\.alert/g.test(content)) {
        content = content.replace(/\balert\s*\(/g, "Alert.alert(");
        changed = true;
      }
    }

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 6. Fix override modifier (TS4114)
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
      "shouldComponentUpdate",
      "getSnapshotBeforeUpdate",
    ];

    overrideMethods.forEach((method) => {
      const regex = new RegExp(`(\\s+)(${method}\\s*\\([^)]*\\))`, "g");
      if (regex.test(content) && !content.includes(`override ${method}`)) {
        content = content.replace(regex, `$1override $2`);
        changed = true;
      }
    });

    if (changed && !DRY_RUN) {
      fs.writeFileSync(file, content, "utf-8");
    }
  });
}

// 7. Comment out missing module imports (TS2307)
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
  console.log(`🚀 Comprehensive TypeScript Error Fixer (${mode})...\n`);

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
    console.log("4️⃣  Fixing style arrays...");
    fixStyleArrays();

    // eslint-disable-next-line no-console
    console.log("5️⃣  Fixing alert() calls...");
    fixAlertCalls();

    // eslint-disable-next-line no-console
    console.log("6️⃣  Adding override modifiers...");
    fixOverrideModifier();

    // eslint-disable-next-line no-console
    console.log("7️⃣  Commenting out missing imports...");
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
    console.log(`  • Style array fixes: ${stats.styleArrays}`);
    // eslint-disable-next-line no-console
    console.log(`\n📊 Total fixes: ${total}`);

    if (DRY_RUN) {
      // eslint-disable-next-line no-console
      console.log("\n💡 Run with --write to apply changes:");
      // eslint-disable-next-line no-console
      console.log("   pnpm exec tsx scripts/fix-all-errors-aggressive.ts --write");
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
