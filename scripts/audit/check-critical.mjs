#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const summaryPath = join(root, 'reports/audit/summary.json');
const suppressionPath = join(root, '.auditignore.json');

if (!existsSync(summaryPath)) {
  console.error('❌ Audit summary not found. Run normalize.mjs first.');
  process.exit(1);
}

const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
let suppressions = {};

if (existsSync(suppressionPath)) {
  suppressions = JSON.parse(readFileSync(suppressionPath, 'utf8'));
}

// Check for critical findings that should never be suppressed
const neverSuppressPatterns = suppressions.exceptions?.neverSuppress || [];
const suppressionPatterns = suppressions.suppressions || [];
const criticalFindings = [];

// Read the detailed findings
const findingsPath = join(root, 'reports/audit/semantic_findings.jsonl');
if (existsSync(findingsPath)) {
  const findingsContent = readFileSync(findingsPath, 'utf8');
  const findings = findingsContent.trim().split('\n').map(line => JSON.parse(line));
  
  findings.forEach(finding => {
    if (finding.severity === 'P0') {
      // Check if this finding is suppressed
      const isSuppressed = suppressionPatterns.some(pattern => {
        if (pattern.pattern?.category && finding.category !== pattern.pattern.category) return false;
        if (pattern.pattern?.severity && !pattern.pattern.severity.includes(finding.severity)) return false;
        if (pattern.pattern?.problem && !finding.problem.includes(pattern.pattern.problem)) return false;
        if (pattern.pattern?.file) {
          const patternFile = pattern.pattern.file.replace('*', '.*');
          if (!new RegExp(patternFile).test(finding.file)) return false;
        }
        return true;
      });
      
      // Check if this finding should never be suppressed
      const shouldNeverSuppress = neverSuppressPatterns.some(pattern => {
        if (pattern.category && finding.category !== pattern.category) return false;
        if (pattern.severity && !pattern.severity.includes(finding.severity)) return false;
        if (pattern.problem && !finding.problem.includes(pattern.problem)) return false;
        return true;
      });
      
      if (shouldNeverSuppress && !isSuppressed) {
        criticalFindings.push(finding);
      }
    }
  });
}

// Check for new P0 findings beyond threshold
const p0Count = summary.by_severity.P0;
const p1Count = summary.by_severity.P1;

const P0_THRESHOLD = 250;
const P1_THRESHOLD = 150000;

let hasBlockingIssues = false;

console.log('🔍 Checking audit results against thresholds...');
console.log(`📊 Summary: ${summary.total_findings} total findings`);
console.log(`🚨 P0 (Critical): ${p0Count}`);
console.log(`⚠️  P1 (High): ${p1Count}`);

if (criticalFindings.length > 0) {
  console.error(`\n❌ BLOCKING: Found ${criticalFindings.length} unsuppressable critical issues:`);
  criticalFindings.forEach(finding => {
    console.error(`   ${finding.id}: ${finding.problem} (${finding.file}:${finding.line})`);
  });
  hasBlockingIssues = true;
}

if (p0Count > P0_THRESHOLD) {
  console.error(`\n❌ BLOCKING: P0 findings (${p0Count}) exceed threshold (${P0_THRESHOLD})`);
  hasBlockingIssues = true;
}

if (p1Count > P1_THRESHOLD) {
  console.error(`\n⚠️  WARNING: P1 findings (${p1Count}) exceed threshold (${P1_THRESHOLD})`);
  console.log('   This will not block the build but should be addressed.');
}

if (hasBlockingIssues) {
  console.error('\n❌ Audit failed - blocking issues found');
  console.error('Fix the critical issues or add them to .auditignore.json with proper justification');
  process.exit(1);
}

console.log('\n✅ Audit passed - no blocking issues found');
console.log(`📈 Quality score: ${((summary.total_findings - p0Count - p1Count) / summary.total_findings * 100).toFixed(1)}%`);

// Show top issues for visibility
if (summary.top_risks.length > 0) {
  console.log('\n🔥 Top issues to address:');
  summary.top_risks.slice(0, 5).forEach(risk => {
    console.log(`   ${risk.severity} ${risk.id}: ${risk.problem} (${risk.file}:${risk.line})`);
  });
}
