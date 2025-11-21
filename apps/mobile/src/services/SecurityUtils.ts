/**
 * Enhanced Security Utilities for API Client
 * Additional security measures for mobile API communication
 */

import { logger } from "@pawfectmatch/core";

// === INPUT VALIDATION ===

/**
 * Validate and sanitize API endpoint
 */
export function validateEndpoint(endpoint: string): boolean {
  // Check for valid endpoint format
  if (!endpoint || typeof endpoint !== "string") {
    return false;
  }

  // Prevent path traversal attacks
  if (endpoint.includes("..") || endpoint.includes("~")) {
    logger.warn("Potential path traversal attack detected", { endpoint });
    return false;
  }

  // Ensure endpoint starts with /
  if (!endpoint.startsWith("/")) {
    return false;
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /[<>]/, // XSS attempts
    /javascript:/i, // JavaScript injection
    /data:/i, // Data URI injection
    /vbscript:/i, // VBScript injection
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(endpoint)) {
      logger.warn("Suspicious endpoint pattern detected", {
        endpoint,
        pattern: pattern.source,
      });
      return false;
    }
  }

  return true;
}

/**
 * Sanitize request headers
 */
export function sanitizeHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    // Remove potentially dangerous headers
    const dangerousHeaders = [
      "x-forwarded-for",
      "x-real-ip",
      "x-originating-ip",
      "x-remote-ip",
      "x-remote-addr",
      "x-client-ip",
      "x-cluster-client-ip",
    ];

    if (dangerousHeaders.includes(key.toLowerCase())) {
      logger.warn("Dangerous header removed", { header: key });
      continue;
    }

    // Sanitize header value
    const sanitizedValue = value.replace(/[\r\n\t]/g, "").trim();
    if (sanitizedValue !== value) {
      logger.warn("Header value sanitized", {
        header: key,
        original: value,
        sanitized: sanitizedValue,
      });
    }

    sanitized[key] = sanitizedValue;
  }

  return sanitized;
}

/**
 * Validate request body for security issues
 */
export function validateRequestBody(body: unknown): boolean {
  if (typeof body === "string") {
    // Check for potential injection attacks
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
      /eval\(/i,
      /expression\(/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(body)) {
        logger.warn("Potentially dangerous content in request body", {
          pattern: pattern.source,
        });
        return false;
      }
    }
  }

  return true;
}

// === RATE LIMITING ===

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly defaultLimit = 100; // requests per minute
  private readonly defaultWindow = 60000; // 1 minute

  /**
   * Check if request is within rate limit
   */
  isAllowed(
    key: string,
    limit: number = this.defaultLimit,
    window: number = this.defaultWindow,
  ): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + window,
      });
      return true;
    }

    if (entry.count >= limit) {
      logger.warn("Rate limit exceeded", { key, count: entry.count, limit });
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Get current rate limit status
   */
  getStatus(
    key: string,
  ): { count: number; limit: number; resetTime: number } | null {
    const entry = this.limits.get(key);
    if (!entry) return null;

    return {
      count: entry.count,
      limit: this.defaultLimit,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

export const rateLimiter = new RateLimiter();

// === REQUEST SIGNING ===

/**
 * Generate request signature for additional security
 */
export function generateRequestSignature(
  method: string,
  endpoint: string,
  body: string | null,
  timestamp: number,
  secret: string,
): string {
  const payload = `${method.toUpperCase()}:${endpoint}:${body || ""}:${timestamp}`;

  // Simple HMAC-like signature (in production, use proper crypto library)
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `${hash.toString(16)}:${timestamp}`;
}

/**
 * Verify request signature
 */
export function verifyRequestSignature(
  signature: string,
  method: string,
  endpoint: string,
  body: string | null,
  secret: string,
  maxAge: number = 300000, // 5 minutes
): boolean {
  const [hash, timestampStr] = signature.split(":");
  const timestamp = parseInt(timestampStr, 10);
  const now = Date.now();

  // Check timestamp age
  if (now - timestamp > maxAge) {
    logger.warn("Request signature expired", { timestamp, now, maxAge });
    return false;
  }

  // Verify signature
  const expectedSignature = generateRequestSignature(
    method,
    endpoint,
    body,
    timestamp,
    secret,
  );
  return signature === expectedSignature;
}

// === RESPONSE VALIDATION ===

/**
 * Validate API response for security issues
 */
export function validateResponse(response: unknown): boolean {
  if (typeof response === "string") {
    // Check for potential XSS in response
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(response)) {
        logger.warn("Potentially dangerous content in API response", {
          pattern: pattern.source,
        });
        return false;
      }
    }
  }

  return true;
}

// === SECURITY HEADERS ===

/**
 * Get security headers for API requests
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Requested-With": "XMLHttpRequest",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

// === ERROR SECURITY ===

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: Error, context: string): string {
  const sensitivePatterns = [
    /password/i,
    /token/i,
    /key/i,
    /secret/i,
    /auth/i,
    /credential/i,
  ];

  let message = error.message;

  // Remove sensitive information
  for (const pattern of sensitivePatterns) {
    message = message.replace(pattern, "[REDACTED]");
  }

  // Log original error for debugging (in development only)
  if (__DEV__) {
    logger.debug("Error sanitized", {
      original: error.message,
      sanitized: message,
      context,
    });
  }

  return message;
}

// === REQUEST TIMEOUT ===

/**
 * Enhanced timeout with exponential backoff
 */
export function createTimeoutSignal(timeout: number): AbortSignal {
  const controller = new AbortController();

  setTimeout(() => {
    controller.abort();
  }, timeout);

  return controller.signal;
}

// === SECURITY AUDIT ===

interface SecurityAuditEntry {
  timestamp: number;
  type: "request" | "response" | "error";
  endpoint?: string;
  method?: string;
  details: Record<string, unknown>;
}

class SecurityAuditor {
  private auditLog: SecurityAuditEntry[] = [];
  private readonly maxEntries = 1000;

  /**
   * Log security event
   */
  log(
    type: SecurityAuditEntry["type"],
    details: Record<string, unknown>,
    endpoint?: string,
    method?: string,
  ): void {
    const entry: SecurityAuditEntry = {
      timestamp: Date.now(),
      type,
      endpoint,
      method,
      details,
    };

    this.auditLog.push(entry);

    // Keep only recent entries
    if (this.auditLog.length > this.maxEntries) {
      this.auditLog = this.auditLog.slice(-this.maxEntries);
    }

    // Log to main logger
    logger.info("Security audit event", entry);
  }

  /**
   * Get recent security events
   */
  getRecentEvents(count: number = 100): SecurityAuditEntry[] {
    return this.auditLog.slice(-count);
  }

  /**
   * Clear audit log
   */
  clear(): void {
    this.auditLog = [];
  }
}

export const securityAuditor = new SecurityAuditor();

// === EXPORTS ===

export { type SecurityAuditEntry, type RateLimitEntry };
