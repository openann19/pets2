const { Project, SyntaxKind } = require('ts-morph');

// Color mappings from the codemod
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

const project = new Project({
  tsConfigFilePath: '/home/ben/Downloads/pets-fresh/apps/mobile/tsconfig.json',
});

const file = project.getSourceFile('/home/ben/Downloads/pets-fresh/apps/mobile/src/navigation/UltraTabBar.tsx');
if (file) {
  console.log('=== TESTING CODEMOD LOGIC ===');
  
  // Find components (same as codemod)
  const variableDeclarations = file.getVariableDeclarations();
  const arrowFunctions = variableDeclarations
    .filter((vd) => {
      const init = vd.getInitializer();
      if (!init) return false;
      const kind = init.getKind();
      return kind === SyntaxKind.ArrowFunction || kind === SyntaxKind.FunctionExpression;
    });
  
  const allFunctions = [...file.getFunctions(), ...arrowFunctions];
  
  const isReactComponent = (func) => {
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
  };
  
  const components = allFunctions.filter(isReactComponent);
  
  // Build component ranges (same as codemod)
  const componentRanges = components.map((comp) => ({
    func: comp,
    start: comp.getStart(),
    end: comp.getEnd(),
  }));
  
  console.log('Component ranges:', componentRanges.length);
  
  // Get string literals (same as codemod)
  const stringLiterals = file.getDescendantsOfKind(SyntaxKind.StringLiteral);
  console.log('String literals found:', stringLiterals.length);
  
  let colorsReplaced = 0;
  
  // Process each literal (same as codemod logic)
  stringLiterals.forEach((literal) => {
    try {
      const literalValue = literal.getLiteralText().trim();
      const normalized = normalizeHex(literalValue);
      
      console.log(`Processing: "${literalValue}" -> "${normalized}"`);

      // Check if it's a hex color
      if (!/^#[0-9a-f]{6}$/.test(normalized)) {
        console.log(`  Not a 6-digit hex color, skipping`);
        return;
      }

      // Check if we have a mapping for this color
      const replacementExpr = COLOR_MAP[normalized];
      if (!replacementExpr) {
        console.log(`  No mapping for ${normalized}, skipping`);
        return;
      }

      // Safety check: Only replace if in a style property
      const propAssign = literal.getParentIfKind(SyntaxKind.PropertyAssignment);
      if (!propAssign) {
        console.log(`  Not in a property assignment, skipping`);
        return;
      }

      const propName = propAssign.getNameNode().getText();
      const isColorProp =
        /color/i.test(propName) ||
        /background/i.test(propName) ||
        /border/i.test(propName) ||
        /shadow/i.test(propName);

      if (!isColorProp) {
        console.log(`  Property "${propName}" is not a color property, skipping`);
        return;
      }

      // Check if inside a component
      const litPos = literal.getStart();
      const ownerComp = componentRanges.find(
        (range) => litPos >= range.start && litPos <= range.end
      );

      if (!ownerComp) {
        console.log(`  Not inside a component, skipping`);
        return;
      }

      console.log(`  ✅ Would replace "${normalized}" with "${replacementExpr}"`);
      console.log(`     Component: ${ownerComp.func.getName()}`);
      console.log(`     Property: ${propName}`);
      colorsReplaced++;

    } catch (error) {
      console.log(`  Error processing: ${error.message}`);
    }
  });
  
  console.log(`\n=== RESULT ===`);
  console.log(`Colors that would be replaced: ${colorsReplaced}`);
  
} else {
  console.log('File not found');
}
