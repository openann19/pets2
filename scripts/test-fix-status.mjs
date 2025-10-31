#!/usr/bin/env node
/**
 * Track test fix progress and generate status report
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'node:child_process';

const REPORTS_DIR = 'reports';
const STATUS_FILE = join(REPORTS_DIR, 'test-fix-status.json');
const PROGRESS_FILE = join(REPORTS_DIR, 'TEST_FIX_PROGRESS.md');

function getTestStats() {
  const result = spawnSync('pnpm', ['test:unit', '--json', '--no-coverage'], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });

  if (result.status !== 0 && !existsSync('coverage/jest-results.json')) {
    return null;
  }

  try {
    const data = JSON.parse(readFileSync('coverage/jest-results.json', 'utf8'));
    return {
      numPassedTestSuites: data.numPassedTestSuites || 0,
      numFailedTestSuites: data.numFailedTestSuites || 0,
      numPassedTests: data.numPassedTests || 0,
      numFailedTests: data.numFailedTests || 0,
      totalTests: (data.numPassedTests || 0) + (data.numFailedTests || 0),
    };
  } catch {
    return null;
  }
}

function generateReport(stats, previousStats) {
  if (!stats) {
    return '❌ Unable to collect test statistics';
  }

  const progress = previousStats ? {
    suitesImproved: previousStats.numFailedTestSuites - stats.numFailedTestSuites,
    testsImproved: previousStats.numFailedTests - stats.numFailedTests,
  } : null;

  const coverage = stats.totalTests > 0
    ? ((stats.numPassedTests / stats.totalTests) * 100).toFixed(1)
    : '0.0';

  let report = `# Test Fix Progress Report\n\n`;
  report += `**Last Updated:** ${new Date().toISOString()}\n\n`;
  report += `## Current Status\n\n`;
  report += `| Metric | Current | Target | Status |\n`;
  report += `|--------|---------|--------|--------|\n`;
  report += `| Test Suites Passing | ${stats.numPassedTestSuites} | ${stats.numPassedTestSuites + stats.numFailedTestSuites} | ${stats.numFailedTestSuites === 0 ? '✅' : '⚠️'} |\n`;
  report += `| Test Suites Failing | ${stats.numFailedTestSuites} | 0 | ${stats.numFailedTestSuites === 0 ? '✅' : '❌'} |\n`;
  report += `| Tests Passing | ${stats.numPassedTests} | - | ✅ |\n`;
  report += `| Tests Failing | ${stats.numFailedTests} | 0 | ${stats.numFailedTests === 0 ? '✅' : '❌'} |\n`;
  report += `| Pass Rate | ${coverage}% | ≥90% | ${parseFloat(coverage) >= 90 ? '✅' : '⚠️'} |\n\n`;

  if (progress) {
    report += `## Progress Since Last Check\n\n`;
    report += `- Test Suites Fixed: ${progress.suitesImproved > 0 ? '+' : ''}${progress.suitesImproved}\n`;
    report += `- Tests Fixed: ${progress.testsImproved > 0 ? '+' : ''}${progress.testsImproved}\n\n`;
  }

  report += `## Next Steps\n\n`;
  if (stats.numFailedTestSuites > 0) {
    report += `1. Run \`node scripts/analyze-test-failures.mjs\` to categorize failures\n`;
    report += `2. Apply automated fixes: \`node scripts/fix-import-paths.mjs\`\n`;
    report += `3. Fix high-priority categories first (moduleResolution, mockSetup)\n`;
  } else {
    report += `✅ All tests passing! Focus on coverage improvements.\n`;
  }

  return report;
}

function main() {
  console.log('📊 Generating test fix status report...\n');

  const stats = getTestStats();
  if (!stats) {
    console.error('Failed to collect test statistics');
    process.exit(1);
  }

  const previousStats = existsSync(STATUS_FILE)
    ? JSON.parse(readFileSync(STATUS_FILE, 'utf8'))
    : null;

  const report = generateReport(stats, previousStats);

  // Save current stats
  writeFileSync(STATUS_FILE, JSON.stringify(stats, null, 2));
  writeFileSync(PROGRESS_FILE, report);

  console.log(report);
  console.log(`\n✅ Status saved to ${PROGRESS_FILE}`);
}

main();

