#!/bin/bash
# Run all test shards sequentially
# Aggregates coverage reports from all shards

set -e

echo "=== Running All Test Shards ==="
echo "This will run all 5 shards sequentially and aggregate coverage reports"
echo ""

# Clean up any existing coverage
rm -rf coverage coverage-merged

# Create coverage directory
mkdir -p coverage

# Track failures
FAILURES=()

echo ""
echo "=== Shard 1: Components ==="
if pnpm exec bash scripts/test-shard.sh 1; then
  echo "✓ Shard 1 passed"
else
  echo "✗ Shard 1 failed"
  FAILURES+=("1")
fi

echo ""
echo "=== Shard 2: Screens ==="
if pnpm exec bash scripts/test-shard.sh 2; then
  echo "✓ Shard 2 passed"
else
  echo "✗ Shard 2 failed"
  FAILURES+=("2")
fi

echo ""
echo "=== Shard 3: Services & Hooks ==="
if pnpm exec bash scripts/test-shard.sh 3; then
  echo "✓ Shard 3 passed"
else
  echo "✗ Shard 3 failed"
  FAILURES+=("3")
fi

echo ""
echo "=== Shard 4: Navigation & Integration ==="
if pnpm exec bash scripts/test-shard.sh 4; then
  echo "✓ Shard 4 passed"
else
  echo "✗ Shard 4 failed"
  FAILURES+=("4")
fi

echo ""
echo "=== Shard 5: Critical & Performance ==="
if pnpm exec bash scripts/test-shard.sh 5; then
  echo "✓ Shard 5 passed"
else
  echo "✗ Shard 5 failed"
  FAILURES+=("5")
fi

echo ""
echo "=== Aggregating Coverage Reports ==="

# Run the coverage merge script if it exists
if [ -f "scripts/merge-coverage.sh" ]; then
  pnpm exec bash scripts/merge-coverage.sh
fi

echo ""
echo "=== Test Run Summary ==="
if [ ${#FAILURES[@]} -eq 0 ]; then
  echo "✓ All shards passed!"
  exit 0
else
  echo "✗ Failed shards: ${FAILURES[*]}"
  exit 1
fi

