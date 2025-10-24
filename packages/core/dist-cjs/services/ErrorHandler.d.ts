/**
 * Centralized Error Handling Service
 * Production-grade error handling with user notifications, logging, and recovery mechanisms
 */
export interface ErrorContext {
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}
export interface ErrorNotification {
    title: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    action?: {
        label: string;
        handler: () => void;
    } | undefined;
    dismissible?: boolean;
    autoHide?: boolean;
    duration?: number;
}
export interface ErrorRecovery {
    canRetry: boolean;
    retryDelay?: number;
    maxRetries?: number;
    fallbackAction?: () => void;
}
export interface ProcessedError {
    id: string;
    message: string;
    code?: string;
    context: ErrorContext;
    notification?: ErrorNotification;
    recovery?: ErrorRecovery;
    stack?: string | undefined;
    timestamp: Date;
}
declare class ErrorHandlerService {
    private errorQueue;
    private notificationHandlers;
    private errorLoggers;
    private maxQueueSize;
    private isProduction;
    constructor();
    /**
     * Register notification handler for user-facing errors
     */
    onNotification(handler: (notification: ErrorNotification) => void): void;
    /**
     * Register error logger for backend logging
     */
    onErrorLog(handler: (error: ProcessedError) => void): void;
    /**
     * Process and handle an error
     */
    handleError(error: Error | string, context?: ErrorContext, options?: {
        showNotification?: boolean;
        logError?: boolean;
        severity?: 'low' | 'medium' | 'high' | 'critical';
    }): ProcessedError;
    /**
     * Handle API errors with specific handling
     */
    handleApiError(error: Error, context?: ErrorContext, options?: {
        endpoint?: string;
        method?: string;
        statusCode?: number;
        showNotification?: boolean;
    }): ProcessedError;
    /**
     * Handle authentication errors
     */
    handleAuthError(error: Error, context?: ErrorContext, options?: {
        authMethod?: string;
        showNotification?: boolean;
    }): ProcessedError;
    /**
     * Handle payment errors
     */
    handlePaymentError(error: Error, context?: ErrorContext, options?: {
        paymentMethod?: string;
        amount?: number;
        currency?: string;
        showNotification?: boolean;
    }): ProcessedError;
    /**
     * Handle network errors
     */
    handleNetworkError(error: Error, context?: ErrorContext, options?: {
        showNotification?: boolean;
        retryable?: boolean;
    }): ProcessedError;
    /**
     * Get error statistics
     */
    getErrorStats(): {
        total: number;
        bySeverity: Record<string, number>;
        byComponent: Record<string, number>;
        recent: ProcessedError[];
    };
    /**
     * Clear error queue
     */
    clearQueue(): void;
    /**
     * Process error into standardized format
     */
    private processError;
    /**
     * Add error to queue
     */
    private addToQueue;
    /**
     * Log error to registered loggers
     */
    private logError;
    /**
     * Show notification to user
     */
    private showNotification;
    /**
     * Determine if notification should be shown
     */
    private shouldShowNotification;
    /**
     * Create user-friendly error notification
     */
    private createErrorNotification;
    /**
     * Create API-specific error notification
     */
    private createApiErrorNotification;
    /**
     * Create API error recovery options
     */
    private createApiErrorRecovery;
    /**
     * Get API error severity
     */
    private getApiErrorSeverity;
    /**
     * Get authentication error message
     */
    private getAuthErrorMessage;
    /**
     * Get payment error message
     */
    private getPaymentErrorMessage;
    /**
     * Determine if error can be recovered from
     */
    private canRecover;
    /**
     * Create recovery options
     */
    private createRecoveryOptions;
    /**
     * Generate unique error ID
     */
    private generateErrorId;
    private extractErrorMessage;
    /**
     * Setup global error handlers
     */
    private setupGlobalErrorHandlers;
}
export declare const ErrorHandler: ErrorHandlerService;
export declare const errorHandler: ErrorHandlerService;
export default ErrorHandler;
//# sourceMappingURL=ErrorHandler.d.ts.map