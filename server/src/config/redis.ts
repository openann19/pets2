/**
 * Redis configuration for caching and rate limiting
 */

import * as Redis from 'ioredis';
const logger = require('../utils/logger');

const isTestEnv = process.env.NODE_ENV === 'test';

// Optional dependency: allow running without ioredis (e.g., in tests/CI)
let RedisConstructor: typeof Redis | null = null;
try {
  RedisConstructor = require('ioredis');
} catch {
  RedisConstructor = null;
  if (!isTestEnv) logger.warn('ioredis not installed; Redis features will be disabled in this environment');
}

let redisClient: Redis.Redis | null = null;

/**
 * Initialize Redis client
 */
function initRedis(): Redis.Redis | null {
  const redisUrl = process.env.REDIS_URL;

  if (!RedisConstructor) {
    // ioredis package not available (tests or minimal installs)
    return null;
  }

  if (!redisUrl) {
    if (!isTestEnv) logger.warn('REDIS_URL not configured, Redis features will be disabled');
    return null;
  }

  try {
    redisClient = new RedisConstructor(redisUrl, {
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

    // Event listeners
    redisClient.on('connect', () => {
      logger.info('Redis client connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis client error', { error: err.message });
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis client', { error: (error as Error).message });
    return null;
  }
}

/**
 * Get Redis client instance
 */
function getRedisClient(): Redis.Redis | null {
  return redisClient;
}

/**
 * Close Redis connection
 */
async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection', { error: (error as Error).message });
    }
  }
}

/**
 * Health check for Redis
 */
async function checkRedisHealth(): Promise<{
  connected: boolean;
  ping?: number;
  error?: string;
}> {
  if (!redisClient) {
    return { connected: false, error: 'Redis client not initialized' };
  }

  try {
    const start = Date.now();
    await redisClient.ping();
    const ping = Date.now() - start;

    return { connected: true, ping };
  } catch (error) {
    return {
      connected: false,
      error: (error as Error).message
    };
  }
}

/**
 * Set a key-value pair with optional TTL
 */
async function setCache(key: string, value: string, ttl?: number): Promise<boolean> {
  if (!redisClient) return false;

  try {
    if (ttl) {
      await redisClient.setex(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (error) {
    logger.error('Redis set error', { key, error: (error as Error).message });
    return false;
  }
}

/**
 * Export setCache with TTL for entitlement caching
 */
export async function setCacheWithTTL(key: string, value: string, ttl: number): Promise<boolean> {
  return setCache(key, value, ttl);
}

/**
 * Get a value by key
 */
async function getCache(key: string): Promise<string | null> {
  if (!redisClient) return null;

  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error('Redis get error', { key, error: (error as Error).message });
    return null;
  }
}

/**
 * Delete a key
 */
async function deleteCache(key: string): Promise<boolean> {
  if (!redisClient) return false;

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete error', { key, error: (error as Error).message });
    return false;
  }
}

/**
 * Set multiple key-value pairs
 */
async function setMultipleCache(data: Record<string, string>, ttl?: number): Promise<boolean> {
  if (!redisClient) return false;

  try {
    const pipeline = redisClient.pipeline();

    for (const [key, value] of Object.entries(data)) {
      if (ttl) {
        pipeline.setex(key, ttl, value);
      } else {
        pipeline.set(key, value);
      }
    }

    await pipeline.exec();
    return true;
  } catch (error) {
    logger.error('Redis set multiple error', { error: (error as Error).message });
    return false;
  }
}

/**
 * Get multiple values by keys
 */
async function getMultipleCache(keys: string[]): Promise<Record<string, string | null>> {
  if (!redisClient) return {};

  try {
    const values = await redisClient.mget(keys);
    const result: Record<string, string | null> = {};

    keys.forEach((key, index) => {
      result[key] = values[index];
    });

    return result;
  } catch (error) {
    logger.error('Redis get multiple error', { keys, error: (error as Error).message });
    return {};
  }
}

// Initialize Redis on module load
initRedis();

export {
  initRedis,
  getRedisClient,
  closeRedis,
  checkRedisHealth,
  setCache,
  getCache,
  deleteCache,
  setMultipleCache,
  getMultipleCache
};
