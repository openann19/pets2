/**
 * Accessibility Audit Script
 * Agent: Accessibility Agent (A11Y)
 * Purpose: Automated accessibility audit
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface A11yIssue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  code?: string;
  fix?: string;
}

async function runA11yAudit() {
  console.log('🔍 Running accessibility audit...');
  
  const srcPath = path.join(process.cwd(), 'src');
  const componentFiles = await glob('**/*.{tsx,jsx}', {
    cwd: srcPath,
    ignore: ['**/*.test.{tsx,jsx}', '**/__tests__/**', '**/__mocks__/**']
  });
  
  const issues: A11yIssue[] = [];
  
  for (const file of componentFiles) {
    const filePath = path.join(srcPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Check for missing accessibility labels
    const touchableOpacityMatches = content.matchAll(/<TouchableOpacity([^>]*?)>/g);
    for (const match of touchableOpacityMatches) {
      const lineNum = content.substring(0, match.index).split('\n').length;
      const props = match[1];
      
      if (!props.includes('accessibilityLabel') && !props.includes('accessibilityRole')) {
        issues.push({
          file,
          line: lineNum,
          severity: 'critical',
          issue: 'Missing accessibilityLabel or accessibilityRole',
          code: match[0],
          fix: 'Add accessibilityLabel="..." or accessibilityRole="button"'
        });
      }
    }
    
    // Check for missing Text accessibility
    const textMatches = content.matchAll(/<Text([^>]*?)>/g);
    for (const match of textMatches) {
      const props = match[1];
      if (!props.includes('allowFontScaling')) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        issues.push({
          file,
          line: lineNum,
          severity: 'high',
          issue: 'Text component missing allowFontScaling',
          code: match[0],
          fix: 'Add allowFontScaling={true}'
        });
      }
    }
    
    // Check for Image accessibility
    const imageMatches = content.matchAll(/<Image([^>]*?)>/g);
    for (const match of imageMatches) {
      const props = match[1];
      if (!props.includes('accessibilityLabel')) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        issues.push({
          file,
          line: lineNum,
          severity: 'medium',
          issue: 'Image missing accessibilityLabel',
          code: match[0],
          fix: 'Add accessibilityLabel="..."'
        });
      }
    }
    
    // Check Modal accessibility
    const modalMatches = content.matchAll(/<Modal([^>]*?)>/g);
    for (const match of modalMatches) {
      const props = match[1];
      if (!props.includes('accessibilityViewIsModal')) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        issues.push({
          file,
          line: lineNum,
          severity: 'critical',
          issue: 'Modal missing accessibilityViewIsModal',
          code: match[0],
          fix: 'Add accessibilityViewIsModal={true}'
        });
      }
    }
  }
  
  const report = {
    generated: new Date().toISOString(),
    agent: 'Accessibility Agent (A11Y)',
    totalFiles: componentFiles.length,
    totalIssues: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
    issues: issues
  };
  
  const reportPath = path.join(process.cwd(), '../../reports/ACCESSIBILITY.md');
  
  // Update or create ACCESSIBILITY.md
  let reportContent = fs.existsSync(reportPath) 
    ? fs.readFileSync(reportPath, 'utf-8')
    : '# Accessibility Report\n\n**Auto-generated accessibility audit**\n\n';
  
  reportContent += `\n## Automated Audit Results\n`;
  reportContent += `- **Total Issues:** ${report.totalIssues}\n`;
  reportContent += `- **Critical:** ${report.critical}\n`;
  reportContent += `- **High:** ${report.high}\n`;
  reportContent += `- **Medium:** ${report.medium}\n\n`;
  
  if (issues.length > 0) {
    reportContent += `\n## Issues\n\n\`\`\`\n${JSON.stringify(issues, null, 2)}\n\`\`\`\n`;
  }
  
  fs.writeFileSync(reportPath, reportContent);
  
  console.log(`✅ Accessibility audit complete: ${report.totalIssues} issues found`);
  console.log(`📊 Critical: ${report.critical}, High: ${report.high}`);
  console.log(`📁 Report saved to ${reportPath}`);
  
  return report;
}

// Run if executed directly
if (require.main === module) {
  runA11yAudit().catch(console.error);
}

export default runA11yAudit;

