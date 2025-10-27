#!/usr/bin/env node
/**
 * Test Services Gate - Reports test status for quality gates
 * Runs service tests and reports pass/fail with coverage metrics
 */

import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const startTime = Date.now();

console.log('🧪 Running Service Tests...\n');

const result = spawnSync('jest', ['--selectProjects', 'services', '--runInBand', '--json', '--outputFile=/tmp/jest-results.json'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
});

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

// Parse results
let testResults = { numPassedTests: 0, numFailedTests: 0, numTotalTests: 0 };
try {
  const fs = await import('node:fs');
  const resultsJson = fs.readFileSync('/tmp/jest-results.json', 'utf8');
  testResults = JSON.parse(resultsJson);
} catch (e) {
  // Ignore if file doesn't exist
}

const passRate = testResults.numTotalTests > 0 
  ? ((testResults.numPassedTests / testResults.numTotalTests) * 100).toFixed(1)
  : 0;

const report = {
  name: 'Unit/Integration Tests',
  status: result.status === 0 ? 'PASS' : 'FAIL',
  severity: 'P0',
  duration: `${duration}s`,
  tests: {
    total: testResults.numTotalTests,
    passed: testResults.numPassedTests,
    failed: testResults.numFailedTests,
    passRate: `${passRate}%`,
  },
  timestamp: new Date().toISOString(),
};

console.log('\n📊 Test Results:');
console.log(`   Total: ${report.tests.total}`);
console.log(`   Passed: ${report.tests.passed} ✅`);
console.log(`   Failed: ${report.tests.failed} ❌`);
console.log(`   Pass Rate: ${report.tests.passRate}`);
console.log(`   Duration: ${report.duration}`);

// Write report
writeFileSync('/home/ben/Downloads/pets-fresh/apps/mobile/reports/test-services-gate.json', JSON.stringify(report, null, 2));

process.exit(result.status === 0 ? 0 : 1);
