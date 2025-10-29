/**
 * Test helper to flush async state updates and timers
 */
import { act } from '@testing-library/react-native';

/**
 * Flush pending async operations and optionally advance timers
 * @param ms - Milliseconds to advance timers (default: 0)
 */
export async function actFlush(ms = 0) {
  await act(async () => {
    if (ms > 0 && typeof jest !== 'undefined' && 'advanceTimersByTime' in jest) {
      (jest as any).advanceTimersByTime(ms);
    }
    await Promise.resolve();
  });
}

/**
 * Flush and wait for a specific condition
 * @param condition - Condition function to wait for
 * @param timeout - Max time to wait (default: 1000ms)
 */
export async function actWaitFor(
  condition: () => boolean | void,
  timeout = 1000
) {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    
    const check = async () => {
      try {
        if (condition()) {
          resolve();
          return;
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error('actWaitFor timeout'));
          return;
        }
        
        await actFlush(10);
        setTimeout(check, 10);
      } catch (error) {
        reject(error);
      }
    };
    
    check();
  });
}
