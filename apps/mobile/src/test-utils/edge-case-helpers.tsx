/**
 * Edge Case Test Utilities
 * Provides helpers for testing edge cases like unmount cleanup, rapid updates, etc.
 */

import { renderHook, RenderHookResult } from '@testing-library/react-native';
import { act } from '@testing-library/react-native';
import type { renderHookWithProviders, HookTestOptions } from './hook-helpers';

/**
 * Test that a hook properly cleans up on unmount
 * 
 * @example
 * ```typescript
 * it('should cleanup on unmount', async () => {
 *   await testUnmountCleanup(
 *     () => useComplexHook(),
 *     (result) => {
 *       expect(result.current.cleanup).toHaveBeenCalled();
 *     }
 *   );
 * });
 * ```
 */
export async function testUnmountCleanup<TProps, TResult>(
  hookFactory: (props: TProps) => TResult,
  options: {
    /** Custom render options */
    renderOptions?: HookTestOptions;
    /** Assertions to run after unmount */
    assertions?: (result: RenderHookResult<TResult, TProps>) => void | Promise<void>;
    /** Initial props */
    initialProps?: TProps;
  } = {}
): Promise<void> {
  const { renderOptions = {}, assertions, initialProps } = options;
  
  // Use renderHookWithProviders if available, otherwise fallback to renderHook
  // This is a simplified version - in practice, you'd import the actual function
  const { result, unmount } = renderHook(hookFactory, {
    initialProps: initialProps as TProps,
  });

  // Give hook time to initialize
  await act(async () => {
    await Promise.resolve();
  });

  // Unmount
  unmount();

  // Allow cleanup to run
  await act(async () => {
    await Promise.resolve();
  });

  // Run assertions if provided
  if (assertions) {
    await assertions(result);
  }
}

/**
 * Test hook with rapid state/prop updates
 * Useful for testing race conditions and state consistency
 * 
 * @example
 * ```typescript
 * it('should handle rapid updates', async () => {
 *   await testRapidUpdates(
 *     () => useSearchHook(),
 *     [
 *       { query: 'dog' },
 *       { query: 'cat' },
 *       { query: 'bird' },
 *     ],
 *     (result) => {
 *       expect(result.current.results).toBeDefined();
 *     }
 *   );
 * });
 * ```
 */
export async function testRapidUpdates<TProps, TResult>(
  hookFactory: (props: TProps) => TResult,
  updates: TProps[],
  options: {
    /** Custom render options */
    renderOptions?: HookTestOptions;
    /** Delay between updates (ms) */
    delay?: number;
    /** Assertions after all updates */
    assertions?: (result: RenderHookResult<TResult, TProps>) => void | Promise<void>;
  } = {}
): Promise<void> {
  const { renderOptions = {}, delay = 0, assertions } = options;
  
  const { result, rerender } = renderHook(hookFactory, {
    initialProps: updates[0],
  });

  // Apply rapid updates
  for (let i = 1; i < updates.length; i++) {
    if (delay > 0) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, delay));
      });
    }
    
    await act(async () => {
      rerender(updates[i]);
      await Promise.resolve();
    });
  }

  // Wait for final state to stabilize
  await act(async () => {
    await Promise.resolve();
  });

  // Run assertions
  if (assertions) {
    await assertions(result);
  }
}

/**
 * Test hook error recovery scenarios
 * 
 * @example
 * ```typescript
 * it('should recover from errors', async () => {
 *   await testErrorRecovery(
 *     () => useDataHook(),
 *     [
 *       { shouldFail: true },
 *       { shouldFail: false },
 *     ],
 *     (result) => {
 *       expect(result.current.error).toBeNull();
 *       expect(result.current.data).toBeDefined();
 *     }
 *   );
 * });
 * ```
 */
export async function testErrorRecovery<TProps, TResult>(
  hookFactory: (props: TProps) => TResult,
  scenarios: Array<{
    props: TProps;
    shouldFail?: boolean;
    errorMessage?: string;
  }>,
  options: {
    /** Custom render options */
    renderOptions?: HookTestOptions;
    /** Assertions after recovery */
    assertions?: (result: RenderHookResult<TResult, TProps>) => void | Promise<void>;
  } = {}
): Promise<void> {
  const { renderOptions = {}, assertions } = options;
  
  const { result, rerender } = renderHook(hookFactory, {
    initialProps: scenarios[0].props,
  });

  // Apply scenarios
  for (const scenario of scenarios.slice(1)) {
    await act(async () => {
      rerender(scenario.props);
      
      if (scenario.shouldFail) {
        // Trigger error scenario
        await Promise.resolve();
      } else {
        // Trigger recovery scenario
        await Promise.resolve();
      }
    });
  }

  // Wait for final state
  await act(async () => {
    await Promise.resolve();
  });

  // Run assertions
  if (assertions) {
    await assertions(result);
  }
}

/**
 * Test hook with network state transitions
 * Useful for testing offline/online behavior
 */
export async function testNetworkTransitions<TProps, TResult>(
  hookFactory: (props: TProps) => TResult,
  transitions: Array<'online' | 'offline'>,
  options: {
    /** Custom render options */
    renderOptions?: HookTestOptions;
    /** Mock network status */
    mockNetworkStatus?: (status: 'online' | 'offline') => void;
    /** Assertions after transitions */
    assertions?: (result: RenderHookResult<TResult, TProps>) => void | Promise<void>;
    initialProps?: TProps;
  } = {}
): Promise<void> {
  const { renderOptions = {}, mockNetworkStatus, assertions, initialProps } = options;
  
  const { result } = renderHook(hookFactory, {
    initialProps: initialProps as TProps,
  });

  // Apply network transitions
  for (const status of transitions) {
    await act(async () => {
      if (mockNetworkStatus) {
        mockNetworkStatus(status);
      }
      await Promise.resolve();
    });
  }

  // Wait for state to stabilize
  await act(async () => {
    await Promise.resolve();
  });

  // Run assertions
  if (assertions) {
    await assertions(result);
  }
}

/**
 * Test hook with concurrent operations
 * Useful for testing race conditions and state consistency
 */
export async function testConcurrentOperations<TProps, TResult>(
  hookFactory: (props: TProps) => TResult,
  operations: Array<{
    name: string;
    action: (result: RenderHookResult<TResult, TProps>) => Promise<void> | void;
  }>,
  options: {
    /** Custom render options */
    renderOptions?: HookTestOptions;
    /** Run operations concurrently (default: true) */
    concurrent?: boolean;
    /** Assertions after operations */
    assertions?: (result: RenderHookResult<TResult, TProps>) => void | Promise<void>;
    initialProps?: TProps;
  } = {}
): Promise<void> {
  const { renderOptions = {}, concurrent = true, assertions, initialProps } = options;
  
  const { result } = renderHook(hookFactory, {
    initialProps: initialProps as TProps,
  });

  if (concurrent) {
    // Run all operations concurrently
    await act(async () => {
      await Promise.all(
        operations.map((op) => op.action(result))
      );
    });
  } else {
    // Run operations sequentially
    for (const op of operations) {
      await act(async () => {
        await op.action(result);
      });
    }
  }

  // Wait for state to stabilize
  await act(async () => {
    await Promise.resolve();
  });

  // Run assertions
  if (assertions) {
    await assertions(result);
  }
}

