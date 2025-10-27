#!/usr/bin/env node

/**
 * Import Verification Script
 * Checks for common import issues in test files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const testFilesPattern = 'src/**/*.test.{ts,tsx}';

console.log('🔍 Verifying imports in test files...\n');

// Get all test files
const testFiles = execSync(`find src -name "*.test.ts*" -type f`)
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${testFiles.length} test files\n`);

const issues = {
  missingFiles: [],
  suspiciousImports: [],
  relativeImports: [],
};

// Check each test file
testFiles.forEach((testFile) => {
  const content = fs.readFileSync(testFile, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for import statements
    const importMatch = line.match(/import.*from\s+['"](.+)['"]/);
    if (!importMatch) return;

    const importPath = importMatch[1];
    const lineNumber = index + 1;

    // Check for relative imports (could use absolute)
    if (importPath.startsWith('../')) {
      issues.relativeImports.push({
        file: testFile,
        line: lineNumber,
        import: importPath,
      });
    }

    // Check if imported file exists
    if (importPath.startsWith('.')) {
      const baseDir = path.dirname(testFile);
      let resolvedPath = path.resolve(baseDir, importPath);

      // Try different extensions
      const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
      let found = false;

      for (const ext of extensions) {
        const testPath = resolvedPath + ext;
        if (fs.existsSync(testPath)) {
          found = true;
          break;
        }
      }

      // Also check for index files
      if (!found) {
        const indexPath = path.join(resolvedPath, 'index.ts');
        if (fs.existsSync(indexPath)) {
          found = true;
        }
      }

      if (!found) {
        issues.missingFiles.push({
          file: testFile,
          line: lineNumber,
          import: importPath,
          resolvedPath,
        });
      }
    }

    // Check for common problematic imports
    const problematicPatterns = [
      '@pawfectmatch/mobile', // Should use relative paths
      '../../../', // Too many levels
    ];

    problematicPatterns.forEach((pattern) => {
      if (importPath.includes(pattern)) {
        issues.suspiciousImports.push({
          file: testFile,
          line: lineNumber,
          import: importPath,
          reason: `Contains suspicious pattern: ${pattern}`,
        });
      }
    });
  });
});

// Report findings
console.log('📊 Results:\n');

if (issues.missingFiles.length > 0) {
  console.log(`❌ Missing Files (${issues.missingFiles.length}):`);
  issues.missingFiles.slice(0, 10).forEach((issue) => {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    Import: ${issue.import}`);
    console.log(`    Resolved: ${issue.resolvedPath}`);
  });
  if (issues.missingFiles.length > 10) {
    console.log(`  ... and ${issues.missingFiles.length - 10} more\n`);
  }
  console.log('');
}

if (issues.suspiciousImports.length > 0) {
  console.log(`⚠️  Suspicious Imports (${issues.suspiciousImports.length}):`);
  issues.suspiciousImports.slice(0, 10).forEach((issue) => {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    ${issue.import} - ${issue.reason}`);
  });
  if (issues.suspiciousImports.length > 10) {
    console.log(`  ... and ${issues.suspiciousImports.length - 10} more\n`);
  }
  console.log('');
}

if (issues.relativeImports.length > 0) {
  console.log(`ℹ️  Relative Imports (${issues.relativeImports.length}):`);
  console.log(`  (These could potentially use absolute imports)\n`);
}

// Summary
const totalIssues = issues.missingFiles.length + issues.suspiciousImports.length;

if (totalIssues === 0) {
  console.log('✅ No critical import issues found!\n');
} else {
  console.log(`Found ${totalIssues} import issues that need attention\n`);
  process.exit(1);
}
