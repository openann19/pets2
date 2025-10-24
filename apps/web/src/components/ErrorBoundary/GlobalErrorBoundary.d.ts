import { Component } from 'react';
export declare class GlobalErrorBoundary extends Component {
    constructor(props: any);
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
        error: any;
        errorId: string;
    };
    componentDidCatch(error: any, errorInfo: any): void;
    logErrorToService: (error: any, errorInfo: any) => void;
    handleRetry: () => void;
    handleGoHome: () => void;
    handleReload: () => void;
    render(): any;
}
export declare function useErrorHandler(): (error: any, errorInfo: any) => never;
export declare function withErrorBoundary(Component: any, errorBoundaryProps: any): {
    (props: any): JSX.Element;
    displayName: string;
};
export default GlobalErrorBoundary;
//# sourceMappingURL=GlobalErrorBoundary.d.ts.map