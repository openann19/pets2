#!/usr/bin/env node

// Import required modules
const fs = require('fs');
const path = require('path');

/**
 * Script to restore files from backups created by console-to-logger.cjs
 * 
 * Usage: node restore-backups.cjs [--backup-dir=directory] [--verbose]
 */

const args = process.argv.slice(2);
const options = {
    backupDir: getArgValue(args, '--backup-dir', 'console-backup'),
    verbose: args.includes('--verbose')
};

// Track statistics
const stats = {
    backupsFound: 0,
    filesRestored: 0,
    errors: []
};

// Main function
async function run() {
    console.log(`
=====================================================
🔄 Console to Logger Backup Restoration Script
=====================================================
Backup Directory: ${options.backupDir}
Verbose: ${options.verbose ? 'Yes' : 'No'}
=====================================================
  `);

    // Check if backup directory exists
    const backupDirPath = path.resolve(process.cwd(), options.backupDir);
    if (!fs.existsSync(backupDirPath)) {
        console.error(`Backup directory not found: ${backupDirPath}`);
        process.exit(1);
    }

    // Read all backup files
    const backupFiles = fs.readdirSync(backupDirPath).filter(file => file.includes('.backup-'));
    stats.backupsFound = backupFiles.length;

    if (stats.backupsFound === 0) {
        console.log('No backup files found.');
        process.exit(0);
    }

    console.log(`Found ${stats.backupsFound} backup files.`);

    // Process each backup file
    for (const backupFile of backupFiles) {
        try {
            // Extract original filename
            const originalFilename = backupFile.split('.backup-')[0];

            // Search for the original file in the workspace
            const workspaceDirs = ['apps', 'packages', 'libs'];
            let originalFilePath = null;

            for (const dir of workspaceDirs) {
                const results = findFilesRecursively(dir, originalFilename);
                if (results.length > 0) {
                    originalFilePath = results[0];
                    break;
                }
            }

            if (!originalFilePath) {
                console.warn(`Could not find original file for backup: ${backupFile}`);
                continue;
            }

            // Read backup content
            const backupContent = fs.readFileSync(path.join(backupDirPath, backupFile), 'utf8');

            // Restore the file
            fs.writeFileSync(originalFilePath, backupContent);
            stats.filesRestored++;

            if (options.verbose) {
                console.log(`Restored ${originalFilePath} from ${backupFile}`);
            }
        } catch (err) {
            stats.errors.push({ file: backupFile, error: err.message });
            console.error(`Error restoring backup ${backupFile}:`, err);
        }
    }

    // Report results
    console.log(`
=====================================================
📊 Restoration Summary
=====================================================
Backups Found: ${stats.backupsFound}
Files Restored: ${stats.filesRestored}
Errors: ${stats.errors.length}
=====================================================
  `);

    if (stats.errors.length > 0) {
        console.log('Files with errors:');
        stats.errors.forEach(({ file, error }) => console.log(`  - ${file}: ${error}`));
    }
}

// Find files recursively
function findFilesRecursively(dir, filename) {
    const results = [];

    function findRecursive(currentDir) {
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
        if (fs.existsSync(dir)) {
            findRecursive(dir);
        }
    } catch (err) {
        console.error(`Error searching directory ${dir}:`, err);
    }

    return results;
}

// Helper function to get argument value
function getArgValue(args, flag, defaultValue) {
    const index = args.indexOf(flag);
    if (index === -1) {
        // Check for --flag=value format
        const argWithValue = args.find(arg => arg.startsWith(`${flag}=`));
        if (argWithValue) {
            return argWithValue.split('=')[1];
        }
        return defaultValue;
    }
    return args[index + 1] || defaultValue;
}

// Run the script
run().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});