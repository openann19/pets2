import React, { Component } from 'react';
/**
 * Comprehensive Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export declare class ErrorBoundary extends Component {
    retryTimeoutId: null;
    constructor(props: any);
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
        error: any;
        errorId: string;
    };
    componentDidCatch(error: any, errorInfo: any): void;
    reportError: (error: any, errorInfo: any) => Promise<void>;
    handleRetry: () => void;
    handleReload: () => void;
    handleGoHome: () => void;
    componentWillUnmount(): void;
    render(): any;
    renderErrorUI(): JSX.Element;
    renderCriticalError(): JSX.Element;
    renderPageError(): JSX.Element;
    renderComponentError(): JSX.Element;
}
/**
 * Hook for functional components to trigger error boundary
 */
export declare const useErrorHandler: () => React.Dispatch<React.SetStateAction<null>>;
/**
 * Higher-order component for wrapping components with error boundary
 */
export declare function withErrorBoundary(Component: any, errorBoundaryProps: any): {
    (props: any): JSX.Element;
    displayName: string;
};
/**
 * Async error boundary for handling promise rejections
 */
export declare class AsyncErrorBoundary extends Component {
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    handleUnhandledRejection: (event: any) => void;
    render(): any;
}
export default ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.d.ts.map