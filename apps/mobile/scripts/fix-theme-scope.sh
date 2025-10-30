#!/bin/bash
# Fix "Cannot find name 'theme'" errors by moving styles inside components
# This script identifies files with the pattern and provides fixes

set -e

echo "🔧 Mobile Theme Error Fixer"
echo "=========================="
echo ""

cd "$(dirname "$0")/.."

# Find files with style definitions that reference theme
echo "Finding files with theme scope errors..."
FILES=$(find src/screens src/components -name "*.tsx" -type f 2>/dev/null | head -20)

for file in $FILES; do
    if [ -f "$file" ]; then
        # Check if file has styles defined outside component scope that reference theme
        if grep -q "const styles = StyleSheet.create" "$file" && grep -q "backgroundColor: theme.colors" "$file"; then
            echo "⚠️  $file - May need manual review"
        fi
    fi
done

echo ""
echo "✅ Review complete. Use manual fixes for complex files."
echo ""
echo "Pattern to fix:"
echo "  BEFORE: Styles defined outside component using 'theme'"
echo "  AFTER:  Move styles inside component after useTheme() hook"

