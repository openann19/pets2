#!/usr/bin/env node

/**
 * Nullable Check Fixer
 * Replaces unsafe conditionals with proper null/undefined checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetPath = args.length > 0 && !args[0].startsWith('--') ? args[0] : '.';

console.log('TypeScript Nullable Check Fixer');
console.log('============================');
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

// Fix nullable checks in a file
function fixNullableChecks(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Common patterns to fix
    const patterns = [
      // Convert simple if (variable) to explicit null/undefined check
      {
        regex: /if\s*\(([a-zA-Z][a-zA-Z0-9_]*)\)/g,
        replacement: function(match, variable) {
          // Skip common boolean variables and other literals
          const skipVariables = ['true', 'false', 'enabled', 'active', 'valid', 'isValid', 'disabled'];
          if (skipVariables.some(function(skip) { return skip === variable; })) {
            return match;
          }
          return 'if (' + variable + ' !== null && ' + variable + ' !== undefined)';
        }
      },
      // Convert logical OR to nullish coalescing for variable assignment
      {
        regex: /([a-zA-Z][a-zA-Z0-9_]*)\s*=\s*([a-zA-Z][a-zA-Z0-9_\.]*)\s*\|\|\s*([^;]+)/g,
        replacement: function(match, left, right, fallback) {
          return left + ' = ' + right + ' ?? ' + fallback;
        }
      },
      // Fix conditional rendering in JSX
      {
        regex: /\{([a-zA-Z][a-zA-Z0-9_\.]*)\s+&&\s+([^}]+)\}/g,
        replacement: function(match, condition, result) {
          // Skip common boolean variables
          const skipConditions = ['isEnabled', 'isActive', 'isValid', 'showContent'];
          if (skipConditions.some(function(skip) { return condition.includes(skip); })) {
            return match;
          }
          return '{' + condition + ' !== undefined && ' + condition + ' !== null && ' + match.substring(condition.length + 1);
        }
      }
    ];
    
    let newContent = content;
    
    // Apply all patterns
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      newContent = newContent.replace(pattern.regex, pattern.replacement);
    }
    
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
    if (fixNullableChecks(files[i])) {
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
