#!/bin/bash

# Script to identify common import/export issues in test files
# Helps prioritize fixes by impact

echo "🔍 Finding Import/Export Issues..."
echo "===================================="
echo ""

# Temporary files
FAILED_TESTS="/tmp/failed_import_tests.txt"
ERROR_PATTERNS="/tmp/error_patterns.txt"

echo "📝 Running tests to collect errors..."
echo "(This may take a few minutes)"
echo ""

# Run tests and capture failures
npm test --silent 2>&1 | tee /tmp/test_output.txt > /dev/null

# Extract unique error patterns
echo "📊 Analyzing error patterns..."
echo ""

# Pattern 1: Cannot find module
echo "1️⃣  Missing Modules:"
grep -i "cannot find module\|module not found" /tmp/test_output.txt | \
  sed "s/.*Cannot find module '\([^']*\)'.*/\1/" | \
  sed "s/.*Module not found: Error: Can't resolve '\([^']*\)'.*/\1/" | \
  sort | uniq -c | sort -rn | head -15
echo ""

# Pattern 2: Missing exports
echo "2️⃣  Missing Exports:"
grep -i "does not provide an export\|is not exported" /tmp/test_output.txt | \
  sed "s/.*'\([^']*\)'.*does not provide an export named '\([^']*\)'.*/\1 -> \2/" | \
  sort | uniq -c | sort -rn | head -10
echo ""

# Pattern 3: Syntax/Transform errors
echo "3️⃣  Transform/Syntax Errors:"
grep -i "SyntaxError:\|unexpected token\|Jest encountered" /tmp/test_output.txt | \
  grep -v "at Object\|at Runtime\|at " | \
  head -10
echo ""

# Pattern 4: Type errors in tests
echo "4️⃣  Type Errors:"
grep -i "TS[0-9]*:\|Type.*is not assignable" /tmp/test_output.txt | \
  head -10
echo ""

# Count failures by directory
echo "5️⃣  Failures by Directory:"
grep "FAIL src/" /tmp/test_output.txt | \
  sed 's/.*FAIL src\/\([^/]*\)\/.*/\1/' | \
  sort | uniq -c | sort -rn | head -10
echo ""

# Top failing test files
echo "6️⃣  Top 10 Failing Test Files:"
grep "FAIL src/" /tmp/test_output.txt | \
  sed 's/.*FAIL \(src\/.*\.test\.tsx*\).*/\1/' | \
  head -10
echo ""

# Summary stats
echo "📈 Summary:"
echo "----------"
TOTAL_FAILURES=$(grep "FAIL src/" /tmp/test_output.txt | wc -l)
echo "Total failing test suites: $TOTAL_FAILURES"

MODULE_ERRORS=$(grep -i "cannot find module\|module not found" /tmp/test_output.txt | wc -l)
echo "Module not found errors: $MODULE_ERRORS"

EXPORT_ERRORS=$(grep -i "does not provide an export" /tmp/test_output.txt | wc -l)
echo "Missing export errors: $EXPORT_ERRORS"

SYNTAX_ERRORS=$(grep -i "SyntaxError" /tmp/test_output.txt | wc -l)
echo "Syntax/Transform errors: $SYNTAX_ERRORS"

echo ""
echo "✅ Analysis complete!"
echo "Full output saved to /tmp/test_output.txt"
echo ""
echo "🎯 Recommended Actions:"
echo "1. Fix missing modules (highest impact: $MODULE_ERRORS instances)"
echo "2. Add missing exports ($EXPORT_ERRORS instances)"
echo "3. Fix syntax/transform errors ($SYNTAX_ERRORS instances)"
