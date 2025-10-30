#!/bin/bash
# 🎨 Theme Token Enforcement Script
# CI check for raw colors/sizes in code
# Based on UI & Motion Contract

set -e

echo "🎨 Checking for raw colors and sizes in code..."
echo ""

# Colors to search for
COLOR_COUNT=$(grep -r "color: '#" apps/mobile/src 2>/dev/null | wc -l || echo "0")
HEX_COUNT=$(grep -r "color: '#" apps/mobile/src 2>/dev/null | wc -l || echo "0")

# Border radius to search for
RADIUS_COUNT=$(grep -r "borderRadius: [0-9]" apps/mobile/src 2>/dev/null | wc -l || echo "0")

# Spacing to search for
PADDING_COUNT=$(grep -r "padding: [0-9]" apps/mobile/src 2>/dev/null | wc -l || echo "0")
MARGIN_COUNT=$(grep -r "margin: [0-9]" apps/mobile/src 2>/dev/null | wc -l || echo "0")

# Opacity to search for
OPACITY_COUNT=$(grep -r "opacity: [0-9]\." apps/mobile/src 2>/dev/null | wc -l || echo "0")

# Font size to search for
FONT_SIZE_COUNT=$(grep -r "fontSize: [0-9]" apps/mobile/src 2>/dev/null | wc -l || echo "0")

echo "Raw hex colors: $HEX_COUNT"
echo "Raw border radius: $RADIUS_COUNT"
echo "Raw padding: $PADDING_COUNT"
echo "Raw margin: $MARGIN_COUNT"
echo "Raw opacity: $OPACITY_COUNT"
echo "Raw font size: $FONT_SIZE_COUNT"

TOTAL_VIOLATIONS=$((HEX_COUNT + RADIUS_COUNT + PADDING_COUNT + MARGIN_COUNT + OPACITY_COUNT + FONT_SIZE_COUNT))

if [ $TOTAL_VIOLATIONS -eq 0 ]; then
  echo ""
  echo "✅ All theme tokens are properly used!"
  exit 0
else
  echo ""
  echo "❌ Found $TOTAL_VIOLATIONS raw style violations"
  echo ""
  echo "Please use Theme tokens instead:"
  echo "  - Theme.colors.* for colors"
  echo "  - Theme.borderRadius.* for border radius"
  echo "  - Theme.spacing.* for spacing"
  echo "  - Theme.typography.fontSize.* for font sizes"
  echo ""
  echo "See: apps/mobile/UI_MOTION_CONTRACT.md for details"
  exit 1
fi

