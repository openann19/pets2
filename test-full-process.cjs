const { Project, SyntaxKind } = require('ts-morph');

// Color mappings from the codemod
const COLOR_MAPPINGS = {
  '#fff': 'theme.colors.surface',
  '#ffffff': 'theme.colors.surface',
  '#000': 'theme.colors.onSurface',
  '#000000': 'theme.colors.onSurface',
  '#111': 'theme.colors.onSurface',
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

const project = new Project({
  tsConfigFilePath: '/home/ben/Downloads/pets-fresh/apps/mobile/tsconfig.json',
});

const file = project.getSourceFile('/home/ben/Downloads/pets-fresh/apps/mobile/src/navigation/UltraTabBar.tsx');
if (file) {
  console.log('=== PROCESSING ULTRA TAB BAR ===');
  
  // Find components
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
  console.log('Found components:', components.length);
  
  // Build component ranges
  const componentRanges = components.map((comp) => ({
    func: comp,
    start: comp.getStart(),
    end: comp.getEnd(),
  }));
  
  console.log('Component ranges:', componentRanges.length);
  
  // Find hardcoded colors
  const strings = file.getDescendantsOfKind(SyntaxKind.StringLiteral);
  const hardcodedColors = strings.filter((lit) => {
    const value = lit.getLiteralText().trim();
    return Object.keys(COLOR_MAPPINGS).includes(value);
  });
  
  console.log('Hardcoded colors found:', hardcodedColors.length);
  
  hardcodedColors.forEach((lit, i) => {
    const value = lit.getLiteralText().trim();
    const line = lit.getStartLineNumber();
    console.log(`Color ${i}: ${value} at line ${line}`);
    
    // Check ownership
    const pos = lit.getStart();
    const owner = componentRanges.find(range => pos >= range.start && pos <= range.end);
    if (owner) {
      console.log(`  Owned by component: ${owner.func.getName()}`);
      
      // Check if it's in a style context
      const parent = lit.getParent();
      let isStyleContext = false;
      
      let current = parent;
      while (current && current.getKind() !== SyntaxKind.SourceFile) {
        if (current.getKind() === SyntaxKind.PropertyAssignment) {
          const propName = current.getNameNode()?.getText();
          if (['color', 'backgroundColor', 'borderColor', 'shadowColor'].includes(propName)) {
            isStyleContext = true;
            break;
          }
        }
        current = current.getParent();
      }
      
      console.log(`  Is style context: ${isStyleContext}`);
      
      if (isStyleContext) {
        const replacement = COLOR_MAPPINGS[value];
        console.log(`  Would replace with: ${replacement}`);
      }
    } else {
      console.log(`  Not owned by any component`);
    }
  });
  
} else {
  console.log('File not found');
}
