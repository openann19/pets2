'use client';
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/auth-store';
import { api } from '../services/api';
import { logger } from '../services/logger';

/**
 * Production-ready authentication hook with Zustand store integration
 * Handles login, register, logout, token refresh, and session management
 */

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
}

export function useAuth() {
    const router = useRouter();
    const { user, accessToken, refreshToken, isAuthenticated, isLoading, error, setUser, setTokens, logout: storeLogout, setIsLoading, setError } = useAuthStore();
    // Initialize API with stored token
    useEffect(() => {
        if (accessToken) {
            api.setToken(accessToken);
        }
    }, [accessToken]);
    // Auto-refresh token before expiry
    useEffect(() => {
        if (!refreshToken || !accessToken)
            return;
        // Decode JWT to get expiry (simple base64 decode for client-side)
        try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const refreshTime = expiryTime - 5 * 60 * 1000; // Refresh 5 minutes before expiry
            if (currentTime >= refreshTime) {
                refreshAccessToken();
            }
            else {
                // Set timeout to refresh token
                const timeout = setTimeout(() => {
                    refreshAccessToken();
                }, refreshTime - currentTime);
                return () => { clearTimeout(timeout); };
            }
        }
        catch (error) {
            logger.error('Failed to decode token for refresh', error);
        }
    }, [accessToken, refreshToken]);
    /**
     * Login with email and password
     */
    const login = useCallback(async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
                credentials: 'include', // For cookies
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const data = await response.json();
            // Store tokens and user data
            setTokens(data.accessToken, data.refreshToken);
            setUser(data.user);
            api.setToken(data.accessToken);
            // Set cookie for middleware auth
            document.cookie = `auth-token=${data.accessToken}; path=/; max-age=86400; samesite=strict`;
            logger.info('User logged in successfully', { userId: data.user.id });
            return true;
        }
        catch (error) {
            logger.error('Login error', error);
            setError(error.message || 'Failed to login');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    }, [setIsLoading, setError, setTokens, setUser]);
    /**
     * Register new user account
     */
    const register = useCallback(async (data: RegisterData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }
            const responseData = await response.json();
            // Store tokens and user data
            setTokens(responseData.accessToken, responseData.refreshToken);
            setUser(responseData.user);
            api.setToken(responseData.accessToken);
            // Set cookie for middleware auth
            document.cookie = `auth-token=${responseData.accessToken}; path=/; max-age=86400; samesite=strict`;
            logger.info('User registered successfully', { userId: responseData.user.id });
            return true;
        }
        catch (error) {
            logger.error('Registration error', error);
            setError(error.message || 'Failed to register');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    }, [setIsLoading, setError, setTokens, setUser]);
    /**
     * Logout user and clear all auth data
     */
    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            // Call logout endpoint to invalidate server-side session
            if (accessToken) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    credentials: 'include',
                });
            }
        }
        catch (error) {
            logger.error('Logout API error', error);
            // Continue with local logout even if API call fails
        }
        // Clear all auth data
        storeLogout();
        api.clearToken();
        // Clear auth cookie
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; samesite=strict';
        // Redirect to login page
        router.push('/login');
        setIsLoading(false);
        logger.info('User logged out');
    }, [accessToken, storeLogout, router, setIsLoading]);
    /**
     * Refresh access token using refresh token
     */
    const refreshAccessToken = useCallback(async () => {
        if (!refreshToken) {
            logger.warn('No refresh token available');
            return false;
        }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            const data = await response.json();
            // Update tokens
            setTokens(data.accessToken, data.refreshToken);
            api.setToken(data.accessToken);
            // Update cookie
            document.cookie = `auth-token=${data.accessToken}; path=/; max-age=86400; samesite=strict`;
            logger.info('Access token refreshed successfully');
            return true;
        }
        catch (error) {
            logger.error('Token refresh error', error);
            // If refresh fails, logout user
            await logout();
            return false;
        }
    }, [refreshToken, setTokens, logout]);
    /**
     * Update user profile
     */
    const updateProfile = useCallback(async (updates) => {
        if (!accessToken) {
            setError('Not authenticated');
            return false;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(updates),
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Profile update failed');
            }
            const updatedUser = await response.json();
            setUser(updatedUser);
            logger.info('Profile updated successfully');
            return true;
        }
        catch (error) {
            logger.error('Profile update error', error);
            setError(error.message || 'Failed to update profile');
            return false;
        }
        finally {
            setIsLoading(false);
        }
    }, [accessToken, setUser, setError, setIsLoading]);
    /**
     * Verify user session on app load
     */
    const verifySession = useCallback(async () => {
        if (!accessToken)
            return;
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Session verification failed');
            }
            const userData = await response.json();
            setUser(userData);
            logger.info('Session verified successfully');
        }
        catch (error) {
            logger.error('Session verification error', error);
            // Clear invalid session
            await logout();
        }
        finally {
            setIsLoading(false);
        }
    }, [accessToken, setUser, logout, setIsLoading]);
    // Verify session on mount - only after hydration
    useEffect(() => {
        if (typeof window !== 'undefined' && accessToken && !user) {
            verifySession();
        }
    }, [accessToken, user, verifySession]);
    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        loading: isLoading, // Alias for compatibility
        error,
        // Actions
        login,
        register,
        logout,
        updateProfile,
        refreshAccessToken,
        verifySession,
    };
}
//# sourceMappingURL=useAuth.js.map