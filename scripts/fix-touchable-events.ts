#!/usr/bin/env tsx
import { Project, SyntaxKind, Node } from "ts-morph";
import fg from "fast-glob";

const files = await fg("apps/mobile/src/**/*.{ts,tsx}", { absolute: true });
const p = new Project({ skipAddingFilesFromTsConfig: true });
p.addSourceFilesAtPaths(files);

let filesChanged = 0, edits = 0;

for (const sf of p.getSourceFiles()) {
  let local = false;
  const opens = sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
                  .concat(sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement));
  
  for (const el of opens) {
    if (el.getTagNameNode().getText() !== "TouchableOpacity") continue;
    
    for (const attr of el.getAttributes()) {
      if (!Node.isJsxAttribute(attr)) continue;
      
      if (attr.getNameNode().getText() === "onTouchStart") { 
        attr.getNameNode().replaceWithText("onPressIn");  
        local = true; 
        edits++; 
      }
      if (attr.getNameNode().getText() === "onTouchEnd") { 
        attr.getNameNode().replaceWithText("onPressOut"); 
        local = true; 
        edits++; 
      }
    }
  }
  
  if (local) { 
    sf.saveSync(); 
    filesChanged++; 
  }
}

console.log(`fix-touchable-events: files=${filesChanged} edits=${edits}`);
