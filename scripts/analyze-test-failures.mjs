#!/usr/bin/env node
/**
 * Analyze Jest test failures and categorize them by error type
 * Outputs a JSON report with categorized failures for targeted fixes
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const REPORTS_DIR = join('reports');
const OUTPUT_FILE = join(REPORTS_DIR, 'test-failure-categories.json');
const FAILURES_DB = join(REPORTS_DIR, 'test-failures-db.json');

mkdirSync(REPORTS_DIR, { recursive: true });

const categories = {
  moduleResolution: [],
  mockSetup: [],
  apiMismatches: [],
  asyncTiming: [],
  themeProvider: [],
  reactNative: [],
  other: [],
};

function runJest() {
  console.log('Running Jest tests to collect failures...');
  const result = spawnSync('pnpm', ['test:unit', '--json', '--no-coverage'], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });

  if (!existsSync('coverage/jest-results.json')) {
    console.error('Jest did not produce results file');
    return null;
  }

  try {
    return JSON.parse(readFileSync('coverage/jest-results.json', 'utf8'));
  } catch (error) {
    console.error('Failed to parse Jest results:', error.message);
    return null;
  }
}

function categorizeFailure(testFile, errorMessage) {
  const msg = errorMessage.toLowerCase();

  if (msg.includes('cannot find module') || msg.includes('module not found')) {
    return 'moduleResolution';
  }
  if (msg.includes('jest.mock') || msg.includes('hoisting') || msg.includes('mock')) {
    return 'mockSetup';
  }
  if (msg.includes('is not a function') || msg.includes('cannot read property') || msg.includes('undefined')) {
    return 'apiMismatches';
  }
  if (msg.includes('waitfornextupdate') || msg.includes('act(') || msg.includes('async')) {
    return 'asyncTiming';
  }
  if (msg.includes('theme') || msg.includes('themeprovider') || msg.includes('usetheme')) {
    return 'themeProvider';
  }
  if (msg.includes('react-native') || msg.includes('view') || msg.includes('text')) {
    return 'reactNative';
  }

  return 'other';
}

function analyzeFailures(results) {
  const failures = [];

  for (const suite of results.testResults || []) {
    if (suite.status === 'failed') {
      const testFile = suite.name;
      const failureMessage = suite.message || 'Unknown error';

      const category = categorizeFailure(testFile, failureMessage);

      const failure = {
        testFile,
        category,
        errorMessage: failureMessage.split('\n')[0], // First line only
        status: 'pending',
        priority: category === 'moduleResolution' || category === 'mockSetup' ? 'high' : 'medium',
      };

      categories[category].push(failure);
      failures.push(failure);
    }

    // Also check individual test failures
    for (const test of suite.assertionResults || []) {
      if (test.status === 'failed') {
        const category = categorizeFailure(suite.name, test.failureMessages?.[0] || '');
        
        if (!categories[category].find(f => f.testFile === suite.name && f.testTitle === test.title)) {
          categories[category].push({
            testFile: suite.name,
            testTitle: test.title,
            category,
            errorMessage: test.failureMessages?.[0]?.split('\n')[0] || 'Unknown',
            status: 'pending',
            priority: 'medium',
          });
        }
      }
    }
  }

  return failures;
}

function generateSummary() {
  const summary = {
    timestamp: new Date().toISOString(),
    categories: Object.keys(categories).reduce((acc, key) => {
      acc[key] = {
        count: categories[key].length,
        files: [...new Set(categories[key].map(f => f.testFile))].slice(0, 10), // Top 10 files
      };
      return acc;
    }, {}),
    totalFailures: Object.values(categories).reduce((sum, arr) => sum + arr.length, 0),
  };

  return summary;
}

function main() {
  console.log('🔍 Analyzing test failures...\n');

  const results = runJest();
  if (!results) {
    console.error('Failed to run tests or parse results');
    process.exit(1);
  }

  const failures = analyzeFailures(results);
  const summary = generateSummary();

  // Write categorized failures
  writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2));
  writeFileSync(FAILURES_DB, JSON.stringify(failures, null, 2));

  console.log('✅ Analysis complete!\n');
  console.log('Summary:');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\n📊 Detailed failures: ${FAILURES_DB}`);
  console.log(`📋 Categories: ${OUTPUT_FILE}`);
}

main();

