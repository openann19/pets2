import { Component } from 'react';
/**
 * Production-ready error boundary with comprehensive error handling,
 * logging, and user-friendly fallback UI
 */
export declare class AppErrorBoundary extends Component {
    constructor(props: any);
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
        error: any;
    };
    componentDidCatch(error: any, errorInfo: any): void;
    handleRetry: () => void;
    handleReload: () => Promise<void>;
    handleReportError: () => void;
    render(): any;
}
export declare function withErrorBoundary(Component: any, fallback: any): {
    (props: any): JSX.Element;
    displayName: string;
};
export default AppErrorBoundary;
//# sourceMappingURL=AppErrorBoundary.d.ts.map