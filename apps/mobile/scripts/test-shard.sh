#!/bin/bash
# Run individual test shard
# Usage: ./test-shard.sh <shard-number>

set -e

SHARD_NUMBER=$1

if [ -z "$SHARD_NUMBER" ]; then
  echo "Usage: $0 <shard-number>"
  echo "Shards: 1=components, 2=screens, 3=services/hooks, 4=navigation/integration, 5=critical/performance"
  exit 1
fi

case $SHARD_NUMBER in
  1)
    echo "Running Shard 1: Components"
    NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' pnpm jest --testPathPattern='components' --coverage
    ;;
  2)
    echo "Running Shard 2: Screens"
    NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' pnpm jest --testPathPattern='screens' --coverage
    ;;
  3)
    echo "Running Shard 3: Services & Hooks"
    NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' pnpm jest --testPathPattern='(services|hooks)' --coverage
    ;;
  4)
    echo "Running Shard 4: Navigation & Integration"
    NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' pnpm jest --testPathPattern='navigation|integration' --coverage
    ;;
  5)
    echo "Running Shard 5: Critical & Performance"
    NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' pnpm jest --testPathPattern='critical|performance|regression' --coverage
    ;;
  *)
    echo "Invalid shard number: $SHARD_NUMBER"
    echo "Shards: 1, 2, 3, 4, 5"
    exit 1
    ;;
esac

