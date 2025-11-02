#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SERVER_SRC = path.resolve(__dirname, '..', 'src');

/**
 * Determine if a file already behaves like a module (has import/export or export {})
 */
function isModule(content) {
  return /\bimport\b/.test(content) || /\bexport\b/.test(content);
}

function hasExportEmpty(content) {
  return /^\s*export\s*{\s*};/m.test(content);
}

function shouldSkip(filePath) {
  const fileName = path.basename(filePath);
  if (fileName.endsWith('.d.ts')) return true;
  if (fileName === 'ensure-modules.js') return true;
  return false;
}

async function processFile(filePath) {
  if (shouldSkip(filePath)) return;
  const stat = await fs.promises.stat(filePath);
  if (stat.isDirectory()) {
    const entries = await fs.promises.readdir(filePath);
    await Promise.all(entries.map((entry) => processFile(path.join(filePath, entry))));
    return;
  }

  if (!filePath.endsWith('.ts')) return;

  const content = await fs.promises.readFile(filePath, 'utf8');
  if (isModule(content)) return;
  if (hasExportEmpty(content)) return;

  const updated = `export {};// Added to mark file as a module\n${content}`;
  await fs.promises.writeFile(filePath, updated, 'utf8');
  console.log(`Converted to module: ${path.relative(SERVER_SRC, filePath)}`);
}

(async () => {
  try {
    await processFile(SERVER_SRC);
    console.log('✅ Module boundary enforcement completed');
  } catch (error) {
    console.error('❌ Failed to enforce module boundaries', error);
    process.exitCode = 1;
  }
})();
