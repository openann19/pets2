const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: '/home/ben/Downloads/pets-fresh/apps/mobile/tsconfig.json',
});

const file = project.getSourceFile('/home/ben/Downloads/pets-fresh/apps/mobile/src/navigation/UltraTabBar.tsx');
if (file) {
  const strings = file.getDescendantsOfKind(SyntaxKind.StringLiteral);
  console.log('Found string literals:', strings.length);
  
  strings.forEach((lit, i) => {
    const value = lit.getLiteralText().trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value)) {
      console.log(`Found hex color: ${value} at line ${lit.getStartLineNumber()}`);
      
      // Check parent context
      const parent = lit.getParent();
      if (parent) {
        console.log(`  Parent kind: ${SyntaxKind[parent.getKind()]}`);
        if (parent.getKind() === SyntaxKind.PropertyAssignment) {
          console.log(`  Property name: ${parent.getNameNode().getText()}`);
        }
      }
    }
  });
} else {
  console.log('File not found');
}
