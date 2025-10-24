import { Component } from 'react';
export declare class EnhancedErrorBoundary extends Component {
    retryTimeout: null;
    constructor(props: any);
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
        error: any;
        errorId: string;
    };
    componentDidCatch(error: any, errorInfo: any): void;
    logError: (error: any, errorInfo: any) => void;
    sendToAnalytics: (errorData: any) => void;
    shouldAutoRetry: (error: any) => boolean;
    scheduleAutoRetry: () => void;
    handleRetry: () => void;
    handleGoHome: () => void;
    handleReload: () => void;
    componentWillUnmount(): void;
    render(): any;
    getErrorContainerClasses: () => "flex items-center justify-center p-8 min-h-screen bg-gray-50" | "flex items-center justify-center p-8 min-h-96 bg-white rounded-lg border border-gray-200 shadow-sm" | "flex items-center justify-center p-8 p-4 bg-white rounded-lg border border-gray-200";
    getErrorTitle: () => "Something went wrong" | "This section failed to load" | "Component error";
    getErrorMessage: () => "We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists." | "This section encountered an error while loading. You can try refreshing or continue using other parts of the app." | "This component encountered an error. The rest of the page should continue to work normally.";
}
export declare function useErrorHandler(): {
    handleError: (error: any, errorInfo: any) => void;
};
export declare function withErrorBoundary(Component: any, errorBoundaryProps: any): {
    (props: any): JSX.Element;
    displayName: string;
};
export default EnhancedErrorBoundary;
//# sourceMappingURL=EnhancedErrorBoundary.d.ts.map