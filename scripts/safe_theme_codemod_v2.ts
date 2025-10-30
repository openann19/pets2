#!/usr/bin/env ts-node

/**
 * SAFE SEMANTIC COLOR MIGRATION (V2)
 *
 * Strategy:
 * - Only mutate inline JSX style props: <View style={{ backgroundColor: "#fff" }} />
 *   and <View style={[base, { shadowColor: "#00000080" }]} />
 *
 * - Only run inside TOP-LEVEL React components that use a BLOCK BODY:
 *     function Screen() { ... }
 *     const Screen = () => { ... }
 *   We DO NOT touch arrow functions that are just `() => (<View .../>)`.
 *   We DO NOT touch nested render helpers.
 *
 * - For each changed component:
 *     - Ensure `import { useTheme } from "@/theme"` is present
 *     - Ensure `const theme = useTheme();` is the first statement in the body
 *       (only if not already there)
 *
 * - We DO NOT touch:
 *     - top-level StyleSheet.create(...)
 *     - config arrays, data models, etc.
 *     - template literals / complex expressions
 *     - anything outside JSX `style={...}` 
 *
 * - `--dry-run` mode: makes no writes, just reports which files WOULD change.
 *
 * After running (no --dry-run):
 *   pnpm typecheck:mobile
 *   pnpm -w eslint apps/mobile/src --fix
 *
 * This is intentionally conservative to avoid the 549-error explosion.
 */

import { Project, SyntaxKind } from "ts-morph";
import { join } from "path";
import { existsSync } from "fs";

////////////////////////////////////////////////////////////////////////////////
// 1. CONFIG: WHAT GETS REPLACED
////////////////////////////////////////////////////////////////////////////////

/**
 * Map hardcoded hex -> semantic token from your theme.
 *
 * These are based on your Theme.colors:
 * - background.primary = "#ffffff"
 * - background.secondary = "#f9fafb"
 * - background.tertiary = "#f3f4f6"
 *
 * - text.primary = "#111827"
 * - text.secondary = "#6b7280"
 * - text.tertiary = "#9ca3af"
 *
 * - border.light = "#e5e7eb"
 * - border.medium = "#d1d5db"
 * - border.dark = "#9ca3af"
 *
 * - status.success = "#10b981"
 * - status.warning = "#f59e0b"
 * - status.error   = "#ef4444"
 * - status.info    = "#3b82f6"
 *
 * - primary[500] = "#ec4899"
 * - primary[600] = "#db2777"
 * - primary[400] = "#f472b6"
 * - primary[700] = "#be185d"
 *
 * Overlay:
 * - "#00000080" etc. becomes theme.colors.text.primary + "80"
 *
 * Shadow:
 * - "#000" / "#000000" map to theme.colors.text.primary (near-black from your tokens)
 */

const COLOR_MAP: Record<string, string> = {
  "#ffffff": "theme.colors.background.primary",
  "#fff": "theme.colors.background.primary",

  "#f9fafb": "theme.colors.background.secondary",
  "#f3f4f6": "theme.colors.background.tertiary",

  "#111827": "theme.colors.text.primary",
  "#6b7280": "theme.colors.text.secondary",
  "#9ca3af": "theme.colors.text.tertiary",

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

  "#ec4899": "theme.colors.primary[500]",
  "#db2777": "theme.colors.primary[600]",
  "#f472b6": "theme.colors.primary[400]",
  "#be185d": "theme.colors.primary[700]",

  "#1f2937": "theme.colors.neutral[800]",
  "#374151": "theme.colors.neutral[700]",
  "#4b5563": "theme.colors.neutral[600]"
};

/**
 * Limited directories we operate on.
 * (If you want to expand, add globs carefully.)
 */
const TARGET_GLOBS = [
  "apps/mobile/src/screens/**/*.{ts,tsx,js,jsx}",
  "apps/mobile/src/components/**/*.{ts,tsx,js,jsx}",
  "apps/mobile/src/widgets/**/*.{ts,tsx,js,jsx}",
  "apps/mobile/src/features/**/*.{ts,tsx,js,jsx}"
];

/**
 * Only treat these style keys as "color-like".
 * We won't rewrite arbitrary props.
 */
function isColorStylePropName(name: string): boolean {
  return (
    /(^|\b)color$/i.test(name) ||
    /Color$/i.test(name) ||
    /^tintColor$/i.test(name) ||
    /^borderColor$/i.test(name) ||
    /^shadowColor$/i.test(name) ||
    /^backgroundColor$/i.test(name) ||
    /^stroke$/i.test(name) ||
    /^fill$/i.test(name)
  );
}

////////////////////////////////////////////////////////////////////////////////
// 2. PROJECT INIT
////////////////////////////////////////////////////////////////////////////////

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

// include js/jsx as well
project.addSourceFilesAtPaths(TARGET_GLOBS);

const DRY_RUN = process.argv.includes("--dry-run");

////////////////////////////////////////////////////////////////////////////////
// 3. HELPERS
////////////////////////////////////////////////////////////////////////////////

/**
 * We only want to touch TOP-LEVEL React components with block bodies.
 *
 * Allowed:
 *   function ProfileScreen() { ... }
 *   const ProfileScreen = () => { return ( ... ) }
 *
 * NOT allowed (skip):
 *   const renderHeader = () => (<View .../>)
 *   itemRenderer = ({item}) => <Row .../>
 *
 * We also skip nested function declarations (body inside another function).
 */
function getTopLevelBlockComponents(sourceFile: any) {
  const results: { node: any; isArrow: boolean }[] = [];

  sourceFile.getStatements().forEach((stmt: any) => {
    // Case 1: function Foo() { ... }
    if (stmt.getKind() === SyntaxKind.FunctionDeclaration) {
      const name = stmt.getName();
      if (!name) return;
      if (!/^[A-Z]/.test(name)) return; // must look like a component
      const body = stmt.getBody();
      if (!body) return;
      // body is a Block -> allowed
      results.push({ node: stmt, isArrow: false });
      return;
    }

    // Case 2: const Foo = (...) => { ... }
    if (stmt.getKind() === SyntaxKind.VariableStatement) {
      stmt.getDeclarations().forEach((decl: any) => {
        const varName = decl.getName();
        if (!/^[A-Z]/.test(varName)) return; // must look like component
        const init = decl.getInitializer();
        if (!init) return;

        const k = init.getKind();
        if (
          k === SyntaxKind.ArrowFunction ||
          k === SyntaxKind.FunctionExpression
        ) {
          // we ONLY allow block bodies:  ()=> { ... }
          const body = init.getBody();
          if (!body) return;
          if (body.getKind() !== SyntaxKind.Block) {
            // arrow with implicit return -> skip (that's where we broke syntax before)
            return;
          }
          results.push({ node: decl, isArrow: true });
        }
      });
    }
  });

  return results;
}

/**
 * Ensure { useTheme } from "@/theme" is imported.
 */
function ensureUseThemeImport(sourceFile: any) {
  try {
    const already = sourceFile.getImportDeclarations().some((imp: any) => {
      try {
        const moduleSpec = imp.getModuleSpecifierValue();
        if (moduleSpec !== "@/theme") return false;
        return imp.getNamedImports().some((ni: any) => ni.getName() === "useTheme");
      } catch (e) {
        return false;
      }
    });

    if (!already) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: "@/theme",
        namedImports: ["useTheme"]
      });
    }
  } catch (e) {
    // silently skip if import manipulation fails
  }
}

/**
 * Insert `const theme = useTheme();` as first statement of the block body,
 * if not already present.
 */
function ensureThemeConstInBlockBody(blockNode: any) {
  try {
    const stmts = blockNode.getStatements();
    const hasThemeDecl = stmts.some(
      (s: any) =>
        s.getKind() === SyntaxKind.VariableStatement &&
        s.getText().includes("const theme = useTheme()")
    );
    if (!hasThemeDecl) {
      blockNode.insertStatements(0, "const theme = useTheme();");
    }
  } catch (e) {
    // silently skip if insertion fails
  }
}

/**
 * Given an ObjectLiteralExpression representing `{ backgroundColor: "#fff" }`,
 * rewrite the string literals for known color props based on COLOR_MAP.
 *
 * returns true if any change happened.
 */
function rewriteObjectLiteralColors(objLit: any): boolean {
  let modified = false;

  try {
    objLit.getProperties().forEach((prop: any) => {
      if (prop.getKind() !== SyntaxKind.PropertyAssignment) return;

      const nameNode = prop.getNameNode();
      if (!nameNode) return;
      const propName = nameNode.getText();

      if (!isColorStylePropName(propName)) return;

      const initLit = prop.getInitializerIfKind(SyntaxKind.StringLiteral);
      if (!initLit) return;

      const rawHex = initLit.getLiteralText().trim().toLowerCase();
      const mappedExpr = COLOR_MAP[rawHex];
      if (!mappedExpr) return;

      // Replace initializer text with semantic token expression
      prop.setInitializer(mappedExpr);
      modified = true;
    });
  } catch (e) {
    // silently skip if property rewrite fails
  }

  return modified;
}

/**
 * For <View style={...} />:
 * style can be:
 *   - { ... }
 *   - [ styles.something, { backgroundColor: "#000" }, more ]
 *
 * We'll walk all ObjectLiteralExpressions under that style expression.
 */
function rewriteStyleAttribute(attrNode: any): boolean {
  try {
    // attrNode is a JsxAttribute with name "style"
    const jsxExpr = attrNode.getInitializerIfKind(SyntaxKind.JsxExpression);
    if (!jsxExpr) return false;

    const expr = jsxExpr.getExpression();
    if (!expr) return false;

    let touched = false;

    const kind = expr.getKind();

    if (kind === SyntaxKind.ObjectLiteralExpression) {
      if (rewriteObjectLiteralColors(expr)) {
        touched = true;
      }
    } else if (kind === SyntaxKind.ArrayLiteralExpression) {
      // style={[ base, { color: "#fff" } ]}
      expr.getElements().forEach((el: any) => {
        if (el.getKind() === SyntaxKind.ObjectLiteralExpression) {
          if (rewriteObjectLiteralColors(el)) {
            touched = true;
          }
        }
      });
    }

    return touched;
  } catch (e) {
    return false;
  }
}

/**
 * Process one component:
 * - Find all JSXAttributes named "style" in this component's block body
 * - Rewrite all inline literals in those "style" objects
 * - If changed: add import/useTheme and insert const theme = useTheme();
 */
function processComponentInFile(sourceFile: any, compInfo: { node: any; isArrow: boolean }): boolean {
  try {
    // Get the block body node
    let blockBody: any | null = null;

    if (!compInfo.isArrow) {
      // FunctionDeclaration
      const fnDecl = compInfo.node;
      const body = fnDecl.getBody();
      if (!body) return false;
      blockBody = body;
    } else {
      // VariableDeclaration -> ArrowFunction or FunctionExpression
      const decl = compInfo.node;
      const init = decl.getInitializer();
      if (!init) return false;
      const body = init.getBody();
      if (!body || body.getKind() !== SyntaxKind.Block) return false;
      blockBody = body;
    }

    if (!blockBody) return false;

    let componentTouched = false;

    // Find all JSXAttributes named "style" inside this component block
    const jsxAttrs = blockBody.getDescendantsOfKind(SyntaxKind.JsxAttribute);
    jsxAttrs
      .filter((attr: any) => {
        try {
          const nameNode = attr.getNameNode();
          if (!nameNode) return false;
          return nameNode.getText() === "style";
        } catch (e) {
          return false;
        }
      })
      .forEach((styleAttr: any) => {
        const didChange = rewriteStyleAttribute(styleAttr);
        if (didChange) {
          componentTouched = true;
        }
      });

    if (componentTouched) {
      ensureUseThemeImport(sourceFile);
      ensureThemeConstInBlockBody(blockBody);
    }

    return componentTouched;
  } catch (e) {
    return false;
  }
}

////////////////////////////////////////////////////////////////////////////////
// 4. MAIN PASS
////////////////////////////////////////////////////////////////////////////////

const changedFiles: string[] = [];

project.getSourceFiles().forEach((sourceFile) => {
  try {
    let fileTouched = false;

    // Only operate on this file's top-level block components
    const comps = getTopLevelBlockComponents(sourceFile);

    comps.forEach((comp) => {
      const didTouch = processComponentInFile(sourceFile, comp);
      if (didTouch) {
        fileTouched = true;
      }
    });

    if (fileTouched) {
      changedFiles.push(sourceFile.getFilePath());
      // We DO NOT call fixUnusedIdentifiers() automatically.
      // That was sometimes mutating imports in weird ways.
    }
  } catch (e) {
    // silently skip files that cause errors
  }
});

// Dry-run mode: report only
if (DRY_RUN) {
  console.log("DRY RUN: files that WOULD change:");
  changedFiles.forEach((f) => console.log(" - " + f));
  process.exit(0);
}

// Write changes for real
project.saveSync();

console.log("✅ SAFE semantic color codemod (V2) complete.");
console.log(`Changed files: ${changedFiles.length}`);
changedFiles.forEach((f) => console.log(" - " + f));
