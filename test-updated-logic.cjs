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
  console.log('=== TESTING UPDATED CODEMOD LOGIC ===');
  
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
  
  // Filter to only hex colors
  const hexLiterals = stringLiterals.filter((literal) => {
    const literalValue = literal.getLiteralText().trim();
    const normalized = normalizeHex(literalValue);
    return /^#[0-9a-f]{6}$/.test(normalized);
  });
  
  console.log('Hex color literals found:', hexLiterals.length);
  
  let colorsReplaced = 0;
  
  // Process each literal with UPDATED logic
  hexLiterals.forEach((literal) => {
    try {
      const literalValue = literal.getLiteralText().trim();
      const normalized = normalizeHex(literalValue);
      
      console.log(`\nProcessing: "${literalValue}" -> "${normalized}"`);

      // Check if we have a mapping for this color
      const replacementExpr = COLOR_MAP[normalized];
      if (!replacementExpr) {
        console.log(`  No mapping for ${normalized}, skipping`);
        return;
      }

      // UPDATED Safety check: Handle conditional expressions
      const propAssign = literal.getParentIfKind(SyntaxKind.PropertyAssignment);
      const conditional = literal.getParentIfKind(SyntaxKind.ConditionalExpression);
      
      let propName = null;
      let context = 'unknown';
      
      if (propAssign) {
        // Direct property assignment: { color: "#fff" }
        propName = propAssign.getNameNode().getText();
        context = 'direct';
      } else if (conditional) {
        // Conditional expression: { color: dark ? "#fff" : "#000" }
        // Walk up to find the containing property assignment
        let parent = conditional.getParent();
        while (parent && parent.getKind() !== SyntaxKind.SourceFile) {
          if (parent.getKind() === SyntaxKind.PropertyAssignment) {
            propName = parent.getNameNode().getText();
            context = 'conditional';
            break;
          }
          parent = parent.getParent();
        }
      }
      
      console.log(`  Context: ${context}`);
      console.log(`  Property name: ${propName}`);
      
      if (!propName) {
        console.log(`  Could not find property name, skipping`);
        return;
      }
      
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
      console.log(`     Property: ${propName} (${context})`);
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
