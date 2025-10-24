/**
 * Secure cookie utilities for httpOnly token management
 * Production-ready with proper security settings
 */
const DEFAULT_OPTIONS = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
};
/**
 * Set a secure httpOnly cookie (server-side only)
 * This should be called from API routes or server components
 */
export function setSecureCookie(name, value, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const cookieParts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
    if (opts.maxAge) {
        cookieParts.push(`Max-Age=${opts.maxAge}`);
    }
    if (opts.expires) {
        cookieParts.push(`Expires=${opts.expires.toUTCString()}`);
    }
    if (opts.path) {
        cookieParts.push(`Path=${opts.path}`);
    }
    if (opts.domain) {
        cookieParts.push(`Domain=${opts.domain}`);
    }
    if (opts.secure) {
        cookieParts.push('Secure');
    }
    if (opts.httpOnly) {
        cookieParts.push('HttpOnly');
    }
    if (opts.sameSite) {
        cookieParts.push(`SameSite=${opts.sameSite.charAt(0).toUpperCase() + opts.sameSite.slice(1)}`);
    }
    return cookieParts.join('; ');
}
/**
 * Delete a cookie (server-side)
 */
export function deleteSecureCookie(name, options = {}) {
    return setSecureCookie(name, '', {
        ...options,
        maxAge: 0,
        expires: new Date(0),
    });
}
/**
 * Parse cookies from header string
 */
export function parseCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader)
        return cookies;
    cookieHeader.split(';').forEach((cookie) => {
        const [name, ...rest] = cookie.split('=');
        const value = rest.join('=').trim();
        if (name && value) {
            cookies[name.trim()] = decodeURIComponent(value);
        }
    });
    return cookies;
}
/**
 * Client-side cookie utilities (for non-httpOnly cookies only)
 */
export const _clientCookies = {
    get(name) {
        if (typeof document === 'undefined')
            return null;
        const cookies = parseCookies(document.cookie);
        return cookies[name] || null;
    },
    set(name, value, options = {}) {
        if (typeof document === 'undefined')
            return;
        const opts = { ...DEFAULT_OPTIONS, ...options, httpOnly: false };
        document.cookie = setSecureCookie(name, value, opts);
    },
    delete(name) {
        if (typeof document === 'undefined')
            return;
        document.cookie = deleteSecureCookie(name);
    },
};
//# sourceMappingURL=cookies.js.map