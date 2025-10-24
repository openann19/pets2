#!/usr/bin/env node

// Import required modules
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    dryRun: args.includes('--dry-run'),
    path: getArgValue(args, '--path', 'apps/'),
    extensions: getArgValue(args, '--ext', 'js,jsx,ts,tsx').split(','),
    skipDirs: getArgValue(args, '--skip', 'coverage,node_modules,dist,build,__tests__,tests,.next,out,vendor').split(','),
    backup: !args.includes('--no-backup'),
    backupDir: getArgValue(args, '--backup-dir', 'console-backup'),
    verbose: args.includes('--verbose'),
    countOnly: args.includes('--count-only'),
    safeMode: args.includes('--safe-mode'), // Enhanced safety checks
    batchSize: parseInt(getArgValue(args, '--batch-size', '50')), // Process in batches
    skipComplex: args.includes('--skip-complex'), // Skip complex console statements
    maxChangesPerFile: parseInt(getArgValue(args, '--max-changes', '20')), // Limit changes per file
    skipValidation: args.includes('--skip-validation') // Skip syntax validation completely
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
    // Generated files that shouldn't be modified
    /\.next\//i,
    /dist\//i,
    // Potentially risky files to modify
    /polyfill/i,
    /shim/i,
    /vendor/i,
];

// Regular expressions for finding console statements
const consolePatterns = [
    {
        type: 'log',
        regex: /console\.log\(\s*(['"`].*?['"`])\s*(,\s*(.+?))?\s*\)/g,
        replacement: (match, message, optionalParams, params) => {
            if (params) {
                if (params.trim().startsWith('{') && params.trim().endsWith('}')) {
                    return `logger.debug(${message}, ${params})`;
                }
                return `logger.debug(${message}, { ${params.startsWith('{') ? params.slice(1, -1) : params} })`;
            }
            return `logger.debug(${message})`;
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
Mode: ${options.dryRun ? 'Dry Run (no changes)' : 'Live (making changes)'}
Path: ${options.path}
Extensions: ${options.extensions.join(', ')}
Skip Directories: ${options.skipDirs.join(', ')}
Create Backups: ${options.backup ? 'Yes' : 'No'}
Count Only: ${options.countOnly ? 'Yes' : 'No'}
=====================================================
  `);

    // Create backup directory if needed
    if (options.backup && !options.dryRun) {
        const backupDirPath = path.resolve(process.cwd(), options.backupDir);
        if (!fs.existsSync(backupDirPath)) {
            fs.mkdirSync(backupDirPath, { recursive: true });
            console.log(`Created backup directory: ${backupDirPath}`);
        }
    }

    // Process files recursively
    processDirectory(options.path);

    // Report stats
    console.log(`
=====================================================
📊 Results Summary
=====================================================
Files Scanned: ${stats.filesScanned}
Files Modified: ${stats.filesModified}
Replacements:
  - console.log → logger.debug: ${stats.replacements.log}
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

    if (stats.skippedFiles.length > 0 && options.verbose) {
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

        // Check for potentially risky patterns that might break during replacement
        if (options.safeMode || options.skipComplex) {
            const riskyPatterns = [
                // Complex dynamic console usage
                /console\[(.*?)\]/,
                // Spread operators in console calls 
                /console\.(log|error|warn|info|debug)\(\s*\.\.\./,
                // Multi-line console statements
                /console\.(log|error|warn|info|debug)\(\s*[\r\n]/,
                // Dynamic method selection
                /console\[['"`].*?['"`]\]/,
                // Complex template literals that might break
                /console\.(log|error|warn|info|debug)\(\s*`.*?\$\{.*?\}.*?`/,
            ];

            if (riskyPatterns.some(pattern => pattern.test(originalContent))) {
                if (options.skipComplex) {
                    stats.skippedFiles.push(`${filePath} (complex console usage)`);
                    return;
                } else if (options.verbose) {
                    console.log(`⚠️ Warning: Complex console usage in ${filePath} - proceed with caution`);
                }
            }
        }

        if (options.countOnly) {
            // Just count occurrences
            for (const pattern of consolePatterns) {
                const matches = originalContent.match(new RegExp(pattern.regex.source, 'g')) || [];
                stats.replacements[pattern.type] += matches.length;
            }
            return;
        }

        // Count how many changes would be made
        let totalChangesInFile = 0;
        for (const pattern of consolePatterns) {
            const matches = originalContent.match(new RegExp(pattern.regex.source, 'g')) || [];
            totalChangesInFile += matches.length;
        }

        // Skip if too many changes in one file (potentially risky)
        if (options.maxChangesPerFile > 0 && totalChangesInFile > options.maxChangesPerFile) {
            stats.skippedFiles.push(`${filePath} (too many changes: ${totalChangesInFile})`);
            console.log(`⚠️ Skipping ${filePath} - too many changes (${totalChangesInFile}). Use --max-changes=0 to override.`);
            return;
        }

        // Create backup before modification
        if (options.backup && !options.dryRun) {
            const filename = path.basename(filePath);
            const backupPath = path.join(
                process.cwd(),
                options.backupDir,
                `${filename}.backup-${Date.now()}`
            );
            fs.writeFileSync(backupPath, originalContent);
            if (options.verbose) {
                console.log(`Created backup: ${backupPath}`);
            }
        }

        // Check if the file already has logger imported
        const hasLoggerImport = importLoggerRegex.test(newContent);

        // Apply replacements
        let replacementsMade = false;
        let changesInFile = 0;

        try {
            // Make a safe copy to validate changes later
            const preValidationContent = newContent;

            for (const pattern of consolePatterns) {
                const originalNewContent = newContent;

                try {
                    newContent = newContent.replace(pattern.regex, (...args) => {
                        try {
                            // Increment counters
                            stats.replacements[pattern.type]++;
                            replacementsMade = true;
                            changesInFile++;

                            // Apply the replacement
                            const result = pattern.replacement(...args);
                            return result;
                        } catch (replacementError) {
                            console.error(`Error in replacement function for ${filePath}:`, replacementError);
                            // Return original text if replacement fails
                            return args[0];
                        }
                    });
                } catch (replaceError) {
                    console.error(`Error during regex replace in ${filePath}:`, replaceError);
                    // Revert to original content for this pattern
                    newContent = originalNewContent;
                }

                if (originalNewContent !== newContent && options.verbose) {
                    console.log(`- Replaced console.${pattern.type} in ${filePath}`);
                }
            }

            // Perform syntax validation to ensure we didn't break the code
            if (replacementsMade && options.safeMode && !args.includes('--skip-validation')) {
                // Skip validation for TypeScript and modern ES module files which can't be validated by Function constructor
                const skipValidationForExtensions = ['.ts', '.tsx', '.mjs'];
                const shouldSkipValidation = skipValidationForExtensions.some(ext => filePath.endsWith(ext)) ||
                    newContent.includes('import ') || newContent.includes('export ');

                if (!shouldSkipValidation) {
                    try {
                        // Simple syntax validation - won't catch all issues but better than nothing
                        Function(newContent);
                    } catch (syntaxError) {
                        console.error(`⚠️ Syntax validation failed for ${filePath} - reverting changes:`, syntaxError.message);
                        newContent = preValidationContent;
                        replacementsMade = false;
                        stats.errorFiles.push(`${filePath} (syntax validation failed)`);
                    }
                } else if (options.verbose) {
                    console.log(`- Skipping syntax validation for ${filePath} (ES module or TypeScript file)`);
                }
            }
        } catch (error) {
            console.error(`Error applying replacements to ${filePath}:`, error);
            replacementsMade = false;
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
            if (options.verbose) {
                console.log(`- Added logger import to ${filePath}`);
            }
        }

        // Write file if changes were made and not in dry-run mode
        if (replacementsMade && newContent !== originalContent) {
            if (!options.dryRun) {
                try {
                    // Check if we can safely parse the file to validate it
                    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                        // For TypeScript files, don't attempt syntax validation (would require typescript parser)
                        if (options.verbose) {
                            console.log(`- TypeScript file: skipping syntax validation for ${filePath}`);
                        }
                    } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
                        try {
                            // Basic JS syntax validation - this won't catch all issues but can prevent obvious breaks
                            if (options.safeMode) {
                                Function(newContent);
                            }
                        } catch (syntaxError) {
                            console.error(`⚠️ JavaScript syntax validation failed for ${filePath} - skipping:`, syntaxError.message);
                            stats.errorFiles.push(`${filePath} (JS syntax validation failed)`);
                            return;
                        }
                    }

                    // Write the modified file
                    fs.writeFileSync(filePath, newContent);
                    stats.filesModified++;

                    if (options.verbose) {
                        console.log(`✅ Successfully modified ${filePath} (${changesInFile} changes)`);
                    }

                } catch (writeError) {
                    console.error(`Error writing file ${filePath}:`, writeError);
                    stats.errorFiles.push(filePath);
                }
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

// Add new help function
function showHelp() {
    console.log(`
=====================================================
🔄 Console to Logger Replacement Script - Help
=====================================================
Usage: node console-to-logger.cjs [options]

Options:
  --dry-run                Only show changes without making them
  --path=<directory>       Directory to process (default: apps/)
  --ext=<extensions>       Comma-separated file extensions (default: js,jsx,ts,tsx)
  --skip=<directories>     Directories to skip (default: coverage,node_modules,dist,build,__tests__,tests,.next,out,vendor)
  --no-backup              Skip creating backup files (NOT RECOMMENDED)
  --backup-dir=<dir>       Backup directory (default: console-backup)
  --verbose                Show detailed output
  --count-only             Just count console statements, don't make changes
  --safe-mode              Extra safety checks to prevent broken code
  --batch-size=<num>       Process in batches of specified size
  --skip-complex           Skip files with complex console usage
  --max-changes=<num>      Maximum changes per file (default: 20, use 0 for unlimited)
  --help                   Show this help message
  
Examples:
  # Dry run to see what would be changed
  node console-to-logger.cjs --dry-run
  
  # Process only specific directory with extra safety
  node console-to-logger.cjs --path=apps/web/src --safe-mode
  
  # Count console statements in the mobile app
  node console-to-logger.cjs --path=apps/mobile --count-only
  
  # Process in small batches with verbose logging
  node console-to-logger.cjs --batch-size=10 --verbose
=====================================================
`);
}

// Add safe batch processing function
async function processBatch(filePaths, batchSize) {
    if (batchSize <= 0) {
        // Process all files at once
        for (const filePath of filePaths) {
            processFile(filePath);
        }
        return;
    }

    // Process in batches
    console.log(`Processing files in batches of ${batchSize}...`);

    for (let i = 0; i < filePaths.length; i += batchSize) {
        const batch = filePaths.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(filePaths.length / batchSize)}...`);

        for (const filePath of batch) {
            processFile(filePath);
        }

        // Small delay between batches to allow system to catch up
        if (i + batchSize < filePaths.length) {
            console.log(`Batch complete. Pausing before next batch...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Collect all file paths before processing
function collectFilePaths(dirPath, filePaths = []) {
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                if (!options.skipDirs.includes(entry.name)) {
                    collectFilePaths(fullPath, filePaths);
                }
            } else {
                const ext = path.extname(entry.name).slice(1);
                if (options.extensions.includes(ext)) {
                    filePaths.push(fullPath);
                }
            }
        }
    } catch (err) {
        console.error(`Error collecting files from ${dirPath}:`, err);
    }

    return filePaths;
}

// Show help if requested
if (args.includes('--help')) {
    showHelp();
    process.exit(0);
}

// Override processDirectory if using batch processing
if (options.batchSize > 0 && !options.countOnly) {
    const originalProcessDirectory = processDirectory;
    processDirectory = function (dirPath) {
        console.log(`Collecting files from ${dirPath} for batch processing...`);
        const filePaths = collectFilePaths(dirPath);
        console.log(`Found ${filePaths.length} files to process.`);

        // Check if there's a lot of files
        if (filePaths.length > 100 && !options.dryRun) {
            console.log(`
⚠️  WARNING: You are about to process ${filePaths.length} files.
   This operation will make changes to your codebase.
   It is recommended to run with --dry-run first.
   
   Press Ctrl+C to cancel or Enter to continue...`);

            // Wait for user input
            require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            }).question('', () => {
                processBatch(filePaths, options.batchSize);
            });
        } else {
            processBatch(filePaths, options.batchSize);
        }
    };
}

// Run the script with error handling
try {
    run().catch(err => {
        console.error('Script failed:', err);
        process.exit(1);
    });
} catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
}