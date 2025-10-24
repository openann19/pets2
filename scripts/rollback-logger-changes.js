#!/usr/bin/env node

/**
 * Rollback Script for Console to Logger Replacements
 * 
 * This script helps you rollback changes made by replace-console-with-logger.js
 * by restoring files from backups.
 * 
 * Usage: node rollback-logger-changes.js [options]
 * 
 * Options:
 *   --path      Path to search for backups (default: apps/)
 *   --dry-run   List backups without restoring
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    dryRun: args.includes('--dry-run'),
    path: getArgValue(args, '--path', 'apps/')
};

// Store statistics
const stats = {
    backupsFound: 0,
    filesRestored: 0,
    backupsRemoved: 0,
    errorFiles: []
};

// Main function
async function run() {
    console.log(`
=====================================================
🔄 Rollback Console to Logger Changes
=====================================================
Mode: ${options.dryRun ? 'Dry Run (no changes will be made)' : 'Live Run'}
Path: ${options.path}
=====================================================
  `);

    // Process files recursively
    processDirectory(options.path);

    // Report stats
    console.log(`
=====================================================
📊 Rollback Results
=====================================================
Backups Found: ${stats.backupsFound}
Files Restored: ${stats.filesRestored}
Backups Removed: ${stats.backupsRemoved}
Files with Errors: ${stats.errorFiles.length}
=====================================================
  `);

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

            if (entry.isDirectory()) {
                processDirectory(fullPath);
                continue;
            }

            // Find backup files (created by replace-console-with-logger.js)
            if (entry.name.match(/\.backup-\d+$/)) {
                stats.backupsFound++;
                processBackup(fullPath);
            }
        }
    } catch (err) {
        console.error(`Error processing directory ${dirPath}:`, err);
    }
}

// Process a backup file
function processBackup(backupPath) {
    try {
        // Get original file path by removing backup suffix
        const originalPath = backupPath.replace(/\.backup-\d+$/, '');

        console.log(`Found backup: ${backupPath} for ${originalPath}`);

        if (!options.dryRun) {
            // Restore the original file from backup
            fs.copyFileSync(backupPath, originalPath);
            console.log(`✅ Restored ${originalPath}`);
            stats.filesRestored++;

            // Remove the backup file
            fs.unlinkSync(backupPath);
            console.log(`🗑️ Removed backup ${backupPath}`);
            stats.backupsRemoved++;
        }
    } catch (err) {
        stats.errorFiles.push(backupPath);
        console.error(`Error processing backup ${backupPath}:`, err);
    }
}

// Helper function to get argument value
function getArgValue(args, flag, defaultValue) {
    const index = args.indexOf(flag);
    if (index === -1) return defaultValue;
    return args[index + 1] || defaultValue;
}

// Run the script
run().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});