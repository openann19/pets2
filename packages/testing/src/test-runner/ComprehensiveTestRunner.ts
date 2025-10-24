/**
 * Comprehensive Test Runner
 * Advanced test runner for error boundaries, payment flows, offline scenarios, and edge cases
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface TestSuite {
  name: string;
  path: string;
  type: 'unit' | 'integration' | 'e2e' | 'visual';
  timeout: number;
  retries: number;
  parallel: boolean;
  coverage: boolean;
}

export interface TestResult {
  suite: string;
  passed: boolean;
  duration: number;
  tests: number;
  failures: number;
  errors: string[];
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

export interface TestRunnerConfig {
  suites: TestSuite[];
  outputDir: string;
  coverageDir: string;
  reportFormat: 'json' | 'html' | 'junit';
  failFast: boolean;
  verbose: boolean;
  watch: boolean;
}

export class ComprehensiveTestRunner {
  private config: TestRunnerConfig;
  private results: TestResult[] = [];

  constructor(config: TestRunnerConfig) {
    this.config = config;
  }

  /**
   * Run all test suites
   */
  async runAll(): Promise<TestResult[]> {
    console.log('🚀 Starting comprehensive test run...');
    
    this.results = [];
    
    for (const suite of this.config.suites) {
      console.log(`\n📋 Running ${suite.name}...`);
      
      try {
        const result = await this.runSuite(suite);
        this.results.push(result);
        
        if (result.passed) {
          console.log(`✅ ${suite.name} passed (${result.tests} tests, ${result.duration}ms)`);
        } else {
          console.log(`❌ ${suite.name} failed (${result.failures} failures)`);
          
          if (this.config.failFast) {
            break;
          }
        }
      } catch (error) {
        console.error(`💥 ${suite.name} crashed:`, error);
        
        this.results.push({
          suite: suite.name,
          passed: false,
          duration: 0,
          tests: 0,
          failures: 1,
          errors: [error instanceof Error ? error.message : String(error)],
        });
        
        if (this.config.failFast) {
          break;
        }
      }
    }
    
    await this.generateReport();
    return this.results;
  }

  /**
   * Run a specific test suite
   */
  private async runSuite(suite: TestSuite): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Prepare test command
      const command = this.buildTestCommand(suite);
      
      // Execute test command
      const output = execSync(command, {
        encoding: 'utf8',
        timeout: suite.timeout,
        stdio: this.config.verbose ? 'inherit' : 'pipe',
      });
      
      // Parse results
      const result = this.parseTestOutput(output, suite);
      result.duration = Date.now() - startTime;
      
      return result;
    } catch (error) {
      return {
        suite: suite.name,
        passed: false,
        duration: Date.now() - startTime,
        tests: 0,
        failures: 1,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Build test command for a suite
   */
  private buildTestCommand(suite: TestSuite): string {
    const baseCommand = 'npx jest';
    const args: string[] = [];
    
    // Add test path
    args.push(suite.path);
    
    // Add timeout
    args.push(`--testTimeout=${suite.timeout}`);
    
    // Add retries
    if (suite.retries > 0) {
      args.push(`--maxWorkers=1`);
    }
    
    // Add parallel execution
    if (suite.parallel) {
      args.push('--maxWorkers=50%');
    } else {
      args.push('--maxWorkers=1');
    }
    
    // Add coverage
    if (suite.coverage) {
      args.push('--coverage');
      args.push(`--coverageDirectory=${this.config.coverageDir}/${suite.name}`);
    }
    
    // Add output format
    args.push(`--json`);
    args.push(`--outputFile=${this.config.outputDir}/${suite.name}-results.json`);
    
    // Add watch mode
    if (this.config.watch) {
      args.push('--watch');
    }
    
    // Add verbose output
    if (this.config.verbose) {
      args.push('--verbose');
    }
    
    return `${baseCommand} ${args.join(' ')}`;
  }

  /**
   * Parse test output
   */
  private parseTestOutput(output: string, suite: TestSuite): TestResult {
    try {
      // Try to read JSON results file
      const resultsFile = join(this.config.outputDir, `${suite.name}-results.json`);
      
      if (existsSync(resultsFile)) {
        const results = JSON.parse(readFileSync(resultsFile, 'utf8'));
        
        return {
          suite: suite.name,
          passed: results.success,
          duration: results.startTime ? Date.now() - results.startTime : 0,
          tests: results.numTotalTests || 0,
          failures: results.numFailedTests || 0,
          errors: (results.testResults as Array<{ status: string; failureMessages?: string[] }> | undefined)
            ?.filter((test) => test.status === 'failed')
            ?.map((test) => test.failureMessages?.join('\n') || 'Unknown error')
            || [],
        };
      }
      
      // Fallback to parsing console output
      return this.parseConsoleOutput(output, suite);
    } catch (error) {
      return {
        suite: suite.name,
        passed: false,
        duration: 0,
        tests: 0,
        failures: 1,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Parse console output as fallback
   */
  private parseConsoleOutput(output: string, suite: TestSuite): TestResult {
    const lines = output.split('\n');
    let tests = 0;
    let failures = 0;
    const errors: string[] = [];
    
    for (const line of lines) {
      if (line.includes('Tests:')) {
        const match = line.match(/(\d+) total/);
        if (match) tests = parseInt(match[1]);
      }
      
      if (line.includes('Failed:')) {
        const match = line.match(/(\d+) failed/);
        if (match) failures = parseInt(match[1]);
      }
      
      if (line.includes('FAIL') || line.includes('Error:')) {
        errors.push(line.trim());
      }
    }
    
    return {
      suite: suite.name,
      passed: failures === 0,
      duration: 0,
      tests,
      failures,
      errors,
    };
  }

  /**
   * Generate comprehensive test report
   */
  private async generateReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        totalTests: this.results.reduce((sum, r) => sum + r.tests, 0),
        totalFailures: this.results.reduce((sum, r) => sum + r.failures, 0),
        totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
      },
      suites: this.results,
    };
    
    // Write JSON report
    const jsonReportPath = join(this.config.outputDir, 'comprehensive-test-report.json');
    writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    if (this.config.reportFormat === 'html') {
      await this.generateHtmlReport(report);
    }
    
    // Generate JUnit report
    if (this.config.reportFormat === 'junit') {
      await this.generateJunitReport(report);
    }
    
    // Print summary
    this.printSummary(report);
  }

  /**
   * Generate HTML test report
   */
  private async generateHtmlReport(report: {
    timestamp: string;
    summary: { total: number; passed: number; failed: number; totalTests: number; totalFailures: number; totalDuration: number };
    suites: Array<{ suite: string; passed: boolean; duration: number; tests: number; failures: number; errors: string[] }>;
  }): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Comprehensive Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .summary-card { background: white; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .suite { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .suite-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; }
        .suite-content { padding: 15px; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 3px; margin: 5px 0; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Comprehensive Test Report</h1>
        <p class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Total Suites</h3>
            <div class="value">${report.summary.total}</div>
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <div class="value passed">${report.summary.passed}</div>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div class="value failed">${report.summary.failed}</div>
        </div>
        <div class="summary-card">
            <h3>Total Tests</h3>
            <div class="value">${report.summary.totalTests}</div>
        </div>
        <div class="summary-card">
            <h3>Total Failures</h3>
            <div class="value failed">${report.summary.totalFailures}</div>
        </div>
        <div class="summary-card">
            <h3>Duration</h3>
            <div class="value">${(report.summary.totalDuration / 1000).toFixed(2)}s</div>
        </div>
    </div>
    
    <h2>Test Suites</h2>
    ${report.suites.map((suite) => `
        <div class="suite">
            <div class="suite-header">
                <h3>${suite.suite} ${suite.passed ? '✅' : '❌'}</h3>
                <p>Tests: ${suite.tests} | Failures: ${suite.failures} | Duration: ${(suite.duration / 1000).toFixed(2)}s</p>
            </div>
            <div class="suite-content">
                ${suite.errors.length > 0 ? `
                    <h4>Errors:</h4>
                    ${suite.errors.map((error) => `<div class="error">${error}</div>`).join('')}
                ` : '<p>No errors</p>'}
            </div>
        </div>
    `).join('')}
</body>
</html>`;

    const htmlReportPath = join(this.config.outputDir, 'comprehensive-test-report.html');
    writeFileSync(htmlReportPath, html);
  }

  /**
   * Generate JUnit XML report
   */
  private async generateJunitReport(report: {
    summary: { totalTests: number; totalFailures: number; totalDuration: number };
    suites: Array<{ suite: string; tests: number; failures: number; duration: number; errors: string[] }>;
  }): Promise<void> {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Comprehensive Test Suite" tests="${report.summary.totalTests}" failures="${report.summary.totalFailures}" time="${(report.summary.totalDuration / 1000).toFixed(3)}">
${report.suites.map((suite: unknown) => `
  <testsuite name="${suite.suite}" tests="${suite.tests}" failures="${suite.failures}" time="${(suite.duration / 1000).toFixed(3)}">
    ${suite.errors.map((error: string, index: number) => `
      <testcase name="test_${index}" classname="${suite.suite}">
        <failure message="${error.replace(/"/g, '&quot;')}">${error.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</failure>
      </testcase>
    `).join('')}
  </testsuite>
`).join('')}
</testsuites>`;

    const junitReportPath = join(this.config.outputDir, 'comprehensive-test-report.xml');
    writeFileSync(junitReportPath, xml);
  }

  /**
   * Print test summary to console
   */
  private printSummary(report: {
    summary: { total: number; passed: number; failed: number; totalTests: number; totalFailures: number; totalDuration: number };
    suites: Array<{ suite: string; passed: boolean; failures: number }>;
  }): void {
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`Total Suites: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Total Failures: ${report.summary.totalFailures}`);
    console.log(`Total Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`);
    
    if (report.summary.failed > 0) {
      console.log('\n❌ Failed Suites:');
      report.suites
        .filter((suite) => !suite.passed)
        .forEach((suite) => {
          console.log(`  - ${suite.suite}: ${suite.failures} failures`);
        });
    }
    
    console.log(`\n📄 Reports generated in: ${this.config.outputDir}`);
  }

  /**
   * Run tests in watch mode
   */
  async watch(): Promise<void> {
    this.config.watch = true;
    console.log('👀 Starting test watch mode...');
    
    // Run initial test
    await this.runAll();
    
    // Watch for file changes and re-run tests
    // This would typically use a file watcher library like chokidar
    console.log('Watching for file changes...');
  }

  /**
   * Run specific test suite
   */
  async runSuite(suiteName: string): Promise<TestResult | null> {
    const suite = this.config.suites.find(s => s.name === suiteName);
    
    if (!suite) {
      console.error(`Suite "${suiteName}" not found`);
      return null;
    }
    
    console.log(`🎯 Running specific suite: ${suiteName}`);
    return await this.runSuite(suite);
  }
}

// Default test configuration
export const defaultTestConfig: TestRunnerConfig = {
  suites: [
    {
      name: 'error-boundaries',
      path: 'packages/testing/src/error-boundary/**/*.test.{ts,tsx}',
      type: 'unit',
      timeout: 30000,
      retries: 2,
      parallel: true,
      coverage: true,
    },
    {
      name: 'payment-flows',
      path: 'packages/testing/src/payment/**/*.test.{ts,tsx}',
      type: 'integration',
      timeout: 60000,
      retries: 1,
      parallel: false,
      coverage: true,
    },
    {
      name: 'offline-scenarios',
      path: 'packages/testing/src/offline/**/*.test.{ts,tsx}',
      type: 'integration',
      timeout: 45000,
      retries: 2,
      parallel: true,
      coverage: true,
    },
    {
      name: 'user-feedback',
      path: 'packages/testing/src/feedback/**/*.test.{ts,tsx}',
      type: 'unit',
      timeout: 30000,
      retries: 1,
      parallel: true,
      coverage: true,
    },
  ],
  outputDir: 'test-results',
  coverageDir: 'coverage',
  reportFormat: 'html',
  failFast: false,
  verbose: false,
  watch: false,
};

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const config = { ...defaultTestConfig };
  
  // Parse command line arguments
  if (args.includes('--watch')) {
    config.watch = true;
  }
  
  if (args.includes('--verbose')) {
    config.verbose = true;
  }
  
  if (args.includes('--fail-fast')) {
    config.failFast = true;
  }
  
  if (args.includes('--junit')) {
    config.reportFormat = 'junit';
  }
  
  const runner = new ComprehensiveTestRunner(config);
  
  if (config.watch) {
    runner.watch();
  } else {
    runner.runAll().then(() => {
      process.exit(0);
    }).catch((error) => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
  }
}

export default ComprehensiveTestRunner;
