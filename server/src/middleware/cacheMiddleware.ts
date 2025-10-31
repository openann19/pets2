/**
 * Redis Cache Middleware
 * Comprehensive caching layer for API routes and responses
 */

import type { Request, Response, NextFunction } from 'express';
import { getCache, setCache, deleteCache } from '../config/redis';
import logger from '../utils/logger';
import crypto from 'crypto';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyPrefix?: string; // Prefix for cache keys
  includeQueryParams?: boolean; // Whether to include query params in cache key
  includeHeaders?: string[]; // Specific headers to include in cache key
  skipCache?: (req: Request) => boolean; // Function to skip caching for specific requests
  varyBy?: string[]; // Additional factors to vary cache by (e.g., user role)
}

const DEFAULT_TTL = 300; // 5 minutes default

/**
 * Generate cache key from request
 */
function generateCacheKey(
  req: Request,
  options: CacheOptions
): string {
  const prefix = options.keyPrefix || 'cache';
  const parts = [prefix, req.method, req.path];

  // Include query parameters if specified
  if (options.includeQueryParams && Object.keys(req.query).length > 0) {
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map(key => `${key}=${req.query[key]}`)
      .join('&');
    parts.push(sortedQuery);
  }

  // Include specific headers if specified
  if (options.includeHeaders && options.includeHeaders.length > 0) {
    const headerValues = options.includeHeaders
      .map(header => req.headers[header.toLowerCase()] || '')
      .join(':');
    if (headerValues) {
      parts.push(headerValues);
    }
  }

  // Include user ID if authenticated
  const userId = (req as any).user?._id?.toString() || (req as any).userId;
  if (userId) {
    parts.push(`user:${userId}`);
  }

  // Include vary-by factors
  if (options.varyBy && options.varyBy.length > 0) {
    const varyValues = options.varyBy.map(factor => {
      if (factor === 'role') {
        return (req as any).user?.role || 'guest';
      }
      if (factor === 'subscription') {
        return (req as any).user?.subscription?.plan || 'free';
      }
      return '';
    }).filter(Boolean).join(':');
    if (varyValues) {
      parts.push(varyValues);
    }
  }

  // Create hash of the key parts for consistent length
  const keyString = parts.join(':');
  const hash = crypto.createHash('sha256').update(keyString).digest('hex').substring(0, 16);
  return `cache:${hash}`;
}

/**
 * Cache middleware factory
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip caching for non-GET requests by default
    if (req.method !== 'GET') {
      return next();
    }

    // Check if caching should be skipped
    if (options.skipCache && options.skipCache(req)) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = generateCacheKey(req, options);

      // Try to get from cache
      const cached = await getCache(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          logger.debug('Cache hit', { key: cacheKey, path: req.path });
          
          // Set cache headers
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('Cache-Control', `public, max-age=${options.ttl || DEFAULT_TTL}`);
          
          return res.json(data);
        } catch (error) {
          logger.warn('Failed to parse cached data', { key: cacheKey, error });
          // Continue to fetch fresh data
        }
      }

      // Cache miss - override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function(body: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const ttl = options.ttl || DEFAULT_TTL;
          setCache(cacheKey, JSON.stringify(body), ttl).catch(error => {
            logger.warn('Failed to cache response', { key: cacheKey, error });
          });
          
          res.setHeader('X-Cache', 'MISS');
          res.setHeader('Cache-Control', `public, max-age=${ttl}`);
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', { error, path: req.path });
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    // Note: This is a simplified version. In production, you'd want to use SCAN
    // to find all matching keys and delete them
    logger.info('Cache invalidation requested', { pattern });
    // Implementation would require Redis SCAN command or maintaining a key index
  } catch (error) {
    logger.error('Cache invalidation error', { pattern, error });
  }
}

/**
 * Clear cache for specific user
 */
export async function clearUserCache(userId: string): Promise<void> {
  try {
    // Clear user-specific cache keys
    const keys = [
      `cache:user:${userId}:profile`,
      `cache:user:${userId}:pets`,
      `cache:user:${userId}:matches`,
    ];

    await Promise.all(keys.map(key => deleteCache(key)));
    logger.info('User cache cleared', { userId });
  } catch (error) {
    logger.error('Error clearing user cache', { userId, error });
  }
}

/**
 * Predefined cache configurations for common routes
 */
export const cacheConfigs = {
  // User routes
  userProfile: cacheMiddleware({
    ttl: 300, // 5 minutes
    keyPrefix: 'user:profile',
    includeQueryParams: false,
    varyBy: ['role'],
  }),

  // Pet routes
  petList: cacheMiddleware({
    ttl: 180, // 3 minutes
    keyPrefix: 'pet:list',
    includeQueryParams: true,
  }),

  petDetails: cacheMiddleware({
    ttl: 600, // 10 minutes
    keyPrefix: 'pet:details',
    includeQueryParams: false,
  }),

  // Match routes
  matchList: cacheMiddleware({
    ttl: 120, // 2 minutes
    keyPrefix: 'match:list',
    includeQueryParams: false,
    varyBy: ['subscription'],
  }),

  // Analytics routes (longer cache)
  analytics: cacheMiddleware({
    ttl: 300, // 5 minutes
    keyPrefix: 'analytics',
    includeQueryParams: true,
    skipCache: (req) => {
      // Don't cache realtime analytics
      return req.query.realtime === 'true';
    },
  }),

  // Public routes (longer cache)
  public: cacheMiddleware({
    ttl: 3600, // 1 hour
    keyPrefix: 'public',
    includeQueryParams: true,
  }),
};

export default cacheMiddleware;

