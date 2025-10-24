#!/usr/bin/env tsx
/**
 * Comprehensive TS2305 Fixer - Module has no exported member
 * Fixes all remaining import/export issues
 */

import { Project } from "ts-morph";
import fg from "fast-glob";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WRITE = process.argv.includes("--write");
const MOBILE_DIR = join(__dirname, "../apps/mobile");

async function main() {
  const files = await fg(["src/**/*.{ts,tsx}"], { 
    cwd: MOBILE_DIR, 
    absolute: true 
  });

  const project = new Project({ skipAddingFilesFromTsConfig: true });
  project.addSourceFilesAtPaths(files);

  let stats = {
    gestureHandler: 0,
    enhancedTokens: 0,
    tokensType: 0,
    colors: 0,
    filesChanged: 0
  };

  for (const sf of project.getSourceFiles()) {
    const imports = sf.getImportDeclarations();
    let fileChanged = false;

    // 1) Fix PanGestureHandler/State imports
    const rnImport = imports.find(d => d.getModuleSpecifierValue() === "react-native");
    if (rnImport) {
      const named = rnImport.getNamedImports();
      const gestureItems = named.filter(ni => 
        ["PanGestureHandler", "State"].includes(ni.getName())
      );
      
      if (gestureItems.length > 0) {
        // Add react-native-gesture-handler import
        let gestureImport = imports.find(d => 
          d.getModuleSpecifierValue() === "react-native-gesture-handler"
        );
        
        if (!gestureImport) {
          gestureImport = sf.addImportDeclaration({
            moduleSpecifier: "react-native-gesture-handler",
            namedImports: []
          });
        }
        
        // Move items
        gestureItems.forEach(item => {
          gestureImport!.addNamedImport(item.getName());
          item.remove();
          stats.gestureHandler++;
        });
        
        // Clean up empty react-native import
        if (rnImport.getNamedImports().length === 0 && 
            !rnImport.getNamespaceImport() && 
            !rnImport.getDefaultImport()) {
          rnImport.remove();
        }
        
        fileChanged = true;
      }
    }

    // 2) Fix EnhancedDesignTokens imports - comment them out
    const enhancedImport = imports.find(d => 
      d.getModuleSpecifierValue().includes("EnhancedDesignTokens")
    );
    
    if (enhancedImport) {
      const problematicItems = [
        "DynamicColors", "EnhancedShadows", "SemanticColors", 
        "EnhancedTypography", "MotionSystem"
      ];
      
      const named = enhancedImport.getNamedImports();
      const toRemove = named.filter(ni => 
        problematicItems.includes(ni.getName())
      );
      
      if (toRemove.length > 0) {
        toRemove.forEach(item => {
          // Comment out the import line instead of removing
          const sourceFile = item.getSourceFile();
          const importDecl = item.getParent()?.getParent();
          if (importDecl) {
            const text = importDecl.getText();
            const commented = `// ${text} // FIXME: EnhancedDesignTokens exports missing`;
            importDecl.replaceWithText(commented);
          }
          stats.enhancedTokens++;
        });
        fileChanged = true;
      }
    }

    // 3) Fix TokensType → Tokens
    imports.forEach(imp => {
      const namedImports = imp.getNamedImports();
      namedImports.forEach(ni => {
        if (ni.getName() === "TokensType") {
          ni.setName("Tokens");
          stats.tokensType++;
          fileChanged = true;
        }
      });
    });

    // 4) Fix Colors import (should be default)
    const globalStylesImport = imports.find(d => 
      d.getModuleSpecifierValue().includes("GlobalStyles")
    );
    
    if (globalStylesImport) {
      const colorsImport = globalStylesImport.getNamedImports().find(ni => 
        ni.getName() === "Colors"
      );
      
      if (colorsImport) {
        colorsImport.remove();
        globalStylesImport.setDefaultImport("Colors");
        stats.colors++;
        fileChanged = true;
      }
    }

    if (fileChanged) stats.filesChanged++;
  }

  if (WRITE) await project.save();

  console.log(`fix-ts2305-comprehensive: ${stats.filesChanged} files changed`);
  console.log(`  Gesture handler fixes: ${stats.gestureHandler}`);
  console.log(`  Enhanced tokens commented: ${stats.enhancedTokens}`);
  console.log(`  TokensType → Tokens: ${stats.tokensType}`);
  console.log(`  Colors import fixes: ${stats.colors}`);
  console.log(WRITE ? "✅ changes written" : "ℹ️ dry-run (use --write)");
}

main().catch(console.error);