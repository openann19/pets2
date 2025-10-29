const { Project, SyntaxKind } = require('ts-morph');

// Copy the exact logic from the codemod to debug
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

// Test on just the UltraTabBar file
const project = new Project({
  tsConfigFilePath: '/home/ben/Downloads/pets-fresh/apps/mobile/tsconfig.json',
});

const sourceFile = project.getSourceFile('/home/ben/Downloads/pets-fresh/apps/mobile/src/navigation/UltraTabBar.tsx');

if (sourceFile) {
  console.log('=== DEBUGGING CODEMOD ON ULTRA TAB BAR ===');
  
  let stats = {
    filesScanned: 0,
    filesModified: 0,
    colorsReplaced: 0,
    importsAdded: 0,
    hooksInjected: 0,
    errors: []
  };
  
  // Skip file logic (this file should be processed)
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

      console.log(`✅ FOUND REPLACEABLE COLOR: "${normalized}" -> "${replacementExpr}"`);
      console.log(`   Component: ${ownerComp.func.getName()}`);
      console.log(`   Property: ${propName}`);
      
      // Track component for theme injection
      componentsNeedingTheme.add(ownerComp);
      
      if (!DRY_RUN) {
        literal.replaceWithText(replacementExpr);
        fileModified = true;
      }
      
      stats.colorsReplaced++;

    } catch (error) {
      stats.errors.push(`String processing failed: ${error.message}`);
    }
  });

  console.log(`\n=== FINAL STATS ===`);
  console.log(`Colors replaced: ${stats.colorsReplaced}`);
  console.log(`Components needing theme: ${componentsNeedingTheme.size}`);
  
} else {
  console.log('File not found');
}
