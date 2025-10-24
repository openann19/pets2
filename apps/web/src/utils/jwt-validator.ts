import { createRemoteJWKSet, jwtVerify } from 'jose';
import { logger } from '@pawfectmatch/core';
;
// Create a JWK set from the auth service
const JWKS = createRemoteJWKSet(new URL(`${process.env['NEXT_PUBLIC_API_URL']}/.well-known/jwks.json`));
export async function validateToken(token) {
    try {
        const { payload } = await jwtVerify(token, JWKS);
        // Verify token is not expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }
        // Verify required claims
        if (!payload['userId'] || !payload['email']) {
            return null;
        }
        // Type assertion with proper checking
        const validatedPayload = {
            userId: payload['userId'],
            email: payload['email'],
            exp: payload.exp,
            iat: payload.iat,
        };
        return validatedPayload;
    }
    catch (error) {
        logger.error('Token validation error:', { error });
        return null;
    }
}
//# sourceMappingURL=jwt-validator.js.map