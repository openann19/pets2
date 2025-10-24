import { logger } from '@pawfectmatch/core';

/**
 * Modify all test files to use the callApi helper function
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function updateFile(filePath) {
    const content = await readFile(filePath, 'utf8');

    // Replace all fetch('/api/... calls with callApi('/api/...
    const updatedContent = content.replace(
        /fetch\('\/api\//g,
        "callApi('/api/"
    ).replace(
        /fetch\("\/api\//g,
        'callApi("/api/'
    ).replace(
        /fetch\(\`\/api\//g,
        "callApi(`/api/"
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