#!/usr/bin/env node
/**
 * Comprehensive test coverage analyzer
 * Identifies all functions, methods, and components that need tests
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');
const REPORT_DIR = path.join(__dirname, '../reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

/**
 * Get all source files recursively
 */
function getAllSourceFiles(dir, fileList = [], baseDir = dir) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (
        !file.includes('node_modules') &&
        !file.includes('__tests__') &&
        !file.includes('__fixtures__') &&
        !file.includes('coverage') &&
        !file.includes('dist')
      ) {
        getAllSourceFiles(filePath, fileList, baseDir);
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
