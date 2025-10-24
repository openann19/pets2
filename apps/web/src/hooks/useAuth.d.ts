interface LoginCredentials {
    email: string;
    password: string;
}
interface RegisterData extends LoginCredentials {
    name: string;
    dateOfBirth?: string;
    location?: string;
}
/**
 * Production-ready authentication hook with Zustand store integration
 * Handles login, register, logout, token refresh, and session management
 */
export declare function useAuth(): {
    user: import("../types").User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    loading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (data: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<any>) => Promise<boolean>;
    refreshAccessToken: () => Promise<boolean>;
    verifySession: () => Promise<void>;
};
export {};
//# sourceMappingURL=useAuth.d.ts.map