import { logger } from '@pawfectmatch/core';

/**
 * Update MSW handlers in test files to use absolute URLs
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function updateFile(filePath) {
    const content = await readFile(filePath, 'utf8');

    // Replace all MSW handler URLs with absolute URLs
    const updatedContent = content.replace(
        /rest\.get\('\/api\//g,
        "rest.get('http://localhost:3000/api/"
    ).replace(
        /rest\.post\('\/api\//g,
        "rest.post('http://localhost:3000/api/"
    ).replace(
        /rest\.get\("\/api\//g,
        'rest.get("http://localhost:3000/api/'
    ).replace(
        /rest\.post\("\/api\//g,
        'rest.post("http://localhost:3000/api/'
    );

    await writeFile(filePath, updatedContent);
    logger.info(`Updated: ${filePath}`);
}

async function main() {
    const testDir = path.join(__dirname, '../__tests__/api');
    const testFiles = [
        path.join(testDir, 'status.test.js'),
        path.join(testDir, 'delete.test.js'),
        path.join(testDir, 'cancel-deletion.test.js'),
        path.join(testDir, 'export-data.test.js'),
        path.join(testDir, 'export-download.test.js')
    ];

    for (const file of testFiles) {
        await updateFile(file);
    }
}

main().catch(console.error);