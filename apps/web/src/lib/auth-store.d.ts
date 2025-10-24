import type { User } from '../types';
interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    setUser: (user: User | null) => void;
    setTokens: (accessToken: string, refreshToken?: string) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    logout: () => void;
    initializeAuth: () => Promise<void>;
    clearTokens: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AuthState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, {
            user: User | null;
            accessToken: string | null;
            refreshToken: string | null;
            isAuthenticated: boolean;
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, {
            user: User | null;
            accessToken: string | null;
            refreshToken: string | null;
            isAuthenticated: boolean;
        }>>;
    };
}>;
export {};
//# sourceMappingURL=auth-store.d.ts.map