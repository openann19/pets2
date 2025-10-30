import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Test React Query integration and configuration
describe('React Query Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
          retry: 2,
          refetchOnWindowFocus: false,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('configures React Query with correct default options', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    
    expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000);
    expect(defaultOptions.queries?.gcTime).toBe(10 * 60 * 1000);
    expect(defaultOptions.queries?.retry).toBe(2);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('handles successful query', async () => {
    const mockData = { message: 'success' };
    const mockFn = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useQuery({
        queryKey: ['test'],
        queryFn: mockFn,
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('handles query errors with retry', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('First error'))
      .mockRejectedValueOnce(new Error('Second error'))
      .mockRejectedValueOnce(new Error('Third error'));

    const { result } = renderHook(
      () => useQuery({
        queryKey: ['test-error'],
        queryFn: mockFn,
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    }, { timeout: 5000 });

    // Should retry 2 times (total 3 calls)
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('caches query results', async () => {
    const mockData = { cached: 'data' };
    const mockFn = jest.fn().mockResolvedValue(mockData);

    // First render
    const { result: result1 } = renderHook(
      () => useQuery({
        queryKey: ['cached-test'],
        queryFn: mockFn,
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result1.current.isSuccess).toBe(true);
    });

    // Second render with same key should use cache
    const { result: result2 } = renderHook(
      () => useQuery({
        queryKey: ['cached-test'],
        queryFn: mockFn,
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result2.current.isSuccess).toBe(true);
    });

    // Should only call the function once due to caching
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result2.current.data).toEqual(mockData);
  });

  it('handles background refetching', async () => {
    const mockFn = jest.fn()
      .mockResolvedValueOnce({ version: 1 })
      .mockResolvedValueOnce({ version: 2 });

    const { result } = renderHook(
      () => useQuery({
        queryKey: ['refetch-test'],
        queryFn: mockFn,
        staleTime: 0, // Make it stale immediately
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ version: 1 });

    // Trigger refetch
    result.current.refetch();

    await waitFor(() => {
      expect(result.current.data).toEqual({ version: 2 });
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('provides loading states', async () => {
    let resolvePromise: (value: unknown) => void;
    const mockFn = jest.fn(() => new Promise(resolve => {
      resolvePromise = resolve;
    }));

    const { result } = renderHook(
      () => useQuery({
        queryKey: ['loading-test'],
        queryFn: mockFn,
      }),
      { wrapper }
    );

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Resolve the promise
    resolvePromise!({ loaded: true });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ loaded: true });
  });
});
