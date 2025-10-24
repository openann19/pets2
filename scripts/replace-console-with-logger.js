#!/usr/bin/env node

/**
 * Console to Logger Replacement Script
 * 
 * This script safely replaces console.log/error/warn/info/debug with logger calls,
 * preserving context and creating backups before making changes.
 * 
 * Usage: node replace-console-with-logger.js [options]
 * 
 * Options:
 *   --dry-run   Only show what changes would be made without actually modifying files
 *   --path      Specific path to process (default: apps/)
 *   --ext       File extensions to process (default: js,jsx,ts,tsx)
 *   --skip      Directories to skip (default: coverage,node_modules,dist,build,__tests__,tests)
 *   --no-backup Skip creating backup files
 *   --test-dir  Directory with test files to process instead of the whole project
 */

import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// ES Module polyfill for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    dryRun: args.includes('--dry-run'),
    path: getArgValue(args, '--path', 'apps/'),
    extensions: getArgValue(args, '--ext', 'js,jsx,ts,tsx').split(','),
    skipDirs: getArgValue(args, '--skip', 'coverage,node_modules,dist,build,__tests__,tests').split(','),
    backup: !args.includes('--no-backup'),
    testDir: getArgValue(args, '--test-dir', ''),
};

// Store statistics
const stats = {
    filesScanned: 0,
    filesModified: 0,
    replacements: {
        log: 0,
        error: 0,
        warn: 0,
        info: 0,
        debug: 0
    },
    skippedFiles: [],
    errorFiles: []
};

// List of patterns to ignore (e.g., logger implementations, test files with console mocks)
const ignorePatterns = [
    // Logger implementations
    /src\/.*logger\.ts$/i,
    /src\/.*logger\.js$/i,
    /utils\/logger\.[jt]sx?$/i,
    /services\/logger\.[jt]sx?$/i,
    // Test setup or mocks
    /setupTests\.js$/i,
    /jest\.setup\.[jt]s$/i,
    // Explicitly ignore files in coverage reports
    /coverage\//i,
    // Files that are explicitly designed to deal with console
    /console-polyfill/i,
    // Test utilities that may mock console
    /test-utils\.tsx$/i,
    /premium-test-utils\.tsx$/i,
];

// Regular expressions for finding console statements
const consolePatterns = [
    {
        type: 'log',
        // Match console.log statements with various argument patterns
        regex: /console\.log\(\s*(['"`].*?['"`])\s*(,\s*(.+?))?\s*\)/g,
        replacement: (match, message, optionalParams, params) => {
            if (params) {
                // If it's a simple object literal like { key: value }, convert to structured logging format
                if (params.trim().startsWith('{') && params.trim().endsWith('}')) {
                    return `logger.info(${message}, ${params})`;
                }
                return `logger.info(${message}, { ${params.startsWith('{') ? params.slice(1, -1) : params} })`;
            }
            return `logger.info(${message})`;
        }
    },
    {
        type: 'error',
        regex: /console\.error\(\s*(['"`].*?['"`])\s*(,\s*(.+?))?\s*\)/g,
        replacement: (match, message, optionalParams, params) => {
            if (params) {
                if (params === 'error' || params === 'err' || params.includes('error:')) {
                    return `logger.error(${message}, { error })`;
                }
                if (params.trim().startsWith('{') && params.trim().endsWith('}')) {
                    return `logger.error(${message}, ${params})`;
                }
                return `logger.error(${message}, { ${params.startsWith('{') ? params.slice(1, -1) : params} })`;
            }
            return `logger.error(${message})`;
        }
    },
    {
        type: 'warn',
        regex: /console\.warn\(\s*(['"`].*?['"`])\s*(,\s*(.+?))?\s*\)/g,
        replacement: (match, message, optionalParams, params) => {
            if (params) {
                if (params.trim().startsWith('{') && params.trim().endsWith('}')) {
                    return `logger.warn(${message}, ${params})`;
                }
                return `logger.warn(${message}, { ${params.startsWith('{') ? params.slice(1, -1) : params} })`;
            }
            return `logger.warn(${message})`;
        }
    },
    {
        type: 'info',
        regex: /console\.info\(\s*(['"`].*?['"`])\s*(,\s*(.+?))?\s*\)/g,
        replacement: (match, message, optionalParams, params) => {
            if (params) {
                if (params.trim().startsWith('{') && params.trim().endsWith('}')) {
                    return `logger.info(${message}, ${params})`;
                }
                return `logger.info(${message}, { ${params.startsWith('{') ? params.slice(1, -1) : params} })`;
            }
            return `logger.info(${message})`;
        }
    },
    {
        type: 'debug',
        regex: /console\.debug\(\s*(['"`].*?['"`])\s*(,\s*(.+?))?\s*\)/g,
        replacement: (match, message, optionalParams, params) => {
            if (params) {
                if (params.trim().startsWith('{') && params.trim().endsWith('}')) {
                    return `logger.debug(${message}, ${params})`;
                }
                return `logger.debug(${message}, { ${params.startsWith('{') ? params.slice(1, -1) : params} })`;
            }
            return `logger.debug(${message})`;
        }
    }
];

// Import statement regex
const importLoggerRegex = /import\s+{\s*logger\s*}.*?from\s+['"]@pawfectmatch\/core['"];?/;

// Main function
async function run() {
    console.log(`
=====================================================
🔄 Console to Logger Replacement Script
=====================================================
Mode: ${options.dryRun ? 'Dry Run (no changes will be made)' : 'Live Run'}
Path: ${options.path}
Extensions: ${options.extensions.join(', ')}
Skip Directories: ${options.skipDirs.join(', ')}
Create Backups: ${options.backup ? 'Yes' : 'No'}
=====================================================
  `);

    // Process files recursively
    processDirectory(getProcessDirectory());

    // Report stats
    console.log(`
=====================================================
📊 Results Summary
=====================================================
Files Scanned: ${stats.filesScanned}
Files Modified: ${stats.filesModified}
Replacements:
  - console.log → logger.info: ${stats.replacements.log}
  - console.error → logger.error: ${stats.replacements.error}
  - console.warn → logger.warn: ${stats.replacements.warn}
  - console.info → logger.info: ${stats.replacements.info}
  - console.debug → logger.debug: ${stats.replacements.debug}
Total Replacements: ${stats.replacements.log +
        stats.replacements.error +
        stats.replacements.warn +
        stats.replacements.info +
        stats.replacements.debug
        }
Skipped Files: ${stats.skippedFiles.length}
Files with Errors: ${stats.errorFiles.length}
=====================================================
  `);

    if (stats.skippedFiles.length > 0) {
        console.log('Skipped files:');
        stats.skippedFiles.forEach(file => console.log(`  - ${file}`));
    }

    if (stats.errorFiles.length > 0) {
        console.log('Files with errors:');
        stats.errorFiles.forEach(file => console.log(`  - ${file}`));
    }
}

// Process a directory recursively
function processDirectory(dirPath) {
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            // Skip directories in the skip list
            if (entry.isDirectory()) {
                if (!options.skipDirs.includes(entry.name)) {
                    processDirectory(fullPath);
                }
                continue;
            }

            // Process files with matching extensions
            const ext = path.extname(entry.name).slice(1);
            if (options.extensions.includes(ext)) {
                processFile(fullPath);
            }
        }
    } catch (err) {
        console.error(`Error processing directory ${dirPath}:`, err);
    }
}

// Process a single file
function processFile(filePath) {
    try {
        stats.filesScanned++;

        // Skip files matching ignore patterns
        if (ignorePatterns.some(pattern => pattern.test(filePath))) {
            stats.skippedFiles.push(filePath);
            return;
        }

        // Read file content
        const originalContent = fs.readFileSync(filePath, 'utf8');
        let newContent = originalContent;

        // Check if the file has any console statements
        const hasConsoleStatements = /console\.(log|error|warn|info|debug)/i.test(originalContent);

        if (!hasConsoleStatements) {
            return;
        }

        // Create backup before modification
        if (options.backup && !options.dryRun) {
            const backupPath = `${filePath}.backup-${Date.now()}`;
            fs.writeFileSync(backupPath, originalContent);
            console.log(`Created backup: ${backupPath}`);
        }

        // Check if the file already has logger imported
        const hasLoggerImport = importLoggerRegex.test(newContent);

        // Apply replacements
        let replacementsMade = false;
        for (const pattern of consolePatterns) {
            const originalNewContent = newContent;
            newContent = newContent.replace(pattern.regex, (...args) => {
                stats.replacements[pattern.type]++;
                replacementsMade = true;
                return pattern.replacement(...args);
            });

            if (originalNewContent !== newContent) {
                console.log(`- Replaced console.${pattern.type} in ${filePath}`);
            }
        }

        // Add logger import if needed
        if (replacementsMade && !hasLoggerImport) {
            // Find a good place to add the import
            const importMatch = newContent.match(/import\s+.*?from\s+['"](.*?)['"]/);
            if (importMatch) {
                const importStatement = 'import { logger } from \'@pawfectmatch/core\';\n';
                const importEndIndex = newContent.indexOf(importMatch[0]) + importMatch[0].length;
                newContent =
                    newContent.substring(0, importEndIndex) +
                    '\n' + importStatement +
                    newContent.substring(importEndIndex);
            } else {
                // No imports found, add at the top of the file
                newContent = 'import { logger } from \'@pawfectmatch/core\';\n\n' + newContent;
            }
            console.log(`- Added logger import to ${filePath}`);
        }

        // Write file if changes were made and not in dry-run mode
        if (replacementsMade && newContent !== originalContent) {
            if (!options.dryRun) {
                fs.writeFileSync(filePath, newContent);
                stats.filesModified++;
            } else {
                console.log(`[Dry Run] Would modify: ${filePath}`);
            }
        }
    } catch (err) {
        stats.errorFiles.push(filePath);
        console.error(`Error processing file ${filePath}:`, err);
    }
}

// Helper function to get argument value
function getArgValue(args, flag, defaultValue) {
    const index = args.indexOf(flag);
    if (index === -1) return defaultValue;
    return args[index + 1] || defaultValue;
}

// Determine which directory to process
function getProcessDirectory() {
    if (options.testDir) {
        const testDir = path.resolve(process.cwd(), options.testDir);
        console.log(`Processing test directory: ${testDir}`);
        return testDir;
    }
    return options.path;
}

// Run the script
run().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});