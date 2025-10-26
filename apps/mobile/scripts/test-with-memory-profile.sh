#!/bin/bash
# Run tests with detailed memory profiling
# Logs heap usage per test file

set -e

echo "=== Running Tests with Memory Profiling ==="
echo "This will run all tests and log memory usage per test file"
echo ""

# Check if Node.js supports --expose-gc
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
  echo "Warning: Node.js version $NODE_VERSION may not support --expose-gc"
fi

echo "Node version: $(node --version)"
echo ""

# Run tests with memory profiling
# --logHeapUsage logs memory after each test
# --expose-gc enables garbage collection
# --max-old-space-size=4096 gives 4GB heap

export NODE_OPTIONS='--max-old-space-size=4096 --expose-gc'

echo "Running test suite..."
echo "Memory will be logged after each test file"
echo ""

pnpm jest --logHeapUsage --verbose 2>&1 | tee test-memory-profile.log

echo ""
echo "=== Memory Profile Summary ==="
echo ""

# Extract memory stats from the log
if [ -f "test-memory-profile.log" ]; then
  echo "Memory profile saved to: test-memory-profile.log"
  echo ""
  
  # Show max memory usage
  MAX_MEM=$(grep -E "heap used|MB" test-memory-profile.log | tail -1)
  if [ -n "$MAX_MEM" ]; then
    echo "Peak memory usage: $MAX_MEM"
  fi
  
  # Show warnings about memory leaks
  LEAK_WARNINGS=$(grep -c "Potential memory leak" test-memory-profile.log || echo "0")
  if [ "$LEAK_WARNINGS" -gt 0 ]; then
    echo ""
    echo "⚠ Found $LEAK_WARNINGS potential memory leak warnings"
    grep "Potential memory leak" test-memory-profile.log | head -10
  else
    echo "✓ No memory leak warnings detected"
  fi
fi

echo ""
echo "Detailed memory profile: test-memory-profile.log"

