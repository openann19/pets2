#!/usr/bin/env node

/*
 * CI Gate Script - Check for Theme. references in actual code files
 * Exits with error code 1 if any Theme. references are found in .ts or .tsx files
 */

const { execSync } = require('child_process');
const path = require('path');

try {
  // Run grep to find Theme. references in all mobile source files (only .ts and .tsx files)
  const output = execSync('grep -r --include="*.ts" --include="*.tsx" "Theme\\." apps/mobile/src', {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8'
  });
  
  if (output.trim().length > 0) {
    console.error('❌ Found forbidden Theme references in code files:');
    console.error(output);
    process.exit(1);
  } else {
    console.log('✅ No Theme references found in code files');
    process.exit(0);
  }
} catch (error) {
  // grep returns exit code 1 when no matches are found, which is what we want
  if (error.status === 1) {
    console.log('✅ No Theme references found in code files');
    process.exit(0);
  } else {
    console.error('Error running theme check:', error.message);
    process.exit(1);
  }
}
