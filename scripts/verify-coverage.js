#!/usr/bin/env node

/**
 * Coverage Verification Script
 * 
 * Verifies that coverage thresholds are met across all packages.
 * Reads coverage-summary.json files and enforces thresholds.
 */

const fs = require('fs');
const path = require('path');

const THRESHOLDS = {
  global: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
  core: {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  },
};

const COVERAGE_DIRS = [
  'apps/mobile/coverage',
  'apps/web/coverage',
  'server/coverage',
  'packages/core/coverage',
  'packages/ui/coverage',
  'packages/design-tokens/coverage',
];

function readCoverageSummary(coveragePath) {
  const summaryPath = path.join(coveragePath, 'coverage-summary.json');
  
  if (!fs.existsSync(summaryPath)) {
    console.warn(`⚠️  No coverage summary found at ${summaryPath}`);
    return null;
  }

  try {
    const data = fs.readFileSync(summaryPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Failed to read coverage summary: ${error.message}`);
    return null;
  }
}

function checkPackageCoverage(coverageDir, packageName) {
  const summary = readCoverageSummary(coverageDir);
  
  if (!summary) {
    return { passed: false, reason: 'No coverage data found' };
  }

  const totals = summary.total || {};
  const isCore = packageName === 'core' || packageName === 'ui';
  const threshold = isCore ? THRESHOLDS.core : THRESHOLDS.global;

  const checks = {};
  let passed = true;

  for (const [metric, required] of Object.entries(threshold)) {
    const actual = totals[metric]?.pct || 0;
    const check = actual >= required;
    
    checks[metric] = {
      required,
      actual,
      passed: check,
    };

    if (!check) {
      passed = false;
    }
  }

  return {
    package: packageName,
    passed,
    checks,
    totals,
  };
}

function main() {
  console.log('🔍 Verifying coverage thresholds...\n');

  const results = [];
  let allPassed = true;

  // Check each package
  for (const coverageDir of COVERAGE_DIRS) {
    if (!fs.existsSync(coverageDir)) {
      console.log(`⏭️  Skipping ${coverageDir} (not found)`);
      continue;
    }

    const packageName = path.basename(path.dirname(coverageDir));
    const result = checkPackageCoverage(coverageDir, packageName);
    results.push(result);

    if (!result.passed) {
      allPassed = false;
      console.error(`❌ ${result.package}: Coverage thresholds not met`);
      
      for (const [metric, check] of Object.entries(result.checks)) {
        const status = check.passed ? '✓' : '✗';
        const color = check.passed ? '\x1b[32m' : '\x1b[31m';
        console.log(
          `  ${color}${status}\x1b[0m ${metric}: ${check.actual.toFixed(2)}% (required: ${check.required}%)`
        );
      }
    } else {
      console.log(`✓ ${result.package}: All thresholds met`);
    }
  }

  // Generate summary report
  const reportPath = '_reports/COVERAGE_VERIFICATION.md';
  const reportLines = [
    '# Coverage Verification Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Results',
    '',
    '| Package | Status | Branches | Functions | Lines | Statements |',
    '|---------|--------|----------|-----------|-------|------------|',
  ];

  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    const checks = result.checks || {};
    
    reportLines.push(
      `| ${result.package} | ${status} | ` +
      `${(checks.branches?.actual || 0).toFixed(1)}% | ` +
      `${(checks.functions?.actual || 0).toFixed(1)}% | ` +
      `${(checks.lines?.actual || 0).toFixed(1)}% | ` +
      `${(checks.statements?.actual || 0).toFixed(1)}% |`
    );
  }

  fs.writeFileSync(reportPath, reportLines.join('\n'));
  console.log(`\n📊 Report saved to ${reportPath}`);

  if (allPassed) {
    console.log('\n✅ All coverage thresholds met!');
    return 0;
  } else {
    console.log('\n❌ Coverage verification failed!');
    return 1;
  }
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { checkPackageCoverage, THRESHOLDS };

