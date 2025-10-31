# Test Utilities Documentation

This directory contains standardized test utilities for mobile app testing, focusing on React Query cleanup, timer management, and multi-dependency hook testing.

## Table of Contents

1. [React Query Helpers](#react-query-helpers)
2. [Timer Helpers](#timer-helpers)
3. [Hook Helpers](#hook-helpers)
4. [Mock Factories](#mock-factories)
5. [Edge Case Helpers](#edge-case-helpers)
6. [Usage Examples](#usage-examples)

## React Query Helpers

**File**: `react-query-helpers.tsx`

### `createTestQueryClient(overrides?)`

Creates a QueryClient with test-friendly defaults:
- `retry: false` - prevents flaky tests from retries
- `gcTime: 0` - prevents cache persistence between tests
- `refetchOnMount: false` - prevents unexpected refetches

```typescript
import { createTestQueryClient } from '@/test-utils/react-query-helpers';

const queryClient = createTestQueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
    },
  },
});
```

### `cleanupQueryClient(queryClient)`

Comprehensive cleanup for QueryClient:
1. Cancels all ongoing queries
2. Removes all query observers
3. Clears all cached data

```typescript
import { cleanupQueryClient } from '@/test-utils/react-query-helpers';

afterEach(() => {
  cleanupQueryClient(queryClient);
});
```

### `createWrapperWithQueryClient(queryClient?)`

Creates a wrapper component for `renderHook` or `render`.

```typescript
import { createWrapperWithQueryClient } from '@/test-utils/react-query-helpers';

const wrapper = createWrapperWithQueryClient(queryClient);
const { result } = renderHook(() => useMyHook(), { wrapper });
```

## Timer Helpers

**File**: `timer-helpers.ts`

### `setupFakeTimers()`

Sets up fake timers with proper tracking. Use this instead of calling `jest.useFakeTimers()` directly.

```typescript
import { setupFakeTimers } from '@/test-utils/timer-helpers';

beforeEach(() => {
  setupFakeTimers();
});
```

### `cleanupTimers()`

Comprehensive timer cleanup:
1. Runs only pending timers
2. Clears all timers
3. Restores real timers

```typescript
import { cleanupTimers } from '@/test-utils/timer-helpers';

afterEach(() => {
  cleanupTimers();
});
```

### `withFakeTimers(fn)`

Wrapper function that automatically sets up and cleans up timers.

```typescript
import { withFakeTimers } from '@/test-utils/timer-helpers';

it('should handle timers', async () => {
  await withFakeTimers(async () => {
    // Your test code here
  });
});
```

### `advanceTimersAndWait(ms)`

Advances timers and waits for async operations.

```typescript
import { advanceTimersAndWait } from '@/test-utils/timer-helpers';

await advanceTimersAndWait(1000);
```

## Hook Helpers

**File**: `hook-helpers.tsx`

### `renderHookWithProviders(hook, options)`

Renders a hook with all necessary providers:
- React Query (QueryClient)
- Navigation (NavigationContainer)
- Theme (ThemeProvider)
- Fake timers (optional)
- Custom wrappers

```typescript
import { renderHookWithProviders } from '@/test-utils/hook-helpers';

const { result, cleanup, queryClient } = renderHookWithProviders(
  () => useComplexHook(),
  {
    useFakeTimers: true,
    withNavigation: true,
    withTheme: true,
  }
);

// Use result...

// Cleanup
cleanup();
```

### `mockMultiDependencyHook(config)`

Sets up mocks for hooks with multiple dependencies.

```typescript
import { mockMultiDependencyHook } from '@/test-utils/hook-helpers';

const cleanup = mockMultiDependencyHook({
  services: {
    apiService: mockApiService,
  },
  useFakeTimers: true,
  socket: mockSocket,
});

// Run tests...

cleanup();
```

## Mock Factories

**File**: `mock-factories.ts`

### `createMockQueryClient(overrides?)`

Creates a mock QueryClient (alias for `createTestQueryClient`).

### `createMockSocket()`

Creates a mock socket with event emitter functionality.

```typescript
import { createMockSocket } from '@/test-utils/mock-factories';

const mockSocket = createMockSocket();
mockSocket.on('event', handler);
mockSocket.emit('event', data);
```

### `createMockNavigation(overrides?)`

Creates mock navigation props.

```typescript
import { createMockNavigation } from '@/test-utils/mock-factories';

const navigation = createMockNavigation({
  navigate: jest.fn(),
});
```

### `createMockServices(overrides?)`

Creates aggregated service mocks.

```typescript
import { createMockServices } from '@/test-utils/mock-factories';

const services = createMockServices({
  api: {
    get: jest.fn().mockResolvedValue({ data: {} }),
  },
});
```

## Edge Case Helpers

**File**: `edge-case-helpers.tsx`

### `testUnmountCleanup(hookFactory, options)`

Tests that a hook properly cleans up on unmount.

```typescript
import { testUnmountCleanup } from '@/test-utils/edge-case-helpers';

it('should cleanup on unmount', async () => {
  await testUnmountCleanup(
    () => useComplexHook(),
    {
      assertions: (result) => {
        expect(result.current.cleanup).toHaveBeenCalled();
      },
    }
  );
});
```

### `testRapidUpdates(hookFactory, updates, options)`

Tests hook with rapid state/prop updates.

```typescript
import { testRapidUpdates } from '@/test-utils/edge-case-helpers';

await testRapidUpdates(
  () => useSearchHook(),
  [
    { query: 'dog' },
    { query: 'cat' },
    { query: 'bird' },
  ]
);
```

### `testErrorRecovery(hookFactory, scenarios, options)`

Tests hook error recovery scenarios.

```typescript
import { testErrorRecovery } from '@/test-utils/edge-case-helpers';

await testErrorRecovery(
  () => useDataHook(),
  [
    { props: { shouldFail: true } },
    { props: { shouldFail: false } },
  ]
);
```

## Usage Examples

### Example 1: Basic React Query Hook Test

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import {
  createTestQueryClient,
  cleanupQueryClient,
  createWrapperWithQueryClient,
} from '@/test-utils/react-query-helpers';
import { useMyQuery } from '../useMyQuery';

describe('useMyQuery', () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = createWrapperWithQueryClient(queryClient);
  });

  afterEach(() => {
    cleanupQueryClient(queryClient);
  });

  it('should fetch data', async () => {
    const { result } = renderHook(() => useMyQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

### Example 2: Hook with Timers

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { setupFakeTimers, cleanupTimers, advanceTimersAndWait } from '@/test-utils/timer-helpers';
import { usePollingHook } from '../usePollingHook';

describe('usePollingHook', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupTimers();
  });

  it('should poll data', async () => {
    const { result } = renderHook(() => usePollingHook());

    await act(async () => {
      await advanceTimersAndWait(1000);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

### Example 3: Complex Multi-Dependency Hook

```typescript
import { renderHookWithProviders } from '@/test-utils/hook-helpers';
import { useComplexHook } from '../useComplexHook';

describe('useComplexHook', () => {
  it('should handle multiple dependencies', async () => {
    const { result, cleanup } = renderHookWithProviders(
      () => useComplexHook(),
      {
        useFakeTimers: true,
        withNavigation: true,
        withTheme: true,
      }
    );

    // Test logic here...

    cleanup();
  });
});
```

### Example 4: Edge Case Testing

```typescript
import { testUnmountCleanup, testRapidUpdates } from '@/test-utils/edge-case-helpers';
import { useMyHook } from '../useMyHook';

describe('useMyHook edge cases', () => {
  it('should cleanup on unmount', async () => {
    await testUnmountCleanup(
      () => useMyHook(),
      {
        assertions: (result) => {
          expect(result.current.isCleanedUp).toBe(true);
        },
      }
    );
  });

  it('should handle rapid updates', async () => {
    await testRapidUpdates(
      () => useMyHook(),
      [
        { prop1: 'value1' },
        { prop1: 'value2' },
        { prop1: 'value3' },
      ]
    );
  });
});
```

## Best Practices

1. **Always cleanup in `afterEach`**: Use `cleanupQueryClient` and `cleanupTimers` in every test suite that uses them.

2. **Use test utilities consistently**: Don't mix manual setup with utility functions - stick to one pattern.

3. **Test edge cases**: Use edge case helpers to catch cleanup bugs and race conditions.

4. **Mock at the right level**: Use mock factories for common patterns, but customize when needed.

5. **Isolate tests**: Each test should be independent - proper cleanup ensures this.

## Migration Guide

### Migrating Existing Tests

1. Replace `new QueryClient({ ... })` with `createTestQueryClient()`
2. Replace `queryClient.clear()` with `cleanupQueryClient(queryClient)`
3. Replace `jest.useFakeTimers()` with `setupFakeTimers()`
4. Replace manual timer cleanup with `cleanupTimers()`
5. Use `createWrapperWithQueryClient()` instead of manual wrapper creation

### Before

```typescript
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

afterEach(() => {
  queryClient.clear();
});
```

### After

```typescript
import { createTestQueryClient, cleanupQueryClient } from '@/test-utils/react-query-helpers';

const queryClient = createTestQueryClient();

afterEach(() => {
  cleanupQueryClient(queryClient);
});
```

