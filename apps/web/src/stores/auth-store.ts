'use client';
import { logger } from '@pawfectmatch/core';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { decryptData, encryptData, generateStorageKey } from '../utils/crypto';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  [key: string]: any; // Allow additional user properties
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  logout: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

type AuthStore = AuthState & AuthActions;

// Custom storage implementation with encryption
const encryptedStorage = {
  getItem: (name: string): string | null => {
    const item = localStorage.getItem(name);
    if (item === null || item === '') return null;
    try {
      const key = generateStorageKey();
      const decrypted = decryptData(item, key);
      return decrypted;
    } catch (error) {
      logger.error('Failed to decrypt auth store:', { error: error as any });
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      const key = generateStorageKey();
      const encrypted = encryptData(value, key);
      localStorage.setItem(name, encrypted);
    } catch (error) {
      logger.error('Failed to encrypt auth store:', { error: error as any });
      // Fallback to regular storage
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export const _useAuthStore = create<AuthStore>()(persist((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  setUser: (user: User | null) => {
    set({ user, isAuthenticated: user !== null });
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },
  clearTokens: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  },
  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },
  setIsLoading: (isLoading: boolean) => {
    set({ isLoading });
  },
  setError: (error: string | null) => {
    set({ error });
  },
}), {
  name: 'pm_auth',
  storage: createJSONStorage(() => encryptedStorage),
  partialize: (state: AuthStore) => ({
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
  }),
}));
