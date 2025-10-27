#!/bin/bash

# Test Failure Analysis Script
# Extracts and categorizes common test failures

echo "🔍 Analyzing Test Failures..."
echo "================================"

# Run tests and capture output
TEST_OUTPUT=$(npm test 2>&1)

# Extract all FAIL lines
echo "$TEST_OUTPUT" | grep "FAIL src/" > /tmp/failed-tests.txt

echo ""
echo "📊 Failure Statistics"
echo "================================"

# Count total failures
TOTAL_FAILURES=$(cat /tmp/failed-tests.txt | wc -l)
echo "Total Failed Suites: $TOTAL_FAILURES"

# Failures by directory
echo ""
echo "Top Failing Directories:"
cat /tmp/failed-tests.txt | cut -d'/' -f2-3 | sort | uniq -c | sort -rn | head -10

# Extract common error patterns
echo ""
echo "🔴 Common Error Patterns"
echo "================================"

# Cannot find module errors
echo ""
echo "Import/Module Errors:"
echo "$TEST_OUTPUT" | grep -i "cannot find module" | sort | uniq -c | sort -rn | head -10

# Type errors
echo ""
echo "Type Errors:"
echo "$TEST_OUTPUT" | grep -i "type.*is not assignable" | sort | uniq -c | sort -rn | head -5

# Async/timeout errors
echo ""
echo "Async/Timeout Errors:"
echo "$TEST_OUTPUT" | grep -i "exceeded timeout\|async" | sort | uniq -c | sort -rn | head -5

# Undefined/null errors
echo ""
echo "Undefined/Null Errors:"
echo "$TEST_OUTPUT" | grep -i "cannot read property.*undefined\|is not a function" | sort | uniq -c | sort -rn | head -5

echo ""
echo "✅ Analysis complete. Check /tmp/failed-tests.txt for full list."
