#!/usr/bin/env node
/**
 * Enhanced Test Failure Analysis Script
 * 
 * Categorizes test failures by type and provides actionable fix suggestions.
 * Generates comprehensive reports for systematic test fixing.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const REPORTS_DIR = join('reports');
const OUTPUT_FILE = join(REPORTS_DIR, 'test-failure-analysis.json');
const SUMMARY_FILE = join(REPORTS_DIR, 'TEST_FAILURE_SUMMARY.md');

mkdirSync(REPORTS_DIR, { recursive: true });

const failureCategories = {
  componentRendering: {
    count: 0,
    files: [],
    patterns: [
      /cannot read propert.*of undefined/i,
      /component.*is not defined/i,
      /failed to render/i,
      /theme/i,
      /usetheme/i,
      /themeprovider/i,
    ],
    fixes: [
      'Add ThemeProvider wrapper',
      'Use unified-render utility',
      'Check useTheme hook ordering',
      'Verify component imports',
    ],
  },
  missingMocks: {
    count: 0,
    files: [],
    patterns: [
      /cannot find module/i,
      /module not found/i,
      /mock.*not found/i,
      /jest\.mock/i,
    ],
    fixes: [
      'Add missing jest.mock() calls',
      'Check jest.setup.ts for global mocks',
      'Verify module path resolution',
    ],
  },
  asyncTiming: {
    count: 0,
    files: [],
    patterns: [
      /waitfor/i,
      /async/i,
      /timing/i,
      /timeout/i,
      /act\(/i,
      /waitfornextupdate/i,
    ],
    fixes: [
      'Add proper await statements',
      'Use waitFor from testing-library',
      'Wrap async updates in act()',
      'Increase timeout if needed',
    ],
  },
  typeMismatches: {
    count: 0,
    files: [],
    patterns: [
      /type.*is not assignable/i,
      /property.*does not exist/i,
      /type.*error/i,
      /typescript/i,
    ],
    fixes: [
      'Fix mock return types',
      'Add proper type assertions',
      'Check prop type definitions',
      'Verify theme type compatibility',
    ],
  },
  integrationIssues: {
    count: 0,
    files: [],
    patterns: [
      /integration/i,
      /navigation/i,
      /hook.*dependency/i,
      /state.*not.*updated/i,
    ],
    fixes: [
      'Check hook dependencies',
      'Verify state synchronization',
      'Add proper cleanup',
      'Check navigation mock setup',
    ],
  },
  other: {
    count: 0,
    files: [],
    patterns: [],
    fixes: ['Review error message for specific fix'],
  },
};

function categorizeFailure(testFile, errorMessage) {
  const msg = errorMessage.toLowerCase();
  
  // Check each category
  for (const [category, config] of Object.entries(failureCategories)) {
    if (category === 'other') continue;
    
    for (const pattern of config.patterns) {
      if (pattern.test(msg)) {
        return category;
      }
    }
  }
  
  return 'other';
}

function runJestTests() {
  console.log('🔍 Running Jest tests to collect failures...\n');
  
  // Run jest directly from the mobile app directory
  const mobileDir = join(process.cwd(), 'apps', 'mobile');
  const result = spawnSync(
    'pnpm',
    ['exec', 'jest', '--json', '--no-coverage'],
    {
      encoding: 'utf8',
      cwd: mobileDir,
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096 --expose-gc',
        TS_NODE_TRANSPILE_ONLY: 'true',
      },
    }
  );

  // Jest writes to stderr even on success in some cases
  const output = result.stdout + result.stderr;
  
  try {
    // Try to find JSON in output - Jest JSON output is usually at the end
    const lines = output.split('\n');
    let jsonStart = -1;
    let jsonEnd = -1;
    
    // Find the JSON object boundaries
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('{') && jsonStart === -1) {
        jsonStart = i;
      }
      if (lines[i].trim() === '}' || lines[i].trim().endsWith('}')) {
        jsonEnd = i;
      }
    }
    
    if (jsonStart >= 0 && jsonEnd >= jsonStart) {
      const jsonText = lines.slice(jsonStart, jsonEnd + 1).join('\n');
      const parsed = JSON.parse(jsonText);
      return parsed;
    }
    
    // Fallback: try matching the entire JSON
    const jsonMatch = output.match(/\{[\s\S]*"numTotalTests"[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.warn('Could not parse Jest output as JSON, trying alternative method...');
    console.warn('Error:', error.message);
  }

  // Try reading from coverage directory
  const resultsPath = join(mobileDir, 'coverage', 'jest-results.json');
  if (existsSync(resultsPath)) {
    try {
      return JSON.parse(readFileSync(resultsPath, 'utf8'));
    } catch (error) {
      console.warn(`Could not read ${resultsPath}`);
    }
  }

  // If JSON parsing failed, try to parse stderr for errors
  if (result.status !== 0 && output) {
    console.warn('Tests failed but could not parse JSON. Output snippet:');
    console.warn(output.slice(0, 500));
  }

  return null;
}

function analyzeTestResults(results) {
  if (!results || !results.testResults) {
    console.error('❌ No test results found');
    return null;
  }

  const analysis = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSuites: results.numTotalTestSuites || 0,
      passedSuites: results.numPassedTestSuites || 0,
      failedSuites: results.numFailedTestSuites || 0,
      totalTests: results.numTotalTests || 0,
      passedTests: results.numPassedTests || 0,
      failedTests: results.numFailedTests || 0,
    },
    categories: {},
    failures: [],
  };

  // Reset category counts
  for (const category of Object.keys(failureCategories)) {
    failureCategories[category].count = 0;
    failureCategories[category].files = [];
  }

  // Analyze each test suite
  for (const suite of results.testResults || []) {
    const testFile = suite.name;
    const suiteMessage = suite.message || '';
    
    // Categorize suite-level failures
    if (suite.status === 'failed') {
      const category = categorizeFailure(testFile, suiteMessage);
      failureCategories[category].count++;
      
      if (!failureCategories[category].files.includes(testFile)) {
        failureCategories[category].files.push(testFile);
      }

      analysis.failures.push({
        file: testFile,
        category,
        level: 'suite',
        message: suiteMessage.split('\n')[0],
      });
    }

    // Analyze individual test failures
    for (const test of suite.assertionResults || []) {
      if (test.status === 'failed') {
        const errorMsg = test.failureMessages?.[0] || '';
        const category = categorizeFailure(testFile, errorMsg);
        failureCategories[category].count++;
        
        if (!failureCategories[category].files.includes(testFile)) {
          failureCategories[category].files.push(testFile);
        }

        analysis.failures.push({
          file: testFile,
          test: test.title,
          category,
          level: 'test',
          message: errorMsg.split('\n')[0],
        });
      }
    }
  }

  // Build category summary
  for (const [category, config] of Object.entries(failureCategories)) {
    analysis.categories[category] = {
      count: config.count,
      fileCount: config.files.length,
      sampleFiles: config.files.slice(0, 10),
      suggestedFixes: config.fixes,
    };
  }

  return analysis;
}

function generateMarkdownReport(analysis) {
  if (!analysis) return '';

  const { summary, categories } = analysis;

  let report = `# Test Failure Analysis Report\n\n`;
  report += `**Generated:** ${new Date(analysis.timestamp).toLocaleString()}\n\n`;

  report += `## Executive Summary\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| **Test Suites** | ${summary.totalSuites} total (${summary.passedSuites} passed, ${summary.failedSuites} failed) |\n`;
  report += `| **Tests** | ${summary.totalTests} total (${summary.passedTests} passed, ${summary.failedTests} failed) |\n`;
  report += `| **Pass Rate** | ${summary.totalTests > 0 ? ((summary.passedTests / summary.totalTests) * 100).toFixed(1) : 0}% |\n\n`;

  report += `## Failure Categories\n\n`;

  // Sort categories by count
  const sortedCategories = Object.entries(categories).sort(
    (a, b) => b[1].count - a[1].count
  );

  for (const [category, data] of sortedCategories) {
    if (data.count === 0) continue;

    report += `### ${category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')} (${data.count} failures)\n\n`;
    report += `**Affected Files:** ${data.fileCount}\n\n`;
    report += `**Suggested Fixes:**\n`;
    for (const fix of data.suggestedFixes) {
      report += `- ${fix}\n`;
    }
    report += `\n**Sample Files:**\n`;
    for (const file of data.sampleFiles) {
      report += `- \`${file}\`\n`;
    }
    report += `\n`;
  }

  report += `## Priority Fix Order\n\n`;
  report += `Based on impact, fix in this order:\n\n`;
  
  let priority = 1;
  for (const [category, data] of sortedCategories) {
    if (data.count === 0) continue;
    report += `${priority}. **${category}** - ${data.count} failures, ${data.fileCount} files\n`;
    priority++;
  }

  report += `\n## Next Steps\n\n`;
  report += `1. Focus on highest-priority category first\n`;
  report += `2. Apply fixes systematically using suggested fixes\n`;
  report += `3. Re-run analysis after each batch of fixes\n`;
  report += `4. Use \`@/test-utils/unified-render\` for component tests\n`;

  return report;
}

function main() {
  console.log('🧪 Enhanced Test Failure Analysis\n');
  console.log('='.repeat(50));
  console.log();

  const results = runJestTests();
  
  if (!results) {
    console.error('❌ Failed to collect test results');
    console.error('Try running: pnpm --filter @pawfectmatch/mobile test');
    process.exit(1);
  }

  const analysis = analyzeTestResults(results);
  
  if (!analysis) {
    console.error('❌ Failed to analyze test results');
    process.exit(1);
  }

  // Write JSON report
  writeFileSync(OUTPUT_FILE, JSON.stringify(analysis, null, 2));
  
  // Write Markdown summary
  const markdown = generateMarkdownReport(analysis);
  writeFileSync(SUMMARY_FILE, markdown);

  console.log('✅ Analysis complete!\n');
  console.log('📊 Summary:');
  console.log(`   Total Failures: ${analysis.summary.failedTests}`);
  console.log(`   Failed Suites: ${analysis.summary.failedSuites}\n`);
  console.log('📋 Reports Generated:');
  console.log(`   JSON: ${OUTPUT_FILE}`);
  console.log(`   Markdown: ${SUMMARY_FILE}\n`);
  
  console.log('🎯 Top Failure Categories:');
  const sorted = Object.entries(analysis.categories)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);
  
  for (const [category, data] of sorted) {
    if (data.count > 0) {
      console.log(`   ${category}: ${data.count} failures`);
    }
  }
}

main();

