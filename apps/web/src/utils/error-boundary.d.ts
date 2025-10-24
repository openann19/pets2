import { Component } from 'react';
export declare class EnhancedErrorBoundary extends Component {
    retryTimeoutId: null;
    constructor(props: any);
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
        error: any;
        errorId: string;
    };
    componentDidCatch(error: any, errorInfo: any): void;
    reportError(error: any, errorInfo: any): void;
    scheduleRetry(): void;
    handleRetry: () => void;
    handleGoHome: () => void;
    handleReport: () => void;
    render(): any;
    componentWillUnmount(): void;
}
export declare const withErrorBoundary: (Component: any, errorBoundaryProps: any) => {
    (props: any): JSX.Element;
    displayName: string;
};
export declare const useErrorReporting: () => {
    reportError: (error: any, context: any) => void;
};
//# sourceMappingURL=error-boundary.d.ts.map