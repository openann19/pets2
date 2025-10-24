/**
 * CSRF Token Provider
 *
 * Client-side utilities for CSRF token management
 * Automatically includes CSRF tokens in API requests
 */
'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { logger } from '@pawfectmatch/core';
;
const CsrfContext = createContext({
    token: null,
    refreshToken: async () => { },
    isLoading: true,
});
/**
 * Extract CSRF token from cookies
 */
function getCsrfTokenFromCookie() {
    if (typeof document === 'undefined')
        return null;
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find((cookie) => cookie.trim().startsWith('csrf-token='));
    if (!csrfCookie)
        return null;
    return csrfCookie.split('=')[1]?.trim() || null;
}
/**
 * Fetch fresh CSRF token from server
 */
async function fetchCsrfToken() {
    try {
        // Make a GET request to any API endpoint to trigger CSRF cookie generation
        const response = await fetch('/api/auth/csrf', {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            logger.warn('[CSRF] Failed to fetch token:', { status: response.status });
            return null;
        }
        // Token should now be in cookies
        return getCsrfTokenFromCookie();
    }
    catch (error) {
        logger.error('[CSRF] Error fetching token:', { error });
        return null;
    }
}
/**
 * CSRF Token Provider Component
 */
export function CsrfProvider({ children }) {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const refreshToken = useCallback(async () => {
        setIsLoading(true);
        // First try to get token from existing cookie
        let csrfToken = getCsrfTokenFromCookie();
        // If no token, fetch from server
        if (!csrfToken) {
            csrfToken = await fetchCsrfToken();
        }
        setToken(csrfToken);
        setIsLoading(false);
    }, []);
    useEffect(() => {
        refreshToken();
    }, [refreshToken]);
    return (<CsrfContext.Provider value={{ token, refreshToken, isLoading }}>
            {children}
        </CsrfContext.Provider>);
}
/**
 * Hook to access CSRF token
 *
 * @example
 * const { token, refreshToken } = useCsrfToken();
 *
 * fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers: {
 *     'x-csrf-token': token || '',
 *   },
 * });
 */
export function useCsrfToken() {
    const context = useContext(CsrfContext);
    if (!context) {
        throw new Error('useCsrfToken must be used within CsrfProvider');
    }
    return context;
}
/**
 * Higher-order function to wrap fetch with CSRF token
 *
 * @example
 * const csrfFetch = withCsrfToken(fetch);
 * await csrfFetch('/api/endpoint', { method: 'POST' });
 */
export function withCsrfToken(fetchFn) {
    return async (input, init) => {
        const token = getCsrfTokenFromCookie();
        if (!token) {
            logger.warn('[CSRF] No token available for request');
        }
        const headers = new Headers(init?.headers);
        // Add CSRF token header if making state-changing request
        const method = init?.method?.toUpperCase() || 'GET';
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && token) {
            headers.set('x-csrf-token', token);
        }
        return fetchFn(input, {
            ...init,
            headers,
            credentials: init?.credentials || 'include', // Ensure cookies are sent
        });
    };
}
/**
 * Get CSRF token header for manual requests
 *
 * @example
 * const headers = getCsrfHeaders();
 * await fetch('/api/endpoint', {
 *   method: 'POST',
 *   headers,
 * });
 */
export function getCsrfHeaders() {
    const token = getCsrfTokenFromCookie();
    if (!token) {
        logger.warn('[CSRF] No CSRF token available');
        return {};
    }
    return {
        'x-csrf-token': token,
    };
}
//# sourceMappingURL=CsrfProvider.jsx.map