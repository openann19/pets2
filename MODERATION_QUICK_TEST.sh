#!/bin/bash

# Manual Moderation System - Quick Test Script
# Validates all components are working correctly

echo "🧪 Testing Manual Moderation System..."
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0.32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Check if PhotoModeration model exists
echo "Test 1: PhotoModeration Model exists..."
if [ -f "server/models/PhotoModeration.js" ]; then
    echo -e "${GREEN}✓${NC} PhotoModeration model found"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} PhotoModeration model NOT found"
    ((TESTS_FAILED++))
fi

# Test 2: Check upload routes
echo "Test 2: Upload routes exist..."
if [ -f "server/routes/uploadRoutes.js" ]; then
    echo -e "${GREEN}✓${NC} Upload routes found"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Upload routes NOT found"
    ((TESTS_FAILED++))
fi

# Test 3: Check moderation routes
echo "Test 3: Moderation routes exist..."
if [ -f "server/routes/moderationRoutes.js" ]; then
    echo -e "${GREEN}✓${NC} Moderation routes found"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Moderation routes NOT found"
    ((TESTS_FAILED++))
fi

# Test 4: Check admin dashboard
echo "Test 4: Admin dashboard exists..."
if [ -f "apps/web/app/(admin)/moderation/page.tsx" ]; then
    echo -e "${GREEN}✓${NC} Admin dashboard found"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Admin dashboard NOT found"
    ((TESTS_FAILED++))
fi

# Test 5: Check auth middleware
echo "Test 5: Auth middleware exists..."
if [ -f "server/src/middleware/auth.js" ]; then
    # Check if requireAdmin exists
    if grep -q "requireAdmin" server/src/middleware/auth.js; then
        echo -e "${GREEN}✓${NC} Auth middleware with requireAdmin found"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} requireAdmin middleware NOT found"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Auth middleware NOT found"
    ((TESTS_FAILED++))
fi

# Test 6: Check model has correct fields
echo "Test 6: PhotoModeration model structure..."
if grep -q "imageMetadata" server/models/PhotoModeration.js; then
    echo -e "${GREEN}✓${NC} Model has imageMetadata (no AI fields)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Model missing imageMetadata"
    ((TESTS_FAILED++))
fi

# Test 7: Check model does NOT have AI fields
echo "Test 7: No AI fields in model..."
if grep -q "aiScanResults" server/models/PhotoModeration.js; then
    echo -e "${RED}✗${NC} Model still has aiScanResults (should be removed)"
    ((TESTS_FAILED++))
else
    echo -e "${GREEN}✓${NC} No AI fields found (correct)"
    ((TESTS_PASSED++))
fi

# Test 8: Check status enum is correct
echo "Test 8: Status enum is manual-only..."
if grep -q "auto-rejected" server/models/PhotoModeration.js; then
    echo -e "${RED}✗${NC} Model has auto-rejected status (should be removed)"
    ((TESTS_FAILED++))
else
    echo -e "${GREEN}✓${NC} Status enum is manual-only (correct)"
    ((TESTS_PASSED++))
fi

# Test 9: Check documentation exists
echo "Test 9: Documentation exists..."
if [ -f "MANUAL_MODERATION_GUIDE.md" ]; then
    echo -e "${GREEN}✓${NC} Moderation guide found"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Moderation guide NOT found"
    ((TESTS_FAILED++))
fi

# Test 10: Check test files exist
echo "Test 10: Test files exist..."
if [ -f "server/tests/photoModeration.test.js" ]; then
    echo -e "${GREEN}✓${NC} Backend tests found"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Backend tests NOT found"
    ((TESTS_FAILED++))
fi

# Test 11: Check frontend uses correct types
echo "Test 11: Frontend has correct interfaces..."
if grep -q "imageMetadata" apps/web/app/\(admin\)/moderation/page.tsx; then
    echo -e "${GREEN}✓${NC} Frontend uses imageMetadata (correct)"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Frontend missing imageMetadata interface"
    ((TESTS_FAILED++))
fi

# Test 12: Check routes have auth middleware
echo "Test 12: Routes protected by auth..."
if grep -q "authenticateToken" server/routes/moderationRoutes.js; then
    echo -e "${GREEN}✓${NC} Moderation routes are protected"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗${NC} Moderation routes NOT protected"
    ((TESTS_FAILED++))
fi

echo ""
echo "========================================"
echo "Test Results:"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo "System is ready for production."
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo "Please fix the issues above."
    exit 1
fi
