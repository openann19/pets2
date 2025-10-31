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
import crypto from 'crypto'
import { logger } from '@pawfectmatch/core';
import { NextRequest, NextResponse } from 'next/server';
/**
 * Configuration for CSRF protection
 */
const CSRF_CONFIG = {
    /** Cookie name for CSRF token */
    cookieName: 'csrf-token',
    /** Header name for CSRF token validation */
    headerName: 'x-csrf-token',
    /** Token length in bytes (32 bytes = 256 bits) */
    tokenLength: 32,
    /** Cookie max age (1 hour) */
    maxAge: 60 * 60,
    /** SameSite policy */
    sameSite: 'strict',
    /** Secure flag (HTTPS only in production) */
    secure: process.env.NODE_ENV === 'production',
    /** HTTP methods that require CSRF protection */
    protectedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
    /** Routes that bypass CSRF (e.g., login endpoints) */
    bypassRoutes: [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
    ],
    /** Routes that require extra protection */
    criticalRoutes: [
        '/api/moderation',
        '/api/admin',
        '/api/payments',
        '/api/user/delete',
    ],
};
/**
 * Generate cryptographically secure CSRF token
 */
export function generateCsrfToken() {
    return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('base64url');
}
/**
 * Validate CSRF token timing-safe comparison
 */
export function validateCsrfToken(token1, token2) {
    if (!token1 || !token2)
        return false;
    if (token1.length !== token2.length)
        return false;
    try {
        // Use constant-time comparison to prevent timing attacks
        const buffer1 = Buffer.from(token1, 'base64url');
        const buffer2 = Buffer.from(token2, 'base64url');
        return crypto.timingSafeEqual(buffer1, buffer2);
    }
    catch {
        return false;
    }
}
/**
 * Extract origin from request for validation
 */
function getRequestOrigin(request) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    if (origin)
        return origin;
    if (referer) {
        try {
            return new URL(referer).origin;
        }
        catch {
            return null;
        }
    }
    return null;
}
/**
 * Validate origin/referer headers to prevent CSRF
 */
function validateOrigin(request) {
    const origin = getRequestOrigin(request);
    if (!origin)
        return false;
    const host = request.headers.get('host');
    if (!host)
        return false;
    const expectedOrigins = [
        `https://${host}`,
        `http://${host}`, // Allow HTTP in development
    ];
    // In development, also allow localhost variations
    if (process.env.NODE_ENV === 'development') {
        expectedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001');
    }
    return expectedOrigins.some((expected) => origin.startsWith(expected));
}
/**
 * Check if route requires CSRF protection
 */
function requiresCsrfProtection(request) {
    const { pathname } = request.nextUrl;
    const method = request.method;
    // Only protect state-changing methods
    if (!CSRF_CONFIG.protectedMethods.includes(method)) {
        return false;
    }
    // Bypass CSRF for specific routes (e.g., initial login)
    if (CSRF_CONFIG.bypassRoutes.some((route) => pathname.startsWith(route))) {
        return false;
    }
    // All API routes require CSRF protection for state-changing methods
    return pathname.startsWith('/api/');
}
/**
 * Check if route requires Authorization header (alternative to CSRF token)
 */
function hasValidAuthorization(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader)
        return false;
    // Bearer token format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
        return false;
    // Token exists and is not empty
    const token = parts[1];
    return token !== undefined && token.length > 0;
}
/**
 * Check if route is critical and requires both CSRF token AND authorization
 */
function isCriticalRoute(pathname) {
    return CSRF_CONFIG.criticalRoutes.some((route) => pathname.startsWith(route));
}
/**
 * Set CSRF token cookie in response
 */
function setCsrfCookie(response, token) {
    response.cookies.set({
        name: CSRF_CONFIG.cookieName,
        value: token,
        httpOnly: true,
        secure: CSRF_CONFIG.secure,
        sameSite: CSRF_CONFIG.sameSite,
        path: '/',
        maxAge: CSRF_CONFIG.maxAge,
    });
}
/**
 * Main CSRF protection middleware
 */
export async function csrfMiddleware(request) {
    const { pathname } = request.nextUrl;
    // Check if this route requires CSRF protection
    if (!requiresCsrfProtection(request)) {
        // For GET requests to API routes, ensure CSRF token cookie exists
        if (request.method === 'GET' && pathname.startsWith('/api/')) {
            const existingToken = request.cookies.get(CSRF_CONFIG.cookieName)?.value;
            if (!existingToken) {
                // Generate and set new CSRF token
                const token = generateCsrfToken();
                const response = NextResponse.next();
                setCsrfCookie(response, token);
                return response;
            }
        }
        return null; // Allow request to proceed
    }
    // === CSRF Protection Logic ===
    // Step 1: Validate Origin/Referer headers
    if (!validateOrigin(request)) {
        logger.warn('[CSRF] Invalid origin/referer:', {
            pathname,
            origin: request.headers.get('origin'),
            referer: request.headers.get('referer'),
            host: request.headers.get('host'),
        });
        return NextResponse.json({
            error: 'Invalid origin',
            message: 'Request origin validation failed',
            code: 'CSRF_INVALID_ORIGIN',
        }, { status: 403 });
    }
    // Step 2: Check for Authorization header (alternative to CSRF for API clients)
    const hasAuth = hasValidAuthorization(request);
    const critical = isCriticalRoute(pathname);
    // Step 3: Get CSRF tokens from cookie and header
    const cookieToken = request.cookies.get(CSRF_CONFIG.cookieName)?.value;
    const headerToken = request.headers.get(CSRF_CONFIG.headerName);
    // Critical routes require BOTH authorization AND CSRF token
    if (critical) {
        if (!hasAuth) {
            logger.warn('[CSRF] Critical route missing authorization:', { pathname });
            return NextResponse.json({
                error: 'Unauthorized',
                message: 'Authorization required for this endpoint',
                code: 'CSRF_MISSING_AUTH',
            }, { status: 401 });
        }
        if (!cookieToken || !headerToken || !validateCsrfToken(cookieToken, headerToken)) {
            logger.warn('[CSRF] Critical route CSRF validation failed:', { pathname });
            return NextResponse.json({
                error: 'CSRF validation failed',
                message: 'Invalid or missing CSRF token for critical operation',
                code: 'CSRF_VALIDATION_FAILED',
            }, { status: 403 });
        }
        // Both auth and CSRF valid - allow request
        return null;
    }
    // Non-critical routes: Accept EITHER authorization OR CSRF token
    if (hasAuth) {
        // Authorization header present and valid - bypass CSRF check
        return null;
    }
    // No authorization header - require CSRF token
    if (!cookieToken) {
        logger.warn('[CSRF] Missing CSRF cookie:', { pathname });
        return NextResponse.json({
            error: 'CSRF token missing',
            message: 'CSRF token not found in cookies',
            code: 'CSRF_TOKEN_MISSING',
        }, { status: 403 });
    }
    if (!headerToken) {
        logger.warn('[CSRF] Missing CSRF header:', { pathname });
        return NextResponse.json({
            error: 'CSRF token missing',
            message: `CSRF token required in ${CSRF_CONFIG.headerName} header`,
            code: 'CSRF_HEADER_MISSING',
        }, { status: 403 });
    }
    // Step 4: Validate token (double-submit pattern)
    if (!validateCsrfToken(cookieToken, headerToken)) {
        logger.warn('[CSRF] Token mismatch:', { pathname });
        return NextResponse.json({
            error: 'CSRF validation failed',
            message: 'CSRF token validation failed',
            code: 'CSRF_TOKEN_INVALID',
        }, { status: 403 });
    }
    // === CSRF validation passed ===
    logger.info('[CSRF] Validation passed:', { pathname, method: request.method });
    return null; // Allow request to proceed
}
/**
 * Generate new CSRF token and set in response
 * Call this after successful login/authentication to rotate token
 */
export function rotateCsrfToken(response) {
    const newToken = generateCsrfToken();
    setCsrfCookie(response, newToken);
}
/**
 * Clear CSRF token cookie (e.g., on logout)
 */
export function clearCsrfToken(response) {
    response.cookies.set({
        name: CSRF_CONFIG.cookieName,
        value: '',
        httpOnly: true,
        secure: CSRF_CONFIG.secure,
        sameSite: CSRF_CONFIG.sameSite,
        path: '/',
        maxAge: 0, // Expire immediately
    });
}
/**
 * Get current CSRF token from request (for embedding in forms/meta tags)
 */
export function getCsrfToken(request) {
    return request.cookies.get(CSRF_CONFIG.cookieName)?.value;
}
/**
 * Middleware configuration export
 */
export const csrfConfig = CSRF_CONFIG;
//# sourceMappingURL=csrf.js.map