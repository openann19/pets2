export {};// Added to mark file as a module
/**
 * Global rate limiting middleware
 * Protects all API endpoints from abuse
 */

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
let RedisStore;
const isTestEnv = process.env.NODE_ENV === 'test';
try {
  RedisStore = require('rate-limit-redis');
} catch {
  RedisStore = null;
}
const redis = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Create rate limiter with Redis store (if available) or memory store
 */
function createRateLimiter(options = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: null, // Will be set automatically
    },
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });

      res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: res.getHeader('Retry-After'),
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    },
    // Use library-provided IPv6-safe generator
    keyGenerator: ipKeyGenerator,
  };

  const config = { ...defaultOptions, ...options };

  // Use Redis store if available
  if (RedisStore && redis && redis.isReady) {
    try {
      config.store = new RedisStore({
        client: redis,
        prefix: 'rl:',
      });
      if (!isTestEnv) logger.info('Rate limiter using Redis store');
    } catch (error) {
      if (!isTestEnv) logger.warn('Failed to initialize Redis store for rate limiter, using memory store', { error: error.message });
    }
  } else {
    if (!isTestEnv) logger.info('Rate limiter using memory store (Redis not available)');
  }

  return rateLimit(config);
}

/**
 * Global rate limiter for all API routes
 * 100 requests per 15 minutes per IP
 */
const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes.',
});

/**
 * Strict rate limiter for sensitive endpoints
 * 10 requests per 15 minutes per IP
 */
const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests to this endpoint, please try again in 15 minutes.',
});

/**
 * Auth rate limiter for login/register endpoints
 * 5 requests per 15 minutes per IP
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again in 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * API rate limiter for general API endpoints
 * 60 requests per minute per IP
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many API requests, please slow down.',
});

/**
 * Upload rate limiter for file upload endpoints
 * 10 uploads per hour per IP
 */
const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many file uploads, please try again later.',
});

/**
 * Webhook rate limiter for external webhooks
 * 100 requests per minute per IP
 */
const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Webhook rate limit exceeded.',
  skip: (req) => {
    // Don't rate limit verified webhooks (e.g., Stripe)
    return req.headers['stripe-signature'] !== undefined;
  },
});

/**
 * Create custom rate limiter with specific options
 */
function createCustomRateLimiter(windowMs, max, message) {
  return createRateLimiter({
    windowMs,
    max,
    message,
  });
}

module.exports = {
  globalRateLimiter,
  strictRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  uploadRateLimiter,
  webhookRateLimiter,
  createCustomRateLimiter,
  createRateLimiter,
};
