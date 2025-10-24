/**
 * Centralized Error Handler
 *
 * Provides consistent error handling across the application with:
 * - Sentry integration for error tracking
 * - User-friendly error messages
 * - Context-aware logging
 * - Error normalization
 *
 * @example
 * ```typescript
 * try {
 *   await api.fetchData();
 * } catch (error) {
 *   ErrorHandler.handle(error, {
 *     component: 'DataFetcher',
 *     action: 'fetchData',
 *     endpoint: '/api/data',
 *   });
 * }
 * ```
 */
export interface ErrorContext {
    /** Component or module where error occurred */
    component: string;
    /** Action being performed when error occurred */
    action: string;
    /** API endpoint (if applicable) */
    endpoint?: string;
    /** User ID (if authenticated) */
    userId?: string;
    /** Additional metadata */
    metadata?: Record<string, unknown>;
}
export declare enum ErrorType {
    NETWORK_ERROR = "NETWORK_ERROR",
    AUTH_ERROR = "AUTH_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
    PERMISSION_ERROR = "PERMISSION_ERROR",
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
    SERVER_ERROR = "SERVER_ERROR",
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    OFFLINE_ERROR = "OFFLINE_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
export interface NormalizedError {
    type: ErrorType;
    message: string;
    statusCode?: number;
    originalError: unknown;
    timestamp: Date;
}
export declare class ErrorHandler {
    /**
     * Main error handling entry point
     */
    static handle(error: unknown, context: ErrorContext): void;
    /**
     * Normalize various error types into consistent format
     */
    private static normalize;
    /**
     * Type guard for HTTP errors
     */
    private static isHttpError;
    /**
     * Log error to Sentry with context
     */
    private static logToSentry;
    /**
     * Get Sentry severity level based on error type
     */
    private static getSentryLevel;
    /**
     * Show user-friendly notification
     */
    private static showUserNotification;
    /**
     * Get user-friendly error message
     */
    private static getUserMessage;
    /**
     * Check if error is retryable
     */
    static isRetryable(error: unknown): boolean;
    /**
     * Get retry delay based on error type (in milliseconds)
     */
    static getRetryDelay(error: unknown, attempt: number): number;
}
/**
 * Handle error with context
 */
export declare function handleError(error: unknown, context: ErrorContext): void;
/**
 * Create error handler for specific component
 */
export declare function createErrorHandler(component: string): (error: unknown, action: string, metadata?: Record<string, unknown>) => void;
//# sourceMappingURL=ErrorHandler.d.ts.map