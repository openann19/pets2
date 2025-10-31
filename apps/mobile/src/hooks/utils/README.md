# Advanced Hook Utilities

This directory contains utilities for managing complex hook patterns, testing, and cleanup strategies.

## Overview

These utilities help with:
- **Complex cleanup patterns** (React Query, timers, WebSocket)
- **Advanced mocking strategies** for multi-dependency hooks
- **Edge case discovery** and testing
- **Resource management** in hooks

## Files

### Core Utilities

#### `useResourceCleanup.ts`
Comprehensive cleanup management for hooks combining multiple resources:
- React Query subscriptions
- Timers (setTimeout/setInterval)
- WebSocket/EventEmitter connections
- Native modules (Audio, Location, etc.)
- Promise cancellations

**Usage:**
```typescript
import { useResourceCleanup } from '@/hooks/utils/useResourceCleanup';

function useMyHook() {
  const cleanup = useResourceCleanup({ queryClient });
  
  // Register timers
  const timer = setTimeout(() => {}, 1000);
  cleanup.registerTimer(timer);
  
  // Register React Query cancellation
  cleanup.registerQueryCancel(() => queryClient.cancelQueries({ queryKey }));
  
  // Register custom cleanup
  cleanup.registerCleanup(() => recording.stopAndUnloadAsync());
  
  // All cleanup runs automatically on unmount
}
```

### Test Utilities

#### `test-utilities.ts`
Advanced testing utilities for complex hooks:
- QueryClient setup for tests
- Mock React Query hooks (useQuery, useMutation)
- Timer control utilities
- WebSocket mocking
- Cleanup assertions

**Usage:**
```typescript
import {
  createTestQueryClient,
  renderHookWithQueryClient,
  setupTimerMocks,
  createMockQueryResult,
} from '@/hooks/utils/__tests__/test-utilities';

describe('MyHook', () => {
  let queryClient: QueryClient;
  let timerControl: ReturnType<typeof setupTimerMocks>;
  
  beforeEach(() => {
    queryClient = createTestQueryClient();
    timerControl = setupTimerMocks();
  });
  
  it('should cleanup properly', async () => {
    const { unmount } = renderHookWithQueryClient(
      () => useMyHook(),
      { queryClient }
    );
    
    timerControl.advanceTimersByTime(1000);
    
    act(() => {
      unmount();
    });
    
    // Assert cleanup occurred
  });
});
```

#### `edge-case-helpers.ts`
Utilities for discovering and testing edge cases:
- Rapid mount/unmount cycles
- Dependency changes during async operations
- Concurrent operations
- Memory leak detection
- Timer accumulation detection
- Query cache pollution detection

**Usage:**
```typescript
import {
  testRapidMountUnmount,
  testDependencyChanges,
  createTimerLeakDetector,
} from '@/hooks/utils/__tests__/edge-case-helpers';

// Test rapid mount/unmount cycles
await testRapidMountUnmount(renderHook, { iterations: 10 });

// Detect timer leaks
const detector = createTimerLeakDetector();
const beforeCount = detector.getActiveTimers();
// ... run hook ...
const afterCount = detector.getActiveTimers();
expect(detector.checkForLeaks(beforeCount, afterCount)).toBe(false);
```

## Common Patterns

### Pattern 1: React Query + Timers

```typescript
function usePollingData(queryKey: string[], pollInterval: number) {
  const cleanup = useResourceCleanup({ queryClient });
  const { data, refetch } = useQuery({ queryKey, queryFn });
  
  useEffect(() => {
    if (pollInterval > 0) {
      const timer = setInterval(() => {
        void refetch();
      }, pollInterval);
      cleanup.registerTimer(timer);
    }
  }, [pollInterval, refetch, cleanup]);
  
  return { data };
}
```

### Pattern 2: WebSocket + React Query

```typescript
function useRealtimeData(queryKey: string[]) {
  const cleanup = useResourceCleanup({ queryClient });
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    const socket = io();
    socketRef.current = socket;
    
    socket.on('data', (data) => {
      queryClient.setQueryData(queryKey, data);
    });
    
    cleanup.registerEventListener(socket, 'connect', handleConnect);
    cleanup.registerCleanup(() => socket.disconnect());
  }, [queryKey, queryClient, cleanup]);
  
  return { socket: socketRef.current };
}
```

### Pattern 3: Native Modules + Timers

```typescript
function useVoiceRecording() {
  const cleanup = useResourceCleanup();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationTimer = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
      if (recordingRef.current) {
        void recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);
  
  // Or using cleanup utility:
  const startRecording = () => {
    const timer = setInterval(() => {
      // Update duration
    }, 1000);
    cleanup.registerTimer(timer);
  };
  
  return { startRecording };
}
```

## Testing Strategies

### 1. Test Cleanup on Unmount

```typescript
it('should cleanup all resources on unmount', async () => {
  const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
  
  const { unmount } = renderHook(() => useMyHook());
  
  act(() => {
    unmount();
  });
  
  await waitFor(() => {
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
```

### 2. Test Timer Cleanup

```typescript
it('should clear timers when dependencies change', () => {
  const timerControl = setupTimerMocks();
  const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
  
  const { rerender } = renderHook(
    (props) => useMyHook(props),
    { initialProps: { interval: 1000 } }
  );
  
  timerControl.advanceTimersByTime(500);
  rerender({ interval: 2000 });
  
  expect(clearIntervalSpy).toHaveBeenCalled();
});
```

### 3. Test React Query Cleanup

```typescript
it('should cancel queries on unmount', async () => {
  const queryClient = createTestQueryClient();
  const cancelSpy = jest.spyOn(queryClient, 'cancelQueries');
  
  const { unmount } = renderHookWithQueryClient(
    () => useMyHook(),
    { queryClient }
  );
  
  act(() => {
    unmount();
  });
  
  await waitFor(() => {
    expect(cancelSpy).toHaveBeenCalled();
  });
});
```

### 4. Test Edge Cases

```typescript
it('should handle rapid mount/unmount cycles', async () => {
  await testRapidMountUnmount(
    () => renderHook(() => useMyHook()),
    { iterations: 10 }
  );
});

it('should handle dependency changes during async operations', async () => {
  await testDependencyChanges(
    (props) => renderHook(() => useMyHook(props)),
    [
      { userId: '1' },
      { userId: '2' },
      { userId: '3' },
    ]
  );
});
```

## Best Practices

1. **Always register resources immediately** after creating them
2. **Use the cleanup utility** instead of manual useEffect cleanup when possible
3. **Test cleanup** in every test that creates resources
4. **Use timer mocks** in tests to control time-based behavior
5. **Assert cleanup** happened after unmounting hooks
6. **Test edge cases** like rapid mount/unmount, dependency changes
7. **Monitor for memory leaks** using the leak detection utilities

## Migration Guide

### Before (Manual Cleanup)
```typescript
function useMyHook() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    timerRef.current = setInterval(() => {}, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
}
```

### After (Using Cleanup Utility)
```typescript
function useMyHook() {
  const cleanup = useResourceCleanup();
  
  useEffect(() => {
    const timer = setInterval(() => {}, 1000);
    cleanup.registerTimer(timer);
  }, [cleanup]);
}
```

## Examples

See `__tests__/complex-hook-example.test.ts` for comprehensive examples of testing complex hooks with all patterns combined.

## Troubleshooting

### Timers not being cleared
- Ensure timers are registered immediately after creation
- Check that `registerTimer` is called before the timer executes
- Use `setupTimerMocks()` in tests to control timer behavior

### React Query not canceling
- Ensure `queryClient` is passed to `useResourceCleanup`
- Check that queries are actually active when cleanup runs
- Use `cancelQueries` spy in tests to verify cancellation

### Memory leaks
- Use `createTimerLeakDetector()` to detect timer leaks
- Check for subscriptions that aren't cleaned up
- Verify all event listeners are removed

### Test failures with async cleanup
- Use `waitFor` to wait for async cleanup to complete
- Ensure `act()` wraps all state updates
- Check that promises resolve before assertions
