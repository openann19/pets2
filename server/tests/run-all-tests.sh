#!/bin/bash
#
# Comprehensive Test Suite Execution Script
# Runs all community API test suites in order
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Running Comprehensive Test Suite${NC}"
echo "=================================="

# Change to server directory
cd "$(dirname "$0")/../.." || exit 1

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from server directory${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed. Installing...${NC}"
    pnpm install
fi

# Test suites to run in order
TEST_SUITES=(
    "tests/integration/community.race-idempotency.test.ts"
    "tests/integration/community.property-based.test.ts"
    "tests/integration/community.moderation-fail-closed.test.ts"
    "tests/integration/community.authz-blocklist.test.ts"
    "tests/integration/community.offline-outbox-sync.test.ts"
    "tests/integration/community.security-input-hardening.test.ts"
    "tests/integration/community.contract-schema.test.ts"
    "tests/integration/community.observability.test.ts"
)

# Counters
PASSED=0
FAILED=0
TOTAL=${#TEST_SUITES[@]}

echo ""
echo "Running $TOTAL test suites..."
echo ""

# Run each test suite
for suite in "${TEST_SUITES[@]}"; do
    if [ ! -f "$suite" ]; then
        echo -e "${YELLOW}⚠️  Test suite not found: $suite${NC}"
        FAILED=$((FAILED + 1))
        continue
    fi
    
    echo -e "${YELLOW}▶️  Running: $suite${NC}"
    
    if pnpm test "$suite" --passWithNoTests; then
        echo -e "${GREEN}✅ Passed: $suite${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ Failed: $suite${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    echo ""
done

# Summary
echo "=================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed: $FAILED${NC}"
else
    echo -e "${GREEN}❌ Failed: $FAILED${NC}"
fi
echo "Total: $TOTAL"
echo ""

# Exit with error if any tests failed
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Some test suites failed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All test suites passed!${NC}"
    exit 0
fi

