export {};// Added to mark file as a module
/**
 * Rate Limiting Middleware
 * Prevents abuse of admin endpoints
 */

const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { logAdminActivity } = require('./adminLogger');

/**
 * Rate limiter for admin routes
 * Limits each admin to 100 requests per 15 minutes
 */
const adminRateLimiter = rateLimit({
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
  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req),

  // Custom handler for rate limit exceeded
  handler: async (req, res) => {
    // Log rate limit exceeded event
    if (req.user) {
      await logAdminActivity(
        req,
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
  skip: (req) => {
    // Skip if not authenticated (will be caught by auth middleware)
    return !req.user;
  }
});

/**
 * Stricter rate limiter for sensitive operations
 * Limits to 20 requests per 15 minutes
 */
const strictRateLimiter = rateLimit({
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

  keyGenerator: (req) => req.user?._id?.toString() || ipKeyGenerator(req),

  handler: async (req, res) => {
    if (req.user) {
      await logAdminActivity(
        req,
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
const loginRateLimiter = rateLimit({
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

  keyGenerator: (req) => `${req.body.email || 'unknown'}_${ipKeyGenerator(req)}`,

  skipSuccessfulRequests: true // Only count failed login attempts
});

module.exports = {
  adminRateLimiter,
  strictRateLimiter,
  loginRateLimiter
};
