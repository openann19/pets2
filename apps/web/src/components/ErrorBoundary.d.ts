import { Component } from 'react';
export declare class ErrorBoundary extends Component {
    constructor(props: any);
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
        error: any;
    };
    componentDidCatch(error: any, errorInfo: any): void;
    handleRetry: () => void;
    handleRefresh: () => void;
    render(): any;
}
//# sourceMappingURL=ErrorBoundary.d.ts.map