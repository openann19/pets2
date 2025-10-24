export declare function AuthProvider({ children }: {
    children: any;
}): JSX.Element;
export declare function useAuthContext(): {
    user: null;
    isAuthenticated: boolean;
    isLoading: boolean;
    loading: boolean;
    error: null;
    login: () => Promise<boolean>;
    register: () => Promise<boolean>;
    logout: () => Promise<void>;
};
export { useAuthContext as useAuth };
//# sourceMappingURL=AuthProvider.d.ts.map