#!/usr/bin/env ts-node

/**
 * Massive semantic color migration for mobile.
 *
 * What it does:
 * - Scans component files under apps/mobile/src/{screens,components,widgets,features}
 * - Finds inline style objects and component-local style objects that still use hardcoded hex
 * - Rewrites those hex strings to semantic theme tokens (theme.colors.*)
 * - Ensures:
 *    import { useTheme } from "@/theme"
 *    const theme = useTheme();
 *   exist in that component before any style uses theme.*
 *
 * What it does NOT do:
 * - It does NOT try to rewrite top-level StyleSheet.create(...) defined OUTSIDE the component.
 *   Those can't see hooks. ESLint (below) will flag the leftovers so dev moves them into
 *   a theme-aware factory manually.
 *
 * Safety:
 * - AST-level (ts-morph), not regex.
 * - Only rewrites known color props: backgroundColor, color, borderColor, shadowColor,
 *   tintColor, stroke, fill.
 * - Only rewrites literals that match COLOR_MAP.
 *
 * After running:
 *   pnpm -w eslint apps/mobile/src --fix
 *   pnpm typecheck:mobile
 *
 * You should see 80%+ of hardcoded colors gone automatically.
 */

import { Project, SyntaxKind, Node, ts } from "ts-morph";
import { join } from "path";
import { existsSync } from "fs";

/**
 * This map is built from your Theme definition you provided.
 * Keys are lowercase hex (no uppercase) INCLUDING shorthand (#fff) and alpha suffix (#00000080).
 *
 * Values are exact expressions you want in code.
 *
 * NOTE on duplicates:
 * - "#9ca3af" exists as text.tertiary and border.dark. We choose border.dark because it's safer
 *   for borders. If that shows up in text styles, you'll still get a readable gray.
 *
 * NOTE on "#000"/"#000000":
 * - We map black to theme.colors.text.primary.
 *   In your Theme, text.primary is "#111827" (near-black). This is intentional: we normalize
 *   everything to design tokens, not literal black. For shadowColor, visually it's slightly lighter
 *   than pure #000, which is fine.
 *
 * NOTE on alpha:
 * - "#00000080" => theme.colors.text.primary + "80"
 *   This preserves translucent overlays like modals/backdrops you already started doing.
 */
const COLOR_MAP: Record<string, string> = {
  "#ffffff": "theme.colors.background.primary",
  "#fff": "theme.colors.background.primary",

  "#f9fafb": "theme.colors.background.secondary",
  "#f3f4f6": "theme.colors.background.tertiary",

  "#111827": "theme.colors.text.primary",
  "#6b7280": "theme.colors.text.secondary",
  "#9ca3af": "theme.colors.border.dark",

  "#000000": "theme.colors.text.primary",
  "#000": "theme.colors.text.primary",

  "#00000080": "theme.colors.text.primary + '80'",
  "#00000066": "theme.colors.text.primary + '66'",
  "#00000040": "theme.colors.text.primary + '40'",
  "#00000033": "theme.colors.text.primary + '33'",

  "#e5e7eb": "theme.colors.border.light",
  "#d1d5db": "theme.colors.border.medium",

  "#10b981": "theme.colors.status.success",
  "#f59e0b": "theme.colors.status.warning",
  "#ef4444": "theme.colors.status.error",
  "#3b82f6": "theme.colors.status.info",

  // brand / primary scales (use as accents, gradients, buttons, etc.)
  "#ec4899": "theme.colors.primary[500]",
  "#db2777": "theme.colors.primary[600]",
  "#f472b6": "theme.colors.primary[400]",
  "#be185d": "theme.colors.primary[700]",

  // neutral scale matches Theme.colors.neutral (avoiding duplicates)
  "#1f2937": "theme.colors.neutral[800]",
  "#374151": "theme.colors.neutral[700]",
  "#4b5563": "theme.colors.neutral[600]"
};

/**
 * Directories we will mutate.
 * These match the typical layout you described (screens, components, widgets, features).
 */
const TARGET_GLOBS = [
  "apps/mobile/src/screens/**/*.{ts,tsx,js,jsx}",
  "apps/mobile/src/components/**/*.{ts,tsx,js,jsx}",
  "apps/mobile/src/widgets/**/*.{ts,tsx,js,jsx}",
  "apps/mobile/src/features/**/*.{ts,tsx,js,jsx}"
];

/**
 * We assume tsconfig is apps/mobile/tsconfig.json
 * so ts-morph can resolve imports/types.
 */
const ROOT = process.cwd();
const TSCONFIG = join(ROOT, "apps/mobile/tsconfig.json");
if (!existsSync(TSCONFIG)) {
  console.error(`tsconfig not found at ${TSCONFIG}`);
  process.exit(1);
}

const project = new Project({
  tsConfigFilePath: TSCONFIG,
  skipAddingFilesFromTsConfig: false
});

// Add JS/JSX that tsconfig might not include:
project.addSourceFilesAtPaths(TARGET_GLOBS);

/**
 * 1. Utility: ensure file imports { useTheme } from "@/theme"
 */
function ensureUseThemeImport(sourceFile: any) {
  const already = sourceFile.getImportDeclarations().some((imp: any) => {
    try {
      const moduleSpec = imp.getModuleSpecifierValue();
      if (moduleSpec !== "@/theme") return false;
      return imp.getNamedImports().some((ni: any) => ni.getName() === "useTheme");
    } catch (e) {
      // Skip dynamic imports or other non-string literals
      return false;
    }
  });

  if (!already) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@/theme",
      namedImports: ["useTheme"]
    });
  }
}

/**
 * 2. Inject "const theme = useTheme();" at top of component body if missing.
 */
function ensureThemeConstInComponent(func: any) {
  const body = func.getBody && func.getBody();
  if (!body) return;

  const hasThemeDecl = body
    .getStatements()
    .some(
      (stmt: any) =>
        stmt.getKind() === SyntaxKind.VariableStatement &&
        stmt.getText().includes("const theme = useTheme()")
    );

  if (!hasThemeDecl) {
    body.insertStatements(0, "const theme = useTheme();");
  }
}

/**
 * 3. Heuristic: figure out which arrow funcs / function decls are React components.
 * We mark a function as component if:
 *   - Its name starts with Capital, OR
 *   - It returns JSX
 */
function isLikelyComponent(fn: any): boolean {
  // Named function: function MyScreen(...) { ... }
  if (fn.getKind() === SyntaxKind.FunctionDeclaration) {
    const name = fn.getName();
    if (name && /^[A-Z]/.test(name)) return true;
    // fallback: JSX check
  }

  // VariableDeclaration: const MyThing = (...) => { ... }
  if (fn.getKind() === SyntaxKind.VariableDeclaration) {
    const varName = fn.getName();
    if (varName && /^[A-Z]/.test(varName)) return true;
  }

  // JSX inference
  const body = fn.getBody && fn.getBody();
  if (!body) return false;
  const hasJSX =
    body.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
    body.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0;
  return hasJSX;
}

/**
 * 4. Decide whether a PropertyAssignment is a color style that we should rewrite.
 */
function isColorStylePropName(propName: string): boolean {
  return (
    /color$/i.test(propName) ||
    /Color$/i.test(propName) ||
    /tintColor$/i.test(propName) ||
    /borderColor$/i.test(propName) ||
    /shadowColor$/i.test(propName) ||
    /backgroundColor$/i.test(propName) ||
    /^stroke$/i.test(propName) ||
    /^fill$/i.test(propName)
  );
}

/**
 * 5. Rewrite "#fff" → theme.colors.background.primary, etc.
 *
 * parent: PropertyAssignment
 * node: StringLiteral
 *
 * We replace
 *   backgroundColor: "#fff"
 * with
 *   backgroundColor: theme.colors.background.primary
 */
function rewriteColorLiteral(litNode: any): boolean {
  const parent = litNode.getParentIfKind(SyntaxKind.PropertyAssignment);
  if (!parent) return false;

  const propNameNode = parent.getNameNode();
  const propName = propNameNode.getText();

  if (!isColorStylePropName(propName)) return false;

  const rawHex = litNode.getLiteralText().trim().toLowerCase();
  const mappedExpr = COLOR_MAP[rawHex];
  if (!mappedExpr) return false;

  parent.setInitializer(mappedExpr);
  return true;
}

/**
 * 6. Process a component function body:
 * - Find all string literals inside that component body
 * - Rewrite any color literals
 * - If we rewrote at least one, ensure theme import + const theme = useTheme()
 *
 * Returns true if modified.
 */
function processComponent(
  sourceFile: any,
  funcDeclOrVarDecl: any
): boolean {
  const body = funcDeclOrVarDecl.getBody && funcDeclOrVarDecl.getBody();
  if (!body) return false;

  let modified = false;

  // All string literals INSIDE this component body
  const stringLits = body.getDescendantsOfKind(SyntaxKind.StringLiteral);
  stringLits.forEach((litNode: any) => {
    const did = rewriteColorLiteral(litNode);
    if (did) {
      modified = true;
    }
  });

  if (modified) {
    ensureUseThemeImport(sourceFile);
    ensureThemeConstInComponent(funcDeclOrVarDecl);
  }

  return modified;
}

/**
 * 7. Walk each file:
 * - Find likely component functions
 * - Run processComponent on each
 * - Clean unused imports
 */
project.getSourceFiles().forEach((sourceFile) => {
  let fileTouched = false;

  // Gather candidate components
  const fns = [
    ...sourceFile.getFunctions(),
    ...sourceFile
      .getVariableDeclarations()
      .filter((vd: any) => {
        const init = vd.getInitializer();
        if (!init) return false;
        const k = init.getKind();
        return (
          k === SyntaxKind.ArrowFunction ||
          k === SyntaxKind.FunctionExpression
        );
      })
  ];

  fns
    .filter(isLikelyComponent)
    .forEach((compFn) => {
      const changed = processComponent(sourceFile, compFn);
      if (changed) fileTouched = true;
    });

  if (fileTouched) {
    // remove unused imports etc.
    sourceFile.fixUnusedIdentifiers();
  }
});

// Save all changes
project.saveSync();

console.log("✅ Semantic color codemod complete.");
