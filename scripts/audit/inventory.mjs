#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const packages = ['apps/mobile', 'apps/web', 'apps/admin', 'packages/core', 'packages/ai', 'packages/ui', 'packages/design-tokens', 'packages/security', 'server'];

const inventory = {
  timestamp: new Date().toISOString(),
  packages: {},
  summary: {
    totalFiles: 0,
    totalLines: 0,
    languages: { ts: 0, tsx: 0, js: 0, jsx: 0, json: 0 },
    largestFiles: []
  }
};

function analyzeDirectory(dirPath, packageName) {
  const files = [];
  let lines = 0;
  
  function traverse(dir) {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git') && !item.includes('dist') && !item.includes('build')) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        const ext = item.split('.').pop();
        if (['ts', 'tsx', 'js', 'jsx', 'json'].includes(ext)) {
          const content = readFileSync(fullPath, 'utf8');
          const fileLines = content.split('\n').length;
          
          files.push({
            path: fullPath.replace(root + '/', ''),
            lines: fileLines,
            size: stat.size,
            ext
          });
          
          lines += fileLines;
          inventory.summary.languages[ext] = (inventory.summary.languages[ext] || 0) + 1;
          inventory.summary.totalFiles++;
          inventory.summary.totalLines += lines;
          
          if (fileLines > 500) {
            inventory.summary.largestFiles.push({
              path: fullPath.replace(root + '/', ''),
              lines: fileLines
            });
          }
        }
      }
    }
  }
  
  try {
    traverse(dirPath);
  } catch (error) {
    // Skip directories that don't exist
  }
  
  return { files, lines };
}

for (const pkg of packages) {
  const pkgPath = join(root, pkg);
  const analysis = analyzeDirectory(pkgPath, pkg);
  
  inventory.packages[pkg] = {
    files: analysis.files.length,
    lines: analysis.lines,
    files: analysis.files
  };
}

// Sort largest files by line count
inventory.summary.largestFiles.sort((a, b) => b.lines - a.lines);
inventory.summary.largestFiles = inventory.summary.largestFiles.slice(0, 20);

console.log(JSON.stringify(inventory, null, 2));
