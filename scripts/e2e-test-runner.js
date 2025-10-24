#!/usr/bin/env node

/**
 * E2E Test Runner Script
 * Orchestrates all E2E tests across web, mobile, and server
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class E2ETestRunner {
  constructor() {
    this.results = {
      web: { status: 'pending', duration: 0, errors: [] },
      mobile: { status: 'pending', duration: 0, errors: [] },
      server: { status: 'pending', duration: 0, errors: [] },
      performance: { status: 'pending', duration: 0, errors: [] }
    };
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 Starting comprehensive E2E test suite...\n');

    try {
      // Run tests in parallel for faster execution
      await Promise.allSettled([
        this.runWebTests(),
        this.runMobileTests(),
        this.runServerTests(),
        this.runPerformanceTests()
      ]);

      this.generateReport();
      this.exitWithCode();
    } catch (error) {
      console.error('❌ E2E test runner failed:', error);
      process.exit(1);
    }
  }

  async runWebTests() {
    console.log('🌐 Running web E2E tests (Cypress)...');
    const startTime = Date.now();

    try {
      // Start web server
      const serverProcess = spawn('pnpm', ['run', 'start', '--filter=pawfectmatch-web'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      // Wait for server to be ready
      await this.waitForServer('http://localhost:3000', 30000);

      // Run Cypress tests
      execSync('pnpm run test:e2e', {
        cwd: path.join(process.cwd(), 'apps/web'),
        stdio: 'inherit'
      });

      this.results.web.status = 'passed';
      this.results.web.duration = Date.now() - startTime;
      console.log('✅ Web E2E tests passed');

      // Kill server
      serverProcess.kill();
    } catch (error) {
      this.results.web.status = 'failed';
      this.results.web.duration = Date.now() - startTime;
      this.results.web.errors.push(error.message);
      console.error('❌ Web E2E tests failed:', error.message);
    }
  }

  async runMobileTests() {
    console.log('📱 Running mobile E2E tests (Detox)...');
    const startTime = Date.now();

    try {
      // Build mobile app
      execSync('pnpm run test:e2e:build', {
        cwd: path.join(process.cwd(), 'apps/mobile'),
        stdio: 'inherit'
      });

      // Run Detox tests
      execSync('pnpm run test:e2e', {
        cwd: path.join(process.cwd(), 'apps/mobile'),
        stdio: 'inherit'
      });

      this.results.mobile.status = 'passed';
      this.results.mobile.duration = Date.now() - startTime;
      console.log('✅ Mobile E2E tests passed');
    } catch (error) {
      this.results.mobile.status = 'failed';
      this.results.mobile.duration = Date.now() - startTime;
      this.results.mobile.errors.push(error.message);
      console.error('❌ Mobile E2E tests failed:', error.message);
    }
  }

  async runServerTests() {
    console.log('🖥️ Running server E2E tests (Jest/Supertest)...');
    const startTime = Date.now();

    try {
      execSync('pnpm test -- --testPathPattern="e2e"', {
        cwd: path.join(process.cwd(), 'server'),
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'test',
          MONGODB_URI: 'mongodb://localhost:27017/pawfectmatch_test'
        }
      });

      this.results.server.status = 'passed';
      this.results.server.duration = Date.now() - startTime;
      console.log('✅ Server E2E tests passed');
    } catch (error) {
      this.results.server.status = 'failed';
      this.results.server.duration = Date.now() - startTime;
      this.results.server.errors.push(error.message);
      console.error('❌ Server E2E tests failed:', error.message);
    }
  }

  async runPerformanceTests() {
    console.log('⚡ Running performance E2E tests (Lighthouse)...');
    const startTime = Date.now();

    try {
      // Start server
      const serverProcess = spawn('pnpm', ['run', 'start'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      // Wait for server to be ready
      await this.waitForServer('http://localhost:3000', 30000);

      // Run Lighthouse CI
      execSync('lhci autorun', {
        stdio: 'inherit'
      });

      this.results.performance.status = 'passed';
      this.results.performance.duration = Date.now() - startTime;
      console.log('✅ Performance E2E tests passed');

      // Kill server
      serverProcess.kill();
    } catch (error) {
      this.results.performance.status = 'failed';
      this.results.performance.duration = Date.now() - startTime;
      this.results.performance.errors.push(error.message);
      console.error('❌ Performance E2E tests failed:', error.message);
    }
  }

  async waitForServer(url, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Server not ready yet, wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    throw new Error(`Server at ${url} did not become ready within ${timeout}ms`);
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const passedTests = Object.values(this.results).filter(r => r.status === 'passed').length;
    const totalTests = Object.keys(this.results).length;

    const report = {
      summary: {
        totalDuration,
        passedTests,
        totalTests,
        successRate: (passedTests / totalTests) * 100
      },
      results: this.results,
      timestamp: new Date().toISOString()
    };

    // Save JSON report
    fs.writeFileSync(
      path.join(process.cwd(), 'e2e-test-results.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate HTML report
    this.generateHTMLReport(report);

    // Print summary
    console.log('\n📊 E2E Test Results Summary:');
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log(`Passed: ${passedTests}/${totalTests} (${report.summary.successRate.toFixed(1)}%)`);
    
    Object.entries(this.results).forEach(([test, result]) => {
      const status = result.status === 'passed' ? '✅' : '❌';
      console.log(`${status} ${test}: ${(result.duration / 1000).toFixed(2)}s`);
      if (result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.join(', ')}`);
      }
    });
  }

  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .test-results { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .test-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
        .test-card.passed { border-left: 5px solid #28a745; }
        .test-card.failed { border-left: 5px solid #dc3545; }
        .test-card h3 { margin: 0 0 15px 0; }
        .test-card.passed h3 { color: #28a745; }
        .test-card.failed h3 { color: #dc3545; }
        .duration { color: #666; font-size: 0.9em; }
        .errors { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .timestamp { text-align: center; color: #666; font-size: 0.9em; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>E2E Test Results</h1>
            <p>Comprehensive end-to-end testing report</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Duration</h3>
                <div class="value">${(report.summary.totalDuration / 1000).toFixed(2)}s</div>
            </div>
            <div class="summary-card">
                <h3>Tests Passed</h3>
                <div class="value">${report.summary.passedTests}/${report.summary.totalTests}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div class="value">${report.summary.successRate.toFixed(1)}%</div>
            </div>
        </div>
        
        <div class="test-results">
            ${Object.entries(report.results).map(([testName, result]) => `
                <div class="test-card ${result.status}">
                    <h3>${testName.charAt(0).toUpperCase() + testName.slice(1)} E2E Tests</h3>
                    <div class="duration">Duration: ${(result.duration / 1000).toFixed(2)}s</div>
                    <div class="status">Status: ${result.status}</div>
                    ${result.errors.length > 0 ? `
                        <div class="errors">
                            <strong>Errors:</strong><br>
                            ${result.errors.map(error => `• ${error}`).join('<br>')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="timestamp">
            Generated on ${new Date(report.timestamp).toLocaleString()}
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(
      path.join(process.cwd(), 'e2e-test-results.html'),
      html
    );
  }

  exitWithCode() {
    const hasFailures = Object.values(this.results).some(r => r.status === 'failed');
    process.exit(hasFailures ? 1 : 0);
  }
}

// Run the test runner
if (require.main === module) {
  const runner = new E2ETestRunner();
  runner.runAllTests();
}

module.exports = E2ETestRunner;
