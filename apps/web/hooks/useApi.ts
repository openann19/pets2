/**
 * API Query Hook
 * Production-hardened React hook for API calls with TanStack Query
 * Features: Caching, error handling, loading states, automatic retries
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { webApiClient, ApiResponse } from '../lib/api-client';
import { handleApiError, WebError } from '../lib/error-handling';
import { logger } from '@pawfectmatch/core';

export interface ApiQueryOptions<T> extends Omit<UseQueryOptions<T, WebError>, 'queryFn'> {
  endpoint: string;
  params?: Record<string, string>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

export interface ApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, WebError, TVariables>, 'mutationFn'> {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: WebError, variables: TVariables) => void;
}

/**
 * Hook for GET requests with caching
 */
export function useApiQuery<T>(
  options: ApiQueryOptions<T>
) {
  const { endpoint, params, enabled = true, staleTime = 5 * 60 * 1000, ...queryOptions } = options;

  return useQuery<T, WebError>({
    queryKey: [endpoint, params],
    queryFn: async (): Promise<T> => {
      try {
        logger.debug('API Query', { endpoint, params });

        const response = await webApiClient.get<T>(endpoint, params);

        if (response.success !== true || response.data === undefined) {
          const errorMessage = (response.error !== undefined && typeof response.error === 'string') ? response.error : 'API request failed';
          throw new Error(errorMessage);
        }

        return response.data;
      } catch (error) {
        const webError = handleApiError(error, endpoint, 'GET', { params });
        throw webError;
      }
    },
    enabled,
    staleTime,
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error instanceof Object && 'type' in error && typeof error.type === 'string' && (error.type === 'AUTHENTICATION' || error.type === 'AUTHORIZATION')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions,
  });
}

/**
 * Hook for API mutations (POST, PUT, PATCH, DELETE)
 */
export function useApiMutation<TData = unknown, TVariables = unknown>(
  options: ApiMutationOptions<TData, TVariables>
) {
  const { endpoint, method = 'POST', onSuccess, onError, ...mutationOptions } = options;
  const queryClient = useQueryClient();

  return useMutation<TData, WebError, TVariables>({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      try {
        logger.debug('API Mutation', { endpoint, method, hasVariables: !!variables });

        let response: ApiResponse<TData>;

        switch (method) {
          case 'POST':
            response = await webApiClient.post<TData>(endpoint, variables);
            break;
          case 'PUT':
            response = await webApiClient.put<TData>(endpoint, variables);
            break;
          case 'PATCH':
            response = await webApiClient.patch<TData>(endpoint, variables);
            break;
          case 'DELETE':
            response = await webApiClient.delete<TData>(endpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        if (!response.success || response.data === undefined) {
          const errorMessage = (response.error !== undefined && typeof response.error === 'string') ? response.error : 'API request failed';
          throw new Error(errorMessage);
        }

        return response.data;
      } catch (error) {
        const webError = handleApiError(error, endpoint, method, { variables });
        throw webError;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      void queryClient.invalidateQueries({ queryKey: [endpoint.split('/')[1]] });

      if (onSuccess !== undefined) {
        onSuccess(data, variables);
      }

      logger.debug('API Mutation successful', { endpoint, method });
    },
    onError: (error, variables) => {
      if (onError !== undefined) {
        onError(error, variables);
      }

      logger.error('API Mutation failed', {
        endpoint,
        method,
        error: error.message,
        type: error.type,
        severity: error.severity
      });
    },
    retry: (failureCount, error) => {
      // Don't retry mutations by default (idempotency concerns)
      // But allow retries for network errors
      if (error.type === 'NETWORK' && failureCount < 2) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...mutationOptions,
  });
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticMutation<TData = unknown, TVariables = unknown>(
  options: ApiMutationOptions<TData, TVariables> & {
    optimisticUpdate?: (variables: TVariables) => void;
    rollbackUpdate?: (variables: TVariables) => void;
  }
) {
  const { optimisticUpdate, rollbackUpdate, ...mutationOptions } = options;
  const queryClient = useQueryClient();

  return useMutation<TData, WebError, TVariables>({
    ...mutationOptions,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [mutationOptions.endpoint.split('/')[1]] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData([mutationOptions.endpoint.split('/')[1]]);

      // Optimistically update
      if (optimisticUpdate) {
        optimisticUpdate(variables);
      }

      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (rollbackUpdate && context?.previousData) {
        rollbackUpdate(variables);
      }

      // Call original onError
      if (mutationOptions.onError) {
        mutationOptions.onError(error, variables);
      }
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: [mutationOptions.endpoint.split('/')[1]] });
    },
  });
}

/**
 * Hook for infinite scrolling queries
 */
export function useInfiniteApiQuery<T>(
  endpoint: string,
  params?: Record<string, string>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    getNextPageParam?: (lastPage: T, allPages: T[]) => unknown;
  }
) {
  const { enabled = true, staleTime = 5 * 60 * 1000, getNextPageParam } = options || {};

  return useQuery({
    queryKey: ['infinite', endpoint, params],
    queryFn: async ({ pageParam = params }): Promise<T> => {
      try {
        logger.debug('Infinite API Query', { endpoint, pageParam });

        const response = await webApiClient.get<T>(endpoint, pageParam as Record<string, string>);

        if (!response.success || response.data === undefined) {
          const errorMessage = (response.error !== undefined && typeof response.error === 'string') ? response.error : 'API request failed';
          throw new Error(errorMessage);
        }

        return response.data;
      } catch (error) {
        const webError = handleApiError(error, endpoint, 'GET', { pageParam });
        throw webError;
      }
    },
    enabled,
    staleTime,
    getNextPageParam,
    retry: (failureCount, error) => {
      if (error.type === 'AUTHENTICATION' || error.type === 'AUTHORIZATION') {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Export utility functions
export { webApiClient };
