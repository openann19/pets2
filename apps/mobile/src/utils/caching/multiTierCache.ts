/**
 * Multi-Tier Caching System
 * 
 * Implements L1 (memory), L2 (persistent), L3 (network) caching strategy
 * with intelligent invalidation and stale-while-revalidate pattern
 */
import { MMKV } from 'react-native-mmkv';
import { QueryClient } from '@tanstack/react-query';
import { log } from '../logger';

// L1: In-memory cache (fastest, least persistent)
const memoryCache = new Map<string, { value: unknown; timestamp: number; ttl: number }>();

// L2: Persistent cache (MMKV - ultra fast)
const persistentCache = new MMKV({
  id: 'app-cache',
  encryptionKey: undefined, // Optional: add encryption for sensitive data
});

interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Whether to persist to L2 */
  persistent?: boolean;
  /** Cache key */
  key: string;
}

/**
 * Multi-tier cache manager
 */
export class MultiTierCache {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Get value from cache (L1 -> L2 -> L3)
   */
  async get<T>(key: string): Promise<T | null> {
    // Check L1 (memory)
    const l1Entry = memoryCache.get(key);
    if (l1Entry && Date.now() - l1Entry.timestamp < l1Entry.ttl) {
      return l1Entry.value as T;
    }

    // Check L2 (persistent)
    try {
      const l2Value = persistentCache.getString(key);
      if (l2Value) {
        const parsed = JSON.parse(l2Value) as { value: T; timestamp: number; ttl: number };
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          // Promote to L1
          memoryCache.set(key, parsed);
          return parsed.value;
        } else {
          // Expired, remove
          persistentCache.delete(key);
        }
      }
    } catch (error) {
      // Handle parse errors
      log.warn('Cache parse error', error);
    }

    // L3 (network) - handled by TanStack Query
    return null;
  }

  /**
   * Set value in cache (L1 and optionally L2)
   */
  set<T>(value: T, options: CacheOptions): void {
    const { key, ttl = 5 * 60 * 1000, persistent = false } = options;
    const timestamp = Date.now();

    // Set L1 (memory)
    memoryCache.set(key, { value, timestamp, ttl });

    // Set L2 (persistent) if requested
    if (persistent) {
      try {
        persistentCache.set(key, JSON.stringify({ value, timestamp, ttl }));
      } catch (error) {
        log.warn('Cache set error', error);
      }
    }
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    // Clear L1
    memoryCache.delete(key);
    
    // Clear L2
    persistentCache.delete(key);
    
    // Clear L3 (TanStack Query)
    this.queryClient.invalidateQueries({ queryKey: [key] });
  }

  /**
   * Clear all caches
   */
  clear(): void {
    memoryCache.clear();
    persistentCache.clearAll();
    this.queryClient.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    l1Size: number;
    l2Size: number;
    l3Size: number;
  } {
    return {
      l1Size: memoryCache.size,
      l2Size: persistentCache.getAllKeys().length,
      l3Size: this.queryClient.getQueryCache().getAll().length,
    };
  }
}

/**
 * Cache invalidation strategies
 */
export const CacheInvalidation = {
  /**
   * Time-based invalidation
   */
  timeBased: (key: string, ttl: number, cache: MultiTierCache) => {
    setTimeout(() => {
      cache.invalidate(key);
    }, ttl);
  },

  /**
   * Event-based invalidation
   */
  eventBased: (key: string, event: string, cache: MultiTierCache) => {
    // Example: invalidate user cache on user update
    // This would be called when user data changes
    cache.invalidate(key);
  },

  /**
   * Dependency-based invalidation
   */
  dependencyBased: (
    key: string,
    dependencies: string[],
    cache: MultiTierCache,
  ) => {
    // Invalidate when dependencies change
    dependencies.forEach((dep) => {
      cache.invalidate(dep);
    });
    cache.invalidate(key);
  },
};

/**
 * Stale-while-revalidate pattern
 */
export async function staleWhileRevalidate<T>(
  key: string,
  fetchFn: () => Promise<T>,
  cache: MultiTierCache,
  options: CacheOptions = { key, ttl: 5 * 60 * 1000 },
): Promise<T> {
  // Return stale data immediately if available
  const stale = await cache.get<T>(key);
  
  if (stale) {
    // Fetch fresh data in background (don't await)
    fetchFn()
      .then((fresh) => {
        cache.set(fresh, options);
      })
      .catch((error) => {
        log.warn('Background refresh failed', error);
      });
    
    return stale;
  }

  // No stale data, fetch and cache
  const fresh = await fetchFn();
  cache.set(fresh, options);
  return fresh;
}
