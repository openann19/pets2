/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern for cookie-based authentication
 */

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRF protection middleware
 * Validates CSRF token for state-changing operations when using cookie auth
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip if using Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  // If using cookie auth, require CSRF token
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const csrfTokenFromHeader = req.headers['x-csrf-token'];
    const csrfTokenFromCookie = getCsrfTokenFromCookie(cookieHeader);

    if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
      logger.security('CSRF token missing', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        hasHeader: !!csrfTokenFromHeader,
        hasCookie: !!csrfTokenFromCookie
      });

      return res.status(403).json({
        success: false,
        message: 'CSRF token required'
      });
    }

    // Constant-time comparison to prevent timing attacks
    const headerBuf = Buffer.from(csrfTokenFromHeader);
    const cookieBuf = Buffer.from(csrfTokenFromCookie);
    if (headerBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(headerBuf, cookieBuf)) {
      logger.security('CSRF token mismatch', {
        method: req.method,
        path: req.path,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        message: 'Invalid CSRF token'
      });
    }

    // Additional Origin/Referer validation
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ].filter(Boolean);

    if (origin) {
      const originUrl = new URL(origin);
      const isAllowed = allowedOrigins.some((allowed: string) => {
        try {
          const allowedUrl = new URL(allowed);
          return originUrl.origin === allowedUrl.origin;
        } catch (e) {
          return false;
        }
      });

      if (!isAllowed) {
        logger.security('CSRF origin validation failed', {
          method: req.method,
          path: req.path,
          origin,
          ip: req.ip
        });

        return res.status(403).json({
          success: false,
          message: 'Invalid origin'
        });
      }
    }
  }

  next();
}

/**
 * Extract CSRF token from cookie header
 */
function getCsrfTokenFromCookie(cookieHeader: string): string | null {
  try {
    const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie: string) => {
      const [key, value] = cookie.trim().split('=');
      if (key) acc[key] = decodeURIComponent(value || '');
      return acc;
    }, {});
    return cookies['csrf-token'] || cookies['XSRF-TOKEN'];
  } catch {
    return null;
  }
}

/**
 * Middleware to set CSRF token cookie
 */
export function setCsrfToken(req: Request, res: Response, next: NextFunction): void {
  // Generate token if not present
  const existingToken = getCsrfTokenFromCookie(req.headers.cookie || '');
  const token = existingToken || generateCsrfToken();

  if (!existingToken) {
    // Set CSRF token cookie
    res.cookie('csrf-token', token, {
      httpOnly: false, // Must be readable by client JS
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }

  // Attach token to response header for client to read
  res.setHeader('X-CSRF-Token', token);

  next();
}

// Export generateCsrfToken is already exported above
