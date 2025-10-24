#!/usr/bin/env tsx
import { Project, SyntaxKind } from "ts-morph";
import fg from "fast-glob";

const files = await fg("apps/mobile/src/**/*.{ts,tsx}", { absolute: true });
const p = new Project({ skipAddingFilesFromTsConfig: true });
p.addSourceFilesAtPaths(files);

let filesChanged = 0, removed = 0;

for (const sf of p.getSourceFiles()) {
  let local = false;
  
  for (const imp of sf.getImportDeclarations()) {
    for (const ni of [...imp.getNamedImports()]) {
      const name = ni.getName();
      const refs = sf.getDescendantsOfKind(SyntaxKind.Identifier).filter(id => id.getText() === name);
      
      // Check if used (excluding the import itself and type-only usage)
      const used = refs.some(id => {
        const parent = id.getParent();
        const parentKind = parent?.getKindName();
        
        // Skip the import declaration itself
        if (parentKind?.includes("Import")) return false;
        
        // Skip type-only usage (type annotations, interface extends, etc.)
        if (parentKind?.includes("Type")) return false;
        
        return true;
      });
      
      if (!used) {
        ni.remove();
        local = true;
        removed++;
      }
    }
    
    // Remove entire import if no named imports left and no default/namespace import
    if (!imp.getNamedImports().length && !imp.getDefaultImport() && !imp.getNamespaceImport()) {
      imp.remove();
    }
  }
  
  if (local) {
    sf.saveSync();
    filesChanged++;
  }
}

console.log(`cleanup-unused-imports: files=${filesChanged} removed=${removed}`);
