/**
 * Temporary Error Handler for Web App
 * This will be replaced with the core package once TypeScript issues are resolved
 */
export interface ErrorContext {
    userId?: string | undefined;
    sessionId?: string | undefined;
    component?: string | undefined;
    action?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    timestamp?: Date | undefined;
    severity?: 'low' | 'medium' | 'high' | 'critical' | undefined;
}
export interface ErrorNotification {
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    action?: {
        label: string;
        handler: () => void;
    } | undefined;
    dismissible?: boolean | undefined;
    autoHide?: boolean | undefined;
    duration?: number | undefined;
}
declare class ErrorHandlerService {
    private isProduction;
    handleError(error: Error | string, context?: ErrorContext, options?: {
        showNotification?: boolean | undefined;
        logError?: boolean | undefined;
        severity?: 'low' | 'medium' | 'high' | 'critical' | undefined;
    }): void;
    handleApiError(error: Error, context?: ErrorContext, options?: {
        endpoint?: string | undefined;
        method?: string | undefined;
        statusCode?: number | undefined;
        showNotification?: boolean | undefined;
    }): void;
    handleNetworkError(error: Error, context?: ErrorContext, options?: {
        showNotification?: boolean | undefined;
        retryable?: boolean | undefined;
    }): void;
    private shouldShowNotification;
    private showNotification;
    private getApiErrorSeverity;
}
export declare const errorHandler: ErrorHandlerService;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map