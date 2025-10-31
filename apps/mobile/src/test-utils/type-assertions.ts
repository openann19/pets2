/**
 * Type Assertion Helpers for Tests
 * Provides type-safe assertions and utilities for test results
 */

import type { RenderHookResult } from '@testing-library/react-native';

/**
 * Assert that a value is not null/undefined and return typed value
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || `Expected value to be defined, but got ${value}`);
  }
}

/**
 * Assert that a hook result has the expected structure
 */
export function assertHookResult<TResult>(
  result: RenderHookResult<TResult, unknown>,
  checks: Array<(current: TResult) => boolean | string>
): void {
  const errors: string[] = [];
  
  for (const check of checks) {
    const result_check = check(result.current);
    if (result_check !== true) {
      errors.push(typeof result_check === 'string' ? result_check : 'Check failed');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Hook result assertions failed:\n${errors.join('\n')}`);
  }
}

/**
 * Type guard for hook results
 */
export function isHookResult<TResult>(
  value: unknown
): value is RenderHookResult<TResult, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'current' in value &&
    'rerender' in value &&
    'unmount' in value
  );
}

/**
 * Get typed current value from hook result with null check
 */
export function getHookValue<TResult>(
  result: RenderHookResult<TResult, unknown>
): TResult {
  assertDefined(result.current, 'Hook result current value is undefined');
  return result.current;
}

/**
 * Assert that an async function resolves
 */
export async function assertResolves<T>(
  promise: Promise<T>,
  timeout = 5000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Promise did not resolve within ${timeout}ms`)), timeout);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Assert that an async function rejects
 */
export async function assertRejects(
  promise: Promise<unknown>,
  errorMatcher?: string | RegExp | ((error: unknown) => boolean),
  timeout = 5000
): Promise<unknown> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Promise did not reject within ${timeout}ms`)), timeout);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    throw new Error(`Expected promise to reject, but it resolved with: ${result}`);
  } catch (error) {
    if (errorMatcher) {
      if (typeof errorMatcher === 'string') {
        if (!String(error).includes(errorMatcher)) {
          throw new Error(`Expected error to match "${errorMatcher}", but got: ${error}`);
        }
      } else if (errorMatcher instanceof RegExp) {
        if (!errorMatcher.test(String(error))) {
          throw new Error(`Expected error to match ${errorMatcher}, but got: ${error}`);
        }
      } else {
        if (!errorMatcher(error)) {
          throw new Error(`Error matcher function returned false for: ${error}`);
        }
      }
    }
    return error;
  }
}

/**
 * Type-safe mock function wrapper
 */
export function createTypedMock<TArgs extends unknown[], TReturn>(
  implementation?: (...args: TArgs) => TReturn
): jest.Mock<TReturn, TArgs> {
  return jest.fn(implementation) as jest.Mock<TReturn, TArgs>;
}

/**
 * Assert mock was called with specific arguments (type-safe)
 */
export function assertMockCalledWith<TArgs extends unknown[]>(
  mock: jest.Mock<unknown, TArgs>,
  ...args: TArgs
): void {
  expect(mock).toHaveBeenCalledWith(...args);
}

/**
 * Get the last call arguments from a mock (type-safe)
 */
export function getLastMockCall<TArgs extends unknown[]>(
  mock: jest.Mock<unknown, TArgs>
): TArgs | undefined {
  const calls = mock.mock.calls;
  return calls.length > 0 ? (calls[calls.length - 1] as TArgs) : undefined;
}

