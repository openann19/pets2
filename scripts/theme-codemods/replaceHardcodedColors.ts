#!/usr/bin/env ts-node

/**
 * PRODUCTION-SAFE CODEMOD: Eliminate hardcoded color literals
 * 
 * DRY RUN MODE: Set DRY_RUN=true to preview changes without writing
 * 
 * Usage:
 *   DRY_RUN=true ts-node scripts/theme-codemods/replaceHardcodedColors.ts
 *   ts-node scripts/theme-codemods/replaceHardcodedColors.ts  # actual run
 */

import { Project, SyntaxKind, SourceFile, FunctionDeclaration, VariableDeclaration } from "ts-morph";
import { join } from "path";
import { existsSync } from "fs";

// ===== CONFIGURATION =====
const DRY_RUN = process.env.DRY_RUN === "true";
const ROOT = process.cwd();
const TARGET_DIR = join(ROOT, "apps/mobile/src");

// Enhanced color mapping with better semantic coverage
const COLOR_MAP: Record<string, string> = {
  // Whites & light backgrounds
  "#ffffff": "theme.colors.surface",
  "#fff": "theme.colors.surface",
  "#f5f5f5": "theme.colors.bg",
  "#fafafa": "theme.colors.bg",
  
  // Blacks & dark text
  "#000000": "theme.colors.onSurface",
  "#000": "theme.colors.onSurface",
  "#1a1a1a": "theme.colors.surface", // dark mode surface
  "#333333": "theme.colors.onMuted",
  "#666666": "theme.colors.onMuted",
  
  // Reds / Danger
  "#ff0000": "theme.colors.danger",
  "#f00": "theme.colors.danger",
  "#d32f2f": "theme.colors.danger",
  "#dc2626": "theme.colors.danger",
  
  // Greens / Success
  "#00ff00": "theme.colors.success",
  "#0f0": "theme.colors.success",
  "#00c853": "theme.colors.success",
  "#10b981": "theme.colors.success",
  
  // Yellows / Warnings
  "#ffa500": "theme.colors.warning",
  "#ffd700": "theme.colors.warning",
  "#f59e0b": "theme.colors.warning",
  
  // Blues / Info
  "#0080ff": "theme.colors.info",
  "#2196f3": "theme.colors.info",
  "#3b82f6": "theme.colors.primary",
};

// ===== SAFETY CHECKS =====
if (!existsSync(TARGET_DIR)) {
  console.error(`❌ Target dir not found: ${TARGET_DIR}`);
  process.exit(1);
}

const tsconfigPath = join(ROOT, "apps/mobile/tsconfig.json");
if (!existsSync(tsconfigPath)) {
  console.error(`❌ tsconfig not found: ${tsconfigPath}`);
  process.exit(1);
}

console.log(`\n${"=".repeat(60)}`);
console.log(`🔍 HARDCODED COLOR CODEMOD ${DRY_RUN ? "(DRY RUN)" : "(LIVE)"}`);
console.log(`${"=".repeat(60)}\n`);
console.log(`Target: ${TARGET_DIR}`);
console.log(`Mode: ${DRY_RUN ? "🔒 DRY RUN - No files will be modified" : "✍️  LIVE - Files will be modified"}\n`);

// ===== INIT PROJECT =====
const project = new Project({
  tsConfigFilePath: tsconfigPath,
  skipAddingFilesFromTsConfig: false,
});

// Track statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  colorsReplaced: 0,
  importsAdded: 0,
  hooksInjected: 0,
  errors: [] as string[],
};

/**
 * SAFE: Ensure theme import exists
 */
function ensureThemeImport(sourceFile: SourceFile): boolean {
  try {
    const hasImport = sourceFile.getImportDeclarations().some((imp) => {
      if (imp.getModuleSpecifierValue() !== "@/theme") return false;
      return imp.getNamedImports().some((ni) => ni.getName() === "useTheme");
    });

    if (!hasImport) {
      if (!DRY_RUN) {
        sourceFile.addImportDeclaration({
          moduleSpecifier: "@/theme",
          namedImports: ["useTheme"],
        });
      }
      stats.importsAdded++;
      return true;
    }
    return false;
  } catch (error) {
    stats.errors.push(`Import injection failed: ${sourceFile.getFilePath()}`);
    return false;
  }
}

/**
 * SAFE: Inject useTheme hook into component
 * Only for function components (capital letter or returns JSX)
 */
function injectThemeHook(func: FunctionDeclaration | VariableDeclaration): boolean {
  try {
    const body = func.getBody?.();
    if (!body || body.getKind() !== SyntaxKind.Block) return false;

    const blockBody = body.asKindOrThrow(SyntaxKind.Block);
    
    // Check if already has theme
    const alreadyHasTheme = blockBody
      .getStatements()
      .some((stmt) => {
        const text = stmt.getText();
        return text.includes("useTheme()") && text.includes("theme");
      });

    if (alreadyHasTheme) return false;

    if (!DRY_RUN) {
      blockBody.insertStatements(0, "const theme = useTheme();");
    }
    stats.hooksInjected++;
    return true;
  } catch (error) {
    stats.errors.push(`Hook injection failed: ${func.getText().substring(0, 50)}...`);
    return false;
  }
}

/**
 * SAFE: Check if this is a React component
 */
function isReactComponent(func: FunctionDeclaration | VariableDeclaration): boolean {
  // Check 1: Name starts with capital letter
  const name = func.getName?.();
  if (name && /^[A-Z]/.test(name)) return true;

  // Check 2: Contains JSX
  const body = func.getBody?.();
  if (!body) return false;

  try {
    const hasJSX = 
      body.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
      body.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0;
    return hasJSX;
  } catch {
    return false;
  }
}

/**
 * SAFE: Replace color literal with theme reference
 */
function replaceColorLiteral(node: any, replacementExpr: string): boolean {
  try {
    const parent = node.getParent();

    // Only handle PropertyAssignment (safe pattern)
    if (parent.getKind() === SyntaxKind.PropertyAssignment) {
      if (!DRY_RUN) {
        parent.setInitializer(replacementExpr);
      }
      stats.colorsReplaced++;
      return true;
    }

    return false;
  } catch (error) {
    stats.errors.push(`Replace failed for: ${node.getText()}`);
    return false;
  }
}

/**
 * Normalize hex color to lowercase full form
 */
function normalizeHex(hex: string): string {
  const lower = hex.toLowerCase();
  // Expand shorthand: #fff -> #ffffff
  if (/^#[0-9a-f]{3}$/.test(lower)) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  return lower;
}

// ===== MAIN PROCESSING =====
const sourceFiles = project.getSourceFiles();
console.log(`Found ${sourceFiles.length} source files to scan\n`);

sourceFiles.forEach((sourceFile) => {
  const filePath = sourceFile.getFilePath();
  
  // Skip test files, mocks, and node_modules
  if (
    filePath.includes("__tests__") ||
    filePath.includes("__mocks__") ||
    filePath.includes("node_modules") ||
    filePath.includes(".test.") ||
    filePath.includes(".spec.")
  ) {
    return;
  }

  stats.filesScanned++;
  let fileModified = false;
  const componentsNeedingTheme = new Set<FunctionDeclaration | VariableDeclaration>();

  // Get all function declarations and arrow functions
  const functions = sourceFile.getFunctions();
  const arrowFunctions = sourceFile
    .getVariableDeclarations()
    .filter((vd) => {
      const init = vd.getInitializer();
      if (!init) return false;
      const kind = init.getKind();
      return kind === SyntaxKind.ArrowFunction || kind === SyntaxKind.FunctionExpression;
    });

  const allFunctions = [...functions, ...arrowFunctions];
  const components = allFunctions.filter(isReactComponent);

  // Build component ranges for ownership check
  const componentRanges = components.map((comp) => ({
    func: comp,
    start: comp.getStart(),
    end: comp.getEnd(),
  }));

  // Find all string literals that might be colors
  const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral);

  stringLiterals.forEach((literal) => {
    try {
      const literalValue = literal.getLiteralText().trim();
      const normalized = normalizeHex(literalValue);

      // Check if it's a hex color
      if (!/^#[0-9a-f]{6}$/.test(normalized)) {
        return;
      }

      // Check if we have a mapping for this color
      const replacementExpr = COLOR_MAP[normalized];
      if (!replacementExpr) {
        return;
      }

      // Safety check: Only replace if in a style property
      const propAssign = literal.getParentIfKind(SyntaxKind.PropertyAssignment);
      if (!propAssign) return;

      const propName = propAssign.getNameNode().getText();
      const isColorProp =
        /color/i.test(propName) ||
        /background/i.test(propName) ||
        /border/i.test(propName) ||
        /shadow/i.test(propName);

      if (!isColorProp) return;

      // Check if inside a component
      const litPos = literal.getStart();
      const ownerComp = componentRanges.find(
        (range) => litPos >= range.start && litPos <= range.end
      );

      if (ownerComp) {
        const replaced = replaceColorLiteral(literal, replacementExpr);
        if (replaced) {
          componentsNeedingTheme.add(ownerComp.func);
          fileModified = true;

          if (DRY_RUN) {
            console.log(`  Would replace: ${literalValue} → ${replacementExpr}`);
            console.log(`    in: ${filePath.replace(ROOT, "")}`);
            console.log(`    property: ${propName}\n`);
          }
        }
      }
    } catch (error) {
      // Skip this literal, log error
      stats.errors.push(`Error processing literal in ${filePath}`);
    }
  });

  // Inject theme for modified components
  if (fileModified) {
    ensureThemeImport(sourceFile);
    componentsNeedingTheme.forEach((comp) => {
      injectThemeHook(comp);
    });
    stats.filesModified++;

    if (DRY_RUN) {
      console.log(`✓ ${filePath.replace(ROOT, "")}`);
    }
  }
});

// ===== SAVE & REPORT =====
if (!DRY_RUN) {
  try {
    project.saveSync();
    console.log("\n✅ Files saved successfully\n");
  } catch (error) {
    console.error("\n❌ Error saving files:", error);
    process.exit(1);
  }
}

console.log(`\n${"=".repeat(60)}`);
console.log("📊 CODEMOD SUMMARY");
console.log(`${"=".repeat(60)}\n`);
console.log(`Files scanned:        ${stats.filesScanned}`);
console.log(`Files modified:       ${stats.filesModified}`);
console.log(`Colors replaced:      ${stats.colorsReplaced}`);
console.log(`Imports added:        ${stats.importsAdded}`);
console.log(`Hooks injected:       ${stats.hooksInjected}`);
console.log(`Errors encountered:   ${stats.errors.length}\n`);

if (stats.errors.length > 0) {
  console.log("⚠️  Errors:");
  stats.errors.slice(0, 10).forEach((err) => console.log(`  - ${err}`));
  if (stats.errors.length > 10) {
    console.log(`  ... and ${stats.errors.length - 10} more`);
  }
  console.log();
}

if (DRY_RUN) {
  console.log(`\n✅ DRY RUN COMPLETE - No files were modified`);
  console.log(`\nTo apply changes, run without DRY_RUN:`);
  console.log(`  ts-node scripts/theme-codemods/replaceHardcodedColors.ts\n`);
} else {
  console.log(`\n✅ CODEMOD COMPLETE`);
  console.log(`\nNext steps:`);
  console.log(`  1. pnpm -w eslint apps/mobile/src --fix`);
  console.log(`  2. pnpm typecheck:mobile`);
  console.log(`  3. Review changes with: git diff`);
  console.log(`  4. Test critical flows manually\n`);
}

process.exit(stats.errors.length > 0 ? 1 : 0);
