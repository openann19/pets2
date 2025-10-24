#!/usr/bin/env tsx
import { Project, SyntaxKind, Node } from "ts-morph";
import fg from "fast-glob";

const files = await fg("apps/mobile/src/**/*.{ts,tsx}", { absolute: true });
const p = new Project({ skipAddingFilesFromTsConfig: true });
p.addSourceFilesAtPaths(files);

let touched = 0, changed = 0;

for (const sf of p.getSourceFiles()) {
  let local = false;
  const jsx = sf.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  
  for (const a of jsx) {
    const name = a.getNameNode().getText();
    if (!["colors", "locations", "transform"].includes(name)) continue;
    
    const init = a.getInitializer();
    if (!init || !Node.isJsxExpression(init)) continue;
    
    const expr = init.getExpression();
    if (!expr) continue;
    
    // Replace `[...] as const` with `[...]` 
    if (Node.isAsExpression(expr) && expr.getTypeNode()?.getText() === "const") {
      const arr = expr.getExpression().getText();
      init.replaceWithText(`{${arr}}`);
      changed++;
      local = true;
    }
  }
  
  if (local) {
    sf.saveSync();
    touched++;
  }
}

console.log(`fix-readonly-arrays: files=${touched} changes=${changed}`);
