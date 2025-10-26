#!/bin/bash
# Run test shards in parallel with memory limits
# Uses GNU parallel if available, otherwise runs sequentially

set -e

echo "=== Running Test Shards in Parallel ==="

# Check if GNU parallel is installed
if command -v parallel &> /dev/null; then
  echo "Using GNU parallel for parallel execution"
  
  # Create a job file for GNU parallel
  echo "pnpm exec bash scripts/test-shard.sh 1" > /tmp/jobs.txt
  echo "pnpm exec bash scripts/test-shard.sh 2" >> /tmp/jobs.txt
  echo "pnpm exec bash scripts/test-shard.sh 3" >> /tmp/jobs.txt
  echo "pnpm exec bash scripts/test-shard.sh 4" >> /tmp/jobs.txt
  echo "pnpm exec bash scripts/test-shard.sh 5" >> /tmp/jobs.txt
  
  # Run with parallel, limit to 2 concurrent jobs to manage memory
  parallel -j 2 :::: /tmp/jobs.txt
  
  rm /tmp/jobs.txt
else
  echo "GNU parallel not found, running sequentially"
  echo "Install GNU parallel for faster execution: sudo apt install parallel"
  echo ""
  
  # Fall back to sequential execution
  for i in {1..5}; do
    echo "=== Running Shard $i ==="
    pnpm exec bash scripts/test-shard.sh $i
  done
fi

echo ""
echo "=== Aggregating Coverage Reports ==="

if [ -f "scripts/merge-coverage.sh" ]; then
  pnpm exec bash scripts/merge-coverage.sh
fi

echo ""
echo "✓ All shards completed"

