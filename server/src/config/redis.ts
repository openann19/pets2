/**
 * Redis configuration for caching and rate limiting
 */

import { Redis as RedisType } from 'ioredis';
import logger from '../utils/logger';

let Redis: typeof import('ioredis').Redis | null = null;
const isTestEnv = process.env['NODE_ENV'] === 'test';

// Optional dependency: allow running without ioredis (e.g., in tests/CI)
try {
  Redis = require('ioredis').Redis;
} catch {
  Redis = null;
  if (!isTestEnv) logger.warn('ioredis not installed; Redis features will be disabled in this environment');
}

let redisClient: RedisType | null = null;

/**
 * Initialize Redis client
 */
function initRedis(): RedisType | null {
  const redisUrl = process.env['REDIS_URL'];

  if (!Redis) {
    // ioredis package not available (tests or minimal installs)
    return null;
  }

  if (!redisUrl) {
    if (!isTestEnv) logger.warn('REDIS_URL not configured, Redis features will be disabled');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err: Error) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      if (!isTestEnv) logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      if (!isTestEnv) logger.info('Redis client ready');
    });

    redisClient.on('error', (error: Error) => {
      logger.error('Redis client error', { error: error.message });
    });

    redisClient.on('close', () => {
      if (!isTestEnv) logger.warn('Redis client connection closed');
    });

    redisClient.on('reconnecting', () => {
      if (!isTestEnv) logger.info('Redis client reconnecting');
    });

    return redisClient;
  } catch (error: unknown) {
    logger.error('Failed to initialize Redis client', { error: (error as Error).message });
    return null;
  }
}

/**
 * Get Redis client instance
 */
function getRedisClient(): RedisType | null {
  if (!redisClient) {
    redisClient = initRedis();
  }
  return redisClient;
}

/**
 * Close Redis connection
 */
async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    if (!isTestEnv) logger.info('Redis connection closed');
  }
}

interface CacheInterface {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<boolean>;
  incr(key: string): Promise<number>;
  flush(): Promise<boolean>;
}

/**
 * Cache utilities
 */
const cache: CacheInterface = {
  /**
   * Get value from cache
   */
  async get(key: string): Promise<any> {
    if (!redisClient) return null;

    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error: unknown) {
      logger.error('Cache get error', { key, error: (error as Error).message });
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    if (!redisClient) return false;

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redisClient.setex(key, ttl, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error: unknown) {
      logger.error('Cache set error', { key, error: (error as Error).message });
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    if (!redisClient) return false;

    try {
      await redisClient.del(key);
      return true;
    } catch (error: unknown) {
      logger.error('Cache delete error', { key, error: (error as Error).message });
      return false;
    }
  },

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    if (!redisClient) return false;

    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error: unknown) {
      logger.error('Cache exists error', { key, error: (error as Error).message });
      return false;
    }
  },

  /**
   * Set expiration time for a key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!redisClient) return false;

    try {
      await redisClient.expire(key, ttl);
      return true;
    } catch (error: unknown) {
      logger.error('Cache expire error', { key, error: (error as Error).message });
      return false;
    }
  },

  /**
   * Increment a counter
   */
  async incr(key: string): Promise<number> {
    if (!redisClient) return 0;

    try {
      return await redisClient.incr(key);
    } catch (error: unknown) {
      logger.error('Cache incr error', { key, error: (error as Error).message });
      return 0;
    }
  },

  /**
   * Clear all cache (use with caution)
   */
  async flush(): Promise<boolean> {
    if (!redisClient) return false;

    try {
      await redisClient.flushdb();
      if (!isTestEnv) logger.warn('Cache flushed');
      return true;
    } catch (error: unknown) {
      logger.error('Cache flush error', { error: (error as Error).message });
      return false;
    }
  },
};

// Initialize Redis on module load (safe no-op if Redis not available)
const client = initRedis();

// Always export a non-null object to allow attaching helper properties
const exported: any = client || { isReady: false };

export default exported;
export { getRedisClient, closeRedis, cache };
