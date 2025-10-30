import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User } from '../types';
/**
 * Global authentication store using Zustand
 * Persists tokens and user data to local storage
 */
export const useAuthStore = create()(persist(immer((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    // Update user data
    setUser: (user) => { set((state) => {
        state.user = user;
        state.isAuthenticated = !!user;
        return state;
    }); },
    // Set tokens after successful login/registration
    setTokens: (accessToken, refreshToken) => { set((state) => {
        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        return state;
    }); },
    // Clear tokens on logout
    clearTokens: () => { set((state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        return state;
    }); },
    // Full logout
    logout: () => { set((state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        return state;
    }); },
    // Set loading state
    setIsLoading: (isLoading) => { set((state) => {
        state.isLoading = isLoading;
        return state;
    }); },
    // Set error message
    setError: (error) => { set((state) => {
        state.error = error;
        return state;
    }); },
})), {
    name: 'auth-storage',
    partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
    }),
}));
//# sourceMappingURL=useAuthStore.js.map