/**
 * Analyze Jest test failures and produce a leaderboard
 */
const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2] || path.join(process.cwd(), 'reports', 'mobile-jest.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ Test results not found: ${jsonPath}`);
  console.log('Run: pnpm mobile:test --silent --json --outputFile reports/mobile-jest.json');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Collect all failures
const failures = report.testResults
  ?.flatMap((testResult) => testResult.assertionResults)
  .filter((assertion) => assertion.status === 'failed') || [];

if (failures.length === 0) {
  console.log('✅ No test failures found!');
  process.exit(0);
}

// Categorize failures by error type
const errorMap = {};

failures.forEach((failure) => {
  const firstLine = failure.failureMessages?.[0]?.split('\n')[0] || 'unknown';
  const key = firstLine.substring(0, 100); // Limit key length
  errorMap[key] = (errorMap[key] || 0) + 1;
});

// Sort by frequency
const sortedErrors = Object.entries(errorMap)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

console.log('\n📊 Top Test Failure Patterns\n');
console.log(`${failures.length} total failures across ${report.testResults?.length || 0} suites\n`);
console.log('Top 20 error patterns:\n');

sortedErrors.forEach(([error, count], index) => {
  console.log(`${(index + 1).toString().padStart(2)}. [${count} occurrences]`);
  console.log(`   ${error}\n`);
});

// Additional insights
const testStats = {
  total: report.testResults?.length || 0,
  passed: report.testResults?.reduce((acc, r) => acc + r.numPassingTests, 0) || 0,
  failed: failures.length,
  duration: report.testResults?.reduce((acc, r) => acc + (r.endTime - r.startTime), 0) || 0,
};

console.log('\n📈 Overall Stats:');
console.log(`   Suites: ${testStats.total}`);
console.log(`   Passed: ${testStats.passed}`);
console.log(`   Failed: ${testStats.failed}`);
console.log(`   Duration: ${(testStats.duration / 1000).toFixed(2)}s\n`);

