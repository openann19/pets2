import { Component } from 'react';
/**
 * Production-ready Error Boundary component
 * Catches React errors and displays fallback UI
 */
export declare class AppErrorBoundary extends Component {
    constructor(props: any);
    static getDerivedStateFromError(error: any): {
        hasError: boolean;
        error: any;
    };
    componentDidCatch(error: any, errorInfo: any): void;
    handleReset: () => void;
    render(): any;
}
export default AppErrorBoundary;
//# sourceMappingURL=AppErrorBoundary.d.ts.map