#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    testDir: args[0] || 'test-files'
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
    }
};

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
function run() {
    console.log('Starting console replacement in test directory:', options.testDir);

    // Process files in the test directory
    processDirectory(options.testDir);

    console.log('Finished with stats:', stats);
}

// Process a directory
function processDirectory(dirPath) {
    try {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                processDirectory(fullPath);
            } else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
                processFile(fullPath);
            }
        }
    } catch (err) {
        console.error('Error processing directory:', err);
    }
}

// Process a single file
function processFile(filePath) {
    console.log('Processing file:', filePath);
    try {
        stats.filesScanned++;

        // Read file content
        const originalContent = fs.readFileSync(filePath, 'utf8');
        let newContent = originalContent;

        // Check if the file has any console statements
        const hasConsoleStatements = /console\.(log|error|warn|info|debug)/i.test(originalContent);

        if (!hasConsoleStatements) {
            console.log('- No console statements found in', filePath);
            return;
        }

        // Create backup
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, originalContent);
        console.log(`- Created backup: ${backupPath}`);

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

        // Write file if changes were made
        if (replacementsMade && newContent !== originalContent) {
            fs.writeFileSync(filePath, newContent);
            stats.filesModified++;
            console.log(`- Modified: ${filePath}`);

            // Show a diff
            console.log('- Changes made:');
            const originalLines = originalContent.split('\n');
            const newLines = newContent.split('\n');

            for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
                if (originalLines[i] !== newLines[i]) {
                    console.log(`  Line ${i + 1}:`);
                    console.log(`    - ${originalLines[i] || ''}`);
                    console.log(`    + ${newLines[i] || ''}`);
                }
            }
        }
    } catch (err) {
        console.error(`Error processing file ${filePath}:`, err);
    }
}

// Run the script
run();