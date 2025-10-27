# Test Sharding Strategy for Mobile Suite

## Overview

Test sharding divides 179 test files into 5 manageable shards to prevent memory exhaustion while maintaining fast test execution.

## Sharding Strategy

### Distribution

| Shard | Category | Pattern | Estimated Tests | Memory Budget |
|-------|----------|---------|-----------------|---------------|
| 1 | Components | `components` | ~26 | 4GB |
| 2 | Screens | `screens` | ~40 | 4GB |
| 3 | Services & Hooks | `services\|hooks` | ~35 | 4GB |
| 4 | Navigation & Integration | `navigation\|integration` | ~25 | 4GB |
| 5 | Critical & Performance | `critical\|performance\|regression` | ~19 | 4GB |

**Total**: ~145 tests across 5 shards

### Rationale

#### Why Shard?

The original test suite crashed with "heap out of memory" even with 6GB allocation. Causes:
- 179 test files in single process
- Extensive mocking loading everything at once
- No isolation between test groups
- Memory accumulates across tests

#### Benefits

1. **Memory Isolation** - Each shard runs in separate process
2. **Parallel Execution** - Run shards concurrently
3. **Faster Feedback** - Fail fast on first shard
4. **Easier Debugging** - Smaller scope per shard
5. **CI/CD Optimization** - Distribute across runners

## Implementation

### Package.json Scripts

```json
{
  "test:shard:1": "NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' jest --testPathPattern='components' --coverage",
  "test:shard:2": "NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' jest --testPathPattern='screens' --coverage",
  "test:shard:3": "NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' jest --testPathPattern='(services|hooks)' --coverage",
  "test:shard:4": "NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' jest --testPathPattern='navigation|integration' --coverage",
  "test:shard:5": "NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' jest --testPathPattern='critical|performance|regression' --coverage",
  "test:all-shards": "bash scripts/test-all-shards.sh",
  "test:parallel-shards": "bash scripts/test-parallel-shards.sh"
}
```

### Shell Scripts

#### `scripts/test-shard.sh`

Run individual shard with appropriate memory limits:

```bash
#!/bin/bash
SHARD_NUMBER=$1
case $SHARD_NUMBER in
  1) pnpm jest --testPathPattern='components' ;;
  2) pnpm jest --testPathPattern='screens' ;;
  # etc.
esac
```

#### `scripts/test-all-shards.sh`

Sequential execution of all shards with coverage aggregation:

```bash
# Run each shard in sequence
for i in {1..5}; do
  pnpm exec bash scripts/test-shard.sh $i
done

# Merge coverage
bash scripts/merge-coverage.sh
```

#### `scripts/test-parallel-shards.sh`

Parallel execution using GNU parallel (optional):

```bash
# Uses GNU parallel for concurrent execution
parallel -j 2 < jobs.txt
```

## Usage Examples

### Local Development

```bash
# Run single shard
pnpm test:shard:1

# Run all shards sequentially
pnpm test:all-shards

# Run with parallel execution
pnpm test:parallel-shards
```

### CI/CD

```bash
# GitHub Actions example
- name: Run Test Shard 1
  run: pnpm test:shard:1

- name: Run Test Shard 2
  run: pnpm test:shard:2

# Run shards in parallel
- name: Run all test shards
  run: pnpm test:parallel-shards
```

### Debug Specific Category

```bash
# Just screens
pnpm test:shard:2

# Just services
pnpm test:shard:3

# With verbose output
pnpm jest --testPathPattern='components' --verbose
```

## Coverage Handling

### Per-Shard Coverage

Each shard generates its own coverage:

```
coverage/
├── lcov.info
├── coverage-final.json
└── index.html
```

### Merging Coverage

```bash
bash scripts/merge-coverage.sh
```

Generates:
- `coverage-merged/lcov.info` - Merged LCOV report
- Coverage summary in console
- Threshold validation

### Coverage Thresholds

Shards must maintain:
- **Global**: 90% coverage
- **Services/Core**: 95% coverage
- **Failing shards**: Block merge

## Performance Considerations

### Memory Management

Each shard gets **4GB heap** to handle:
- Large component trees
- Complex mock setups
- Integration test state
- Coverage instrumentation

### Execution Time

**Sequential** (typical CI):
- Shard 1: ~2-3 min
- Shard 2: ~3-4 min
- Shard 3: ~2-3 min
- Shard 4: ~2-3 min
- Shard 5: ~1-2 min
- **Total**: ~10-15 minutes

**Parallel** (requires GNU parallel):
- Concurrent execution
- **Total**: ~3-5 minutes

### Worker Configuration

Default Jest config:
```javascript
maxWorkers: '50%',  // Use 50% of CPUs
workerIdleMemoryLimit: '1GB',
```

Can be overridden per shard if needed.

## Adding New Tests

### By Category

- **Component test** → Add to `src/components/`
- **Screen test** → Add to `src/screens/`
- **Service test** → Add to `src/services/`
- **Hook test** → Add to `src/hooks/`

### By Type

- **Integration test** → Use `.integration.test.tsx` suffix
- **Performance test** → Use `.performance.test.tsx` suffix
- **Critical test** → Add to `src/__tests__/critical-journeys.test.tsx`

Jest will automatically route to correct shard.

## Shard Debugging

### Check Shard Contents

```bash
# List tests in shard 1
pnpm jest --listTests --testPathPattern='components'

# Count tests
pnpm jest --listTests --testPathPattern='components' | wc -l
```

### Run Specific Test

```bash
# Ignore shard, run single file
pnpm jest src/components/swipe/__tests__/SwipeGestureHints.test.tsx
```

### Memory Profiling

```bash
# Profile shard 1
NODE_OPTIONS='--inspect --max-old-space-size=4096' pnpm test:shard:1
```

## Limitations

### Current Approach

- **Fixed shards** - Manual categorization
- **No auto-balancing** - Shards may have different sizes
- **Manual maintenance** - New test categories require script updates

### Future Improvements

1. **Auto-sharding** - Dynamically balance test distribution
2. **Dynamic thresholds** - Adjust based on historical performance
3. **Smart parallelization** - Optimize worker count per shard
4. **Cost-aware execution** - Distribute across CI runners efficiently

## Monitoring

### Test Health

Track per shard:
- **Execution time** - Alert if >5 min
- **Memory usage** - Alert if >4GB peak
- **Failure rate** - Alert if >10%
- **Coverage** - Alert if <90%

### Regression Detection

- Memory growth trends
- Test execution time increases
- Coverage drops
- Flaky test rate

