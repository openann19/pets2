#!/usr/bin/env node

/**
 * Simple Any Type Fixer
 * Replaces 'any' types with 'unknown' for better type safety
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetPath = args.length > 0 && !args[0].startsWith('--') ? args[0] : '.';

console.log('TypeScript Any Type Fixer');
console.log('======================');
console.log('Mode: ' + (dryRun ? 'Dry run (no changes will be made)' : 'Making changes'));
console.log('Target path: ' + targetPath);
console.log('');

// Find TypeScript files
function findTypeScriptFiles() {
  try {
    const command = 'find ' + targetPath + ' -type f -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/.git/*" \\( -name "*.ts" -o -name "*.tsx" \\)';
    const output = execSync(command, { encoding: 'utf8' });
    return output.trim().split('\n').filter(function(line) { 
      return line.length > 0;
    });
  } catch (error) {
    console.error('Error finding TypeScript files: ' + error.message);
    return [];
  }
}

// Fix any types in a file
function fixAnyTypes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Simple replacements
    let newContent = content
      .replace(/: any([ ]*[=;,)\[])/g, ': unknown$1')
      .replace(/as any/g, 'as unknown')
      .replace(/<any>/g, '<unknown>')
      .replace(/Array<any>/g, 'Array<unknown>')
      .replace(/Promise<any>/g, 'Promise<unknown>')
      .replace(/Map<string, any>/g, 'Map<string, unknown>')
      .replace(/\{\s*\[key: string\]: any\s*\}/g, 'Record<string, unknown>');
    
    // Return whether we made changes
    if (newContent !== originalContent) {
      if (!dryRun) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed: ' + filePath);
      } else {
        console.log('Would fix: ' + filePath);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error processing file ' + filePath + ': ' + error.message);
    return false;
  }
}

// Main execution
function main() {
  const files = findTypeScriptFiles();
  console.log('Found ' + files.length + ' TypeScript files to process.');
  
  let fixedCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    if (fixAnyTypes(files[i])) {
      fixedCount++;
    }
  }
  
  console.log('\nSummary:');
  console.log((dryRun ? 'Would fix' : 'Fixed') + ' ' + fixedCount + ' out of ' + files.length + ' files.');
  
  if (dryRun && fixedCount > 0) {
    console.log('To apply these changes, run without the --dry-run flag.');
  }
}

main();
