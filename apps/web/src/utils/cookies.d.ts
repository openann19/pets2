/**
 * Secure cookie utilities for httpOnly token management
 * Production-ready with proper security settings
 */
export interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}
/**
 * Set a secure httpOnly cookie (server-side only)
 * This should be called from API routes or server components
 */
export declare function setSecureCookie(name: string, value: string, options?: CookieOptions): string;
/**
 * Delete a cookie (server-side)
 */
export declare function deleteSecureCookie(name: string, options?: Partial<CookieOptions>): string;
/**
 * Parse cookies from header string
 */
export declare function parseCookies(cookieHeader: string): Record<string, string>;
/**
 * Client-side cookie utilities (for non-httpOnly cookies only)
 */
export declare const _clientCookies: {
    get(name: string): string | null;
    set(name: string, value: string, options?: Omit<CookieOptions, "httpOnly">): void;
    delete(name: string): void;
};
//# sourceMappingURL=cookies.d.ts.map