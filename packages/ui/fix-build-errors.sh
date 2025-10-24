#!/bin/bash
# Comprehensive UI Package Build Fixer
# Addresses systematic TypeScript errors to enable package build
# October 2025 - PawfectMatch Premium

set -e

echo "🔧 Starting UI Package Build Fixes..."
echo ""

cd "$(dirname "$0")"

# ==================================
# 1. Fix JSX namespace errors
# ==================================
echo "📝 Adding React JSX type imports to files with JSX namespace errors..."

for file in \
  "src/components/AIFeatures/GestureInteraction.tsx" \
  "src/components/AIFeatures/VoiceInteraction.tsx" \
  "src/components/DarkModeToggle/DarkModeToggle.tsx" \
  "src/components/Premium/PremiumInput.tsx"
do
  if [ -f "$file" ]; then
    # Check if React import exists
    if ! grep -q "import.*React" "$file"; then
      # Add at top after any existing imports
      sed -i.bak '1i\
import React from '\''react'\'';
' "$file" && rm "${file}.bak"
      echo "  ✅ Added React import to $file"
    elif grep -q "import React," "$file" && ! grep -q "type JSX" "$file"; then
      # React exists but JSX type missing - update import
      sed -i.bak "s/import React,/import React, { type JSX },/g" "$file" && rm "${file}.bak"
      echo "  ✅ Added JSX type to existing React import in $file"
    else
      echo "  ℹ️  $file already has React import"
    fi
  fi
done

echo ""

# ==================================
# 2. Fix verbatimModuleSyntax violations
# ==================================
echo "📝 Fixing type-only imports (ErrorInfo, ReactNode)..."

for file in \
  "src/components/ErrorBoundary/EnhancedErrorBoundary.tsx" \
  "src/components/ErrorBoundary/ErrorBoundary.tsx" \
  "src/components/Payment/PaymentErrorBoundary.tsx" \
  "src/components/Feedback/UserFeedbackSystem.tsx"
do
  if [ -f "$file" ]; then
    # Fix ErrorInfo and ReactNode to be type-only imports
    sed -i.bak -E "s/import React, \{ (.*)(ErrorInfo|ReactNode)(.*) \} from 'react'/import React, { \1type \2\3 } from 'react'/g" "$file" 2>/dev/null || true
    sed -i.bak -E "s/, (ErrorInfo|ReactNode),/, type \1,/g" "$file" && rm "${file}.bak"
    echo "  ✅ Fixed type-only imports in $file"
  fi
done

echo ""

# ==================================
# 3. Stub out cross-package imports
# ==================================
echo "📝 Removing invalid cross-package imports..."

# EnhancedErrorBoundary
file="src/components/ErrorBoundary/EnhancedErrorBoundary.tsx"
if [ -f "$file" ]; then
  sed -i.bak "/import.*from '.*core\/src\/services\/ErrorHandler'/d" "$file"
  sed -i.bak "/import.*from '.*core\/src\/services\/Logger'/d" "$file" && rm "${file}.bak"
  echo "  ✅ Removed cross-package imports from $file"
fi

# ErrorBoundary
file="src/components/ErrorBoundary/ErrorBoundary.tsx"
if [ -f "$file" ]; then
  sed -i.bak "/import.*from '.*web\/src\/services\/logger'/d" "$file" && rm "${file}.bak"
  echo "  ✅ Removed cross-package imports from $file"
fi

# PaymentErrorBoundary
file="src/components/Payment/PaymentErrorBoundary.tsx"
if [ -f "$file" ]; then
  sed -i.bak "/import.*from '.*core\/src\/services\/ErrorHandler'/d" "$file"
  sed -i.bak "/import.*from '.*core\/src\/services\/Logger'/d" "$file" && rm "${file}.bak"
  echo "  ✅ Removed cross-package imports from $file"
fi

# UserFeedbackSystem
file="src/components/Feedback/UserFeedbackSystem.tsx"
if [ -f "$file" ]; then
  sed -i.bak "/import.*from '.*core\/src\/services\/ErrorHandler'/d" "$file"
  sed -i.bak "/import.*from '.*core\/src\/services\/Logger'/d" "$file" && rm "${file}.bak"
  echo "  ✅ Removed cross-package imports from $file"
fi

echo ""

# ==================================
# 4. Add stub logger/errorHandler
# ==================================
echo "📝 Adding stub logger/errorHandler constants..."

for file in \
  "src/components/ErrorBoundary/EnhancedErrorBoundary.tsx" \
  "src/components/Payment/PaymentErrorBoundary.tsx" \
  "src/components/Feedback/UserFeedbackSystem.tsx"
do
  if [ -f "$file" ] && ! grep -q "const logger = " "$file"; then
    # Add after imports, before first export/const
    sed -i.bak '/^import/,/^$/!b; /^$/a\
\
// Stub logger for UI package build\
const logger = {\
  error: (msg: string, ...args: any[]) => console.error(msg, ...args),\
  warn: (msg: string, ...args: any[]) => console.warn(msg, ...args),\
  info: (msg: string, ...args: any[]) => console.log(msg, ...args),\
};
' "$file" && rm "${file}.bak"
    echo "  ✅ Added stub logger to $file"
  fi
done

# UserFeedbackSystem has unused errorHandler declaration
file="src/components/Feedback/UserFeedbackSystem.tsx"
if [ -f "$file" ] && grep -q "errorHandler is declared but" < <(cd ../.. && pnpm build 2>&1); then
  sed -i.bak "/const errorHandler = /d" "$file" && rm "${file}.bak"
  echo "  ✅ Removed unused errorHandler from $file"
fi

# ErrorBoundary.tsx needs logger
file="src/components/ErrorBoundary/ErrorBoundary.tsx"
if [ -f "$file" ] && ! grep -q "const logger = " "$file"; then
  sed -i.bak '/^import/,/^$/!b; /^$/a\
\
// Stub logger for UI package build\
const logger = {\
  error: (msg: string, ...args: any[]) => console.error(msg, ...args),\
  warn: (msg: string, ...args: any[]) => console.warn(msg, ...args),\
  info: (msg: string, ...args: any[]) => console.log(msg, ...args),\
};
' "$file" && rm "${file}.bak"
  echo "  ✅ Added stub logger to $file"
fi

echo ""

# ==================================
# 5. Add override modifiers
# ==================================
echo "📝 Adding override modifiers to class methods..."

for file in \
  "src/components/ErrorBoundary/EnhancedErrorBoundary.tsx" \
  "src/components/ErrorBoundary/ErrorBoundary.tsx" \
  "src/components/Payment/PaymentErrorBoundary.tsx"
do
  if [ -f "$file" ]; then
    # Add override to componentDidCatch, getDerivedStateFromError, render
    sed -i.bak -E 's/^(  )(static getDerivedStateFromError)/\1override \2/g' "$file"
    sed -i.bak -E 's/^(  )(componentDidCatch)/\1override \2/g' "$file"
    sed -i.bak -E 's/^(  )(render\(\))/\1override \2/g' "$file" && rm "${file}.bak"
    echo "  ✅ Added override modifiers to $file"
  fi
done

echo ""

# ==================================
# 6. Fix react-aria imports
# ==================================
echo "📝 Fixing react-aria imports..."

# Button.tsx
file="src/components/Button/Button.tsx"
if [ -f "$file" ]; then
  # Fix AriaButtonProps import
  sed -i.bak "s/import { AriaButtonProps }/import { type AriaButtonProps }/g" "$file" && rm "${file}.bak"
  echo "  ✅ Fixed AriaButtonProps import in $file"
fi

# Input.tsx
file="src/components/Input/Input.tsx"
if [ -f "$file" ] && grep -q "Cannot find name 'useTextField'" < <(cd ../.. && pnpm build 2>&1 | grep Input.tsx); then
  # Add react-aria imports
  if ! grep -q "import.*useTextField.*from 'react-aria'" "$file"; then
    sed -i.bak '1a\
import { useTextField, type AriaTextFieldProps, useFocusRing } from '\''react-aria'\'';
' "$file" && rm "${file}.bak"
    echo "  ✅ Added react-aria imports to $file"
  fi
fi

# Card.tsx
file="src/components/Card/Card.tsx"
if [ -f "$file" ] && grep -q "Cannot find name 'useFocusRing'" < <(cd ../.. && pnpm build 2>&1 | grep Card.tsx); then
  if ! grep -q "import.*useFocusRing.*from 'react-aria'" "$file"; then
    sed -i.bak '1a\
import { useFocusRing, useHover, mergeProps } from '\''react-aria'\'';
' "$file" && rm "${file}.bak"
    echo "  ✅ Added react-aria imports to $file"
  fi
fi

echo ""

# ==================================
# 7. Remove unused variables
# ==================================
echo "📝 Removing unused variables..."

# ChatBubbleLeftIcon in EnhancedErrorBoundary
file="src/components/ErrorBoundary/EnhancedErrorBoundary.tsx"
if [ -f "$file" ]; then
  sed -i.bak "s/ChatBubbleLeftIcon, //g" "$file"
  sed -i.bak "s/, ChatBubbleLeftIcon//g" "$file" && rm "${file}.bak"
  echo "  ✅ Removed unused ChatBubbleLeftIcon from $file"
fi

# ExclamationTriangleIcon in PaymentErrorBoundary
file="src/components/Payment/PaymentErrorBoundary.tsx"
if [ -f "$file" ]; then
  sed -i.bak "s/ExclamationTriangleIcon, //g" "$file"
  sed -i.bak "s/, ExclamationTriangleIcon//g" "$file" && rm "${file}.bak"
  echo "  ✅ Removed unused ExclamationTriangleIcon from $file"
fi

# React import in files using only types
for file in \
  "src/components/ErrorBoundary/EnhancedErrorBoundary.tsx" \
  "src/components/Payment/PaymentErrorBoundary.tsx"
do
  if [ -f "$file" ] && grep -q "'React' is declared but its value is never read" < <(cd ../.. && pnpm build 2>&1); then
    # These files actually DO use React (they're class components), so the error is incorrect
    # But we can silence it by ensuring React is used in JSX
    echo "  ℹ️  React unused warning in $file (false positive for class components)"
  fi
done

echo ""

echo "✅ All systematic fixes applied!"
echo ""
echo "Next: Build the package with 'pnpm build' to verify remaining errors."
echo "      Remaining issues will be Framer Motion className errors (~40) which require manual component updates or 'as any' assertions."
