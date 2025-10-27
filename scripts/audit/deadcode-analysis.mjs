#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const findings = [];
const imports = new Map();
const exports = new Map();

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileName = filePath.replace(root + '/', '');
  
  // Track imports
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // ES6 imports
    const importMatch = line.match(/import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const namedImports = importMatch[1];
      const defaultImport = importMatch[2];
      const source = importMatch[3];
      
      if (namedImports) {
        const importsList = namedImports.split(',').map(s => s.trim());
        importsList.forEach(imp => {
          if (!imports.has(source)) imports.set(source, []);
          imports.get(source).push({ name: imp, file: fileName, line: lineNum });
        });
      }
      
      if (defaultImport) {
        if (!imports.has(source)) imports.set(source, []);
        imports.get(source).push({ name: defaultImport, file: fileName, line: lineNum, isDefault: true });
      }
    }
    
    // CommonJS require
    const requireMatch = line.match(/(?:const|let|var)\s+{([^}]+)}\s*=\s*require\(['"]([^'"]+)['"]\)/);
    if (requireMatch) {
      const namedImports = requireMatch[1].split(',').map(s => s.trim());
      const source = requireMatch[2];
      
      namedImports.forEach(imp => {
        if (!imports.has(source)) imports.set(source, []);
        imports.get(source).push({ name: imp, file: fileName, line: lineNum });
      });
    }
    
    // Track exports
    const exportMatch = line.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/);
    if (exportMatch) {
      const exportName = exportMatch[1];
      if (!exports.has(fileName)) exports.set(fileName, []);
      exports.get(fileName).push({ name: exportName, line: lineNum });
    }
    
    // Default export
    if (line.includes('export default')) {
      if (!exports.has(fileName)) exports.set(fileName, []);
      exports.get(fileName).push({ name: 'default', line: lineNum, isDefault: true });
    }
    
    // Named exports
    const namedExportMatch = line.match(/export\s*{([^}]+)}/);
    if (namedExportMatch) {
      const exportsList = namedExportMatch[1].split(',').map(s => s.trim());
      if (!exports.has(fileName)) exports.set(fileName, []);
      exportsList.forEach(exp => {
        exports.get(fileName).push({ name: exp, line: lineNum });
      });
    }
  });
}

function traverse(dir) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git') && !item.includes('dist') && !item.includes('build')) {
      traverse(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
      analyzeFile(fullPath);
    }
  }
}

// Analyze all directories
['apps/mobile/src', 'apps/web/src', 'packages/core/src', 'server/src'].forEach(dir => {
  try {
    traverse(join(root, dir));
  } catch (error) {
    // Skip if directory doesn't exist
  }
});

// Find unused exports
exports.forEach((exportList, file) => {
  exportList.forEach(exportItem => {
    const isUsed = Array.from(imports.values()).flat().some(imp => 
      imp.name === exportItem.name || 
      (exportItem.isDefault && imp.isDefault)
    );
    
    if (!isUsed && !file.includes('.test.') && !file.includes('.spec.')) {
      findings.push({
        id: `AUD-DEAD-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P3',
        category: 'DeadCode',
        file: file,
        line: exportItem.line,
        code: `export ${exportItem.name}`,
        problem: 'Unused export',
        evidence: `Export "${exportItem.name}" is not imported anywhere in the codebase`,
        fix: 'Remove unused export or add to suppression list if intentionally unused',
        autofix: {
          type: 'patch',
          snippet: `Remove export ${exportItem.name} from line ${exportItem.line}`
        },
        blast_radius: 'Minimal',
        confidence: 0.7,
        tags: ['unused-code', 'exports'],
        owner: file.includes('mobile') ? 'mobile' : file.includes('web') ? 'web' : file.includes('server') ? 'server' : 'core'
      });
    }
  });
});

// Check for TODO/FIXME comments
function findTodos(dir) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git') && !item.includes('dist') && !item.includes('build')) {
      findTodos(fullPath);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
      const content = readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        if (line.includes('TODO') || line.includes('FIXME')) {
          findings.push({
            id: `AUD-DEAD-${String(findings.length + 1).padStart(5, '0')}`,
            severity: 'P3',
            category: 'DeadCode',
            file: fullPath.replace(root + '/', ''),
            line: lineNum,
            code: line.trim(),
            problem: 'TODO or FIXME comment',
            evidence: 'Outstanding TODO/FIXME items indicate incomplete work',
            fix: 'Address the TODO/FIXME item or create a ticket',
            autofix: {
              type: 'manual',
              snippet: 'Resolve the TODO/FIXME or create a tracking ticket'
            },
            blast_radius: 'Minimal',
            confidence: 0.9,
            tags: ['todo', 'fixme', 'technical-debt'],
            owner: fullPath.includes('mobile') ? 'mobile' : fullPath.includes('web') ? 'web' : fullPath.includes('server') ? 'server' : 'core'
          });
        }
      });
    }
  }
}

findTodos(join(root, 'apps/mobile/src'));
findTodos(join(root, 'apps/web/src'));
findTodos(join(root, 'packages/core/src'));
findTodos(join(root, 'server/src'));

// Output findings as JSONL
findings.forEach(finding => {
  console.log(JSON.stringify(finding));
});
