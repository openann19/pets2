#!/usr/bin/env node
/**
 * Generate a lightweight catalogue of functions/methods to help audit test coverage.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const REPORT_DIR = path.join(__dirname, '../reports');
const OUTPUT_PATH = path.join(REPORT_DIR, 'coverage/function-inventory.json');

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '__tests__',
  '__fixtures__',
  'coverage',
  'dist',
  '.expo',
  '.storybook',
  '.jest-cache',
]);

const SUPPORTED_EXTENSIONS = new Set(['.ts', '.tsx']);
const TEST_FILE_SUFFIXES = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];
const SKIP_FUNCTION_NAMES = new Set(['type', 'default']);

function ensureReportDir() {
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }
  const coverageDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
}

function isTestFile(fileName) {
  return TEST_FILE_SUFFIXES.some((suffix) => fileName.endsWith(suffix));
}

function collectSourceFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!SKIP_DIR_NAMES.has(entry.name)) {
        files.push(...collectSourceFiles(entryPath));
      }
      return;
    }

    const ext = path.extname(entry.name);
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      return;
    }

    if (isTestFile(entry.name) || entry.name.endsWith('.d.ts')) {
      return;
    }

    files.push(entryPath);
  });

  return files;
}

function getLineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function registerFunction({ functions, seen, name, line, kind }) {
  if (!name || SKIP_FUNCTION_NAMES.has(name) || seen.has(name)) {
    return;
  }
  seen.add(name);
  functions.push({ name, line, kind });
}

function extractFunctions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const seen = new Set();
  const functions = [];

  const patterns = [
    { kind: 'function-declaration', regex: /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g },
    { kind: 'const-arrow', regex: /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g },
    { kind: 'const-function', regex: /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function\s*\(/g },
  ];

  patterns.forEach(({ regex, kind }) => {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      const name = match[1];
      registerFunction({
        functions,
        seen,
        name,
        line: getLineNumber(content, match.index),
        kind,
      });
    }
  });

  const lines = content.split(/\r?\n/);
  const classStack = [];

  lines.forEach((line, index) => {
    const classMatch = line.match(/^(?:export\s+)?(?:abstract\s+)?class\s+\w+/);
    if (classMatch) {
      const open = (line.match(/\{/g) || []).length;
      const close = (line.match(/\}/g) || []).length;
      classStack.push(open - close);
      return;
    }

    if (classStack.length === 0) {
      return;
    }

    const methodMatch = line.match(/^\s*(?:public|protected|private)?\s*(?:async\s+)?(?:get|set)?\s*(\w+)\s*\(/);
    if (methodMatch) {
      registerFunction({
        functions,
        seen,
        name: methodMatch[1],
        line: index + 1,
        kind: 'class-method',
      });
    }

    const open = (line.match(/\{/g) || []).length;
    const close = (line.match(/\}/g) || []).length;
    const depthDelta = open - close;
    const currentDepth = classStack.pop();
    const newDepth = (currentDepth ?? 0) + depthDelta;
    if (newDepth > 0) {
      classStack.push(newDepth);
    }
  });

  return functions;
}

function createReport(entries) {
  const totalFunctions = entries.reduce((acc, entry) => acc + entry.functions.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    sourceRoot: SRC_DIR,
    totalFilesWithFunctions: entries.length,
    totalFunctions,
    files: entries,
  };
}

function main() {
  ensureReportDir();

  const files = collectSourceFiles(SRC_DIR);
  const entries = files
    .map((file) => ({
      file: path.relative(SRC_DIR, file),
      functions: extractFunctions(file),
    }))
    .filter((entry) => entry.functions.length > 0)
    .sort((a, b) => a.file.localeCompare(b.file));

  const report = createReport(entries);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

  const relativeOutput = path.relative(process.cwd(), OUTPUT_PATH);
  console.log(`Function inventory written to ${relativeOutput}`);
  console.log(`Analyzed ${files.length} source files (${report.totalFunctions} functions).`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('[coverage] Failed to generate function inventory');
    console.error(error);
    process.exitCode = 1;
  }
}
