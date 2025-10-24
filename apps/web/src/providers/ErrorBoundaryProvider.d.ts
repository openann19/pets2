export declare const useErrorContext: () => never;
/**
 * Global Error Boundary Provider
 * Provides error handling context and global error UI
 */
export declare const ErrorBoundaryProvider: ({ children }: {
    children: any;
}) => JSX.Element;
/**
 * Hook for reporting errors from anywhere in the app
 */
export declare const useErrorReporter: () => (error: any, context: any) => void;
/**
 * Higher-order component for error reporting
 */
export declare function withErrorReporting(Component: any, context: any): {
    (props: any): JSX.Element;
    displayName: string;
};
export default ErrorBoundaryProvider;
//# sourceMappingURL=ErrorBoundaryProvider.d.ts.map