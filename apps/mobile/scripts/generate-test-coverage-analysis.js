#!/usr/bin/env node
/**
 * Script to analyze test coverage across the mobile app
 * Identifies all source files and their functions/methods that need tests
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '../src');
const REPORT_DIR = path.join(__dirname, '../reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

/**
 * Get all source files recursively
 */
function getAllSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, test directories, and build outputs
      if (
        !file.includes('node_modules') &&
        !file.includes('__tests__') &&
        !file.includes('__fixtures__') &&
        !file.includes('coverage') &&
        !file.includes('dist') &&
        !file.includes('.expo')
      ) {
        getAllSourceFiles(filePath, fileList);
      }
    } else if (
      (file.endsWith('.ts') || file.endsWith('.tsx')) &&
      !file.endsWith('.test.ts') &&
      !file.endsWith('.test.tsx') &&
      !file.endsWith('.spec.ts') &&
      !file.endsWith('.spec.tsx') &&
      !file.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Extract functions and methods from a file
 */
function extractFunctions(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const functions = [];
    const relativePath = path.relative(SRC_DIR, filePath);

    // Match function declarations: export function, export const = function, class methods
    const functionPatterns = [
      // export function name() or function name()
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g,
      // export const name = () => {} or const name = () => {}
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?:=>|{|async)/g,
      // export const name = function() {}
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?function\s*\(/g,
      // class methods: methodName() or get methodName() or set methodName()
      /(?:public|private|protected|\s+)?(?:async\s+)?(?:get|set)?\s*(\w+)\s*\(/g,
      // Arrow functions assigned to exports
      /export\s+(?:default\s+)?\{[^}]*(\w+)\s*:\s*(?:\([^)]*\)\s*=>|async\s*\([^)]*\)\s*=>)/g,
    ];

    const lines = content.split('\n');
    const seenFunctions = new Set();

    functionPatterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const funcName = match[1];
        if (funcName && !seenFunctions.has(funcName) && funcName !== 'type' && funcName !==/<parameter>
</invoke>
