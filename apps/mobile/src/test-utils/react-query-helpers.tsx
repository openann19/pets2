/**
 * React Query Test Utilities
 * Provides standardized QueryClient setup and cleanup for tests
 */

import React from 'react';
import { QueryClient, QueryClientProvider, QueryClientConfig } from '@tanstack/react-query';

/**
 * Create a test QueryClient with deterministic defaults
 * 
 * Features:
 * - retry: false - prevents flaky tests from retries
 * - gcTime: 0 - prevents cache persistence between tests
 * - refetchOnMount: false - prevents unexpected refetches
 * - refetchOnWindowFocus: false - prevents focus-based refetches
 */
export function createTestQueryClient(
  overrides?: Partial<QueryClientConfig>
): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Previously cacheTime in v4
        staleTime: 0,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
    ...overrides,
  });
}

/**
 * Comprehensive cleanup for QueryClient
 * 
 * Order matters:
 * 1. Cancel all ongoing queries (prevents race conditions)
 * 2. Remove all queries (clears observers)
 * 3. Clear cache (final cleanup)
 */
export function cleanupQueryClient(queryClient: QueryClient): void {
  try {
    // Cancel all ongoing queries to prevent race conditions
    queryClient.cancelQueries();
    
    // Remove all queries and their observers
    queryClient.removeQueries();
    
    // Clear all cached data
    queryClient.clear();
  } catch (error) {
    // Silently fail cleanup - don't break tests if cleanup fails
    // This can happen if QueryClient is already disposed
    if (process.env.NODE_ENV === 'test') {
      console.warn('QueryClient cleanup warning:', error);
    }
  }
}

/**
 * Create a wrapper component with QueryClientProvider
 * Use with renderHook or render from testing-library
 */
export function createWrapperWithQueryClient(
  queryClient?: QueryClient
): React.ComponentType<{ children: React.ReactNode }> {
  const client = queryClient || createTestQueryClient();
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

/**
 * Hook for tests that need QueryClient instance
 * Returns both the client and wrapper
 */
export function useTestQueryClient(
  overrides?: Partial<QueryClientConfig>
): {
  queryClient: QueryClient;
  wrapper: React.ComponentType<{ children: React.ReactNode }>;
} {
  const queryClient = React.useMemo(
    () => createTestQueryClient(overrides),
    []
  );
  
  const wrapper = React.useMemo(
    () => createWrapperWithQueryClient(queryClient),
    [queryClient]
  );
  
  return { queryClient, wrapper };
}

/**
 * Reset QueryClient to clean state (useful for beforeEach)
 */
export function resetQueryClient(queryClient: QueryClient): void {
  cleanupQueryClient(queryClient);
  // Optionally reconfigure with defaults
  queryClient.setDefaultOptions({
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });
}

