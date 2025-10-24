/**
 * CSRF Protection Middleware
 *
 * Implements comprehensive Cross-Site Request Forgery protection with:
 * - Double-submit cookie pattern
 * - Origin/Referer validation
 * - Cryptographically secure token generation
 * - SameSite cookie enforcement
 * - Token rotation on authentication
 *
 * Security Level: P0 Critical
 * Standards: OWASP CSRF Prevention Cheat Sheet
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */
import { NextRequest, NextResponse } from 'next/server';
/**
 * Generate cryptographically secure CSRF token
 */
export declare function generateCsrfToken(): string;
/**
 * Validate CSRF token timing-safe comparison
 */
export declare function validateCsrfToken(token1: string, token2: string): boolean;
/**
 * Main CSRF protection middleware
 */
export declare function csrfMiddleware(request: NextRequest): Promise<NextResponse | null>;
/**
 * Generate new CSRF token and set in response
 * Call this after successful login/authentication to rotate token
 */
export declare function rotateCsrfToken(response: NextResponse): void;
/**
 * Clear CSRF token cookie (e.g., on logout)
 */
export declare function clearCsrfToken(response: NextResponse): void;
/**
 * Get current CSRF token from request (for embedding in forms/meta tags)
 */
export declare function getCsrfToken(request: NextRequest): string | undefined;
/**
 * Middleware configuration export
 */
export declare const csrfConfig: {
    /** Cookie name for CSRF token */
    readonly cookieName: "csrf-token";
    /** Header name for CSRF token validation */
    readonly headerName: "x-csrf-token";
    /** Token length in bytes (32 bytes = 256 bits) */
    readonly tokenLength: 32;
    /** Cookie max age (1 hour) */
    readonly maxAge: number;
    /** SameSite policy */
    readonly sameSite: "strict";
    /** Secure flag (HTTPS only in production) */
    readonly secure: boolean;
    /** HTTP methods that require CSRF protection */
    readonly protectedMethods: readonly ["POST", "PUT", "PATCH", "DELETE"];
    /** Routes that bypass CSRF (e.g., login endpoints) */
    readonly bypassRoutes: readonly ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/auth/forgot-password", "/api/auth/reset-password"];
    /** Routes that require extra protection */
    readonly criticalRoutes: readonly ["/api/moderation", "/api/admin", "/api/payments", "/api/user/delete"];
};
//# sourceMappingURL=csrf.d.ts.map