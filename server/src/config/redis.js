/**
 * Redis configuration for caching and rate limiting
 */

let Redis;
const logger = require('../utils/logger');
const isTestEnv = process.env.NODE_ENV === 'test';

// Optional dependency: allow running without ioredis (e.g., in tests/CI)
try {
  Redis = require('ioredis');
} catch {
  Redis = null;
  if (!isTestEnv) logger.warn('ioredis not installed; Redis features will be disabled in this environment');
}

let redisClient = null;

/**
 * Initialize Redis client
 */
function initRedis() {
  const redisUrl = process.env.REDIS_URL;

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
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
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

    redisClient.on('error', (error) => {
      logger.error('Redis client error', { error: error.message });
    });

    redisClient.on('close', () => {
      if (!isTestEnv) logger.warn('Redis client connection closed');
    });

    redisClient.on('reconnecting', () => {
      if (!isTestEnv) logger.info('Redis client reconnecting');
    });

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis client', { error: error.message });
    return null;
  }
}

/**
 * Get Redis client instance
 */
function getRedisClient() {
  if (!redisClient) {
    redisClient = initRedis();
  }
  return redisClient;
}

/**
 * Close Redis connection
 */
async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    if (!isTestEnv) logger.info('Redis connection closed');
  }
}

/**
 * Cache utilities
 */
const cache = {
  /**
   * Get value from cache
   */
  async get(key) {
    if (!redisClient) return null;

    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  },

  /**
   * Set value in cache with optional TTL
   */
  async set(key, value, ttl = 3600) {
    if (!redisClient) return false;

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redisClient.setex(key, ttl, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  async del(key) {
    if (!redisClient) return false;

    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  },

  /**
   * Check if key exists in cache
   */
  async exists(key) {
    if (!redisClient) return false;

    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error: error.message });
      return false;
    }
  },

  /**
   * Set expiration time for a key
   */
  async expire(key, ttl) {
    if (!redisClient) return false;

    try {
      await redisClient.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error('Cache expire error', { key, error: error.message });
      return false;
    }
  },

  /**
   * Increment a counter
   */
  async incr(key) {
    if (!redisClient) return 0;

    try {
      return await redisClient.incr(key);
    } catch (error) {
      logger.error('Cache incr error', { key, error: error.message });
      return 0;
    }
  },

  /**
   * Clear all cache (use with caution)
   */
  async flush() {
    if (!redisClient) return false;

    try {
      await redisClient.flushdb();
      if (!isTestEnv) logger.warn('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error', { error: error.message });
      return false;
    }
  },
};

// Initialize Redis on module load (safe no-op if Redis not available)
const client = initRedis();

// Always export a non-null object to allow attaching helper properties
const exported = client || { isReady: false };

module.exports = exported;
module.exports.getRedisClient = getRedisClient;
module.exports.closeRedis = closeRedis;
module.exports.cache = cache;
