#!/bin/bash

# Run Subscription Tests
# This script runs all tests related to premium subscriptions
# and generates a report of the results

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   PawfectMatch Subscription Test Suite   ${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Create reports directory if it doesn't exist
mkdir -p ./reports

# Define test categories
echo -e "${YELLOW}Preparing to run subscription tests in categories:${NC}"
echo "1. Premium Feature Access Tests"
echo "2. Stripe Integration Tests"
echo "3. Webhook Handling Tests"
echo "4. Security Tests"
echo ""

# Run tests with Jest
echo -e "${BLUE}Running tests...${NC}"

# Premium Feature Access Tests
echo -e "${YELLOW}Running Premium Feature Access Tests...${NC}"
npx jest tests/integration/premium/premium-feature-race-conditions.test.js --json --outputFile=./reports/premium-features.json || true
echo ""

# Stripe Integration Tests
echo -e "${YELLOW}Running Stripe Integration Tests...${NC}"
npx jest tests/integration/premium/stripe-checkout.test.js --json --outputFile=./reports/stripe-integration.json || true
echo ""

# Webhook Handling Tests
echo -e "${YELLOW}Running Webhook Handling Tests...${NC}"
npx jest tests/integration/premium/webhook-resilience.test.js --json --outputFile=./reports/webhook-handling.json || true
echo ""

# Security Tests
echo -e "${YELLOW}Running Security Tests...${NC}"
npx jest tests/security/premium-access-validation.test.js --json --outputFile=./reports/security.json || true
echo ""

# Compile results
echo -e "${BLUE}Compiling test results...${NC}"
node -e "
const fs = require('fs');
const path = require('path');

const reports = [
  'premium-features.json',
  'stripe-integration.json',
  'webhook-handling.json',
  'security.json'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const results = {};

reports.forEach(report => {
  try {
    const data = fs.readFileSync(path.join('./reports', report), 'utf8');
    const parsed = JSON.parse(data);
    
    if (parsed && parsed.numTotalTests) {
      totalTests += parsed.numTotalTests;
      passedTests += parsed.numPassedTests;
      failedTests += parsed.numFailedTests;
      
      results[report.replace('.json', '')] = {
        total: parsed.numTotalTests,
        passed: parsed.numPassedTests,
        failed: parsed.numFailedTests,
        time: parsed.testResults[0]?.perfStats?.runtime || 0
      };
    }
  } catch (err) {
    console.log('Could not read report: ' + report);
  }
});

// Generate summary
const summary = {
  date: new Date().toISOString(),
  totalTests,
  passedTests,
  failedTests,
  passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
  categories: results
};

fs.writeFileSync('./reports/subscription-test-summary.json', JSON.stringify(summary, null, 2));

// Output results
console.log('Test Summary:');
console.log('=============');
console.log(\`Total Tests: \${totalTests}\`);
console.log(\`Passed: \${passedTests}\`);
console.log(\`Failed: \${failedTests}\`);
console.log(\`Pass Rate: \${summary.passRate}%\`);
console.log('');
console.log('Category Results:');

Object.keys(results).forEach(category => {
  const r = results[category];
  console.log(\`\${category}: \${r.passed}/\${r.total} passed (\${Math.round((r.passed/r.total)*100)}%) in \${r.time}ms\`);
});
"

# Check if any tests failed
if [ -f "./reports/subscription-test-summary.json" ]; then
  FAILED_TESTS=$(grep -o '"failedTests":[0-9]*' ./reports/subscription-test-summary.json | grep -o '[0-9]*')
  
  if [ "$FAILED_TESTS" -gt 0 ]; then
    echo -e "${RED}Tests completed with $FAILED_TESTS failures.${NC}"
    exit 1
  else
    echo -e "${GREEN}All tests passed successfully!${NC}"
    exit 0
  fi
else
  echo -e "${RED}Error generating test summary.${NC}"
  exit 1
fi
