import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ZustandSetter } from '../types/advanced';
import type { User } from '../types/models';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  logout: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setIsOnboarded: (isOnboarded: boolean) => void;
}

/**
 * Global authentication store using Zustand
 * Persists tokens and user data to local storage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    immer((set: ZustandSetter<AuthState>) => ({
      user: null as User | null,
      accessToken: null as string | null,
      refreshToken: null as string | null,
      isLoading: false as boolean,
      error: null as string | null,
      isAuthenticated: false as boolean,
      isOnboarded: false as boolean,

      // Update user data
      setUser: (user: User | null) => {
        set((state: AuthState) => {
          state.user = user;
          state.isAuthenticated = user !== null;
          return state;
        });
      },

      // Set tokens after successful login/registration
      setTokens: (accessToken: string, refreshToken: string) => {
        set((state: AuthState) => {
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
          return state;
        });
      },

      // Clear tokens on logout
      clearTokens: () => {
        set((state: AuthState) => {
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          return state;
        });
      },

      // Full logout
      logout: () => {
        set((state: AuthState) => {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          return state;
        });
      },

      // Set loading state
      setIsLoading: (isLoading: boolean) => {
        set((state: AuthState) => {
          state.isLoading = isLoading;
          return state;
        });
      },

      // Set error message
      setError: (error: string | null) => {
        set((state: AuthState) => {
          state.error = error;
          return state;
        });
      },

      // Set onboarding state
      setIsOnboarded: (isOnboarded: boolean) => {
        set((state: AuthState) => {
          state.isOnboarded = isOnboarded;
          return state;
        });
      },
    })),
    {
      name: 'auth-storage',
      partialize: (state: AuthState) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
