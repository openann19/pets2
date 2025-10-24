/**
 * 🔐 PRODUCTION-READY AUTHENTICATION MIDDLEWARE
 * Comprehensive auth middleware with JWT validation, session management, and security headers
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
    sessionId: string;
}
interface AuthContext {
    user: {
        id: string;
        email: string;
        role: string;
        sessionId: string;
    };
    isAuthenticated: boolean;
    permissions: string[];
}
export declare class JWTManager {
    /**
     * Generate access token
     */
    static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
    /**
     * Verify and decode JWT token
     */
    static verifyToken(token: string): JWTPayload | null;
    /**
     * Extract token from request headers
     */
    static extractToken(request: NextRequest): string | null;
}
export declare class SessionManager {
    /**
     * Create new session
     */
    static createSession(userId: string, email: string, role: string, ipAddress: string, userAgent: string): string;
    /**
     * Validate session
     */
    static validateSession(sessionId: string): boolean;
    /**
     * Destroy session
     */
    static destroySession(sessionId: string): void;
    /**
     * Clean up expired sessions
     */
    static cleanupExpiredSessions(): void;
}
export declare class PermissionManager {
    /**
     * Get permissions for role
     */
    static getRolePermissions(role: string): string[];
    /**
     * Check if user has permission
     */
    static hasPermission(userPermissions: string[], requiredPermission: string): boolean;
}
export declare function createAuthMiddleware(options: {
    requireAuth?: boolean;
    requiredPermissions?: string[];
    allowRoles?: string[];
}): (request: NextRequest) => Promise<NextResponse | AuthContext>;
export declare class RateLimiter {
    private static requests;
    static isAllowed(identifier: string, maxRequests: number, windowMs: number): boolean;
    static cleanup(): void;
}
export declare function addSecurityHeaders(response: NextResponse): NextResponse;
export declare function createSecurityMiddleware(): (request: NextRequest) => Promise<NextResponse>;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map