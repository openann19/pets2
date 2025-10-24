/**
 * 🔐 PRODUCTION-READY AUTHENTICATION MIDDLEWARE
 * Comprehensive auth middleware with JWT validation, session management, and security headers
 */
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { logger } from '../services/logger';
// ====== CONFIGURATION ======
const JWT_SECRET = process.env['JWT_SECRET'] || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env['REFRESH_TOKEN_EXPIRES_IN'] || '7d';
// Session storage (in production, use Redis or database)
const activeSessions = new Map();
// ====== JWT UTILITIES ======
export class JWTManager {
    /**
     * Generate access token
     */
    static generateAccessToken(payload) {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'pawfectmatch',
            audience: 'pawfectmatch-users',
        });
    }
    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload) {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
            issuer: 'pawfectmatch',
            audience: 'pawfectmatch-refresh',
        });
    }
    /**
     * Verify and decode JWT token
     */
    static verifyToken(token) {
        try {
            const payload = jwt.verify(token, JWT_SECRET, {
                issuer: 'pawfectmatch',
                audience: ['pawfectmatch-users', 'pawfectmatch-refresh'],
            });
            // Check if session is still active
            const session = activeSessions.get(payload.sessionId);
            if (!session) {
                logger.warn('Token verification failed: Session not found', {
                    sessionId: payload.sessionId,
                });
                return null;
            }
            // Update last activity
            session.lastActivity = Date.now();
            return payload;
        }
        catch (error) {
            logger.error('Token verification failed', { error: error instanceof Error ? error.message : String(error) });
            return null;
        }
    }
    /**
     * Extract token from request headers
     */
    static extractToken(request) {
        // Try Authorization header first
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        // Try cookie
        const cookieToken = request.cookies.get('pm_auth_token')?.value;
        if (cookieToken) {
            return cookieToken;
        }
        return null;
    }
}
// ====== SESSION MANAGEMENT ======
export class SessionManager {
    /**
     * Create new session
     */
    static createSession(userId, email, role, ipAddress, userAgent) {
        const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        activeSessions.set(sessionId, {
            userId,
            email,
            role,
            lastActivity: Date.now(),
            ipAddress,
            userAgent,
        });
        logger.info('Session created', { sessionId, userId, email, role });
        return sessionId;
    }
    /**
     * Validate session
     */
    static validateSession(sessionId) {
        const session = activeSessions.get(sessionId);
        if (!session)
            return false;
        // Check session timeout (24 hours)
        const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
        if (Date.now() - session.lastActivity > SESSION_TIMEOUT) {
            activeSessions.delete(sessionId);
            logger.info('Session expired', { sessionId });
            return false;
        }
        return true;
    }
    /**
     * Destroy session
     */
    static destroySession(sessionId) {
        const session = activeSessions.get(sessionId);
        if (session) {
            activeSessions.delete(sessionId);
            logger.info('Session destroyed', { sessionId, userId: session.userId });
        }
    }
    /**
     * Clean up expired sessions
     */
    static cleanupExpiredSessions() {
        const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
        const now = Date.now();
        for (const [sessionId, session] of activeSessions.entries()) {
            if (now - session.lastActivity > SESSION_TIMEOUT) {
                activeSessions.delete(sessionId);
                logger.info('Cleaned up expired session', { sessionId });
            }
        }
    }
}
// ====== PERMISSION SYSTEM ======
export class PermissionManager {
    /**
     * Get permissions for role
     */
    static getRolePermissions(role) {
        const permissions = {
            administrator: ['*'],
            moderator: [
                'users:read',
                'users:suspend',
                'users:activate',
                'users:ban',
                'chats:read',
                'chats:block',
                'chats:unblock',
                'chats:delete_message',
                'uploads:read',
                'uploads:approve',
                'uploads:reject',
                'uploads:delete',
                'verifications:read',
                'verifications:approve',
                'verifications:reject',
                'analytics:read',
                'reports:read',
                'security:read',
            ],
            support: ['users:read', 'chats:read', 'uploads:read', 'verifications:read', 'analytics:read'],
            analyst: [
                'analytics:read',
                'analytics:export',
                'reports:read',
                'reports:create',
                'reports:export',
                'users:read',
                'chats:read',
            ],
            billing_admin: [
                'billing:read',
                'billing:manage',
                'stripe:read',
                'stripe:configure',
                'analytics:read',
                'users:read',
            ],
            premium: ['premium:access'],
            user: ['basic:access'],
        };
        return permissions[role] || [];
    }
    /**
     * Check if user has permission
     */
    static hasPermission(userPermissions, requiredPermission) {
        // Administrator has all permissions
        if (userPermissions.includes('*'))
            return true;
        // Exact match
        if (userPermissions.includes(requiredPermission))
            return true;
        // Wildcard match
        const [resource] = requiredPermission.split(':');
        if (userPermissions.includes(`${resource}:*`))
            return true;
        return false;
    }
}
// ====== AUTHENTICATION MIDDLEWARE ======
export function createAuthMiddleware(options) {
    return async (request) => {
        const { requireAuth = true, requiredPermissions = [], allowRoles = [] } = options;
        // Extract token
        const token = JWTManager.extractToken(request);
        if (!token) {
            if (requireAuth) {
                return new NextResponse('Unauthorized', { status: 401 });
            }
            return { user: null, isAuthenticated: false, permissions: [] };
        }
        // Verify token
        const payload = JWTManager.verifyToken(token);
        if (!payload) {
            if (requireAuth) {
                return new NextResponse('Invalid token', { status: 401 });
            }
            return { user: null, isAuthenticated: false, permissions: [] };
        }
        // Validate session
        if (!SessionManager.validateSession(payload.sessionId)) {
            return new NextResponse('Session expired', { status: 401 });
        }
        // Check role restrictions
        if (allowRoles.length > 0 && !allowRoles.includes(payload.role)) {
            return new NextResponse('Insufficient permissions', { status: 403 });
        }
        // Get user permissions
        const permissions = PermissionManager.getRolePermissions(payload.role);
        // Check specific permissions
        for (const permission of requiredPermissions) {
            if (!PermissionManager.hasPermission(permissions, permission)) {
                return new NextResponse('Insufficient permissions', { status: 403 });
            }
        }
        // Create auth context
        const authContext = {
            user: {
                id: payload.userId,
                email: payload.email,
                role: payload.role,
                sessionId: payload.sessionId,
            },
            isAuthenticated: true,
            permissions,
        };
        return authContext;
    };
}
// ====== RATE LIMITING ======
export class RateLimiter {
    static requests = new Map();
    static isAllowed(identifier, maxRequests, windowMs) {
        const now = Date.now();
        const key = identifier;
        const record = this.requests.get(key);
        if (!record || now > record.resetTime) {
            this.requests.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });
            return true;
        }
        if (record.count >= maxRequests) {
            return false;
        }
        record.count++;
        return true;
    }
    static cleanup() {
        const now = Date.now();
        for (const [key, record] of this.requests.entries()) {
            if (now > record.resetTime) {
                this.requests.delete(key);
            }
        }
    }
}
// ====== SECURITY HEADERS ======
export function addSecurityHeaders(response) {
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // CSP header
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';");
    return response;
}
// ====== MIDDLEWARE FACTORY ======
export function createSecurityMiddleware() {
    return async (request) => {
        const response = NextResponse.next();
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') ??
            request.headers.get('x-real-ip') ??
            'unknown';
        if (!RateLimiter.isAllowed(ip, 100, 60000)) {
            // 100 requests per minute
            return new NextResponse('Too Many Requests', { status: 429 });
        }
        // Add security headers
        addSecurityHeaders(response);
        // CSRF protection for state-changing requests
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
            const origin = request.headers.get('origin');
            const host = request.headers.get('host');
            if (origin && host && !origin.includes(host)) {
                return new NextResponse('Forbidden', { status: 403 });
            }
        }
        return response;
    };
}
// Classes and functions are already exported above with 'export' keyword
//# sourceMappingURL=authMiddleware.js.map