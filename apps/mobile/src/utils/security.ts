/**
 * Enterprise Security Layer
 * Advanced security implementation following Rule 12 (Security & Privacy)
 */

import { z } from 'zod';
import { logger } from '@pawfectmatch/core';

// Polyfill for crypto.getRandomValues in React Native
function getRandomValues(array: Uint8Array): Uint8Array {
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

// Input Validation Schemas (Zod)
export const UserInputSchemas = {
  // Authentication
  login: z.object({
    email: z.email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  register: z.object({
    email: z.email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number',
      ),
    firstName: z.string().min(2, 'First name too short').max(50, 'First name too long'),
    lastName: z.string().min(2, 'Last name too short').max(50, 'Last name too long'),
    dateOfBirth: z.string().refine((date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      return age >= 13 && age <= 120;
    }, 'Invalid age (must be 13-120 years old)'),
  }),

  // Pet Profile
  petProfile: z.object({
    name: z.string().min(1, 'Pet name required').max(50, 'Pet name too long'),
    breed: z.string().min(1, 'Breed required').max(100, 'Breed name too long'),
    age: z.number().min(0, 'Age cannot be negative').max(50, 'Age seems too high'),
    species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
    description: z.string().max(1000, 'Description too long').optional(),
  }),

  // Message/Chat
  message: z.object({
    content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
    type: z.enum(['text', 'image', 'location']).default('text'),
  }),

  // Search Filters
  searchFilters: z.object({
    maxDistance: z.number().min(1).max(500).optional(),
    breeds: z.array(z.string()).max(10, 'Too many breed filters').optional(),
    ageRange: z
      .object({
        min: z.number().min(0).max(50),
        max: z.number().min(0).max(50),
      })
      .optional(),
  }),
};

// XSS Protection Utilities
export class InputSanitizer {
  private static instance: InputSanitizer | null = null;

  static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer();
    }
    return InputSanitizer.instance;
  }

  /**
   * Sanitize HTML content to prevent XSS (simplified for React Native)
   */
  sanitizeHtml(dirty: string): string {
    try {
      // Simple HTML sanitization - remove script tags and dangerous attributes
      return dirty
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
    } catch (error) {
      logger.error('HTML sanitization failed', {
        error: error instanceof Error ? error.message : String(error),
        input: dirty,
      });
      return '';
    }
  }

  /**
   * Sanitize plain text (remove dangerous characters)
   */
  sanitizeText(input: string): string {
    if (typeof input !== 'string') {
      logger.error('Invalid input type for text sanitization', {
        type: typeof input,
      });
      return '';
    }

    // Remove null bytes and other dangerous characters
    return (
      input
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // Remove control characters
        .replace(/[<>]/g, '') // Remove angle brackets
        .trim()
        .slice(0, 10000)
    ); // Limit length
  }

  /**
   * Validate and sanitize email
   */
  sanitizeEmail(email: string): string {
    const sanitized = this.sanitizeText(email).toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format');
    }

    return sanitized;
  }

  /**
   * Sanitize filename for uploads
   */
  sanitizeFilename(filename: string): string {
    return this.sanitizeText(filename)
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
      .slice(0, 255); // Limit length
  }
}

// Rate Limiting Implementation
export class RateLimiter {
  private static instance: RateLimiter | null = null;
  private attempts = new Map<string, { count: number; resetTime: number }>();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if request should be rate limited
   */
  checkLimit(identifier: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const key = identifier;

    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      // First attempt or window expired
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (record.count >= maxAttempts) {
      logger.warn('Rate limit exceeded', {
        identifier,
        attempts: record.count,
      });
      return true; // Rate limited
    }

    record.count++;
    return false;
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Clean up expired records
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// CSRF Protection
export class CSRFProtection {
  private static instance: CSRFProtection | null = null;
  private tokens = new Map<string, { token: string; expires: number }>();

  static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection();
    }
    return CSRFProtection.instance;
  }

  /**
   * Generate CSRF token
   */
  generateToken(sessionId: string): string {
    const token = getRandomValues(new Uint8Array(32)).reduce(
      (acc, byte) => acc + byte.toString(16).padStart(2, '0'),
      '',
    );

    this.tokens.set(sessionId, {
      token,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return token;
  }

  /**
   * Validate CSRF token
   */
  validateToken(sessionId: string, token: string): boolean {
    const record = this.tokens.get(sessionId);

    if (!record || record.expires < Date.now()) {
      logger.warn('CSRF token expired or invalid', { sessionId });
      return false;
    }

    const isValid = record.token === token;
    if (!isValid) {
      logger.warn('CSRF token mismatch', { sessionId });
    }

    return isValid;
  }

  /**
   * Clean up expired tokens
   */
  cleanup(): void {
    const now = Date.now();
    for (const [sessionId, record] of this.tokens.entries()) {
      if (now > record.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

// Input Validation Wrapper
export class InputValidator {
  private static instance: InputValidator | null = null;
  private sanitizer = InputSanitizer.getInstance();
  private rateLimiter = RateLimiter.getInstance();

  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }

  /**
   * Validate and sanitize user input
   */
  validateInput<T>(schema: z.ZodType<T>, data: unknown, context: string = 'unknown'): T {
    try {
      // First pass: sanitize if it's a string
      let sanitizedData = data;
      if (typeof data === 'string') {
        sanitizedData = this.sanitizer.sanitizeText(data);
      } else if (typeof data === 'object' && data !== null) {
        // Sanitize string properties in objects
        sanitizedData = this.sanitizeObjectStrings(data as Record<string, unknown>);
      }

      // Validate with Zod schema
      const validatedData = schema.parse(sanitizedData);

      logger.info('Input validation passed', {
        context,
        schema: schema.description || 'unnamed schema',
      });

      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Input validation failed', {
          context,
          errors: error.issues,
          input:
            typeof data === 'object' && data !== null
              ? (() => {
                  try {
                    return JSON.stringify(data, null, 2);
                  } catch {
                    return '[Object]';
                  }
                })()
              : String(data),
        });
        throw new Error(`Validation failed: ${error.issues.map((e) => e.message).join(', ')}`);
      }

      logger.error('Input validation error', {
        context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Check rate limit for operation
   */
  checkRateLimit(identifier: string, operation: string): void {
    const limited = this.rateLimiter.checkLimit(
      `${operation}:${identifier}`,
      10, // 10 attempts
      60000, // per minute
    );

    if (limited) {
      throw new Error(`Rate limit exceeded for ${operation}. Please try again later.`);
    }
  }

  private sanitizeObjectStrings(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizer.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObjectStrings(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

// Security Headers Middleware
interface SecurityRequest {
  headers: Record<string, string>;
}

interface SecurityResponse {
  setHeader: (name: string, value: string) => void;
}

export const createSecurityHeaders = (
  _req: SecurityRequest,
  res: SecurityResponse,
  next: () => void,
) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  );

  // Other security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    ['camera=(), microphone=(), geolocation=(), payment=()'].join(', '),
  );

  next();
};

// Export singleton instances
export const inputValidator = InputValidator.getInstance();
export const inputSanitizer = InputSanitizer.getInstance();
export const rateLimiter = RateLimiter.getInstance();
export const csrfProtection = CSRFProtection.getInstance();
