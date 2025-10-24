import { NextRequest } from 'next/server';
export interface AuthPayload {
    userId: string;
    email: string;
    role: string;
    twoFactorEnabled: boolean;
    iat: number;
    exp: number;
}
/**
 * Verify authentication from the request
 */
export declare function verifyAuth(request: NextRequest): Promise<Partial<AuthPayload>>;
/**
 * Creates a new authentication token
 */
export declare function createAuthToken(payload: Omit<AuthPayload, 'iat' | 'exp'>): Promise<string>;
/**
 * Validate that two-factor authentication has been completed
 */
export declare function validateTwoFactor(_userId: string, token: string): Promise<boolean>;
//# sourceMappingURL=auth.d.ts.map