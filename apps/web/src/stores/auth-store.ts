'use client';
import { logger } from '@pawfectmatch/core';
;
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { decryptData, encryptData, generateStorageKey } from '../utils/crypto';
// Custom storage implementation with encryption
const encryptedStorage = {
    getItem: (name) => {
        const item = localStorage.getItem(name);
        if (item === null || item === '')
            return null;
        try {
            const key = generateStorageKey();
            const decrypted = decryptData(item, key);
            return decrypted;
        }
        catch (error) {
            logger.error('Failed to decrypt auth store:', { error });
            return null;
        }
    },
    setItem: (name, value) => {
        try {
            const key = generateStorageKey();
            const encrypted = encryptData(value, key);
            localStorage.setItem(name, encrypted);
        }
        catch (error) {
            logger.error('Failed to encrypt auth store:', { error });
            // Fallback to regular storage
            localStorage.setItem(name, value);
        }
    },
    removeItem: (name) => {
        localStorage.removeItem(name);
    },
};
export const _useAuthStore = create()(persist((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    setUser: (user) => {
        set({ user, isAuthenticated: user !== null });
    },
    setTokens: (accessToken, refreshToken) => {
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
    setIsLoading: (isLoading) => {
        set({ isLoading });
    },
    setError: (error) => {
        set({ error });
    },
}), {
    name: 'pm_auth',
    storage: createJSONStorage(() => encryptedStorage),
    partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
    }),
}));
//# sourceMappingURL=auth-store.js.map