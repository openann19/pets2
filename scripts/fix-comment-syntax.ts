#!/usr/bin/env tsx
/**
 * Fix malformed comment syntax in import statements
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

  let stats = { filesFixed: 0 };

  for (const file of files) {
    let content = fs.readFileSync(file, "utf-8");
    let changed = false;

    // Fix malformed comments that start with "// import {" and have unmatched braces
    const lines = content.split('\n');
    const fixedLines = [];
    let inBadComment = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect start of malformed comment
      if (line.trim().startsWith('// import {') && !line.includes('}')) {
        inBadComment = true;
        fixedLines.push('// FIXME: EnhancedDesignTokens exports missing');
        fixedLines.push('// ' + line.replace(/^\/\/\s*/, ''));
        changed = true;
        continue;
      }
      
      // If we're in a bad comment, comment out the line
      if (inBadComment) {
        if (line.includes('} from')) {
          fixedLines.push('// ' + line);
          inBadComment = false;
          changed = true;
          continue;
        } else if (line.trim()) {
          fixedLines.push('// ' + line);
          changed = true;
          continue;
        }
      }
      
      fixedLines.push(line);
    }

    if (changed) {
      const newContent = fixedLines.join('\n');
      stats.filesFixed++;
      if (!DRY_RUN) {
        fs.writeFileSync(file, newContent, "utf-8");
      }
    }
  }

  console.log(`fix-comment-syntax: ${stats.filesFixed} files fixed`);
  console.log(DRY_RUN ? "ℹ️ dry-run (use --write)" : "✅ changes written");
}

main().catch(console.error);