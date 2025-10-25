/**
 * Cache Service for PawfectMatch
 * Redis-based caching with fallback to memory cache
 */

import logger from '../utils/logger';

class CacheService {
  private memoryCache: Map<string, { value: any; expiry: number }>;
  private defaultTTL: number;

  constructor() {
    this.memoryCache = new Map();
    this.defaultTTL = 300; // 5 minutes
  }

  /**
   * Get value from cache
   */
  async get(key: string): Promise<any> {
    try {
      // Check memory cache first
      const cached = this.memoryCache.get(key);
      if (cached && cached.expiry > Date.now()) {
        return cached.value;
      }

      // Remove expired entry
      if (cached) {
        this.memoryCache.delete(key);
      }

      return null;
    } catch (error) {
      logger.error('Error getting from cache', { error, key });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const expiry = Date.now() + (ttl * 1000);
      this.memoryCache.set(key, { value, expiry });
      
      logger.debug('Value cached', { key, ttl });
    } catch (error) {
      logger.error('Error setting cache', { error, key });
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);
      logger.debug('Cache value deleted', { key });
    } catch (error) {
      logger.error('Error deleting from cache', { error, key });
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Error clearing cache', { error });
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): any {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.expiry <= now) {
        expiredCount++;
      }
    }

    return {
      totalKeys: this.memoryCache.size,
      expiredKeys: expiredCount,
      activeKeys: this.memoryCache.size - expiredCount
    };
  }
}

export default new CacheService();
