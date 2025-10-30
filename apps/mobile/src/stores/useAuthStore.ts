import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createSecureStorage } from '../utils/secureStorage';

import type { User } from '@pawfectmatch/core';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  updateUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  logout: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Mobile-specific authentication store using Zustand with secure storage
 * Fixes M-SEC-01: Uses expo-secure-store instead of AsyncStorage for JWT tokens
 * Persists sensitive tokens securely and user data safely
 */
export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Update user data
      setUser: (user: User | null) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = user !== null;
          return state;
        }),

      // Update user data (merge with existing)
      updateUser: (user: User) =>
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...user };
          }
          return state;
        }),

      // Set tokens after successful login/registration
      setTokens: (accessToken: string, refreshToken: string) =>
        set((state) => {
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
          return state;
        }),

      // Clear tokens on logout
      clearTokens: () =>
        set((state) => {
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          return state;
        }),

      // Full logout
      logout: () =>
        set((state) => {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          return state;
        }),

      // Set loading state
      setIsLoading: (isLoading: boolean) =>
        set((state) => {
          state.isLoading = isLoading;
          return state;
        }),

      // Set error message
      setError: (error: string | null) =>
        set((state) => {
          state.error = error;
          return state;
        }),
    })),
    {
      name: 'auth-storage-secure',
      storage: createSecureStorage() as unknown as Parameters<
        typeof persist<AuthState, unknown, unknown, AuthState>
      >[1]['storage'],
      partialize: (state: AuthState): Partial<AuthState> => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
