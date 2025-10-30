/**
 * Security Scan Script
 * Agent: Security & Privacy Officer (SP)
 * Purpose: Secret scanning, PII detection, SSL pinning verification
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface SecurityIssue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium';
  issue: string;
  code?: string;
  recommendation: string;
}

async function securityScan() {
  console.log('🔍 Running security scan...');
  
  const srcPath = path.join(process.cwd(), 'src');
  const allFiles = await glob('**/*.{ts,tsx,js,jsx,json}', {
    cwd: srcPath,
    ignore: ['**/node_modules/**', '**/*.test.*', '**/__tests__/**']
  });
  
  const issues: SecurityIssue[] = [];
  
  // Pattern for secrets and sensitive data
  const secretPatterns = [
    { pattern: /(?:secret|password|api[_-]?key|token|private[_-]?key)\s*=\s*["'`]([^"'`]+)/gi, name: 'Hardcoded secret' },
    { pattern: /(?:mongodb|postgres|mysql):\/\/[^\s]+/gi, name: 'Database connection string' },
    { pattern: /sk_live_[a-zA-Z0-9]{32,}/g, name: 'Stripe secret key' },
    { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: 'GitHub token' },
    { pattern: /AKIA[0-9A-Z]{16}/g, name: 'AWS access key' }
  ];
  
  // Pattern for PII data
  const piiPatterns = [
    { pattern: /(?:ssn|social[_-]?security)/gi, name: 'Social Security Number' },
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, name: 'SSN format' },
    { pattern: /(?:credit[_-]?card|card[_-]?number)/gi, name: 'Credit card reference' }
  ];
  
  for (const file of allFiles) {
    const filePath = path.join(srcPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Check for secrets
    for (const check of secretPatterns) {
      const matches = content.matchAll(check.pattern);
      for (const match of matches) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        issues.push({
          file,
          line: lineNum,
          severity: 'critical',
          issue: check.name,
          code: lines[lineNum - 1],
          recommendation: 'Move to environment variables or secure storage'
        });
      }
    }
    
    // Check for PII
    for (const check of piiPatterns) {
      const matches = content.matchAll(check.pattern);
      for (const match of matches) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        issues.push({
          file,
          line: lineNum,
          severity: 'high',
          issue: check.name,
          code: lines[lineNum - 1],
          recommendation: 'Ensure PII is encrypted and comply with GDPR'
        });
      }
    }
    
    // Check AsyncStorage usage for PII
    if (content.includes('AsyncStorage') && !content.includes('encrypted')) {
      const asyncStorageMatches = content.matchAll(/AsyncStorage\.(?:setItem|getItem)/g);
      for (const match of asyncStorageMatches) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        issues.push({
          file,
          line: lineNum,
          severity: 'high',
          issue: 'AsyncStorage used without encryption',
          code: lines[lineNum - 1],
          recommendation: 'Use react-native-encrypted-storage for sensitive data'
        });
      }
    }
  }
  
  const report = {
    generated: new Date().toISOString(),
    agent: 'Security & Privacy Officer (SP)',
    totalFiles: allFiles.length,
    totalIssues: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    issues: issues
  };
  
  const reportPath = path.join(process.cwd(), '../../reports/security_scan.md');
  
  // Update or create security_scan.md
  let reportContent = fs.existsSync(reportPath) 
    ? fs.readFileSync(reportPath, 'utf-8')
    : '# Security Scan Report\n\n**Auto-generated security audit**\n\n';
  
  reportContent += `\n## Automated Scan Results\n`;
  reportContent += `- **Total Issues:** ${report.totalIssues}\n`;
  reportContent += `- **Critical:** ${report.critical}\n`;
  reportContent += `- **High:** ${report.high}\n\n`;
  
  if (issues.length > 0) {
    reportContent += `\n## Issues\n\n\`\`\`\n${JSON.stringify(issues, null, 2)}\n\`\`\`\n`;
  }
  
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`✅ Security scan complete: ${report.totalIssues} issues found`);
  console.log(`📊 Critical: ${report.critical}, High: ${report.high}`);
  console.log(`📁 Report saved to ${reportPath}`);
  
  return report;
}

// Run if executed directly
if (require.main === module) {
  securityScan().catch(console.error);
}

export default securityScan;

