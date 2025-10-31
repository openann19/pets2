/**
 * Edge Case Discovery Helpers
 * 
 * Utilities to discover and test edge cases in complex hooks:
 * - Rapid mount/unmount cycles
 * - Dependency changes during async operations
 * - Concurrent operations
 * - Memory leaks
 * - Timer accumulation
 * - Query cache pollution
 */

import { act, renderHook } from '@testing-library/react-native';
import type { RenderHookResult } from '@testing-library/react-native';

export interface EdgeCaseTestConfig {
  /** Number of iterations for stress tests */
  iterations?: number;
  /** Delay between operations (ms) */
  delay?: number;
  /** Check for memory leaks */
  checkMemoryLeaks?: boolean;
}

/**
 * Test rapid mount/unmount cycles
 * Useful for discovering cleanup issues
 */
export async function testRapidMountUnmount<TResult, TProps>(
  renderHook: (props?: TProps) => RenderHookResult<TResult, TProps>,
  config: EdgeCaseTestConfig = {},
): Promise<void> {
  const { iterations = 10, delay = 10 } = config;

  for (let i = 0; i < iterations; i++) {
    const { unmount } = renderHook();
    
    act(() => {
      unmount();
    });

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Test dependency changes during async operations
 */
export async function testDependencyChanges<TResult, TProps>(
  renderHook: (props: TProps) => RenderHookResult<TResult, TProps>,
  propChanges: Array<TProps>,
  delayBetweenChanges = 100,
): Promise<void> {
  const hookResult = renderHook(propChanges[0]);

  for (let i = 1; i < propChanges.length; i++) {
    await act(async () => {
      hookResult.rerender(propChanges[i]);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenChanges));
    });
  }

  act(() => {
    hookResult.unmount();
  });
}

/**
 * Test concurrent async operations
 */
export async function testConcurrentOperations<T>(
  operations: Array<() => Promise<T>>,
  expectedFinalState: (results: Array<T | Error>) => void,
): Promise<void> {
  const results = await Promise.allSettled(
    operations.map((op) => op()),
  );

  const values = results.map((result) =>
    result.status === 'fulfilled' ? result.value : result.reason,
  );

  expectedFinalState(values);
}

/**
 * Detect timer accumulation (memory leak indicator)
 */
export function createTimerLeakDetector(): {
  getActiveTimers: () => number;
  checkForLeaks: (beforeCount: number, afterCount: number) => boolean;
  reset: () => void;
} {
  let activeTimers = 0;

  const originalSetTimeout = global.setTimeout;
  const originalSetInterval = global.setInterval;
  const originalClearTimeout = global.clearTimeout;
  const originalClearInterval = global.clearInterval;

  const trackedTimers = new Set<ReturnType<typeof setTimeout>>();

  global.setTimeout = ((...args: Parameters<typeof setTimeout>) => {
    const timerId = originalSetTimeout(...args);
    activeTimers++;
    trackedTimers.add(timerId);
    return timerId;
  }) as typeof setTimeout;

  global.setInterval = ((...args: Parameters<typeof setInterval>) => {
    const timerId = originalSetInterval(...args);
    activeTimers++;
    trackedTimers.add(timerId);
    return timerId;
  }) as typeof setInterval;

  global.clearTimeout = ((timerId: ReturnType<typeof setTimeout>) => {
    if (trackedTimers.has(timerId)) {
      activeTimers--;
      trackedTimers.delete(timerId);
    }
    return originalClearTimeout(timerId);
  }) as typeof clearTimeout;

  global.clearInterval = ((timerId: ReturnType<typeof setInterval>) => {
    if (trackedTimers.has(timerId)) {
      activeTimers--;
      trackedTimers.delete(timerId);
    }
    return originalClearInterval(timerId);
  }) as typeof clearInterval;

  return {
    getActiveTimers: () => activeTimers,
    checkForLeaks: (beforeCount: number, afterCount: number) => {
      return afterCount > beforeCount;
    },
    reset: () => {
      activeTimers = 0;
      trackedTimers.clear();
      global.setTimeout = originalSetTimeout;
      global.setInterval = originalSetInterval;
      global.clearTimeout = originalClearTimeout;
      global.clearInterval = originalClearInterval;
    },
  };
}

/**
 * Test query cache pollution
 */
export async function testQueryCachePollution(
  queryClient: any,
  queryKey: string[],
  operations: Array<() => Promise<void>>,
): Promise<{
  initialCacheSize: number;
  finalCacheSize: number;
  polluted: boolean;
}> {
  const initialCache = queryClient.getQueryCache();
  const initialCacheSize = initialCache.getAll().length;

  await Promise.all(operations.map((op) => op()));

  const finalCache = queryClient.getQueryCache();
  const finalCacheSize = finalCache.getAll().length;

  // Check if query still exists after cleanup
  const queryExists = queryClient.getQueryData(queryKey) !== undefined;

  return {
    initialCacheSize,
    finalCacheSize,
    polluted: queryExists || finalCacheSize > initialCacheSize + 1,
  };
}

/**
 * Test cleanup order and timing
 */
export async function testCleanupOrder(
  hookResult: RenderHookResult<any, any>,
  expectedCleanupOrder: Array<string>,
): Promise<Array<string>> {
  const cleanupOrder: Array<string> = [];

  // This would need to be integrated with the hook's cleanup logic
  // For now, it's a framework for testing

  act(() => {
    hookResult.unmount();
  });

  // Wait for cleanup to complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Compare actual vs expected order
  const matches = cleanupOrder.length === expectedCleanupOrder.length &&
    cleanupOrder.every((item, index) => item === expectedCleanupOrder[index]);

  if (!matches) {
    throw new Error(
      `Cleanup order mismatch. Expected: ${expectedCleanupOrder.join(', ')}, Got: ${cleanupOrder.join(', ')}`,
    );
  }

  return cleanupOrder;
}

/**
 * Test error handling during cleanup
 */
export async function testCleanupErrorHandling(
  hookResult: RenderHookResult<any, any>,
  expectedErrors: Array<string>,
): Promise<Array<Error>> {
  const errors: Array<Error> = [];

  const originalConsoleError = console.error;
  console.error = jest.fn((...args) => {
    if (args[0] instanceof Error) {
      errors.push(args[0]);
    }
    originalConsoleError(...args);
  });

  try {
    act(() => {
      hookResult.unmount();
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Restore console.error
    console.error = originalConsoleError;

    // Verify expected errors occurred
    const errorMessages = errors.map((e) => e.message);
    const matches = expectedErrors.every((expected) =>
      errorMessages.some((actual) => actual.includes(expected)),
    );

    if (!matches) {
      throw new Error(
        `Expected errors not found. Expected: ${expectedErrors.join(', ')}, Got: ${errorMessages.join(', ')}`,
      );
    }

    return errors;
  } finally {
    console.error = originalConsoleError;
  }
}

/**
 * Stress test hook with multiple scenarios
 */
export async function stressTestHook<TResult, TProps>(
  renderHook: (props?: TProps) => RenderHookResult<TResult, TProps>,
  scenarios: Array<{
    name: string;
    props?: TProps;
    operations?: Array<() => Promise<void> | void>;
    assertions?: () => void | Promise<void>;
  }>,
): Promise<Array<{ scenario: string; passed: boolean; error?: Error }>> {
  const results: Array<{ scenario: string; passed: boolean; error?: Error }> = [];

  for (const scenario of scenarios) {
    try {
      const hookResult = renderHook(scenario.props);

      if (scenario.operations) {
        for (const operation of scenario.operations) {
          await act(async () => {
            await Promise.resolve(operation());
          });
        }
      }

      if (scenario.assertions) {
        await act(async () => {
          await Promise.resolve(scenario.assertions!());
        });
      }

      act(() => {
        hookResult.unmount();
      });

      results.push({ scenario: scenario.name, passed: true });
    } catch (error) {
      results.push({
        scenario: scenario.name,
        passed: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  return results;
}
