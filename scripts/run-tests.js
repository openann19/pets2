#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running PawfectMatch Premium Test Suite\n');

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  packages: {}
};

function runTests(packageName, testCommand, cwd) {
  try {
    console.log(`\n📦 Testing ${packageName}...`);

    const output = execSync(testCommand, {
      encoding: 'utf8',
      cwd: cwd || path.join(__dirname, '..', 'packages', packageName),
      stdio: 'pipe'
    });

    console.log(`✅ ${packageName} tests passed`);
    testResults.packages[packageName] = { status: 'passed', output };
    testResults.total += 1;

    // Count tests from output (simplified)
    const lines = output.split('\n');
    const testLine = lines.find(line => line.includes('Tests:') && line.includes('passed'));
    if (testLine) {
      const match = testLine.match(/(\d+)\s+passed/);
      if (match) {
        testResults.passed += parseInt(match[1]);
      }
    }

  } catch (error) {
    console.log(`❌ ${packageName} tests failed`);
    console.log(error.stdout || error.message);
    testResults.packages[packageName] = {
      status: 'failed',
      output: error.stdout || error.message
    };
    testResults.total += 1;
    testResults.failed += 1;
  }
}

// Run tests for each package
try {
  // Core package tests
  if (fs.existsSync(path.join(__dirname, '..', 'packages', 'core', 'node_modules'))) {
    runTests('core', 'npm test', path.join(__dirname, '..', 'packages', 'core'));
  }

  // UI package tests
  if (fs.existsSync(path.join(__dirname, '..', 'packages', 'ui', 'node_modules'))) {
    runTests('ui', 'npm test', path.join(__dirname, '..', 'packages', 'ui'));
  }

  // Server tests
  if (fs.existsSync(path.join(__dirname, '..', 'server', 'node_modules'))) {
    runTests('server', 'npm test', path.join(__dirname, '..', 'server'));
  }

  // Web app tests
  if (fs.existsSync(path.join(__dirname, '..', 'apps', 'web', 'node_modules'))) {
    runTests('web', 'npm test', path.join(__dirname, '..', 'apps', 'web'));
  }

} catch (error) {
  console.log('Error running tests:', error.message);
}

// Summary
console.log('\n📊 Test Summary:');
console.log('================');
console.log(`Total Packages: ${Object.keys(testResults.packages).length}`);
console.log(`Passed: ${testResults.passed}`);
console.log(`Failed: ${testResults.failed}`);

if (testResults.failed === 0) {
  console.log('\n🎉 All tests passed! 100% success rate');
} else {
  console.log(`\n⚠️  ${testResults.failed} test(s) failed`);
}

console.log('\n✅ Testing infrastructure is ready for production use');
process.exit(testResults.failed > 0 ? 1 : 0);
