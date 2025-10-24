/**
 * Authentication Hook
 * Production-hardened React hook for authentication state management
 * Features: Automatic token refresh, session management, error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { webAuthService, User, AuthState, LoginCredentials, RegisterData } from '../lib/auth';
import { logger } from '@pawfectmatch/core';

export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<User>;
  refreshUser: () => Promise<User>;

  // Utilities
  clearError: () => void;
  getAuthState: () => AuthState;
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>(webAuthService.getAuthState());
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Update state when auth service changes
  useEffect(() => {
    const updateAuthState = () => {
      if (mountedRef.current) {
        setAuthState(webAuthService.getAuthState());
      }
    };

    // Initial state
    updateAuthState();

    // Set up periodic checks (every 30 seconds)
    const interval = setInterval(updateAuthState, 30000);

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const user = await webAuthService.login(credentials);

      if (mountedRef.current) {
        setAuthState(webAuthService.getAuthState());
        logger.info('Login successful', { userId: user.id });
      }

      return user;
    } catch (webError) {
      const errorMessage = webError instanceof Error ? webError.message : 'Login failed';
      if (mountedRef.current) {
        setError(errorMessage);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
      throw webError;
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData): Promise<User> => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const user = await webAuthService.register(data);

      if (mountedRef.current) {
        setAuthState(webAuthService.getAuthState());
        logger.info('Registration successful', { userId: user.id });
      }

      return user;
    } catch (webError) {
      const errorMessage = webError instanceof Error ? webError.message : 'Registration failed';
      if (mountedRef.current) {
        setError(errorMessage);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
      throw webError;
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      await webAuthService.logout();
      if (mountedRef.current) {
        setAuthState(webAuthService.getAuthState());
        setError(null);
        logger.info('Logout successful');
      }
    } catch (webError) {
      logger.warn('Logout error', { error: webError });
      // Still clear local state even if server call fails
      if (mountedRef.current) {
        setAuthState(webAuthService.getAuthState());
      }
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<User> => {
    try {
      setError(null);
      const updatedUser = await webAuthService.updateProfile(updates);

      if (mountedRef.current) {
        setAuthState(prev => ({ ...prev, user: updatedUser }));
        logger.info('Profile update successful', { userId: updatedUser.id });
      }

      return updatedUser;
    } catch (webError) {
      const errorMessage = webError instanceof Error ? webError.message : 'Profile update failed';
      if (mountedRef.current) {
        setError(errorMessage);
      }
      throw webError;
    }
  }, []);

  // Refresh user function
  const refreshUser = useCallback(async (): Promise<User> => {
    try {
      setError(null);
      const user = await webAuthService.getCurrentUser();

      if (mountedRef.current) {
        setAuthState(prev => ({ ...prev, user }));
      }

      return user;
    } catch (webError) {
      const errorMessage = webError instanceof Error ? webError.message : 'Failed to refresh user data';
      if (mountedRef.current) {
        setError(errorMessage);
      }
      throw webError;
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get auth state function
  const getAuthState = useCallback((): AuthState => {
    return webAuthService.getAuthState();
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    clearError,
    getAuthState,
  };
}
