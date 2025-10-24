#!/usr/bin/env tsx
/**
 * Fix PanGestureHandler/State imports
 * Move from react-native to react-native-gesture-handler
 */

import * as fs from "fs";
import * as path from "path";
import fg from "fast-glob";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOBILE_DIR = path.join(__dirname, "../apps/mobile");
const DRY_RUN = !process.argv.includes("--write");

async function main() {
  const files = await fg(["src/**/*.{ts,tsx}"], { 
    cwd: MOBILE_DIR, 
    absolute: true 
  });

  let stats = { filesChanged: 0, importsFixed: 0 };

  for (const file of files) {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Check if file imports PanGestureHandler or State from react-native
    const rnImportRegex = /^import\s*{\s*([^}]+)\s*}\s*from\s*['"]react-native['"];?$/gm;
    
    content = content.replace(rnImportRegex, (match, imports) => {
      const importList = imports.split(',').map((s: string) => s.trim());
      const gestureItems = importList.filter((item: string) => 
        item === 'PanGestureHandler' || item === 'State'
      );
      
      if (gestureItems.length === 0) return match;
      
      // Remove gesture items from react-native import
      const remainingImports = importList.filter((item: string) => 
        item !== 'PanGestureHandler' && item !== 'State'
      );
      
      let result = '';
      
      // Add gesture handler import
      result += `import { ${gestureItems.join(', ')} } from 'react-native-gesture-handler';\n`;
      
      // Keep react-native import if there are remaining items
      if (remainingImports.length > 0) {
        result += `import { ${remainingImports.join(', ')} } from 'react-native';`;
      }
      
      stats.importsFixed += gestureItems.length;
      changed = true;
      
      return result;
    });

    if (changed) {
      stats.filesChanged++;
      if (!DRY_RUN) {
        fs.writeFileSync(file, content, "utf-8");
      }
    }
  }

  console.log(`fix-gesture-imports: ${stats.filesChanged} files changed`);
  console.log(`  Imports fixed: ${stats.importsFixed}`);
  console.log(DRY_RUN ? "ℹ️ dry-run (use --write)" : "✅ changes written");
}

main().catch(console.error);