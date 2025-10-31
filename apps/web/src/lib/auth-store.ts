import { create } from 'zustand';
import { logger } from '@pawfectmatch/core';
import { persist } from 'zustand/middleware';
import { isBrowser, getSafeWindow, getSafeDocument, removeLocalStorageItem } from '@pawfectmatch/core/utils/env';
// SECURITY FIX: Tokens are now stored in httpOnly cookies set by the backend
// Client-side CANNOT access httpOnly cookies - they are sent automatically with requests
// Tokens are no longer stored in localStorage or client-accessible cookies
// Backend sets httpOnly cookies on login/register/refresh - see SECURITY_TOKEN_FIX_PLAN.md
const tokenStorage = {
    // Note: Tokens are in httpOnly cookies, not accessible via JavaScript
    // These functions are kept for backwards compatibility but tokens come from cookies automatically
    setAccessToken: (_token: string): void => {
        // SECURITY: Tokens are set by backend in httpOnly cookies
        // Client cannot and should not set tokens - this is a no-op
        // Tokens are automatically sent with requests via cookies
        logger.debug('[AuthStore] Token set by backend in httpOnly cookie');
    },
    setRefreshToken: (_token: string): void => {
        // SECURITY: Tokens are set by backend in httpOnly cookies
        // Client cannot and should not set tokens - this is a no-op
        logger.debug('[AuthStore] Refresh token set by backend in httpOnly cookie');
    },
    getAccessToken: () => {
        // SECURITY: httpOnly cookies cannot be accessed via JavaScript
        // Tokens are automatically sent with requests via cookies
        // Return null to indicate tokens come from cookies (handled by server)
        return null;
    },
    getRefreshToken: () => {
        // SECURITY: httpOnly cookies cannot be accessed via JavaScript
        // Tokens are automatically sent with requests via cookies
        return null;
    },
    clearAll: () => {
        if (!isBrowser())
            return;
        // Clear any legacy localStorage entries (migration cleanup)
        removeLocalStorageItem('accessToken');
        removeLocalStorageItem('refreshToken');
        removeLocalStorageItem('auth_token');
        removeLocalStorageItem('refresh_token');
        // Note: httpOnly cookies are cleared by backend on logout
        // Client-side cookie clearing only works for non-httpOnly cookies
        // Attempt to clear any non-httpOnly cookie remnants
        const win = getSafeWindow();
        const doc = getSafeDocument();
        if (win && doc) {
            const secureFlag = win.location.protocol === 'https:' ? '; Secure' : '';
            doc.cookie = `accessToken=; Max-Age=0; Path=/; SameSite=Strict${secureFlag}`;
            doc.cookie = `refreshToken=; Max-Age=0; Path=/; SameSite=Strict${secureFlag}`;
            doc.cookie = `auth-token=; Max-Age=0; Path=/; SameSite=Lax`;
        }
    }
};
export const useAuthStore = create()(persist((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,
    setUser: (user) => {
        set({
            user,
            isAuthenticated: !!user,
            error: null
        });
    },
    setTokens: (accessToken, refreshToken) => {
        // SECURITY: Tokens are now in httpOnly cookies set by backend
        // We still track token state in memory for UI purposes, but don't store in localStorage
        // Tokens are automatically sent with requests via cookies
        set({
            accessToken: accessToken || null, // Keep in memory for state management
            refreshToken: refreshToken || get().refreshToken, // Keep in memory for state management
            isAuthenticated: true,
            error: null
        });
        // Note: Token storage functions are no-ops - tokens come from httpOnly cookies
        tokenStorage.setAccessToken(accessToken);
        if (refreshToken) {
            tokenStorage.setRefreshToken(refreshToken);
        }
        // Sync with API service if available (token is in cookie, but notify service of auth state)
        if (isBrowser()) {
            try {
                const apiService = require('../services/api').default;
                // API service will use cookies automatically, but we can notify it of auth state
                if (apiService && typeof apiService.setToken === 'function') {
                    // API service should use credentials: 'include' for cookies
                    apiService.setToken(accessToken, refreshToken);
                }
            }
            catch (error) {
                logger.debug('[AuthStore] API service not available for token sync');
            }
        }
    },
    setIsLoading: (loading) => {
        set({ isLoading: loading });
    },
    setError: (error) => {
        set({ error });
    },
    clearTokens: () => {
        tokenStorage.clearAll();
        set({
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false
        });
    },
    logout: () => {
        // Clear all auth state
        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
        });
        // Clear all stored tokens
        tokenStorage.clearAll();
    },
    initializeAuth: async () => {
        // Prevent multiple initializations
        const state = get();
        if (state.isInitialized || state.isLoading) {
            return;
        }
        set({ isLoading: true, isInitialized: true });
        try {
            // SECURITY: Tokens are in httpOnly cookies, not accessible via JavaScript
            // Validate authentication by calling backend with credentials: 'include'
            // This will automatically send cookies with the request
            if (isBrowser()) {
                try {
                    const apiService = require('../services/api').default;
                    // Validate token with backend by fetching current user
                    // Cookies are sent automatically with credentials: 'include'
                    if (apiService && apiService.getCurrentUser) {
                        const userResponse = await apiService.getCurrentUser();
                        if (userResponse.success && userResponse.data) {
                            // Authentication successful - tokens are in httpOnly cookies
                            set({ 
                                user: userResponse.data, 
                                isAuthenticated: true,
                                // Don't store tokens in state - they're in httpOnly cookies
                                accessToken: null,
                                refreshToken: null
                            });
                        } else {
                            // No valid authentication - clear state
                            logger.warn('[AuthStore] Token validation failed - no valid session');
                            get().clearTokens();
                        }
                    } else {
                        // No API service available
                        logger.debug('[AuthStore] API service not available');
                        set({ isAuthenticated: false });
                    }
                }
                catch (error) {
                    logger.debug('[AuthStore] Could not validate token', { error });
                    // If validation fails, clear tokens
                    get().clearTokens();
                }
            }
        }
        catch (error) {
            logger.error('[AuthStore] Initialization error:', { error });
            set({ error: 'Failed to initialize authentication' });
        }
        finally {
            set({ isLoading: false });
        }
    },
    // Automatic token refresh before expiration
    refreshTokenIfNeeded: async () => {
        // SECURITY: Refresh token is in httpOnly cookie, not accessible via JavaScript
        // API service will handle refresh using cookies automatically
        try {
            const apiService = require('../services/api').default;
            if (apiService && apiService.refreshAccessToken) {
                // Refresh endpoint will read refreshToken from httpOnly cookie
                // and set new tokens in httpOnly cookies
                const refreshed = await apiService.refreshAccessToken();
                if (refreshed) {
                    // Tokens are now in httpOnly cookies set by backend
                    // We don't need to read them - they're automatically sent with requests
                    set({
                        // Don't store tokens in state - they're in httpOnly cookies
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: true
                    });
                    return true;
                }
            }
        } catch (error) {
            logger.error('[AuthStore] Token refresh failed', { error });
        }
        return false;
    },
}), {
    name: 'auth-storage',
    partialize: (state) => ({
        // SECURITY: Only persist user data, NOT tokens
        // Tokens are in httpOnly cookies set by backend, not stored in localStorage
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Explicitly exclude tokens from persistence
        // accessToken and refreshToken should not be persisted
    }),
}));
//# sourceMappingURL=auth-store.js.map