#!/bin/bash

# PawfectMatch Mobile App Verification Script
# This script validates the mobile app is ready for deployment

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$REPO_ROOT/apps/mobile"

echo "🐾 PawfectMatch Mobile App Verification"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SUCCESS=0
WARNINGS=0
FAILURES=0

print_status() {
    if [ "$1" == "success" ]; then
        echo -e "${GREEN}✓${NC} $2"
        SUCCESS=$((SUCCESS + 1))
    elif [ "$1" == "warning" ]; then
        echo -e "${YELLOW}⚠${NC} $2"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}✗${NC} $2"
        FAILURES=$((FAILURES + 1))
    fi
}

# 1. Check if core package builds
echo "1. Checking core package..."
cd "$REPO_ROOT/packages/core"
if pnpm build > /dev/null 2>&1; then
    print_status "success" "Core package builds successfully"
else
    print_status "failure" "Core package failed to build"
fi

# 2. Check if design tokens exist
echo ""
echo "2. Checking design tokens..."
if [ -f "$REPO_ROOT/packages/design-tokens/dist/react-native.ts" ]; then
    print_status "success" "Design tokens generated"
else
    print_status "warning" "Design tokens not found, attempting to generate..."
    cd "$REPO_ROOT/packages/design-tokens"
    if node build.js > /dev/null 2>&1; then
        print_status "success" "Design tokens generated successfully"
    else
        print_status "failure" "Failed to generate design tokens"
    fi
fi

# 3. Check mobile app structure
echo ""
echo "3. Checking mobile app structure..."
cd "$MOBILE_DIR"

if [ -f "App.tsx" ] && [ -f "app.json" ] && [ -f "package.json" ]; then
    print_status "success" "Mobile app structure is valid"
else
    print_status "failure" "Mobile app structure is incomplete"
fi

# 4. Check theme system
echo ""
echo "4. Checking theme system..."
if [ -f "src/theme/theme.ts" ] && [ -f "src/theme/useTheme.ts" ]; then
    print_status "success" "Theme system files exist"
    
    # Check if key components use theme
    THEME_USAGE=$(grep -r "useTheme" src/screens/*.tsx 2>/dev/null | wc -l)
    if [ "$THEME_USAGE" -gt 10 ]; then
        print_status "success" "Theme is used in $THEME_USAGE screen files"
    else
        print_status "warning" "Theme usage is limited ($THEME_USAGE screens)"
    fi
else
    print_status "failure" "Theme system is incomplete"
fi

# 5. Check UI components
echo ""
echo "5. Checking UI components..."
if [ -d "src/components/ui" ]; then
    UI_COMPONENTS=$(ls src/components/ui/*.tsx 2>/dev/null | wc -l)
    if [ "$UI_COMPONENTS" -gt 0 ]; then
        print_status "success" "Found $UI_COMPONENTS themed UI components"
    else
        print_status "warning" "No themed UI components found"
    fi
else
    print_status "failure" "UI components directory not found"
fi

# 6. Check navigation types
echo ""
echo "6. Checking navigation configuration..."
if [ -f "src/navigation/types.ts" ]; then
    print_status "success" "Navigation types defined"
    
    # Count registered routes
    ROUTES=$(grep -c ":" src/navigation/types.ts 2>/dev/null || echo "0")
    print_status "success" "Found $ROUTES navigation routes defined"
else
    print_status "warning" "Navigation types not found"
fi

# 7. Check test files
echo ""
echo "7. Checking test coverage..."
TEST_COUNT=$(find src -name "*.test.ts*" 2>/dev/null | wc -l)
SCREEN_COUNT=$(find src/screens -name "*.tsx" -not -path "*/\__tests__/*" 2>/dev/null | wc -l)

if [ "$TEST_COUNT" -gt 0 ]; then
    COVERAGE_PERCENT=$((TEST_COUNT * 100 / SCREEN_COUNT))
    print_status "success" "Found $TEST_COUNT test files ($COVERAGE_PERCENT% screen coverage)"
else
    print_status "warning" "No test files found"
fi

# 8. Check environment configuration
echo ""
echo "8. Checking environment configuration..."
if [ -f ".env.example" ]; then
    print_status "success" "Environment example file exists"
else
    print_status "warning" "No .env.example file found"
fi

# 9. Check for duplicate screens
echo ""
echo "9. Checking for duplicate screens..."
DUPLICATES=0
if [ -f "src/screens/AICompatibilityScreen.tsx" ] && [ -f "src/screens/ai/AICompatibilityScreen.tsx" ]; then
    print_status "warning" "Duplicate: AICompatibilityScreen (root and ai/)"
    DUPLICATES=$((DUPLICATES + 1))
fi
if [ -f "src/screens/AIPhotoAnalyzerScreen.tsx" ] && [ -f "src/screens/ai/AIPhotoAnalyzerScreen.tsx" ]; then
    print_status "warning" "Duplicate: AIPhotoAnalyzerScreen (root and ai/)"
    DUPLICATES=$((DUPLICATES + 1))
fi
if [ -f "src/screens/SwipeScreen.tsx" ] && [ -f "src/screens/ModernSwipeScreen.tsx" ]; then
    print_status "warning" "Duplicate: SwipeScreen vs ModernSwipeScreen"
    DUPLICATES=$((DUPLICATES + 1))
fi
if [ -f "src/screens/CreatePetScreen.tsx" ] && [ -f "src/screens/ModernCreatePetScreen.tsx" ]; then
    print_status "warning" "Duplicate: CreatePetScreen vs ModernCreatePetScreen"
    DUPLICATES=$((DUPLICATES + 1))
fi
if [ "$DUPLICATES" -eq 0 ]; then
    print_status "success" "No duplicate screens detected"
fi

# 10. Check TypeScript configuration
echo ""
echo "10. Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    print_status "success" "TypeScript configured"
    
    # Check if strict mode is enabled
    if grep -q '"strict": true' tsconfig.json 2>/dev/null; then
        print_status "success" "TypeScript strict mode enabled"
    else
        print_status "warning" "TypeScript strict mode not explicitly enabled"
    fi
else
    print_status "failure" "No TypeScript configuration found"
fi

# Summary
echo ""
echo "========================================"
echo "📊 Verification Summary"
echo "========================================"
echo -e "${GREEN}Successes:${NC} $SUCCESS"
echo -e "${YELLOW}Warnings:${NC}  $WARNINGS"
echo -e "${RED}Failures:${NC}  $FAILURES"
echo ""

# Overall status
if [ "$FAILURES" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}✓ EXCELLENT${NC} - Mobile app is in perfect condition!"
        exit 0
    elif [ "$WARNINGS" -lt 5 ]; then
        echo -e "${GREEN}✓ GOOD${NC} - Mobile app is ready with minor items to address"
        exit 0
    else
        echo -e "${YELLOW}⚠ FAIR${NC} - Mobile app is functional but has several warnings"
        exit 0
    fi
else
    echo -e "${RED}✗ ATTENTION NEEDED${NC} - Mobile app has $FAILURES critical issues"
    exit 1
fi
