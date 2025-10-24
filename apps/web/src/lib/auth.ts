import * as jose from 'jose';
import { logger } from '@pawfectmatch/core';
;
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-default-jwt-secret-for-development';
const TOKEN_NAME = 'pawfectmatch_auth';
/**
 * Verify authentication from the request
 */
export async function verifyAuth(request) {
    try {
        // Try to get token from cookies first
        const cookieStore = cookies();
        const tokenCookie = cookieStore.get(TOKEN_NAME)?.value;
        // If no cookie, try Authorization header (Bearer token)
        let token = tokenCookie;
        if (!token) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token) {
            logger.info('No authentication token found');
            return {};
        }
        // Verify the token
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        return payload;
    }
    catch (error) {
        logger.error('Auth verification error:', { error });
        return {};
    }
}
/**
 * Creates a new authentication token
 */
export async function createAuthToken(payload) {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        twoFactorEnabled: payload.twoFactorEnabled,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);
    return token;
}
/**
 * Validate that two-factor authentication has been completed
 */
export async function validateTwoFactor(_userId, token) {
    try {
        // In a real implementation, this would validate against a stored token
        // For now, we'll just simulate validation
        // This is a placeholder - in production you would verify against a database
        return token.length === 6 && /^\d+$/.test(token);
    }
    catch (error) {
        logger.error('Two-factor validation error:', { error });
        return false;
    }
}
//# sourceMappingURL=auth.js.map