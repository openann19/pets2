"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const immer_1 = require("zustand/middleware/immer");
/**
 * Global authentication store using Zustand
 * Persists tokens and user data to local storage
 */
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.persist)((0, immer_1.immer)((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    isOnboarded: false,
    // Update user data
    setUser: (user) => {
        set((state) => {
            state.user = user;
            state.isAuthenticated = user !== null;
            return state;
        });
    },
    // Set tokens after successful login/registration
    setTokens: (accessToken, refreshToken) => {
        set((state) => {
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
            return state;
        });
    },
    // Clear tokens on logout
    clearTokens: () => {
        set((state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            return state;
        });
    },
    // Full logout
    logout: () => {
        set((state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            return state;
        });
    },
    // Set loading state
    setIsLoading: (isLoading) => {
        set((state) => {
            state.isLoading = isLoading;
            return state;
        });
    },
    // Set error message
    setError: (error) => {
        set((state) => {
            state.error = error;
            return state;
        });
    },
    // Set onboarding state
    setIsOnboarded: (isOnboarded) => {
        set((state) => {
            state.isOnboarded = isOnboarded;
            return state;
        });
    },
})), {
    name: 'auth-storage',
    partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
    }),
}));
