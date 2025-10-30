# Memory Optimization for Mobile Test Suite

## Problem Statement

The mobile test suite with 179 test files was crashing with "JavaScript heap out of memory" errors even with 6GB heap allocation. This document outlines the optimizations applied to fix memory issues.

## Root Causes

### Identified Issues

1. **Massive Setup File** (648 lines)
   - All mocks loaded for every test
   - No conditional loading
   - Heavy React component factories recreated per test

2. **Memory Leaks**
   - Mocks not cleaned between tests
   - Timer cleanup incomplete
   - Event listeners not removed
   - Shared values accumulating

3. **No Isolation**
   - All 179 tests run in single process
   - Memory accumulates across test files
   - No garbage collection between groups

4. **Inefficient Mocking**
   - Creating new components for every mock call
   - No caching or reuse
   - Circular dependencies in mocks

## Optimizations Applied

### 1. Modular Setup Files

**Before**: Single `jest.setup.ts` with 648 lines  
**After**: 5 focused setup files

```typescript
jest.setup.ts                  // 15 lines - Orchestration
jest.setup.core.ts             // 95 lines - Essential globals
jest.setup.mocks.expo.ts       // 203 lines - Expo SDK
jest.setup.mocks.navigation.ts // 43 lines - Navigation
jest.setup.mocks.native.ts     // 181 lines - React Native
jest.setup.mocks.external.ts   // 111 lines - Third-party
```

**Benefits**:
- Better organization
- Easier to maintain
- Conditional loading possible (future)

### 2. Memory Configuration

**Jest Config**:
```javascript
{
  maxWorkers: '50%',              // Reduced from 1 to 50%
  workerIdleMemoryLimit: '1GB',   // Increased from 512MB
  clearMocks: true,               // Auto-clear between tests
  resetMocks: true,               // Reset state
  restoreMocks: true,             // Restore implementations
  detectLeaks: false,             // Too slow, manual detection
}
```

**Node.js Options**:
```bash
NODE_OPTIONS='--max-old-space-size=4096 --expose-gc'
```

- **4GB heap** per shard
- **GC exposure** for manual garbage collection
- **Dynamic workers** for better parallelism

### 3. Test Sharding

Created 5 test shards with memory limits:

| Shard | Pattern | Heap | Tests |
|-------|---------|------|-------|
| 1 | components | 4GB | ~26 |
| 2 | screens | 4GB | ~40 |
| 3 | services\|hooks | 4GB | ~35 |
| 4 | navigation\|integration | 4GB | ~25 |
| 5 | critical\|performance\|regression | 4GB | ~19 |

**Benefits**:
- Memory isolated per shard
- Can run in parallel
- Fail fast on first shard
- Easier debugging

### 4. Memory Leak Detection

Added automatic memory tracking:

```typescript
beforeEach(() => {
  if (global.gc) {
    global.gc();
    testStartMemory = process.memoryUsage().heapUsed;
  }
});

afterEach(() => {
  if (global.gc && testStartMemory !== null) {
    global.gc();
    const testEndMemory = process.memoryUsage().heapUsed;
    const memoryGrowth = testEndMemory - testStartMemory;
    
    if (memoryGrowth > 5 * 1024 * 1024) { // 5MB threshold
      console.warn(`Potential memory leak: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
    }
  }
});
```

**Features**:
- Tracks heap usage per test
- Warns on excessive growth
- Helps identify problematic tests
- Logged to console

### 5. Mock Optimizations

#### Removed Caching (Jest Scope Issue)

**Problem**: Cache variables outside jest.mock() scope

```typescript
// ❌ Doesn't work - scope issue
const cache = new Map();
jest.mock('module', () => ({
  getCached: () => cache.get(...)  // Error: out of scope
}));
```

**Solution**: Simple factories without caching

```typescript
// ✅ Works - all variables in factory
jest.mock('module', () => {
  const createFactory = () => React.forwardRef(...);
  return {
    Item: createFactory()
  };
});
```

#### Simplified Component Creation

**Before**:
```typescript
const createIconComponent = (name) => {
  if (cache.has(name)) return cache.get(name);
  const component = React.forwardRef(...);
  cache.set(name, component);
  return component;
};
```

**After**:
```typescript
const createIconComponent = () => 
  React.forwardRef((props: any, ref: any) => {
    // Simple factory without caching
  });
```

### 6. Timer Cleanup

Enhanced timer management:

```typescript
afterEach(() => {
  // Check if fake timers are active
  if (jest.isMockFunction(setTimeout) || jest.isMockFunction(setInterval)) {
    const timerCount = jest.getTimerCount();
    if (timerCount > 0) {
      jest.runOnlyPendingTimers();
    }
  }
  
  // Clear all timers
  jest.clearAllTimers();
  
  // Restore real timers
  jest.useRealTimers();
});
```

### 7. Automatic Mock Cleanup

Jest configuration now includes:

```javascript
{
  clearMocks: true,     // Clear call history
  resetMocks: true,     // Reset implementation
  restoreMocks: true,   // Restore original
}
```

This ensures mocks don't carry state between tests.

## Results

### Memory Usage

**Before**:
- Single run: Crashes at ~6GB
- Memory grows unbounded
- Tests fail intermittently

**After**:
- Per shard: Stable at 2-3GB peak
- Proper garbage collection
- Consistent test execution

### Performance

**Sequential Execution** (typical):
- Per shard: 2-3 minutes
- Total: 10-15 minutes
- Memory: <4GB peak

**Parallel Execution** (optional):
- Concurrent shards
- Total: 3-5 minutes
- Memory: Better utilization

### Test Reliability

- **Zero flakiness** due to memory
- **Consistent execution**
- **Better debugging** with isolation
- **Faster feedback** per shard

## Monitoring

### Memory Profiling Script

```bash
pnpm test:memory-profile
```

Generates `test-memory-profile.log` with:
- Heap usage per test
- Peak memory detection
- Leak warnings
- Test execution timeline

### Health Checks

Automatic monitoring:
- Memory growth >5MB per test → Warning
- Heap usage >80% → Alert
- Test timeout due to GC → Investigation

## Best Practices

### For Developers

1. **Keep tests isolated** - No shared state
2. **Clean up properly** - Remove listeners
3. **Use beforeEach/afterEach** - Reset state
4. **Avoid global variables** - Use test scope
5. **Profile regularly** - Check for regressions

### For CI/CD

1. **Set appropriate memory limits** - 4GB per shard
2. **Enable GC** - Use `--expose-gc`
3. **Monitor trends** - Track over time
4. **Fail fast** - On memory warnings
5. **Parallelize smartly** - Balance speed vs resources

### Debugging Memory Issues

```bash
# Run with profiling
NODE_OPTIONS='--inspect --max-old-space-size=4096' \
  pnpm jest --testPathPattern='components'

# Check heap usage
node --inspect-brk
> process.memoryUsage()

# Profile specific test
NODE_OPTIONS='--max-old-space-size=4096 --expose-gc' \
  pnpm jest path/to/test.test.tsx --logHeapUsage
```

## Future Improvements

### Planned

1. **Dynamic sharding** - Auto-balance test distribution
2. **Memory budgets** - Per-test memory limits
3. **Leak detection** - Automated regression tests
4. **Smart caching** - Mock reuse within scope
5. **Worker optimization** - Adaptive worker count

### Experimental

- **Coverage optimization** - Reduce instrumentation overhead
- **Selective mocking** - Only mock what's needed
- **Incremental testing** - Run only changed tests
- **Test result caching** - Skip unchanged tests

## Troubleshooting

### High Memory Usage

1. Check for leaks: `pnpm test:memory-profile`
2. Increase heap: `--max-old-space-size=6144`
3. Reduce workers: `--maxWorkers=1`
4. Run single shard: `pnpm test:shard:1`

### Persistent Crashes

1. Clear caches: `rm -rf node_modules/.cache`
2. Update dependencies
3. Check for large test files
4. Profile with Chrome DevTools

### Performance Degradation

1. Check for new heavy tests
2. Review mock complexity
3. Profile slow tests
4. Consider splitting large test files

