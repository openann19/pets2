/**
 * Performance Audit Script
 * Agent: Performance Profiler (PP)
 * Purpose: Performance profiling and budget validation
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface PerformanceIssue {
  file: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium';
  recommendation: string;
}

async function runPerfAudit() {
  console.log('🔍 Running performance audit...');
  
  const srcPath = path.join(process.cwd(), 'src');
  const perfBudgetPath = path.join(process.cwd(), '../../reports/perf_budget.json');
  
  const issues: PerformanceIssue[] = [];
  
  // Check for performance anti-patterns
  const componentFiles = await glob('**/*.{tsx,jsx}', {
    cwd: srcPath,
    ignore: ['**/*.test.{tsx,jsx}', '**/__tests__/**']
  });
  
  for (const file of componentFiles) {
    const filePath = path.join(srcPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for useEffect without dependencies (potential memory leaks)
    const badUseEffectMatches = content.matchAll(/useEffect\s*\(\s*\(\)\s*=>\s*{[^}]*}\s*\)/g);
    for (const match of badUseEffectMatches) {
      const hasDeps = match[1] || '';
      if (!hasDeps.includes('[')) {
        issues.push({
          file,
          issue: 'useEffect without dependencies array',
          severity: 'critical',
          recommendation: 'Add dependency array to prevent memory leaks'
        });
      }
    }
    
    // Check for inline functions in JSX (causes unnecessary re-renders)
    const inlineFunctionMatches = content.matchAll(/onPress\s*=\s*{\s*\(\)\s*=>/g);
    if (inlineFunctionMatches.length > 5) {
      issues.push({
        file,
        issue: 'Multiple inline functions detected',
        severity: 'high',
        recommendation: 'Use useCallback to memoize event handlers'
      });
    }
    
    // Check for large components (potential performance issue)
    const lineCount = content.split('\n').length;
    if (lineCount > 500) {
      issues.push({
        file,
        issue: `Component is too large (${lineCount} lines)`,
        severity: 'medium',
        recommendation: 'Consider breaking into smaller components'
      });
    }
  }
  
  const report = {
    generated: new Date().toISOString(),
    agent: 'Performance Profiler (PP)',
    totalFiles: componentFiles.length,
    totalIssues: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    issues: issues,
    budget: fs.existsSync(perfBudgetPath) ? JSON.parse(fs.readFileSync(perfBudgetPath, 'utf-8')) : null
  };
  
  const reportPath = path.join(process.cwd(), '../../reports/perf_budget.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Performance audit complete: ${report.totalIssues} issues found`);
  console.log(`📊 Critical: ${report.critical}, High: ${report.high}`);
  console.log(`📁 Report saved to ${reportPath}`);
  
  return report;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerfAudit().catch(console.error);
}

export default runPerfAudit;

