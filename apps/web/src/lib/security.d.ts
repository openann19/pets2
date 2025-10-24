/**
 * Security Configuration and Utilities
 * Implements comprehensive security measures for the web application
 */
import { SecurityEventDetails } from '@/types/common';
export declare const CSP_CONFIG: {
    'default-src': string[];
    'script-src': string[];
    'style-src': string[];
    'font-src': string[];
    'img-src': string[];
    'media-src': string[];
    'connect-src': string[];
    'frame-src': string[];
    'object-src': string[];
    'base-uri': string[];
    'form-action': string[];
    'frame-ancestors': string[];
    'upgrade-insecure-requests': never[];
};
export declare function generateCSPHeader(): string;
export declare const SECURITY_HEADERS: {
    'Content-Security-Policy': string;
    'X-Frame-Options': string;
    'X-Content-Type-Options': string;
    'Referrer-Policy': string;
    'X-XSS-Protection': string;
    'Strict-Transport-Security': string;
    'Permissions-Policy': string;
};
declare class CSRFManager {
    private token;
    private tokenExpiry;
    generateToken(): string;
    getToken(): string | null;
    validateToken(token: string): boolean;
    clearToken(): void;
}
export declare const csrfManager: CSRFManager;
export declare class InputSanitizer {
    static sanitizeHTML(input: string): string;
    static sanitizeInput(input: string): string;
    static validateEmail(email: string): boolean;
    static validatePassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    static sanitizeFileName(fileName: string): string;
}
export declare class RateLimiter {
    private requests;
    private readonly maxRequests;
    private readonly windowMs;
    constructor(maxRequests?: number, windowMs?: number);
    isAllowed(identifier: string): boolean;
    getRemainingRequests(identifier: string): number;
    reset(identifier: string): void;
}
export declare const rateLimiters: {
    auth: RateLimiter;
    api: RateLimiter;
    upload: RateLimiter;
};
export declare class SecureCookie {
    static set(name: string, value: string, options?: {
        maxAge?: number;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
        path?: string;
    }): void;
    static get(name: string): string | null;
    static delete(name: string, path?: string): void;
}
export declare class SecurityLogger {
    static logSecurityEvent(event: {
        type: 'csrf_attempt' | 'rate_limit_exceeded' | 'suspicious_activity' | 'auth_failure';
        details: SecurityEventDetails;
        userAgent?: string;
        ip?: string;
        userId?: string;
    }): void;
}
export declare class XSSProtection {
    static escapeHTML(str: string): string;
    static detectXSS(input: string): boolean;
    static sanitizeContent(content: string): string;
}
export declare class SecureStorage {
    static encrypt(data: string, key: string): Promise<string>;
    static decrypt(encryptedData: string, key: string): Promise<string>;
}
declare const _default: {
    CSP_CONFIG: {
        'default-src': string[];
        'script-src': string[];
        'style-src': string[];
        'font-src': string[];
        'img-src': string[];
        'media-src': string[];
        'connect-src': string[];
        'frame-src': string[];
        'object-src': string[];
        'base-uri': string[];
        'form-action': string[];
        'frame-ancestors': string[];
        'upgrade-insecure-requests': never[];
    };
    SECURITY_HEADERS: {
        'Content-Security-Policy': string;
        'X-Frame-Options': string;
        'X-Content-Type-Options': string;
        'Referrer-Policy': string;
        'X-XSS-Protection': string;
        'Strict-Transport-Security': string;
        'Permissions-Policy': string;
    };
    generateCSPHeader: typeof generateCSPHeader;
    csrfManager: CSRFManager;
    InputSanitizer: typeof InputSanitizer;
    rateLimiters: {
        auth: RateLimiter;
        api: RateLimiter;
        upload: RateLimiter;
    };
    SecureCookie: typeof SecureCookie;
    SecurityLogger: typeof SecurityLogger;
    XSSProtection: typeof XSSProtection;
    SecureStorage: typeof SecureStorage;
};
export default _default;
//# sourceMappingURL=security.d.ts.map