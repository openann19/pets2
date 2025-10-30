#!/usr/bin/env ts-node
/**
 * Codemod: Move StyleSheet.create that references `theme` into component scope.
 * Strategy:
 *  - Find top-level consts assigned to StyleSheet.create({...}) -> names: styles, *Styles, etc.
 *  - For each, create a factory: `function __makeStyles_<Name>(theme: Theme) { return StyleSheet.create(OBJECT); }`
 *  - For each React component in file (function decl or const PascalCase = () => JSX), insert:
 *      const theme = useTheme();
 *      const <name> = useMemo(() => __makeStyles_<Name>(theme), [theme]);
 *  - Remove original top-level consts.
 */
import {
  ArrowFunction,
  FunctionDeclaration,
  Node,
  Project,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';

const THEME_IMPORT = '@/theme/unified-theme';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const files = project.getSourceFiles(['**/*.tsx']);

let editedFiles = 0;

for (const sf of files) {
  let fileChanged = false;
  ensureImports(sf);

  const styleDecls: { name: string; objectLiteralText: string }[] = [];

  const topLevel = sf.getStatements();
  for (const st of topLevel) {
    if (!Node.isVariableStatement(st)) continue;
    const declList = st.getDeclarationList();
    const decls = declList.getDeclarations();
    for (const d of decls) {
      const init = d.getInitializer();
      if (!init || !Node.isCallExpression(init)) continue;
      const callText = init.getExpression().getText();
      if (callText !== 'StyleSheet.create') continue;
      const args = init.getArguments();
      if (args.length !== 1 || !Node.isObjectLiteralExpression(args[0])) continue;
      const name = d.getName();
      const objectLiteralText = args[0].getText();
      styleDecls.push({ name, objectLiteralText });
    }
  }

  if (styleDecls.length === 0) {
    continue;
  }

  for (const decl of styleDecls) {
    const varStmt = sf.getVariableDeclaration(decl.name)?.getFirstAncestorByKind(SyntaxKind.VariableStatement);
    varStmt?.remove();

    const factoryName = `__makeStyles_${decl.name}`;
    const factoryCode = `function ${factoryName}(theme: Theme) {\n  return StyleSheet.create(${decl.objectLiteralText});\n}`;

    const lastImport = sf.getFirstDescendantByKind(SyntaxKind.ImportDeclaration);
    if (lastImport) {
      sf.insertStatements(lastImport.getChildIndex() + 1, factoryCode + '\n');
    } else {
      sf.insertStatements(0, factoryCode + '\n');
    }

    const components = findReactComponents(sf);
    for (const comp of components) {
      const body = comp.getBody();
      if (!body) continue;
      const bodyText = body.getText();
      if (new RegExp(`\\bconst\\s+${decl.name}\\b`).test(bodyText)) continue;

      const inject = `\nconst theme = useTheme();\nconst ${decl.name} = useMemo(() => ${factoryName}(theme), [theme]);\n`;

      if (Node.isArrowFunction(comp)) {
        const block = comp.getBody();
        if (Node.isBlock(block)) {
          block.insertStatements(0, inject);
        } else {
          const ret = block.getText();
          comp.setBodyText(`{${inject}return ${ret};}`);
        }
      } else if (Node.isFunctionDeclaration(comp)) {
        const blk = comp.getBody();
        blk?.insertStatements(0, inject);
      }
    }

    fileChanged = true;
  }

  if (fileChanged) {
    editedFiles++;
    sf.saveSync();
  }
}

console.log(`[codemod:migrate-theme-styles] Files edited: ${editedFiles}`);

function ensureImports(sf: SourceFile) {
  const imps = sf.getImportDeclarations();
  const hasStyleSheet = imps.some((i) => i.getModuleSpecifierValue() === 'react-native');
  const hasReact = imps.some((i) => i.getModuleSpecifierValue() === 'react');
  const hasTheme = imps.some((i) => i.getModuleSpecifierValue() === THEME_IMPORT);

  if (!hasStyleSheet) {
    sf.addImportDeclaration({ namedImports: ['StyleSheet'], moduleSpecifier: 'react-native' });
  }
  if (!hasReact) {
    sf.addImportDeclaration({ namedImports: ['useMemo'], moduleSpecifier: 'react' });
  }
  if (!hasTheme) {
    sf.addImportDeclaration({ namedImports: ['useTheme', 'Theme'], moduleSpecifier: THEME_IMPORT });
  }
}

function findReactComponents(sf: SourceFile) {
  const comps: (ArrowFunction | FunctionDeclaration)[] = [];

  sf.getVariableDeclarations().forEach((vd) => {
    const name = vd.getName();
    if (!/^[A-Z]/.test(name)) return;
    const init = vd.getInitializer();
    if (init && Node.isArrowFunction(init)) {
      const returnsJsx =
        init.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
        init.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0 ||
        init.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0;
      if (returnsJsx) comps.push(init);
    }
  });

  sf.getFunctions().forEach((fn) => {
    const name = fn.getName();
    if (!name || !/^[A-Z]/.test(name)) return;
    const returnsJsx =
      fn.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
      fn.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0 ||
      fn.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0;
    if (returnsJsx) comps.push(fn);
  });

  return comps;
}
