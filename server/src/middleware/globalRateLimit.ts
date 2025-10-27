/**
 * Global rate limiting middleware
 * Protects all API endpoints from abuse
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request, Response } from 'express';
let RedisStore: typeof import('rate-limit-redis').Store | null;
const isTestEnv = process.env.NODE_ENV === 'test';
try {
  RedisStore = require('rate-limit-redis');
} catch {
  RedisStore = null;
}
import { getRedisClient } from '../config/redis';
import logger from '../utils/logger';

/**
 * Create rate limiter with Redis store (if available) or memory store
 */
interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  skip?: (req: Request) => boolean;
  skipSuccessfulRequests?: boolean;
}

export function createRateLimiter(options: RateLimitOptions = {}): ReturnType<typeof rateLimit> {
  const defaultOptions: Record<string, unknown> = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.',
    handler: (req: Request, res: Response) => {
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
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/health' || req.path === '/api/health';
    },
    // Use library-provided IPv6-safe generator
    keyGenerator: ipKeyGenerator,
  };

  const config: Record<string, unknown> = { ...defaultOptions, ...options };

  // Use Redis store if available
  const redis = getRedisClient();
  if (RedisStore && redis && (redis as any).isReady) {
    try {
      config.store = new RedisStore({
        client: redis,
        prefix: 'rl:',
      });
      if (!isTestEnv) logger.info('Rate limiter using Redis store');
    } catch (error) {
      if (!isTestEnv) logger.warn('Failed to initialize Redis store for rate limiter, using memory store', { error: error instanceof Error ? error.message : 'Unknown error' });
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
export const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again in 15 minutes.',
});

/**
 * Strict rate limiter for sensitive endpoints
 * 10 requests per 15 minutes per IP
 */
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests to this endpoint, please try again in 15 minutes.',
});

/**
 * Auth rate limiter for login/register endpoints
 * 5 requests per 15 minutes per IP
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again in 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * API rate limiter for general API endpoints
 * 60 requests per minute per IP
 */
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many API requests, please slow down.',
});

/**
 * Upload rate limiter for file upload endpoints
 * 10 uploads per hour per IP
 */
export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many file uploads, please try again later.',
});

/**
 * Webhook rate limiter for external webhooks
 * 100 requests per minute per IP
 */
export const webhookRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Webhook rate limit exceeded.',
  skip: (req: Request) => {
    // Don't rate limit verified webhooks (e.g., Stripe)
    return req.headers['stripe-signature'] !== undefined;
  },
});

/**
 * Create custom rate limiter with specific options
 */
export function createCustomRateLimiter(windowMs: number, max: number, message: string): ReturnType<typeof rateLimit> {
  return createRateLimiter({
    windowMs,
    max,
    message,
  });
}

