#!/bin/bash
# Verify no type suppressions in source code
# Enforces Type Supremacy + Resilience principles

set -euo pipefail

echo "🔍 Scanning for type suppressions..."

ERRORS=0

# Check for TS suppressions in source
TS_SUPPRESS=$(grep -r --include="*.ts" --include="*.tsx" \
  --exclude="*.test.*" --exclude="*.spec.*" --exclude="*eslint*" \
  -e "@ts-ignore" -e "@ts-nocheck" \
  apps/web/src packages/*/src 2>/dev/null || true)

if [ -n "$TS_SUPPRESS" ]; then
  echo "❌ Found @ts-ignore or @ts-nocheck in source files:"
  echo "$TS_SUPPRESS"
  echo ""
  echo "Fix: Remove suppression and fix the underlying type error"
  ERRORS=$((ERRORS + 1))
fi

# Check for @ts-expect-error without description
TS_EXPECT_ERROR=$(grep -r --include="*.ts" --include="*.tsx" \
  --exclude="*.test.*" --exclude="*.spec.*" \
  -B1 "@ts-expect-error" apps/web/src packages/*/src 2>/dev/null | \
  grep -E "@ts-expect-error$|@ts-expect-error\s*$|@ts-expect-error\s{1,9}[^\s]" || true)

if [ -n "$TS_EXPECT_ERROR" ]; then
  echo "❌ Found @ts-expect-error without proper description (min 10 chars):"
  echo "$TS_EXPECT_ERROR"
  echo ""
  echo "Fix: Add description explaining why suppression is needed"
  ERRORS=$((ERRORS + 1))
fi

# Check for eslint-disable in source (excluding logger files and specific allowed patterns)
ESLINT_DISABLE=$(grep -r --include="*.ts" --include="*.tsx" \
  --exclude="*eslint*" --exclude="*.test.*" --exclude="*.spec.*" \
  --exclude="*logger.ts" --exclude="*logger.tsx" \
  -e "eslint-disable" \
  apps/web/src packages/*/src 2>/dev/null || true)

if [ -n "$ESLINT_DISABLE" ]; then
  echo "❌ Found eslint-disable comments in source files:"
  echo "$ESLINT_DISABLE"
  echo ""
  echo "Fix: Remove suppression and fix the underlying lint error"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "✅ No type suppressions found!"
  echo ""
  echo "Type Supremacy enforced:"
  echo "  • No @ts-ignore"
  echo "  • No @ts-nocheck  "
  echo "  • All @ts-expect-error have descriptions"
  echo "  • No eslint-disable (except logger files)"
  exit 0
else
  echo ""
  echo "Found $ERRORS suppression violation(s)"
  echo ""
  echo "💡 Principles:"
  echo "  • Type Supremacy: Fix types, don't suppress"
  echo "  • Resilience: Catch bugs at compile time"
  echo "  • Maintainability: No hidden technical debt"
  exit 1
fi
