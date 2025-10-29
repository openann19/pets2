const { Project, SyntaxKind } = require('ts-morph');

// Copy the exact logic from the codemod but process just one file
const COLOR_MAP = {
  '#ffffff': 'theme.colors.surface',
  '#000000': 'theme.colors.onSurface',
  '#111111': 'theme.colors.onSurface',
  '#f5f5f5': 'theme.colors.bg',
  '#ff0000': 'theme.colors.danger',
  '#d32f2f': 'theme.colors.danger',
  '#00c853': 'theme.colors.success',
  '#00ff00': 'theme.colors.success',
  '#ffa500': 'theme.colors.warning',
  '#ffd700': 'theme.colors.warning',
  '#2196f3': 'theme.colors.primary',
  '#3b82f6': 'theme.colors.primary',
};

function normalizeHex(hex) {
  const lower = hex.toLowerCase();
  // Expand shorthand: #fff -> #ffffff
  if (/^#[0-9a-f]{3}$/.test(lower)) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  return lower;
}

function isReactComponent(func) {
  const name = func.getName?.();
  if (name && /^[A-Z]/.test(name)) return true;
  
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

// Test on the backup file
const project = new Project({
  tsConfigFilePath: '/home/ben/Downloads/pets-fresh/apps/mobile/tsconfig.json',
});

// Add the backup file to the project
const sourceFile = project.addSourceFileAtPath('/home/ben/Downloads/pets-fresh/UltraTabBar.backup.tsx');

if (sourceFile) {
  console.log('=== TESTING ACTUAL CODEMOD ON BACKUP FILE ===');
  
  let stats = {
    filesScanned: 0,
    filesModified: 0,
    colorsReplaced: 0,
    importsAdded: 0,
    hooksInjected: 0,
    errors: []
  };
  
  const filePath = sourceFile.getFilePath();
  console.log(`Processing file: ${filePath}`);
  
  stats.filesScanned++;
  let fileModified = false;
  const componentsNeedingTheme = new Set();

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

  console.log(`Found ${components.length} components`);

  // Build component ranges for ownership check
  const componentRanges = components.map((comp) => ({
    func: comp,
    start: comp.getStart(),
    end: comp.getEnd(),
  }));

  // Check if useTheme is already imported
  const hasThemeImport = sourceFile.getImportDeclarations().some(imp => 
    imp.getModuleSpecifier().getLiteralText().includes('theme')
  );

  console.log(`Has theme import: ${hasThemeImport}`);

  // Get all string literals
  const stringLiterals = sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral);
  console.log(`Found ${stringLiterals.length} string literals`);

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

      // Safety check: Only replace if in a style property or conditional within style property
      const propAssign = literal.getParentIfKind(SyntaxKind.PropertyAssignment);
      const conditional = literal.getParentIfKind(SyntaxKind.ConditionalExpression);
      
      let propName = null;
      let isColorProp = false;
      
      if (propAssign) {
        // Direct property assignment: { color: "#fff" }
        propName = propAssign.getNameNode().getText();
      } else if (conditional) {
        // Conditional expression: { color: dark ? "#fff" : "#000" }
        // Walk up to find the containing property assignment
        let parent = conditional.getParent();
        while (parent && parent.getKind() !== SyntaxKind.SourceFile) {
          if (parent.getKind() === SyntaxKind.PropertyAssignment) {
            propName = parent.getNameNode().getText();
            break;
          }
          parent = parent.getParent();
        }
      }
      
      if (!propName) return;
      
      isColorProp =
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

      if (!ownerComp) return;

      console.log(`✅ REPLACING: "${normalized}" -> "${replacementExpr}"`);
      console.log(`   Component: ${ownerComp.func.getName()}`);
      console.log(`   Property: ${propName}`);
      
      // Track component for theme injection
      componentsNeedingTheme.add(ownerComp);
      
      // ACTUALLY REPLACE THE COLOR
      literal.replaceWithText(replacementExpr);
      fileModified = true;
      stats.colorsReplaced++;

    } catch (error) {
      stats.errors.push(`String processing failed: ${error.message}`);
    }
  });

  // Save the file if modified
  if (fileModified) {
    sourceFile.saveSync();
    stats.filesModified++;
  }

  console.log(`\n=== FINAL STATS ===`);
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Colors replaced: ${stats.colorsReplaced}`);
  console.log(`Components needing theme: ${componentsNeedingTheme.size}`);
  console.log(`Errors: ${stats.errors.length}`);
  
} else {
  console.log('File not found');
}
