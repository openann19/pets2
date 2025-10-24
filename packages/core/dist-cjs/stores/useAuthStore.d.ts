import type { User } from '../types/models';
export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isOnboarded: boolean;
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
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<AuthState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, {
            accessToken: string | null;
            refreshToken: string | null;
            user: User | null;
        }>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, {
            accessToken: string | null;
            refreshToken: string | null;
            user: User | null;
        }>>;
    };
}, "setState"> & {
    setState(nextStateOrUpdater: AuthState | Partial<AuthState> | ((state: import("immer").WritableDraft<AuthState>) => void), shouldReplace?: boolean | undefined): void;
}>;
//# sourceMappingURL=useAuthStore.d.ts.map