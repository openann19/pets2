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
    
    // Check for large imports on critical path
    if (line.includes('import') && line.includes('from') && 
        (line.includes('lodash') || line.includes('moment') || line.includes('date-fns'))) {
      findings.push({
        id: `AUD-PERF-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Performance',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Large library import on critical path',
        evidence: 'Large libraries increase bundle size and slow initial load',
        fix: 'Use dynamic imports or tree-shaking for large libraries',
        autofix: {
          type: 'codemod',
          snippet: 'Replace with dynamic import: const library = await import("library");'
        },
        blast_radius: 'Module',
        confidence: 0.7,
        tags: ['bundle-size', 'dynamic-imports'],
        owner: filePath.includes('mobile') ? 'mobile' : filePath.includes('web') ? 'web' : 'core'
      });
    }
    
    // Check for missing React.memo in components with props
    if (content.includes('props') && content.includes('return') && 
        !content.includes('React.memo') && !content.includes('memo(') &&
        filePath.endsWith('.tsx') && !filePath.includes('.test.')) {
      findings.push({
        id: `AUD-PERF-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Performance',
        file: filePath.replace(root + '/', ''),
        line: 1,
        code: 'Component without React.memo',
        problem: 'Component with props missing React.memo optimization',
        evidence: 'Components without memo can re-render unnecessarily',
        fix: 'Wrap component export in React.memo()',
        autofix: {
          type: 'codemod',
          snippet: 'export default React.memo(ComponentName);'
        },
        blast_radius: 'Local',
        confidence: 0.6,
        tags: ['react', 'memoization', 'rendering'],
        owner: filePath.includes('mobile') ? 'mobile' : 'web'
      });
    }
    
    // Check for images without optimization in Next.js
    if (line.includes('<img') && !line.includes('next/image') && filePath.includes('apps/web')) {
      findings.push({
        id: `AUD-PERF-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Performance',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Using regular img tag instead of next/image',
        evidence: 'next/image provides optimization, lazy loading, and better performance',
        fix: 'Replace <img> with <Image> from next/image',
        autofix: {
          type: 'codemod',
          snippet: 'Replace <img> with <Image> from next/image and add width/height props'
        },
        blast_radius: 'Local',
        confidence: 0.8,
        tags: ['next.js', 'image-optimization'],
        owner: 'web'
      });
    }
    
    // Check for missing useCallback in functions with dependencies
    if (line.includes('useCallback') === false && 
        line.includes('function') && 
        content.includes('useEffect') && 
        content.includes('[') && content.includes(']')) {
      findings.push({
        id: `AUD-PERF-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Performance',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Function in useEffect without useCallback',
        evidence: 'Functions without useCallback can cause infinite re-renders',
        fix: 'Wrap function in useCallback with proper dependencies',
        autofix: {
          type: 'manual',
          snippet: 'Wrap function in useCallback(() => { ... }, [dependencies])'
        },
        blast_radius: 'Local',
        confidence: 0.6,
        tags: ['react', 'usecallback', 'performance'],
        owner: filePath.includes('mobile') ? 'mobile' : 'web'
      });
    }
    
    // Check for synchronous operations that could be async
    if ((line.includes('JSON.parse') || line.includes('JSON.stringify')) && 
        line.includes('large') === false && 
        content.includes('await') === false) {
      findings.push({
        id: `AUD-PERF-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P3',
        category: 'Performance',
        file: filePath.replace(root + '/', ''),
        line: lineNum,
        code: line.trim(),
        problem: 'Synchronous JSON operations on main thread',
        evidence: 'Large JSON operations can block the main thread',
        fix: 'Consider Web Workers or async JSON parsing for large data',
        autofix: {
          type: 'manual',
          snippet: 'Use async JSON parsing or Web Workers for large data'
        },
        blast_radius: 'Local',
        confidence: 0.5,
        tags: ['json', 'main-thread', 'performance'],
        owner: filePath.includes('mobile') ? 'mobile' : 'web'
      });
    }
    
    // Check for missing loading states
    if (content.includes('fetch(') && !content.includes('loading') && !content.includes('isLoading')) {
      findings.push({
        id: `AUD-PERF-${String(findings.length + 1).padStart(5, '0')}`,
        severity: 'P2',
        category: 'Performance',
        file: filePath.replace(root + '/', ''),
        line: 1,
        code: 'Fetch without loading state',
        problem: 'Async operation without loading state',
        evidence: 'Users need feedback during async operations',
        fix: 'Add loading state management for async operations',
        autofix: {
          type: 'manual',
          snippet: 'Add const [isLoading, setIsLoading] = useState(false); and manage during fetch'
        },
        blast_radius: 'Local',
        confidence: 0.7,
        tags: ['ux', 'loading-states', 'async'],
        owner: filePath.includes('mobile') ? 'mobile' : 'web'
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

// Analyze mobile and web directories
['apps/mobile/src', 'apps/web/src'].forEach(dir => {
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
