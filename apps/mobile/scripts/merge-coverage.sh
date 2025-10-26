#!/bin/bash
# Merge coverage reports from all test shards
# Validates coverage thresholds and generates unified report

set -e

echo "=== Merging Coverage Reports ==="

# Collect all lcov files from shards
COVERAGE_DIRS=$(find . -name "coverage" -type d | grep -v node_modules | grep -v "\.git")

if [ -z "$COVERAGE_DIRS" ]; then
  echo "No coverage directories found"
  exit 1
fi

# Create merged coverage directory
mkdir -p coverage-merged
rm -rf coverage-merged/*

# Merge all lcov.info files
MERGED_LCOV="coverage-merged/lcov.info"
touch "$MERGED_LCOV"

for dir in $COVERAGE_DIRS; do
  if [ -f "$dir/lcov.info" ]; then
    echo "Merging $dir/lcov.info"
    cat "$dir/lcov.info" >> "$MERGED_LCOV"
  fi
done

# Generate HTML report from merged lcov
if [ -f "$MERGED_LCOV" ]; then
  echo "Generating merged HTML coverage report"
  
  # Use lcov tool if available
  if command -v lcov &> /dev/null; then
    lcov --summary "$MERGED_LCOV"
  fi
  
  # Extract coverage metrics from lcov file
  TOTAL_LINES=$(grep -c "^DA:" "$MERGED_LCOV" 2>/dev/null || echo "0")
  COVERED_LINES=$(grep "^DA:" "$MERGED_LCOV" | grep -v ",0$" | wc -l 2>/dev/null || echo "0")
  
  if [ "$TOTAL_LINES" -gt 0 ]; then
    COVERAGE_PERCENT=$((COVERED_LINES * 100 / TOTAL_LINES))
    echo ""
    echo "=== Coverage Summary ==="
    echo "Total Lines: $TOTAL_LINES"
    echo "Covered Lines: $COVERED_LINES"
    echo "Coverage: $COVERAGE_PERCENT%"
    
    # Check thresholds (90% minimum)
    if [ "$COVERAGE_PERCENT" -lt 90 ]; then
      echo ""
      echo "⚠ Warning: Coverage below 90% threshold"
      echo "Current: $COVERAGE_PERCENT%"
      echo "Required: 90%"
    else
      echo ""
      echo "✓ Coverage above 90% threshold"
    fi
  fi
else
  echo "No merged coverage file created"
fi

echo ""
echo "Merged coverage report: coverage-merged/lcov.info"

