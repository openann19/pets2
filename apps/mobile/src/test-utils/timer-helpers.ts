/**
 * Timer Management Test Utilities
 * Provides standardized fake timer setup and cleanup for tests
 */

// Jest timer types
type JestFakeTimers = {
  useFakeTimers(): void;
  useRealTimers(): void;
  runOnlyPendingTimers(): void;
  clearAllTimers(): void;
  advanceTimersByTime(ms: number): void;
};

// Access Jest timer methods from global
const jestTimers = (jest as unknown as JestFakeTimers);

type TimerState = {
  isUsingFakeTimers: boolean;
  pendingTimers: number;
};

let globalTimerState: TimerState = {
  isUsingFakeTimers: false,
  pendingTimers: 0,
};

/**
 * Setup fake timers with proper tracking
 * Use this instead of calling jest.useFakeTimers() directly
 */
export function setupFakeTimers(): void {
  if (!globalTimerState.isUsingFakeTimers) {
    jestTimers.useFakeTimers();
    globalTimerState.isUsingFakeTimers = true;
    globalTimerState.pendingTimers = 0;
  }
}

/**
 * Comprehensive timer cleanup
 * 
 * Order matters:
 * 1. Run only pending timers (prevents completing future timers)
 * 2. Clear all timers (removes any remaining timers)
 * 3. Restore real timers (essential for test isolation)
 */
export function cleanupTimers(): void {
  try {
    if (globalTimerState.isUsingFakeTimers) {
      // Run only pending timers to allow cleanup code to execute
      jestTimers.runOnlyPendingTimers();
      
      // Clear any remaining timers
      jestTimers.clearAllTimers();
      
      // Always restore real timers for test isolation
      jestTimers.useRealTimers();
      
      globalTimerState.isUsingFakeTimers = false;
      globalTimerState.pendingTimers = 0;
    }
  } catch (error) {
    // Ensure real timers are restored even if cleanup fails
    try {
      jestTimers.useRealTimers();
    } catch {
      // Ignore errors during forced restoration
    }
    
    if (process.env['NODE_ENV'] === 'test') {
      console.warn('Timer cleanup warning:', error);
    }
  }
}

/**
 * Wrapper function for tests that need fake timers
 * Automatically sets up and cleans up timers
 * 
 * @example
 * ```typescript
 * it('should handle timers', async () => {
 *   await withFakeTimers(async () => {
 *     setupFakeTimers();
 *     // Your test code here
 *   });
 * });
 * ```
 */
export async function withFakeTimers<T>(
  fn: () => Promise<T> | T
): Promise<T> {
  const wasUsingFakeTimers = globalTimerState.isUsingFakeTimers;
  
  if (!wasUsingFakeTimers) {
    setupFakeTimers();
  }
  
  try {
    const result = await fn();
    return result;
  } finally {
    if (!wasUsingFakeTimers) {
      cleanupTimers();
    }
  }
}

/**
 * Advance timers and wait for async operations
 * Useful when testing hooks with timers and async state updates
 */
export async function advanceTimersAndWait(
  ms: number
): Promise<void> {
  if (!globalTimerState.isUsingFakeTimers) {
    throw new Error('Fake timers must be set up before advancing timers');
  }
  
  jestTimers.advanceTimersByTime(ms);
  
  // Wait for any async operations triggered by timer advancement
  await Promise.resolve();
}

/**
 * Get timer state (for debugging)
 */
export function getTimerState(): Readonly<TimerState> {
  return { ...globalTimerState };
}

/**
 * Reset timer state (for test isolation)
 */
export function resetTimerState(): void {
  cleanupTimers();
  globalTimerState = {
    isUsingFakeTimers: false,
    pendingTimers: 0,
  };
}

