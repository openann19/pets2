#!/usr/bin/env tsx
/**
 * Fix React Native import errors (TS2305)
 * - PanGestureHandler/State → react-native-gesture-handler
 * - MaskedViewIOS → @react-native-masked-view/masked-view
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

  let touched = 0, pan = 0, state = 0, masked = 0;

  for (const sf of project.getSourceFiles()) {
    const imports = sf.getImportDeclarations();
    let fileChanged = false;

    // 1) PanGestureHandler/State FROM react-native → react-native-gesture-handler
    const rn = imports.find(d => d.getModuleSpecifierValue() === "react-native");
    if (rn) {
      const named = rn.getNamedImports();
      const panIdx = named.findIndex(ni => ni.getName() === "PanGestureHandler");
      const stateIdx = named.findIndex(ni => ni.getName() === "State");
      
      if (panIdx !== -1 || stateIdx !== -1) {
        let rnh = imports.find(d => d.getModuleSpecifierValue() === "react-native-gesture-handler");
        if (!rnh) {
          rnh = sf.addImportDeclaration({ 
            moduleSpecifier: "react-native-gesture-handler", 
            namedImports: [] 
          });
        }
        
        if (panIdx !== -1) { 
          rnh.addNamedImport("PanGestureHandler"); 
          named[panIdx].remove(); 
          pan++; 
        }
        if (stateIdx !== -1) { 
          rnh.addNamedImport("State"); 
          named[stateIdx].remove(); 
          state++; 
        }
        
        if (rn.getNamedImports().length === 0 && !rn.getNamespaceImport() && !rn.getDefaultImport()) {
          rn.remove();
        }
        fileChanged = true;
      }
    }

    // 2) MaskedViewIOS → @react-native-masked-view/masked-view (default MaskedView)
    const rn2 = imports.find(d => d.getModuleSpecifierValue() === "react-native");
    if (rn2) {
      const maskedIdx = rn2.getNamedImports().findIndex(ni => ni.getName() === "MaskedViewIOS");
      if (maskedIdx !== -1) {
        rn2.getNamedImports()[maskedIdx].remove();
        
        let mv = imports.find(d => d.getModuleSpecifierValue() === "@react-native-masked-view/masked-view");
        if (!mv) {
          mv = sf.addImportDeclaration({ 
            moduleSpecifier: "@react-native-masked-view/masked-view", 
            defaultImport: "MaskedView" 
          });
        } else if (!mv.getDefaultImport()) {
          mv.setDefaultImport("MaskedView");
        }
        
        if (rn2.getNamedImports().length === 0 && !rn2.getNamespaceImport() && !rn2.getDefaultImport()) {
          rn2.remove();
        }
        
        masked++; 
        fileChanged = true;
      }
    }

    if (fileChanged) touched++;
  }

  if (WRITE) await project.save();

  console.log(`fix-rn-imports: ${touched} files changed`);
  console.log(`  PanGestureHandler moved: ${pan}`);
  console.log(`  State moved:            ${state}`);
  console.log(`  MaskedViewIOS → MaskedView: ${masked}`);
  console.log(WRITE ? "✅ changes written" : "ℹ️ dry-run (use --write)");
}

main().catch(console.error);