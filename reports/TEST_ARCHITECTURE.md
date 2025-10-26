# Mobile Test Suite Architecture

## Overview

The mobile test suite for PawfectMatch has been optimized to handle 179 test files efficiently by:

1. **Modular Setup Files** - Split large setup into focused modules
2. **Memory-Optimized Configuration** - Increased heap size with garbage collection
3. **Test Sharding** - Divide tests into 5 manageable shards
4. **Enhanced Memory Management** - Proper cleanup and leak detection

## Test Organization

### Setup Files Structure

```
apps/mobile/
├── jest.setup.ts              # Main entry point
├── jest.setup.core.ts         # Core polyfills and globals
├── jest.setup.mocks.expo.ts   # Expo-specific mocks
├── jest.setup.mocks.navigation.ts # Navigation mocks
├── jest.setup.mocks.native.ts    # React Native component mocks
└── jest.setup.mocks.external.ts # Third-party library mocks
```

### Setup File Responsibilities

#### `jest.setup.core.ts`
- Essential polyfills (TextEncoder/TextDecoder)
- Global React Native API mocks (Alert, Platform, Dimensions, etc.)
- Memory tracking and leak detection
- Test lifecycle hooks (beforeEach/afterEach)

#### `jest.setup.mocks.expo.ts`
- Expo SDK mocks (image-picker, camera, location, etc.)
- Optimized icon component creation
- File system and AV mocks

#### `jest.setup.mocks.navigation.ts`
- React Navigation mocks
- Routing and navigation hooks
- Masked view components

#### `jest.setup.mocks.native.ts`
- React Native list components (FlatList, SectionList, etc.)
- Maps and gesture handler mocks
- Reanimated mocks (simplified without caching to avoid scope issues)
- SVG and safe area context

#### `jest.setup.mocks.external.ts`
- Sentry, authentication, and security mocks
- React Query mocks
- Third-party integrations

## Test Sharding

Tests are divided into 5 shards based on category:

### Shard 1: Components (~26 tests)
- Pattern: `src/components/**/__tests__/**`
- Focus: UI component unit tests
- Examples: buttons, cards, form inputs

### Shard 2: Screens (~40 tests)
- Pattern: `src/screens/**/__tests__/**`
- Focus: Screen-level integration tests
- Examples: chat, profile, discovery

### Shard 3: Services & Hooks (~35 tests)
- Pattern: `src/services/**/__tests__/**` + `src/hooks/**/__tests__/**`
- Focus: Business logic and custom hooks
- Examples: API services, data hooks

### Shard 4: Navigation & Integration (~25 tests)
- Pattern: `src/navigation/**/__tests__/**` + integration tests
- Focus: Navigation flows and app-level integration
- Examples: tab navigation, routing

### Shard 5: Critical & Performance (~19 tests)
- Pattern: Critical journeys, performance tests, regression tests
- Focus: End-to-end critical paths
- Examples: user onboarding, matching flow

## Configuration

### Memory Management

```javascript
{
  maxWorkers: '50%',              // Use 50% of available CPUs
  workerIdleMemoryLimit: '1GB',   // Kill workers exceeding 1GB
  clearMocks: true,               // Auto-clear mocks
  resetMocks: true,               // Reset mock state
  restoreMocks: true,             // Restore original implementations
}
```

### Node.js Options

```bash
NODE_OPTIONS='--max-old-space-size=4096 --expose-gc'
```

- **4GB heap** per shard to handle memory-intensive tests
- **GC exposure** enables manual garbage collection for leak detection

## Running Tests

### Single Shard
```bash
pnpm test:shard:1  # Components
pnpm test:shard:2  # Screens
# etc.
```

### All Shards (Sequential)
```bash
pnpm test:all-shards
# or
bash scripts/test-all-shards.sh
```

### Parallel Execution
```bash
pnpm test:parallel-shards
# Requires GNU parallel: sudo apt install parallel
```

### Memory Profiling
```bash
pnpm test:memory-profile
# Generates test-memory-profile.log with heap usage
```

## Coverage

Coverage reports are generated per shard and can be merged:

```bash
bash scripts/merge-coverage.sh
```

Thresholds:
- **Global**: 90% (branches, functions, lines, statements)
- **Services/Core**: 95% (stricter for critical paths)

## Memory Leak Detection

The test suite includes automatic memory leak detection:

- Tracks heap usage before/after each test
- Warns if memory grows >5MB during a single test
- Logs warnings to console

## Debugging

### Memory Issues
```bash
# Run with detailed logging
pnpm test:safe

# Profile memory usage
NODE_OPTIONS='--inspect --max-old-space-size=4096' pnpm test:shard:1
```

### Cache Issues
```bash
# Clear Jest cache
rm -rf node_modules/.cache
pnpm jest --clearCache
```

### Test Failures
```bash
# Run single test file
pnpm jest path/to/test.test.tsx

# Run with verbose output
pnpm jest --verbose

# Run with coverage for specific pattern
pnpm jest --testPathPattern="swipe" --coverage
```

## Best Practices

1. **Mock at module level** - Use `jest.mock()` in setup files
2. **Clean up timers** - Always restore real timers in afterEach
3. **Avoid global state** - Isolate tests completely
4. **Use typed mocks** - Leverage TypeScript for mock safety
5. **Profile regularly** - Check memory profiles for regressions

## Performance Metrics

Target benchmarks:
- **Shard execution**: <3 minutes per shard
- **Total time**: <15 minutes (all shards sequential)
- **Memory per shard**: <4GB peak
- **Coverage**: ≥90% global, ≥95% services

## Troubleshooting

### "JavaScript heap out of memory"
- Increase heap size: `--max-old-space-size=6144`
- Run fewer tests in parallel
- Check for memory leaks with `test:memory-profile`

### Mock factory scope errors
- Never reference variables outside jest.mock()
- Use `mock` prefix for cache variables (special Jest permission)
- Prefer simple factories over complex caching

### Timer cleanup errors
- Always use `jest.useRealTimers()` in afterEach
- Check if fake timers are active before running timers

