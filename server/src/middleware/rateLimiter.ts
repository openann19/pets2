/**
 * Rate Limiting Middleware
 * Prevents abuse of admin endpoints
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request, Response } from 'express';
import { logAdminActivity } from './adminLogger';

/**
 * Rate limiter for admin routes
 * Limits each admin to 100 requests per 15 minutes
 */
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each admin to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this admin account. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  // Custom key generator - use user ID instead of IP
  keyGenerator: (req: Request) => (req as any).user?._id?.toString() || ipKeyGenerator(req),

  // Custom handler for rate limit exceeded
  handler: async (req: Request, res: Response) => {
    // Log rate limit exceeded event
    if ((req as any).user) {
      await logAdminActivity(
        req as any,
        'RATE_LIMIT_EXCEEDED',
        {
          endpoint: req.path,
          method: req.method
        },
        false,
        'Rate limit exceeded'
      );
    }

    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many requests from this admin account. Please try again later.',
      retryAfter: '15 minutes'
    });
  },

  // Skip rate limiting for successful requests (only count failed/suspicious ones)
  skip: (req: Request) => {
    // Skip if not authenticated (will be caught by auth middleware)
    return !(req as any).user;
  }
});

/**
 * Stricter rate limiter for sensitive operations
 * Limits to 20 requests per 15 minutes
 */
export const strictRateLimiterForAdmin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many sensitive operations. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request) => (req as any).user?._id?.toString() || ipKeyGenerator(req),

  handler: async (req: Request, res: Response) => {
    if ((req as any).user) {
      await logAdminActivity(
        req as any,
        'STRICT_RATE_LIMIT_EXCEEDED',
        {
          endpoint: req.path,
          method: req.method
        },
        false,
        'Strict rate limit exceeded for sensitive operation'
      );
    }

    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many sensitive operations. Please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Rate limiter for login attempts
 * Prevents brute force attacks
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many login attempts',
    message: 'Too many failed login attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: Request) => `${(req as any).body?.email || 'unknown'}_${ipKeyGenerator(req)}`,

  skipSuccessfulRequests: true // Only count failed login attempts
});

