#!/usr/bin/env node

/**
 * Professional Quality Gate System - 2025 Standards
 * 
 * This script implements a comprehensive quality gate that prevents
 * technical debt from accumulating by enforcing strict standards
 * at every stage of development.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class QualityGate {
  constructor() {
    this.checks = [];
    this.failedChecks = [];
    this.passedChecks = [];
    this.startTime = Date.now();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runCheck(name, command, options = {}) {
    this.log(`\n🔍 ${name}...`, 'blue');
    
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        ...options 
      });
      
      this.passedChecks.push({ name, command, result });
      this.log(`✅ ${name} passed`, 'green');
      return { success: true, result };
    } catch (error) {
      this.failedChecks.push({ name, command, error: error.message });
      this.log(`❌ ${name} failed`, 'red');
      this.log(`   Error: ${error.message}`, 'red');
      return { success: false, error: error.message };
    }
  }

  async typeCheck() {
    return this.runCheck(
      'TypeScript Type Check',
      'pnpm run type-check'
    );
  }

  async lintCheck() {
    return this.runCheck(
      'ESLint Check',
      'pnpm run lint:check'
    );
  }

  async formatCheck() {
    return this.runCheck(
      'Code Format Check',
      'pnpm run format:check'
    );
  }

  async testCheck() {
    return this.runCheck(
      'Test Suite',
      'pnpm run test:ci'
    );
  }

  async securityCheck() {
    return this.runCheck(
      'Security Audit',
      'pnpm audit --audit-level moderate'
    );
  }

  async bundleCheck() {
    return this.runCheck(
      'Bundle Size Check',
      'pnpm run bundle:check'
    );
  }

  async performanceCheck() {
    return this.runCheck(
      'Performance Check',
      'pnpm run perf:check'
    );
  }

  async accessibilityCheck() {
    return this.runCheck(
      'Accessibility Check',
      'pnpm run a11y:check'
    );
  }

  async dependencyCheck() {
    return this.runCheck(
      'Dependency Check',
      'pnpm run deps:check'
    );
  }

  async codeComplexityCheck() {
    return this.runCheck(
      'Code Complexity Check',
      'pnpm run complexity:check'
    );
  }

  async generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      totalChecks: this.checks.length,
      passedChecks: this.passedChecks.length,
      failedChecks: this.failedChecks.length,
      success: this.failedChecks.length === 0,
      checks: {
        passed: this.passedChecks,
        failed: this.failedChecks
      }
    };

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const reportPath = path.join(process.cwd(), 'quality-report.html');
    fs.writeFileSync(reportPath, htmlReport, 'utf8');

    this.log(`\n📊 Quality Report generated: ${reportPath}`, 'cyan');
    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Gate Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .status.failure { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #6c757d; margin-top: 5px; }
        .checks { margin-top: 30px; }
        .check-item { padding: 15px; margin-bottom: 10px; border-radius: 6px; }
        .check-item.passed { background: #d4edda; border-left: 4px solid #28a745; }
        .check-item.failed { background: #f8d7da; border-left: 4px solid #dc3545; }
        .check-name { font-weight: bold; margin-bottom: 5px; }
        .check-details { font-size: 0.9em; color: #6c757d; }
        .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Quality Gate Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="status ${report.success ? 'success' : 'failure'}">
            <h2>${report.success ? '✅ All Quality Checks Passed' : '❌ Quality Gate Failed'}</h2>
            <p>${report.success ? 'Your code meets professional standards!' : 'Please fix the issues below before proceeding.'}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${report.totalChecks}</div>
                <div class="metric-label">Total Checks</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #28a745;">${report.passedChecks}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value" style="color: #dc3545;">${report.failedChecks}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.duration}</div>
                <div class="metric-label">Duration</div>
            </div>
        </div>
        
        <div class="checks">
            <h3>Check Results</h3>
            ${report.checks.passed.map(check => `
                <div class="check-item passed">
                    <div class="check-name">✅ ${check.name}</div>
                    <div class="check-details">Command: ${check.command}</div>
                </div>
            `).join('')}
            ${report.checks.failed.map(check => `
                <div class="check-item failed">
                    <div class="check-name">❌ ${check.name}</div>
                    <div class="check-details">Command: ${check.command}</div>
                    <div class="check-details">Error: ${check.error}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Quality Gate System - Professional Standards 2025</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  async run() {
    this.log('🚀 Starting Quality Gate - Professional Standards 2025', 'bright');
    this.log('====================================================', 'bright');

    // Run all quality checks
    await this.typeCheck();
    await this.lintCheck();
    await this.formatCheck();
    await this.testCheck();
    await this.securityCheck();
    await this.bundleCheck();
    await this.performanceCheck();
    await this.accessibilityCheck();
    await this.dependencyCheck();
    await this.codeComplexityCheck();

    // Generate report
    const report = await this.generateReport();

    // Summary
    this.log('\n📊 QUALITY GATE SUMMARY', 'bright');
    this.log('=======================', 'bright');
    this.log(`Total Checks: ${report.totalChecks}`, 'blue');
    this.log(`Passed: ${report.passedChecks}`, 'green');
    this.log(`Failed: ${report.failedChecks}`, report.failedChecks > 0 ? 'red' : 'green');
    this.log(`Duration: ${report.duration}`, 'blue');

    if (report.success) {
      this.log('\n🎉 Quality Gate PASSED!', 'green');
      this.log('Your code meets professional standards.', 'green');
      return { success: true, report };
    } else {
      this.log('\n❌ Quality Gate FAILED!', 'red');
      this.log('Please fix the issues above before proceeding.', 'red');
      return { success: false, report };
    }
  }
}

// Run the quality gate
if (require.main === module) {
  const gate = new QualityGate();
  gate.run().then(result => {
    if (!result.success) {
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Quality gate failed:', error);
    process.exit(1);
  });
}

module.exports = QualityGate;
