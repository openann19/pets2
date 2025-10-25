#!/usr/bin/env ts-node
/**
 * 🔧 MOBILE ERROR FIXER
 * Systematically fixes TypeScript errors in mobile app
 */

import { Project } from "ts-morph";
import * as path from "path";

const project = new Project({
  tsConfigFilePath: path.join(__dirname, "../apps/mobile/tsconfig.json"),
});

console.log("🔍 Analyzing mobile app errors...\n");

// Get all source files
const sourceFiles = project.getSourceFiles("apps/mobile/src/**/*.{ts,tsx}");

let fixCount = 0;

// Fix 1: Remove unused imports
sourceFiles.forEach((file) => {
  file.fixUnusedIdentifiers();
  fixCount++;
});

// Fix 2: Add missing type imports
sourceFiles.forEach((file) => {
  const imports = file.getImportDeclarations();
  imports.forEach((imp) => {
    const namedImports = imp.getNamedImports();
    namedImports.forEach((named) => {
      // Check if it's a type-only import that should be
      const name = named.getName();
      if (name.endsWith("Props") || name.endsWith("Type") || name.endsWith("Interface")) {
        if (!imp.isTypeOnly() && !named.isTypeOnly()) {
          named.setIsTypeOnly(true);
          fixCount++;
        }
      }
    });
  });
});

// Fix 3: Fix JSX.Element return types
sourceFiles.forEach((file) => {
  const functions = file.getFunctions();
  functions.forEach((func) => {
    const returnType = func.getReturnType();
    if (returnType.getText().includes("JSX.Element")) {
      func.setReturnType("React.JSX.Element");
      fixCount++;
    }
  });
});

// Save all changes
project.saveSync();

console.log(`✅ Fixed ${fixCount} issues`);
console.log("\n🎉 Mobile error fixing complete!");
