#!/usr/bin/env node

/**
 * Verify script to check if any errors were introduced after console-to-logger replacement
 * This script checks all modified files for syntax errors and runs tests if available
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    path: getArgValue(args, '--path', 'apps/'),
    backupDir: getArgValue(args, '--backup-dir', 'console-backup'),
    verbose: args.includes('--verbose'),
    runTests: args.includes('--run-tests'),
    revertBroken: args.includes('--revert-broken'),
};

console.log(`
=====================================================
🔍 Post-Replacement Verification Script
=====================================================
Path: ${options.path}
Backup Directory: ${options.backupDir}
Run Tests: ${options.runTests ? 'Yes' : 'No'}
Revert Broken Files: ${options.revertBroken ? 'Yes' : 'No'}
=====================================================
`);

// Track statistics
const stats = {
    filesChecked: 0,
    filesPassed: 0,
    filesWithErrors: [],
    filesReverted: 0,
    testsRun: 0,
    testsPassed: 0,
};

// Get list of modified files from backup directory
function getModifiedFiles() {
    const backupDirPath = path.resolve(process.cwd(), options.backupDir);
    if (!fs.existsSync(backupDirPath)) {
        console.error(`Backup directory not found: ${backupDirPath}`);
        return [];
    }

    const backupFiles = fs.readdirSync(backupDirPath).filter(file => file.includes('.backup-'));
    const modifiedFiles = [];

    for (const backupFile of backupFiles) {
        const originalFilename = backupFile.split('.backup-')[0];
        const originalFilePath = findOriginalFile(originalFilename);

        if (originalFilePath) {
            modifiedFiles.push({
                path: originalFilePath,
                backup: path.join(backupDirPath, backupFile),
            });
        }
    }

    return modifiedFiles;
}

// Find the original file in the workspace
function findOriginalFile(filename) {
    const searchDirs = ['apps', 'packages', 'libs', 'src'];

    for (const dir of searchDirs) {
        const results = findFilesRecursively(dir, filename);
        if (results.length > 0) {
            return results[0];
        }
    }

    return null;
}

// Find files recursively
function findFilesRecursively(dir, filename) {
    const results = [];

    function findRecursive(currentDir) {
        if (!fs.existsSync(currentDir)) return;

        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory() && !['node_modules', 'dist', 'build', 'coverage'].includes(entry.name)) {
                findRecursive(fullPath);
            } else if (entry.name === filename) {
                results.push(fullPath);
            }
        }
    }

    try {
        findRecursive(dir);
    } catch (err) {
        console.error(`Error searching directory ${dir}:`, err);
    }

    return results;
}

// Check JavaScript/TypeScript file for syntax errors
function checkSyntax(filePath) {
    try {
        if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
            // For JS files, try to require them
            try {
                // Simple syntax check without actually executing the code
                const content = fs.readFileSync(filePath, 'utf8');
                new Function(content);
                return true;
            } catch (err) {
                console.error(`Syntax error in ${filePath}:`, err.message);
                return false;
            }
        }

        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            // For TS files, use tsc to check syntax
            try {
                execSync(`npx tsc --noEmit --allowJs --jsx react ${filePath}`, { stdio: 'pipe' });
                return true;
            } catch (err) {
                console.error(`TypeScript error in ${filePath}:`, err.message);
                return false;
            }
        }

        return true; // Skip other file types
    } catch (err) {
        console.error(`Error checking syntax for ${filePath}:`, err);
        return false;
    }
}

// Revert a file to its backup version
function revertFile(filePath, backupPath) {
    try {
        const backupContent = fs.readFileSync(backupPath, 'utf8');
        fs.writeFileSync(filePath, backupContent);
        console.log(`Reverted ${filePath} to backup`);
        stats.filesReverted++;
        return true;
    } catch (err) {
        console.error(`Error reverting ${filePath}:`, err);
        return false;
    }
}

// Run tests related to a file if possible
function runTests(filePath) {
    // Find test file associated with the given file
    const filename = path.basename(filePath);
    const baseFilename = filename.replace(/\.[^.]+$/, '');
    const dirName = path.dirname(filePath);

    const possibleTestPaths = [
        path.join(dirName, '__tests__', `${baseFilename}.test.js`),
        path.join(dirName, '__tests__', `${baseFilename}.test.ts`),
        path.join(dirName, '__tests__', `${baseFilename}.test.tsx`),
        path.join(dirName, `${baseFilename}.test.js`),
        path.join(dirName, `${baseFilename}.test.ts`),
        path.join(dirName, `${baseFilename}.test.tsx`),
        path.join(dirName, `${baseFilename}.spec.js`),
        path.join(dirName, `${baseFilename}.spec.ts`),
        path.join(dirName, `${baseFilename}.spec.tsx`),
    ];

    for (const testPath of possibleTestPaths) {
        if (fs.existsSync(testPath)) {
            console.log(`Running tests for ${filePath}`);
            try {
                execSync(`npx jest ${testPath}`, { stdio: 'pipe' });
                console.log(`✅ Tests passed for ${filePath}`);
                stats.testsRun++;
                stats.testsPassed++;
                return true;
            } catch (err) {
                console.error(`❌ Tests failed for ${filePath}`);
                stats.testsRun++;
                return false;
            }
        }
    }

    return null; // No tests found
}

// Main verification function
function verifyFiles() {
    const modifiedFiles = getModifiedFiles();
    console.log(`Found ${modifiedFiles.length} modified files to verify.`);

    if (modifiedFiles.length === 0) {
        console.log('No modified files found. Please run the console-to-logger script first.');
        return;
    }

    for (const file of modifiedFiles) {
        stats.filesChecked++;
        console.log(`Checking ${file.path}...`);

        // Skip if file no longer exists
        if (!fs.existsSync(file.path)) {
            console.log(`File no longer exists: ${file.path}`);
            continue;
        }

        // Check for syntax errors
        const syntaxOk = checkSyntax(file.path);

        if (!syntaxOk) {
            stats.filesWithErrors.push(file.path);
            console.log(`❌ Syntax errors found in ${file.path}`);

            if (options.revertBroken) {
                revertFile(file.path, file.backup);
            }
            continue;
        }

        // Run tests if requested
        if (options.runTests) {
            const testResult = runTests(file.path);

            if (testResult === false) {
                stats.filesWithErrors.push(`${file.path} (tests failed)`);

                if (options.revertBroken) {
                    revertFile(file.path, file.backup);
                }
                continue;
            }
        }

        stats.filesPassed++;
        console.log(`✅ ${file.path} passed verification`);
    }

    // Report results
    console.log(`
=====================================================
📊 Verification Summary
=====================================================
Files Checked: ${stats.filesChecked}
Files Passed: ${stats.filesPassed}
Files with Errors: ${stats.filesWithErrors.length}
Files Reverted: ${stats.filesReverted}
Tests Run: ${stats.testsRun}
Tests Passed: ${stats.testsPassed}
=====================================================
  `);

    if (stats.filesWithErrors.length > 0) {
        console.log('Files with errors:');
        stats.filesWithErrors.forEach(file => console.log(`  - ${file}`));
    }
}

// Helper function to get argument value
function getArgValue(args, flag, defaultValue) {
    const index = args.indexOf(flag);
    if (index === -1) return defaultValue;
    return args[index + 1] || defaultValue;
}

// Run verification
verifyFiles();