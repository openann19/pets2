/**
 * 🔐 OPTIMIZED AUTH HOOK
 * Enhanced authentication flow based on Tinder clone optimizations
 * Provides smooth auth experience with premium loading states and error handling
 */
interface AuthConfig {
    hapticEnabled?: boolean;
    soundEnabled?: boolean;
    autoRetry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
}
interface AuthCallbacks {
    onLoginSuccess?: (user: unknown) => void;
    onLoginError?: (error: Error) => void;
    onLogoutSuccess?: () => void;
    onLogoutError?: (error: Error) => void;
    onRegisterSuccess?: (user: unknown) => void;
    onRegisterError?: (error: Error) => void;
}
export declare const useOptimizedAuth: (config?: AuthConfig, callbacks?: AuthCallbacks) => {
    user: null;
    isLoading: boolean;
    error: string | null;
    retryCount: number;
    loadingStep: string;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: {
        email: string;
        password: string;
        name: string;
        petName?: string;
        petBreed?: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    googleLogin: () => Promise<void>;
    clearError: () => void;
    triggerHaptic: (type?: "light" | "medium" | "heavy") => void;
    triggerSound: (type: "success" | "error" | "loading") => void;
};
export {};
//# sourceMappingURL=useOptimizedAuth.d.ts.map