#!/usr/bin/env tsx
/**
 * EA — Error Annihilator for mobile TS/TSX (React Native)
 * Safe codemods: SafeAreaView edges removal, Theme semantic→tokens, Ionicons glyphMap, fontWeight, Animated import
 */
import { Project, SyntaxKind, Node, ts } from "ts-morph";
import fg from "fast-glob";
import * as fs from "node:fs";
import * as path from "node:path";
import prettier from "prettier";
import { EAConfig } from "./ea.config";

type Cnt = Record<string, number>;
const counts: Cnt = {
  filesTouched: 0,
  safeArea_edges_removed: 0,
  theme_semantic_rewrites: 0,
  ionicons_glyphMap_fixed: 0,
  fontWeight_normalized: 0,
  animated_import_added: 0,
};

const args = process.argv.slice(2);
const WRITE = args.includes("--write");

/** Utilities */
const isFromModule = (importDecl: any, mod: string) =>
  importDecl.getModuleSpecifierValue?.() === mod;

const loadPrettier = async () =>
  await prettier.resolveConfig(process.cwd()).catch(() => null);

async function formatFile(filePath: string, code: string) {
  const cfg = (await loadPrettier()) ?? {};
  return prettier.format(code, { ...cfg, filepath: filePath });
}

/** Transformations */
function transformFile(file: import("ts-morph").SourceFile) {
  let touched = false;

  // Track imports
  const imports = file.getImportDeclarations();

  const hasImport = (name: string, mod: string) =>
    imports.some(
      d =>
        isFromModule(d, mod) &&
        d.getNamedImports().some((ni: any) => ni.getName() === name)
    );

  const addNamedImport = (name: string, mod: string) => {
    const existing = imports.find(d => isFromModule(d, mod));
    if (existing) {
      if (!existing.getNamedImports().some(ni => ni.getName() === name)) {
        existing.addNamedImport(name);
      }
    } else {
      file.addImportDeclaration({ moduleSpecifier: mod, namedImports: [name] });
    }
  };

  // 1) SafeAreaView edges prop removal (only when imported from 'react-native')
  const safeAreaFromRN = imports.some(
    d =>
      isFromModule(d, "react-native") &&
      d.getNamedImports().some(ni => ni.getName() === "SafeAreaView")
  );
  if (safeAreaFromRN) {
    const jsxOpening = file.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
    const jsxSelfClosing = file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    const jsx = [...jsxOpening, ...jsxSelfClosing];
    for (const el of jsx) {
      const tagName = el.getTagNameNode().getText();
      if (tagName === "SafeAreaView") {
        const attrs = el.getAttributes();
        for (const attr of attrs) {
          if (Node.isJsxAttribute(attr)) {
            const attrName = attr.getChildAtIndex(0)?.getText();
            if (attrName === "edges") {
              attr.remove();
              counts.safeArea_edges_removed++;
              touched = true;
            }
          }
        }
      }
    }
  }

  // 2) Theme.semantic.X → Theme.colors.<map>[500]
  //    Matches: Theme.semantic.<id> and Theme.semantic["<id>"]
  const themeMap = EAConfig.themeMap || {};
  const themePathMap = EAConfig.themePathMap || {};
  file.forEachDescendant(n => {
    try {
      if (Node.isPropertyAccessExpression(n)) {
        const left = n.getExpression();
        const name = n.getNameNode().getText();
        if (
          Node.isPropertyAccessExpression(left) &&
          left.getExpression().getText() === "Theme" &&
          left.getNameNode().getText() === "semantic"
        ) {
          const mapped = (themeMap as any)[name];
          if (mapped) {
            const replacement = typeof mapped === 'string' ? mapped : `colors.${name}[500]`;
            n.replaceWithText(`Theme.${replacement}`);
            counts.theme_semantic_rewrites++;
            touched = true;
          }
        }
      } else if (Node.isElementAccessExpression(n)) {
        const left = n.getExpression();
        const arg = n.getArgumentExpression();
        if (
          Node.isPropertyAccessExpression(left) &&
          left.getExpression().getText() === "Theme" &&
          left.getNameNode().getText() === "semantic" &&
          arg &&
          Node.isStringLiteral(arg)
        ) {
          const key = arg.getLiteralText();
          const mapped = (themeMap as any)[key];
          if (mapped) {
            const replacement = typeof mapped === 'string' ? mapped : `colors.${key}[500]`;
            n.replaceWithText(`Theme.${replacement}`);
            counts.theme_semantic_rewrites++;
            touched = true;
          }
        }
      }
    } catch (e) {
      // Skip nodes that can't be safely replaced
    }
  });

  // 2b) Direct Theme.colors path rewrites
  file.forEachDescendant(n => {
    if (Node.isPropertyAccessExpression(n)) {
      const fullPath = n.getText();
      if (fullPath.startsWith("Theme.")) {
        const rel = fullPath.slice("Theme.".length);
        const replacement = (themePathMap as any)[rel];
        if (replacement) {
          n.replaceWithText(`Theme.${replacement}`);
          counts.theme_semantic_rewrites++;
          touched = true;
        }
      }
    }
  });

  // 3) Ionicons glyphMap usages → string name
  //    Replace name={Ionicons.glyphMap[someVar]} → name={someVar as string}
  //    Also catches .glyphMap["foo"]
  const jsxOpening2 = file.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
  const jsxSelfClosing2 = file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
  const jsxElems = [...jsxOpening2, ...jsxSelfClosing2];

  for (const el of jsxElems) {
    const attrs = el.getAttributes();
    for (const attr of attrs) {
      if (!Node.isJsxAttribute(attr)) continue;
      const attrName = attr.getChildAtIndex(0)?.getText();
      if (attrName !== "name") continue;
      const init = attr.getInitializer();
      if (!init || !Node.isJsxExpression(init)) continue;
      const expr = init.getExpression();
      if (!expr) continue;

      // Ionicons.glyphMap[expr] or Ionicons.glyphMap.foo
      if (Node.isElementAccessExpression(expr)) {
        const expLeft = expr.getExpression();
        if (
          Node.isPropertyAccessExpression(expLeft) &&
          expLeft.getExpression().getText() === "Ionicons" &&
          expLeft.getName() === "glyphMap"
        ) {
          const inner = expr.getArgumentExpression()?.getText() ?? "''";
          init.replaceWithText(`{${inner} as string}`);
          counts.ionicons_glyphMap_fixed++;
          touched = true;
        }
      } else if (Node.isPropertyAccessExpression(expr)) {
        const left = expr.getExpression();
        if (
          Node.isPropertyAccessExpression(left) &&
          left.getExpression().getText() === "Ionicons" &&
          left.getName() === "glyphMap"
        ) {
          const icon = expr.getName();
          init.replaceWithText(`{'${icon}' as string}`);
          counts.ionicons_glyphMap_fixed++;
          touched = true;
        }
      }
    }
  }

  // 4) fontWeight: 600 → '600'
  const objs = file.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression);
  for (const obj of objs) {
    const prop = obj.getProperty("fontWeight");
    if (!prop) continue;
    if (Node.isPropertyAssignment(prop)) {
      const init = prop.getInitializer();
      if (init && Node.isNumericLiteral(init)) {
        const val = init.getText();
        prop.setInitializer(`'${val}'`);
        counts.fontWeight_normalized++;
        touched = true;
      }
    }
  }

  // 5) Ensure Animated import if `Animated.` used (skip if configured)
  if (!(EAConfig as any).skipAnimatedImport) {
    const usesAnimatedDot = file
      .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
      .some(p => p.getExpression().getText() === "Animated");
    if (usesAnimatedDot && !hasImport("Animated", "react-native")) {
      addNamedImport("Animated", "react-native");
      counts.animated_import_added++;
      touched = true;
    }
  }

  if (touched) counts.filesTouched++;
  return touched;
}

/** Main */
(async function run() {
  const project = new Project({
    tsConfigFilePath: fs.existsSync("apps/mobile/tsconfig.json")
      ? "apps/mobile/tsconfig.json"
      : undefined,
    skipAddingFilesFromTsConfig: true,
  });

  const files = await fg([...EAConfig.globs], { absolute: true });
  if (!files.length) {
    console.log("No files matched globs:", EAConfig.globs);
    process.exit(0);
  }

  const sf = project.addSourceFilesAtPaths(files);
  for (const file of sf) transformFile(file);

  if (WRITE) {
    await project.save();
    // Prettify changed files
    for (const file of sf) {
      if (!file.isSaved()) continue;
      const p = file.getFilePath();
      const code = fs.readFileSync(p, "utf8");
      const fmt = await formatFile(p, code).catch(() => code);
      if (fmt && fmt !== code) fs.writeFileSync(p, fmt, "utf8");
    }
  }

  // Report
  const pad = (k: string) => k.padEnd(32, " ");
  console.log("\n🔧 EA Summary (dry-run:", !WRITE, ")\n");
  console.log(pad("Files touched") + counts.filesTouched);
  console.log(pad("SafeArea edges removed") + counts.safeArea_edges_removed);
  console.log(pad("Theme semantic→tokens") + counts.theme_semantic_rewrites);
  console.log(pad("Ionicons glyphMap fixed") + counts.ionicons_glyphMap_fixed);
  console.log(pad("fontWeight normalized") + counts.fontWeight_normalized);
  console.log(pad("Animated import added") + counts.animated_import_added);
  console.log("\n💡 Tip: run with --write to apply changes.\n");
})();
