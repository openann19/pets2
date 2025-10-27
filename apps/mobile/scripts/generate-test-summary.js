#!/usr/bin/env node

/**
 * Generate TEST_RUN_SUMMARY.md from test results
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports');
const JEST_RESULTS = path.join(REPORTS_DIR, 'jest-results.xml');
const COVERAGE_DIR = path.join(__dirname, '../coverage');
const PERF_RESULTS = path.join(REPORTS_DIR, 'PERF_RESULTS.json');
const SECURITY_REPORT = path.join(REPORTS_DIR, 'SECURITY_REPORT.md');

const summaryPath = path.join(REPORTS_DIR, 'TEST_RUN_SUMMARY.md');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function getCoverageStats() {
  const coveragePath = path.join(COVERAGE_DIR, 'coverage-summary.json');
  const coverageJson = readFile(coveragePath);
  
  if (!coverageJson) {
    return null;
  }
  
  try {
    const coverage = JSON.parse(coverageJson);
    return {
      lines: coverage.total.lines.pct,
      branches: coverage.total.branches.pct,
      functions: coverage.total.functions.pct,
      statements: coverage.total.statements.pct,
    };
  } catch (error) {
    return null;
  }
}

function getPerfMetrics() {
  const perfJson = readFile(PERF_RESULTS);
  if (!perfJson) {
    return null;
  }
  
  try {
    const metrics = JSON.parse(perfJson);
    return {
      bundleSize: metrics.bundleSize ? `${(metrics.bundleSize / 1024 / 1024).toFixed(2)}MB` : 'N/A',
      coldStart: metrics.coldStart ? `${metrics.coldStart}ms` : 'N/A',
      tti: metrics.tti ? `${metrics.tti}ms` : 'N/A',
    };
  } catch (error) {
    return null;
  }
}

function generateSummary() {
  const coverage = getCoverageStats();
  const perf = getPerfMetrics();
  const securityReport = readFile(SECURITY_REPORT);
  
  const hasSecurityIssues = securityReport && securityReport.includes('❌');
  
  let summary = `# Test Run Summary

**Date:** ${new Date().toISOString()}
**Status:** ${hasSecurityIssues ? '❌ FAILED' : '✅ PASSED'}

## Test Results

`;
  
  if (coverage) {
    summary += `### Coverage

- **Lines:** ${coverage.lines}%
- **Branches:** ${coverage.branches}%
- **Functions:** ${coverage.functions}%
- **Statements:** ${coverage.statements}%

`;
  }
  
  if (perf) {
    summary += `### Performance

- **Bundle Size:** ${perf.bundleSize}
- **Cold Start:** ${perf.coldStart}
- **TTI:** ${perf.tti}

`;
  }
  
  summary += `### Security

${securityReport ? '✅ Security scan completed - see SECURITY_REPORT.md' : '⚠️  Security scan not run'}

## Device Matrix

| Device | OS | Status |
|--------|----|---------|
| iPhone 15 Simulator | iOS 17 | TODO |
| Pixel 6 Emulator | Android 13 | TODO |

## Known Issues

${hasSecurityIssues ? securityReport.split('## Summary')[0] : 'None'}

## Next Steps

- [ ] Run full E2E suite on device matrix
- [ ] Generate PERF_BASELINE.json from production metrics
- [ ] Complete accessibility audit
- [ ] Validate contracts with backend
`;
  
  fs.writeFileSync(summaryPath, summary);
  console.log('✅ Test summary generated:', summaryPath);
}

generateSummary();

