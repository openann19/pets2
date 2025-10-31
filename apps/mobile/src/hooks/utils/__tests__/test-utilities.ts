/**
 * Advanced Test Utilities for Complex Hooks
 * 
 * Utilities for testing hooks with:
 * - React Query
 * - Timers
 * - WebSocket/EventEmitter
 * - Multiple async dependencies
 * - Race conditions
 * - Cleanup scenarios
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { RenderHookResult } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import type { ReactNode } from 'react';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

export interface TestQueryClientOptions {
  /** Enable query client logger */
  enableLogger?: boolean;
  /** Default query options */
  defaultOptions?: {
    queries?: {
      retry?: boolean | number;
      staleTime?: number;
      gcTime?: number;
    };
  };
}

/**
 * Create a test QueryClient with sensible defaults
 */
export function createTestQueryClient(options: TestQueryClientOptions = {}): QueryClient {
  const { defaultOptions = {} } = options;

  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
        ...defaultOptions.queries,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper component for testing hooks with QueryClient
 */
export function TestQueryProvider({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}): React.JSX.Element {
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

/**
 * Mock React Query hooks with fine-grained control
 */
export interface MockQueryOptions<TData = unknown> {
  data?: TData;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
  isFetching?: boolean;
  isSuccess?: boolean;
  refetch?: () => Promise<UseQueryResult<TData>>;
}

/**
 * Create a mock useQuery return value
 */
export function createMockQueryResult<TData = unknown>(
  options: MockQueryOptions<TData> = {},
): UseQueryResult<TData> {
  const {
    data,
    isLoading = false,
    isError = false,
    error,
    isFetching = false,
    isSuccess = data !== undefined && !isError && !isLoading,
    refetch = jest.fn().mockResolvedValue({
      data,
      isLoading: false,
      isError: false,
      isFetching: false,
      isSuccess: true,
    } as UseQueryResult<TData>),
  } = options;

  return {
    data: data as TData,
    isLoading,
    isError,
    error: error || (isError ? new Error('Mock query error') : null),
    isFetching,
    isSuccess,
    refetch: refetch as () => Promise<UseQueryResult<TData>>,
    status: isLoading
      ? ('loading' as const)
      : isError
        ? ('error' as const)
        : ('success' as const),
    fetchStatus: isFetching ? ('fetching' as const) : ('idle' as const),
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: isError ? Date.now() : 0,
    failureCount: isError ? 1 : 0,
    failureReason: error || null,
    errorUpdateCount: isError ? 1 : 0,
    isInitialLoading: isLoading,
    isPaused: false,
    isPlaceholderData: false,
    isPreviousData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    errorReset: jest.fn(),
    remove: jest.fn(),
    // Additional required properties
    isPending: isLoading,
    isLoadingError: isError && isLoading,
    isFetched: !isLoading,
    isFetchedAfterMount: !isLoading,
  } as unknown as UseQueryResult<TData>;
}

export interface MockMutationOptions<TData = unknown, TVariables = unknown> {
  mutate?: jest.Mock;
  mutateAsync?: jest.Mock;
  data?: TData;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
  isSuccess?: boolean;
  isPaused?: boolean;
  reset?: jest.Mock;
}

/**
 * Create a mock useMutation return value
 */
export function createMockMutationResult<TData = unknown, TVariables = unknown>(
  options: MockMutationOptions<TData, TVariables> = {},
): UseMutationResult<TData, Error, TVariables> {
  const {
    mutate = jest.fn(),
    mutateAsync = jest.fn(),
    data,
    isLoading = false,
    isError = false,
    error,
    isSuccess = data !== undefined && !isError && !isLoading,
    isPaused = false,
    reset = jest.fn(),
  } = options;

  return {
    mutate,
    mutateAsync: mutateAsync as (
      variables: TVariables,
      options?: any,
    ) => Promise<TData>,
    data: data as TData,
    isLoading,
    isError,
    error: error || (isError ? new Error('Mock mutation error') : null),
    isSuccess,
    isPaused,
    reset: reset as () => void,
    status: isLoading
      ? ('loading' as const)
      : isError
        ? ('error' as const)
        : isSuccess
          ? ('success' as const)
          : ('idle' as const),
    submittedAt: Date.now(),
    variables: undefined,
    context: undefined,
    failureCount: isError ? 1 : 0,
    failureReason: error || null,
    isIdle: !isLoading && !isError && !isSuccess,
    isPending: isLoading,
    isReset: false,
  } as UseMutationResult<TData, Error, TVariables>;
}

/**
 * Timer control utilities for testing
 */
export interface TimerControl {
  /** Fast-forward time by specified milliseconds */
  advanceTimersByTime: (ms: number) => void;
  /** Run all pending timers */
  runAllTimers: () => void;
  /** Run only pending timers */
  runOnlyPendingTimers: () => void;
  /** Get number of pending timers */
  getTimerCount: () => number;
  /** Clear all timers */
  clearAllTimers: () => void;
}

/**
 * Setup timer mocks and return control utilities
 */
export function setupTimerMocks(): TimerControl {
  jest.useFakeTimers();

  return {
    advanceTimersByTime: (ms: number) => {
      act(() => {
        jest.advanceTimersByTime(ms);
      });
    },
    runAllTimers: () => {
      act(() => {
        jest.runAllTimers();
      });
    },
    runOnlyPendingTimers: () => {
      act(() => {
        jest.runOnlyPendingTimers();
      });
    },
    getTimerCount: () => {
      return (jest as any).getTimerCount?.() || 0;
    },
    clearAllTimers: () => {
      jest.clearAllTimers();
    },
  };
}

/**
 * Cleanup timer mocks
 */
export function cleanupTimerMocks(): void {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
}

/**
 * Render hook with QueryClient provider
 */
export function renderHookWithQueryClient<TResult, TProps>(
  render: (props: TProps) => TResult,
  options: {
    initialProps?: TProps;
    queryClient?: QueryClient;
    wrapper?: (props: { children: ReactNode }) => React.JSX.Element;
  } = {},
): RenderHookResult<TResult, TProps> {
  const { initialProps, queryClient = createTestQueryClient(), wrapper } = options;

  const Wrapper = wrapper
    ? wrapper
    : ({ children }: { children: ReactNode }) =>
        React.createElement(TestQueryProvider, { queryClient, children });

  return renderHook(render, {
    ...(initialProps !== undefined && { initialProps }),
    wrapper: Wrapper,
  });
}

/**
 * Wait for async operations with timeout
 */
export async function waitForAsync(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {},
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await Promise.resolve(condition());
    if (result) return;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`waitForAsync timed out after ${timeout}ms`);
}

/**
 * Test cleanup patterns
 */
export async function testCleanup(
  hookResult: RenderHookResult<any, any>,
  cleanupChecks: Array<() => boolean | Promise<boolean>>,
): Promise<void> {
  // Unmount the hook
  act(() => {
    hookResult.unmount();
  });

  // Wait a bit for cleanup to complete
  await waitFor(() => {
    return cleanupChecks.every((check) => check());
  });
}

/**
 * Test race condition scenarios
 */
export async function testRaceCondition<T>(
  operations: Array<() => Promise<T>>,
  expectedBehavior: (results: Array<T | Error>) => void,
): Promise<void> {
  const results = await Promise.allSettled(
    operations.map((op) => op().catch((error) => error)),
  );

  const values = results.map((result) =>
    result.status === 'fulfilled' ? result.value : result.reason,
  );

  expectedBehavior(values);
}

/**
 * Create mock WebSocket
 */
export function createMockWebSocket(): {
  socket: {
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
    connect: jest.Mock;
    disconnect: jest.Mock;
    connected: boolean;
  };
  events: Map<string, Array<(...args: any[]) => void>>;
} {
  const events = new Map<string, Array<(...args: any[]) => void>>();

  const socket: {
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
    disconnect: jest.Mock;
    connected: boolean;
  } = {
    on: jest.fn((event: string, handler: (...args: any[]) => void): typeof socket => {
      if (!events.has(event)) {
        events.set(event, []);
      }
      events.get(event)!.push(handler);
      return socket;
    }),
    off: jest.fn((event: string, handler?: (...args: any[]) => void): typeof socket => {
      if (handler) {
        const handlers = events.get(event);
        if (handlers) {
          const index = handlers.indexOf(handler);
          if (index > -1) handlers.splice(index, 1);
        }
      } else {
        events.delete(event);
      }
      return socket;
    }),
    emit: jest.fn((event: string, ...args: any[]) => {
      const handlers = events.get(event) || [];
      handlers.forEach((handler) => handler(...args));
      return socket;
    }),
    connect: jest.fn(() => {
      socket.connected = true;
      const connectHandlers = events.get('connect') || [];
      connectHandlers.forEach((handler) => handler());
      return socket;
    }),
    disconnect: jest.fn(() => {
      socket.connected = false;
      const disconnectHandlers = events.get('disconnect') || [];
      disconnectHandlers.forEach((handler) => handler());
      return socket;
    }),
    connected: false,
  };

  return { socket, events };
}

/**
 * Assert that a hook properly cleans up resources
 */
export async function assertCleanup(
  hookResult: RenderHookResult<any, any>,
  assertions: {
    timersCleared?: () => boolean;
    queriesCancelled?: () => boolean;
    listenersRemoved?: () => boolean;
    subscriptionsClosed?: () => boolean;
  },
): Promise<void> {
  const { unmount } = hookResult;

  act(() => {
    unmount();
  });

  await waitFor(async () => {
    if (assertions.timersCleared && !assertions.timersCleared()) {
      throw new Error('Timers were not cleared');
    }
    if (assertions.queriesCancelled && !assertions.queriesCancelled()) {
      throw new Error('Queries were not cancelled');
    }
    if (assertions.listenersRemoved && !assertions.listenersRemoved()) {
      throw new Error('Event listeners were not removed');
    }
    if (assertions.subscriptionsClosed && !assertions.subscriptionsClosed()) {
      throw new Error('Subscriptions were not closed');
    }
  });
}
