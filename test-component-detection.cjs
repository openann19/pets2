const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: '/home/ben/Downloads/pets-fresh/apps/mobile/tsconfig.json',
});

const file = project.getSourceFile('/home/ben/Downloads/pets-fresh/apps/mobile/src/navigation/UltraTabBar.tsx');
if (file) {
  console.log('=== FUNCTIONS ===');
  const functions = file.getFunctions();
  console.log('Function declarations:', functions.length);
  
  console.log('\n=== VARIABLE DECLARATIONS ===');
  const variableDeclarations = file.getVariableDeclarations();
  console.log('Variable declarations:', variableDeclarations.length);
  
  const arrowFunctions = variableDeclarations
    .filter((vd) => {
      const init = vd.getInitializer();
      if (!init) return false;
      const kind = init.getKind();
      return kind === SyntaxKind.ArrowFunction || kind === SyntaxKind.FunctionExpression;
    });
  
  console.log('Arrow functions:', arrowFunctions.length);
  
  arrowFunctions.forEach((vd, i) => {
    console.log(`Arrow function ${i}:`);
    console.log(`  Name: ${vd.getName()}`);
    console.log(`  Type: ${vd.getType().getText()}`);
    console.log(`  Has JSX: ${vd.getInitializer().getDescendantsOfKind(SyntaxKind.JsxElement).length > 0}`);
  });
  
  const allFunctions = [...functions, ...arrowFunctions];
  console.log('\n=== ALL FUNCTIONS ===');
  console.log('Total functions:', allFunctions.length);
  
  // Check component detection
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
  console.log('\n=== COMPONENTS ===');
  console.log('React components found:', components.length);
  
  components.forEach((comp, i) => {
    console.log(`Component ${i}: ${comp.getName()}`);
  });
  
} else {
  console.log('File not found');
}
