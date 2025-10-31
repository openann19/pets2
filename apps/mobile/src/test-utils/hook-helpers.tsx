/**
 * Multi-Dependency Hook Test Utilities
 * Provides helpers for testing complex hooks with multiple dependencies
 */

import React from 'react';
import { renderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/theme';
import {
  createTestQueryClient,
  cleanupQueryClient,
  createWrapperWithQueryClient,
} from './react-query-helpers';
import { setupFakeTimers, cleanupTimers } from './timer-helpers';

export interface HookTestOptions {
  /** Custom QueryClient instance */
  queryClient?: QueryClient;
  /** Enable fake timers for timer-based hooks */
  useFakeTimers?: boolean;
  /** Include navigation provider */
  withNavigation?: boolean;
  /** Include theme provider */
  withTheme?: boolean;
  /** Additional wrapper components */
  wrappers?: Array<React.ComponentType<{ children: React.ReactNode }>>;
  /** Initial props for the hook */
  initialProps?: unknown;
}

export interface HookTestResult<TProps, TResult> {
  /** Render hook result */
  result: RenderHookResult<TResult, TProps>;
  /** QueryClient instance */
  queryClient: QueryClient;
  /** Cleanup function */
  cleanup: () => void;
  /** Rerender hook with new props */
  rerender: (props?: TProps) => void;
  /** Unmount hook */
  unmount: () => void;
}

/**
 * Render a hook with all necessary providers
 * 
 * Supports:
 * - React Query (QueryClient)
 * - Navigation (NavigationContainer)
 * - Theme (ThemeProvider)
 * - Fake timers
 * - Custom wrappers
 */
export function renderHookWithProviders<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options: HookTestOptions = {}
): HookTestResult<TProps, TResult> {
  const {
    queryClient = createTestQueryClient(),
    useFakeTimers = false,
    withNavigation = false,
    withTheme = true,
    wrappers = [],
    initialProps,
  } = options;

  // Setup fake timers if requested
  if (useFakeTimers) {
    setupFakeTimers();
  }

  // Build wrapper chain
  const AllWrappers: React.ComponentType<{ children: React.ReactNode }> = ({
    children,
  }) => {
    let content = children;

    // Apply custom wrappers first (innermost)
    for (const Wrapper of wrappers) {
      content = <Wrapper>{content}</Wrapper>;
    }

    // Apply standard providers (outermost)
    if (withTheme) {
      content = <ThemeProvider>{content}</ThemeProvider>;
    }

    if (withNavigation) {
      content = <NavigationContainer>{content}</NavigationContainer>;
    }

    content = (
      <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>
    );

    return <>{content}</>;
  };

  // Render hook
  const renderResult = renderHook(hook, {
    wrapper: AllWrappers,
    initialProps: initialProps as TProps,
  });

  // Cleanup function
  const cleanup = () => {
    try {
      // Cleanup QueryClient
      cleanupQueryClient(queryClient);

      // Cleanup timers if used
      if (useFakeTimers) {
        cleanupTimers();
      }
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  };

  return {
    result: renderResult,
    queryClient,
    cleanup,
    rerender: renderResult.rerender,
    unmount: renderResult.unmount,
  };
}

/**
 * Mock strategy for multi-dependency hooks
 * 
 * Provides a structured approach to mocking:
 * 1. Services
 * 2. React Query
 * 3. Timers
 * 4. External dependencies (socket, navigation, etc.)
 */
export interface MultiDependencyMockConfig {
  /** Service mocks */
  services?: Record<string, jest.Mock | object>;
  /** QueryClient options */
  queryClientOptions?: Parameters<typeof createTestQueryClient>[0];
  /** Enable fake timers */
  useFakeTimers?: boolean;
  /** Navigation mock */
  navigation?: object;
  /** Socket mock */
  socket?: object;
  /** Store mocks (Zustand, etc.) */
  stores?: Record<string, object>;
}

/**
 * Setup mocks for multi-dependency hooks
 * Returns cleanup function to restore all mocks
 */
export function mockMultiDependencyHook(
  config: MultiDependencyMockConfig = {}
): () => void {
  const {
    services = {},
    useFakeTimers = false,
    navigation,
    socket,
    stores = {},
  } = config;

  const cleanupFns: Array<() => void> = [];

  // Setup fake timers if needed
  if (useFakeTimers) {
    setupFakeTimers();
    cleanupFns.push(() => cleanupTimers());
  }

  // Mock services
  const serviceMocks: Array<jest.Mock> = [];
  for (const [key, mock] of Object.entries(services)) {
    if (jest.isMockFunction(mock)) {
      serviceMocks.push(mock);
      mock.mockClear();
    }
  }

  // Mock stores if provided
  const storeMocks: Array<jest.Mock> = [];
  for (const [key, store] of Object.entries(stores)) {
    // Store mocking logic here
    // This would depend on your store implementation
  }

  // Return cleanup function
  return () => {
    // Restore all mocks
    for (const mock of serviceMocks) {
      mock.mockReset();
    }
    for (const mock of storeMocks) {
      mock.mockReset();
    }

    // Run cleanup functions
    for (const cleanup of cleanupFns) {
      cleanup();
    }
  };
}

/**
 * Test helper for hooks with React Query + timers
 * 
 * @example
 * ```typescript
 * it('should poll data', async () => {
 *   const { result, cleanup } = renderHookWithTimersAndQuery(
 *     () => usePollingHook(),
 *     { refetchInterval: 1000 }
 *   );
 *   
 *   await advanceTimers(1000);
 *   expect(result.current.data).toBeDefined();
 *   cleanup();
 * });
 * ```
 */
export function renderHookWithTimersAndQuery<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options: HookTestOptions & { queryClient?: QueryClient } = {}
): HookTestResult<TProps, TResult> {
  return renderHookWithProviders(hook, {
    ...options,
    useFakeTimers: true,
  });
}

