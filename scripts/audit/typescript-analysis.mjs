#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const findings = [];

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for explicit 'any' types
    if (line.includes(': any') || line.includes('as any') || line.includes('<any>')) {
      findings.push({
        id: `AUD-TYP-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Type',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Explicit any type usage',
        evidence: 'any types defeat TypeScript type safety and should be replaced with proper types',
        fix: 'Replace any with specific TypeScript type or interface',
        autofix: {
          type: 'manual',
          snippet: 'Replace : any with proper type like : string, : number, or custom interface'
        },
        blast_radius: 'Local',
        confidence: 0.9,
        tags: ['typescript', 'type-safety'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : filePath.includes('server') ? 'server' : 'core'
      });
    }
    
    // Check for @ts-ignore or @ts-expect-error
    if (line.includes('@ts-ignore') || line.includes('@ts-expect-error')) {
      findings.push({
        id: `AUD-TYP-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Type',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'TypeScript suppression comment',
        evidence: 'TypeScript suppressions hide type errors and should be avoided',
        fix: 'Fix the underlying type issue instead of suppressing it',
        autofix: {
          type: 'manual',
          snippet: 'Remove suppression and fix the type error'
        },
        blast_radius: 'Local',
        confidence: 0.8,
        tags: ['typescript', 'suppression'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : filePath.includes('server') ? 'server' : 'core'
      });
    }
    
    // Check for unawaited promises
    if (line.includes('await') === false && 
        (line.includes('.then(') || line.includes('.catch(')) && 
        !line.includes('return ') && 
        !line.includes('const ') && 
        !line.includes('let ') && 
        !line.includes('var ')) {
      findings.push({
        id: `AUD-TYP-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P1',
        category: 'Type',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Unawaited promise or floating .then()',
        evidence: 'Unawaited promises can cause unhandled rejections and race conditions',
        fix: 'Add await or proper error handling with try/catch',
        autofix: {
          type: 'manual',
          snippet: 'Add await before the promise call or use proper async/await pattern'
        },
        blast_radius: 'Local',
        confidence: 0.7,
        tags: ['async', 'promises', 'error-handling'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : filePath.includes('server') ? 'server' : 'core'
      });
    }
    
    // Check for console.log in production code
    if (line.includes('console.log') && !line.includes('//') && !line.includes('/*')) {
      findings.push({
        id: `AUD-TYP-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P3',
        category: 'Type',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Console.log in production code',
        evidence: 'Console logs should be removed or replaced with proper logging',
        fix: 'Replace with proper logger or remove for production',
        autofix: {
          type: 'manual',
          snippet: 'Replace console.log with logger.log or remove'
        },
        blast_radius: 'Local',
        confidence: 0.6,
        tags: ['logging', 'production'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : filePath.includes('server') ? 'server' : 'core'
      });
    }
    
    // Check for unsafe type assertions
    if (line.includes('as ') && !line.includes('as const') && !line.includes('as unknown')) {
      findings.push({
        id: `AUD-TYP-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Type',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Unsafe type assertion',
        evidence: 'Type assertions can bypass type safety checks',
        fix: 'Use type guards or proper type checking instead of assertions',
        autofix: {
          type: 'manual',
          snippet: 'Replace "as Type" with proper type guard or runtime check'
        },
        blast_radius: 'Local',
        confidence: 0.7,
        tags: ['typescript', 'type-assertion'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : filePath.includes('server') ? 'server' : 'core'
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
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      analyzeFile(fullPath);
    }
  }
}

// Analyze all TypeScript directories
['apps/mobile/src', 'apps/web/src', 'packages/core/src', 'server/src'].forEach(dir => {
  try {
    traverse(join(root, dir));
  } catch (error) {
    // Skip if directory doesn't exist
  }
});

// Output findings as JSONL
findings.forEach(finding => {
  console.log(JSON.stringify(finding));
});
