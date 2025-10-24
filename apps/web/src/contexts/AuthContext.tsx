'use client';
import { createContext, useContext, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { useAuthStore } from '../lib/auth-store';
import { api } from '../services/api';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const { user, isAuthenticated, isLoading, error, setUser, setTokens, setIsLoading, setError, logout: clearAuth, initializeAuth } = useAuthStore();
    // Initialize auth on mount
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);
    // ----- DEV AUTH BYPASS -----
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && !isAuthenticated) {
            const stored = localStorage.getItem('accessToken');
            if (!stored) {
                // Pre-generated demo tokens from backend (valid for 24h)
                const demoTokens = {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ1MzYxZTU3ZGVmZGFhNzZmYzNjM2YiLCJpYXQiOjE3NTg4MDM0ODYsImV4cCI6MTc1OTQwODI4Nn0.uw2KH-77AuozUVbuleO07UAX0sBBeZZ6S6g0_5srV-I',
                    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQ1MzYxZTU3ZGVmZGFhNzZmYzNjM2YiLCJpYXQiOjE3NTg4MDM0ODYsImV4cCI6MTc2MTM5NTQ4Nn0.3uEUvdPP7ZmW2_XilX7OFcfbUfnjLj3mlx65T38l6t8'
                };
                const demoUser = {
                    _id: '68d5361e57defdaa76fc3c3f',
                    email: 'demo@pawfect.com',
                    firstName: 'Demo',
                    lastName: 'User',
                    premium: { isActive: false, tier: 'basic' },
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                };
                setTokens(demoTokens.accessToken, demoTokens.refreshToken);
                setUser(demoUser);
                logger.info('[DEV] Auth bypass tokens injected', { color: '#8b5cf6' });
            }
        }
    }, [isAuthenticated, setTokens, setUser]);
    // ----- END DEV AUTH BYPASS -----
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.login(email, password);
            setTokens(response.accessToken, response.refreshToken);
            setUser(response.user);
        }
        catch (error) {
            setError(error.message || 'Login failed');
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    };
    const register = async (email, password, firstName, lastName) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.register({ email, password, firstName, lastName });
            setTokens(response.accessToken, response.refreshToken);
            setUser(response.user);
        }
        catch (error) {
            setError(error.message || 'Registration failed');
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    };
    const logout = async () => {
        try {
            setIsLoading(true);
            await api.logout();
        }
        catch (error) {
            // Continue with logout even if API call fails
        }
        finally {
            clearAuth();
            setUser(null);
            setIsLoading(false);
        }
    };
    return (<AuthContext.Provider value={{
            user: user,
            isAuthenticated,
            isLoading,
            error,
            login,
            register,
            logout
        }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
//# sourceMappingURL=AuthContext.jsx.map