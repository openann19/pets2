/**
 * Feed Caching Hook with React Query
 * Phase 1: Performance & Scalability
 * 
 * Implements intelligent caching strategy for feed data:
 * - HTTP caching headers
 * - React Query caching with stale-while-revalidate
 * - Persistent cache for offline support
 * - CDN-optimized image prefetching
 */

import { useCallback, useMemo } from 'react';
import {
  useQuery,
  useQueryClient,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { logger } from '@pawfectmatch/core';
import type { Pet, PetFilters } from '../../types/api';
import { matchesAPI } from '../../services/api';
import { MultiTierCache } from '../../utils/caching/multiTierCache';
import { queryClient } from '../../config/queryClient';

export interface FeedCacheConfig {
  /** Stale time in milliseconds */
  staleTime?: number;
  /** Cache time (gcTime) in milliseconds */
  gcTime?: number;
  /** Enable persistent caching */
  persistent?: boolean;
  /** Enable HTTP cache headers */
  httpCache?: boolean;
}

export interface UseFeedCachingOptions {
  filters?: PetFilters;
  enabled?: boolean;
  onSuccess?: (pets: Pet[]) => void;
  onError?: (error: Error) => void;
}

export interface UseFeedCachingReturn {
  /** Cached pets data */
  pets: Pet[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch pets */
  refetch: () => Promise<void>;
  /** Invalidate cache */
  invalidateCache: () => void;
  /** Prefetch next page */
  prefetchNextPage: (nextFilters?: PetFilters) => Promise<void>;
  /** Get cache statistics */
  getCacheStats: () => {
    size: number;
    staleCount: number;
    freshCount: number;
  };
}

// Create cache instance
const feedCache = new MultiTierCache(queryClient);

// Cache key generator
const getCacheKey = (filters?: PetFilters): string[] => {
  const baseKey = ['feed', 'pets'];
  if (!filters || Object.keys(filters).length === 0) {
    return baseKey;
  }
  // Sort filter keys for consistent caching
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce((acc, key) => {
      acc[key] = filters[key as keyof PetFilters];
      return acc;
    }, {} as Record<string, unknown>);
  return [...baseKey, JSON.stringify(sortedFilters)];
};

// Default cache configuration
const DEFAULT_CACHE_CONFIG: Required<FeedCacheConfig> = {
  staleTime: 2 * 60 * 1000, // 2 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  persistent: true,
  httpCache: true,
};

/**
 * Feed Caching Hook
 * 
 * Provides intelligent caching for feed data with:
 * - React Query integration
 * - Multi-tier caching (memory + persistent)
 * - HTTP cache headers support
 * - Stale-while-revalidate pattern
 */
export function useFeedCaching(
  options: UseFeedCachingOptions = {},
): UseFeedCachingReturn {
  const { filters, enabled = true, onSuccess, onError } = options;
  const queryClient = useQueryClient();
  
  const cacheKey = useMemo(() => getCacheKey(filters), [filters]);

  // Query options with caching
  const queryOptions: UseQueryOptions<Pet[], Error> = useMemo(
    () => ({
      queryKey: cacheKey,
      queryFn: async (): Promise<Pet[]> => {
        try {
          // Try to get from cache first
          const cached = await feedCache.get<Pet[]>(cacheKey.join(':'));
          
          if (cached) {
            logger.debug('Feed cache hit', { filters });
            // Return cached data immediately, refresh in background
            void refetchMutation.mutateAsync();
            return cached;
          }

          // Fetch from API
          logger.debug('Feed cache miss, fetching from API', { filters });
          const fetchedPets = await matchesAPI.getPets(filters);

          // Store in cache
          feedCache.set(fetchedPets, {
            key: cacheKey.join(':'),
            ttl: DEFAULT_CACHE_CONFIG.gcTime,
            persistent: DEFAULT_CACHE_CONFIG.persistent,
          });

          return fetchedPets;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Feed fetch failed', { error: err, filters });
          throw err;
        }
      },
      enabled,
      staleTime: DEFAULT_CACHE_CONFIG.staleTime,
      gcTime: DEFAULT_CACHE_CONFIG.gcTime,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    }),
    [cacheKey, filters, enabled],
  );

  // Main query
  const {
    data: pets = [],
    isLoading,
    error,
    refetch: queryRefetch,
  } = useQuery<Pet[], Error>(queryOptions);

  // Background refetch mutation (stale-while-revalidate)
  const refetchMutation = useMutation({
    mutationFn: async (): Promise<Pet[]> => {
      const fetchedPets = await matchesAPI.getPets(filters);
      
      // Update cache
      feedCache.set(fetchedPets, {
        key: cacheKey.join(':'),
        ttl: DEFAULT_CACHE_CONFIG.gcTime,
        persistent: DEFAULT_CACHE_CONFIG.persistent,
      });

      // Update React Query cache
      queryClient.setQueryData(cacheKey, fetchedPets);

      return fetchedPets;
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      logger.warn('Background feed refresh failed', { error });
      onError?.(error instanceof Error ? error : new Error(String(error)));
    },
  });

  // Call success callback when data arrives
  useMemo(() => {
    if (pets.length > 0) {
      onSuccess?.(pets);
    }
  }, [pets, onSuccess]);

  // Call error callback
  useMemo(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  /**
   * Refetch pets
   */
  const refetch = useCallback(async (): Promise<void> => {
    await queryRefetch();
  }, [queryRefetch]);

  /**
   * Invalidate cache
   */
  const invalidateCache = useCallback(() => {
    // Invalidate multi-tier cache
    feedCache.invalidate(cacheKey.join(':'));
    
    // Invalidate React Query cache
    queryClient.invalidateQueries({ queryKey: cacheKey });
    
    logger.debug('Feed cache invalidated', { filters });
  }, [cacheKey, filters, queryClient]);

  /**
   * Prefetch next page
   */
  const prefetchNextPage = useCallback(
    async (nextFilters?: PetFilters): Promise<void> => {
      const nextCacheKey = getCacheKey(nextFilters || filters);
      
      // Prefetch in background
      await queryClient.prefetchQuery({
        queryKey: nextCacheKey,
        queryFn: async (): Promise<Pet[]> => {
          const fetchedPets = await matchesAPI.getPets(nextFilters || filters);
          
          // Store in cache
          feedCache.set(fetchedPets, {
            key: nextCacheKey.join(':'),
            ttl: DEFAULT_CACHE_CONFIG.gcTime,
            persistent: DEFAULT_CACHE_CONFIG.persistent,
          });
          
          return fetchedPets;
        },
        staleTime: DEFAULT_CACHE_CONFIG.staleTime,
      });
      
      logger.debug('Feed prefetch completed', { filters: nextFilters || filters });
    },
    [filters, queryClient],
  );

  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    const queryCache = queryClient.getQueryCache();
    const allQueries = queryCache.findAll({ queryKey: ['feed', 'pets'] });
    
    const now = Date.now();
    let staleCount = 0;
    let freshCount = 0;

    allQueries.forEach((query) => {
      const state = query.state;
      const dataUpdatedAt = state.dataUpdatedAt || 0;
      const isStale = now - dataUpdatedAt > DEFAULT_CACHE_CONFIG.staleTime;
      
      if (isStale) {
        staleCount += 1;
      } else {
        freshCount += 1;
      }
    });

    return {
      size: allQueries.length,
      staleCount,
      freshCount,
    };
  }, [queryClient]);

  return {
    pets,
    isLoading,
    error: error || null,
    refetch,
    invalidateCache,
    prefetchNextPage,
    getCacheStats,
  };
}

