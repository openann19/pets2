/**
 * Input sanitization utilities
 * Protects against XSS attacks by removing dangerous HTML/script content
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Removes script tags, javascript: URIs, event handlers, and other dangerous content
 * @param input - The input string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    return String(input);
  }

  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: URIs
    .replace(/javascript:/gi, '')
    // Remove event handlers (onClick, onLoad, etc.)
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    // Remove style attributes that could contain javascript
    .replace(/style\s*=\s*"[^"]*expression\s*\([^"]*\)[^"]*"/gi, '')
    .replace(/style\s*=\s*'[^']*expression\s*\([^']*\)[^']*'/gi, '')
    // Remove vbscript: URIs
    .replace(/vbscript:/gi, '')
    // Remove data: URIs that could contain scripts
    .replace(/data:\s*text\/html/gi, '')
    // Basic HTML tag removal (keeping safe tags like <b>, <i> if needed)
    .replace(/<\/?script[^>]*>/gi, '')
    .replace(/<\/?iframe[^>]*>/gi, '')
    .replace(/<\/?object[^>]*>/gi, '')
    .replace(/<\/?embed[^>]*>/gi, '')
    .replace(/<\/?form[^>]*>/gi, '')
    .replace(/<\/?input[^>]*>/gi, '')
    .replace(/<\/?meta[^>]*>/gi, '')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize object recursively
 * @param obj - The object to sanitize
 * @returns The sanitized object
 */
export function sanitizeObject<T>(obj: T): T | string | T[] | Record<string, unknown> {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeInput(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T[];
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    sanitized[key] = sanitizeObject(value);
  }

  return sanitized as T;
}

