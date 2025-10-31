/*
 * Theme Migration Codemod (RN/TSX)
 * ---------------------------------------------------------
 * - Replaces `Theme.` -> `theme.` (with token drift mapping)
 * - Converts top-level `const styles = StyleSheet.create({...})` 
 *   into a `makeStyles(theme)` factory and injects usage inside
 *   the default-exported component.
 * - Ensures `useTheme` import from a configurable provider path.
 * - Writes a JSON report of remaining refs and edge cases.
 */

const { Project, SyntaxKind, Node } = require("ts-morph");
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const dry = argv.includes("--dry");
const providerArg = argv.find(a => a.startsWith("--provider="));
const themeTypeArg = argv.find(a => a.startsWith("--theme-type="));
const providerDefault = "../theme/Provider";
const themeType = themeTypeArg ? themeTypeArg.split("=")[1] : "any";
const providerSpecifier = providerArg ? providerArg.split("=")[1] : providerDefault;

const patterns = argv.filter(a => !a.startsWith("--"));
if (patterns.length === 0) {
  console.error('Pass patterns, e.g.: pnpm tsx scripts/theme-migrate.js "apps/mobile/src/screens/**/*.tsx"');
  process.exit(1);
}

// Token drift rewrites (string-level, conservative)
const stringRewrites = [
  [/\.colors\.primary\[\s*500\s*\]/g, ".colors.primary"],
  [/\.colors\.text\.secondary\b/g, ".colors.textMuted"],
  [/\.colors\.background\b/g, ".colors.bg"],
  [/\.borderRadius\b/g, ".radius"],
  [/\.colors\.status\.error\b/g, ".colors.danger"],
  // Optional extras you can keep/extend:
  [/\.colors\.status\.success\b/g, ".colors.success"],
  [/\.colors\.status\.warning\b/g, ".colors.warning"],
];

const project = new Project({
  tsConfigFilePath: fs.existsSync("tsconfig.json") ? "tsconfig.json" : undefined,
  skipAddingFilesFromTsConfig: false,
});

for (const pat of patterns) project.addSourceFilesAtPaths(pat);

const warnings = [];

function ensureUseThemeImport(source) {
  // Remove { Theme } imports from unified-theme (keep other type-only imports)
  source.getImportDeclarations().forEach(d => {
    const from = d.getModuleSpecifierValue();
    const named = d.getNamedImports().map(n => n.getName());
    if (/theme\/unified-theme/.test(from) && named.includes("Theme")) {
      const rest = d.getNamedImports().filter(n => n.getName() !== "Theme");
      if (rest.length === 0) d.remove(); else { d.removeNamedImport("Theme"); d.setIsTypeOnly(true); }
    }
  });

  // Add useTheme from configured provider path (relative is okay; alias is okay)
  const hasUseTheme =
    source.getImportDeclarations().some(d =>
      d.getModuleSpecifierValue() === providerSpecifier &&
      d.getNamedImports().some(ni => ni.getName() === "useTheme")
    );
  if (!hasUseTheme) {
    source.addImportDeclaration({
      moduleSpecifier: providerSpecifier,
      namedImports: [{ name: "useTheme" }],
    });
  }
}

function ensureStyleSheetImport(source) {
  const rnImport = source.getImportDeclarations().find(d => d.getModuleSpecifierValue() === "react-native");
  if (rnImport) {
    const names = rnImport.getNamedImports().map(n => n.getName());
    if (!names.includes("StyleSheet")) rnImport.addNamedImport("StyleSheet");
  } else {
    source.addImportDeclaration({ moduleSpecifier: "react-native", namedImports: [{ name: "StyleSheet" }] });
  }
}

function replaceThemeMemberAccess(source) {
  source.forEachDescendant(node => {
    if (Node.isPropertyAccessExpression(node)) {
      const expr = node.getExpression();
      if (Node.isIdentifier(expr) && expr.getText() === "Theme") {
        expr.replaceWithText("theme");
      }
    }
  });
}

function rewriteTopLevelStylesToFactory(source) {
  // Find top-level `const styles = StyleSheet.create({...})` 
  const varStatements = source.getVariableStatements();
  const decls = varStatements.flatMap(vs => vs.getDeclarations()).filter(d => d.getName() === "styles");

  let changed = false;
  for (const decl of decls) {
    if (decl.getFirstAncestorByKind(SyntaxKind.FunctionDeclaration) ||
        decl.getFirstAncestorByKind(SyntaxKind.FunctionExpression) ||
        decl.getFirstAncestorByKind(SyntaxKind.ArrowFunction)) {
      continue; // already inside a component; skip
    }
    const init = decl.getInitializer();
    if (!init || !Node.isCallExpression(init)) continue;
    if (init.getExpression().getText() !== "StyleSheet.create") continue;

    const arg = init.getArguments()[0];
    if (!arg) continue;

    let stylesText = arg.getText();
    for (const [re, to] of stringRewrites) stylesText = stylesText.replace(re, to);

    // If makeStyles already exists, skip redefining it
    const existing = source.getFunction("makeStyles");
    if (!existing) {
      const func = source.addFunction({
        name: "makeStyles",
        isExported: false,
        parameters: [{ name: "theme", type: themeType }],
        returnType: "any",
        statements: [`return StyleSheet.create(${stylesText});`],
      });
      // place function after imports
      const firstList = source.getFirstChildByKind(SyntaxKind.SyntaxList);
      if (firstList) func.move(firstList.getChildCount());
    }

    // Remove original `styles` var
    decl.getVariableStatement()?.remove();
    changed = true;
  }
  return changed;
}

function injectHookAndStylesCall(source) {
  let inserted = false;

  const defFunc = source.getFunctions().find(f => f.isDefaultExport());
  if (defFunc) {
    const body = defFunc.getBody();
    if (body) {
      // Avoid duplicate injection
      const bodyText = body.getText();
      if (!bodyText.includes("useTheme(") && !bodyText.includes("makeStyles(")) {
        body.insertStatements(0, [`const theme = useTheme();`, `const styles = makeStyles(theme);`]);
      }
      inserted = true;
    }
  }

  if (!inserted) {
    // export default Identifier;
    const exp = source.getExportAssignment(s => true);
    if (exp && !exp.isExportEquals()) {
      const expr = exp.getExpression();
      if (Node.isIdentifier(expr)) {
        const name = expr.getText();
        const v = source.getVariableDeclaration(name);
        const init = v?.getInitializer();
        const body = (Node.isArrowFunction(init) || Node.isFunctionExpression(init)) ? init.getBody() : undefined;
        if (body && Node.isBlock(body)) {
          const bodyText = body.getText();
          if (!bodyText.includes("useTheme(") && !bodyText.includes("makeStyles(")) {
            body.insertStatements(0, [`const theme = useTheme();`, `const styles = makeStyles(theme);`]);
          }
          inserted = true;
        }
      }
    }
  }

  if (!inserted) warnings.push({ file: source.getFilePath(), reason: "Could not inject theme/styles (non-standard default export)" });
}

function applyStringRewrites(source) {
  let text = source.getFullText();
  for (const [re, to] of stringRewrites) text = text.replace(re, to);
  // Do NOT blindly replace "Theme." here (AST handled); just commit signal changes.
  source.replaceWithText(text);
}

for (const sf of project.getSourceFiles()) {
  if (!/\.tsx$/.test(sf.getFilePath())) continue;

  const before = sf.getFullText();

  ensureUseThemeImport(sf);
  ensureStyleSheetImport(sf);
  const changedFactory = rewriteTopLevelStylesToFactory(sf);
  replaceThemeMemberAccess(sf);
  injectHookAndStylesCall(sf);
  applyStringRewrites(sf);

  if (!dry && sf.getFullText() !== before) sf.fixMissingImports();
}

if (!dry) project.saveSync();

// Report
const remainingThemeRefs = [];
for (const sf of project.getSourceFiles()) {
  if (sf.getFullText().includes("Theme.")) remainingThemeRefs.push(sf.getFilePath());
}

const report = {
  scanned: project.getSourceFiles().length,
  remainingThemeReferences: remainingThemeRefs,
  warnings,
};
fs.writeFileSync(path.resolve("theme-migrate-report.json"), JSON.stringify(report, null, 2));
console.log("✅ Theme migration complete. See theme-migrate-report.json");
if (remainingThemeRefs.length) console.warn(`⚠️ Remaining Theme.* refs: ${remainingThemeRefs.length}`);
if (warnings.length) console.warn(`⚠️ Warnings: ${warnings.length}`);
