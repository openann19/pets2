"use strict";
/**
 * Centralized Error Handling Service
 * Production-grade error handling with user notifications, logging, and recovery mechanisms
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ErrorHandler = void 0;
const environment_1 = require("../utils/environment");
const isPromiseRejectionEvent = (event) => {
    return 'reason' in event;
};
const isErrorEvent = (event) => {
    return 'error' in event;
};
const stringifyUnknown = (value) => {
    if (value instanceof Error) {
        return value.message;
    }
    if (typeof value === 'object' && value !== null) {
        try {
            return JSON.stringify(value);
        }
        catch {
            return '[unserializable object]';
        }
    }
    return String(value);
};
const isRecordWithMessage = (value) => {
    return typeof value === 'object' && value !== null && 'message' in value;
};
class ErrorHandlerService {
    errorQueue = [];
    notificationHandlers = [];
    errorLoggers = [];
    maxQueueSize = 1000;
    isProduction = process.env['NODE_ENV'] === 'production';
    constructor() {
        this.setupGlobalErrorHandlers();
    }
    /**
     * Register notification handler for user-facing errors
     */
    onNotification(handler) {
        this.notificationHandlers.push(handler);
    }
    /**
     * Register error logger for backend logging
     */
    onErrorLog(handler) {
        this.errorLoggers.push(handler);
    }
    /**
     * Process and handle an error
     */
    handleError(error, context = {}, options = {}) {
        const processedError = this.processError(error, context, options);
        // Add to queue
        this.addToQueue(processedError);
        // Log error
        if (options.logError !== false) {
            this.logError(processedError);
        }
        // Show notification
        if (options.showNotification !== false && processedError.notification != null) {
            this.showNotification(processedError.notification);
        }
        return processedError;
    }
    /**
     * Handle API errors with specific handling
     */
    handleApiError(error, context = {}, options = {}) {
        const apiContext = {
            ...context,
            component: 'API',
            action: `${options.method ?? 'REQUEST'} ${options.endpoint ?? 'unknown'}`,
            metadata: {
                ...context.metadata,
                endpoint: options.endpoint,
                method: options.method,
                statusCode: options.statusCode,
            },
        };
        // Create notification and recovery options for API errors
        this.createApiErrorNotification(error, options);
        this.createApiErrorRecovery(options.statusCode);
        return this.handleError(error, apiContext, {
            showNotification: options.showNotification !== false,
            severity: this.getApiErrorSeverity(options.statusCode),
        });
    }
    /**
     * Handle authentication errors
     */
    handleAuthError(error, context = {}, options = {}) {
        const authContext = {
            ...context,
            component: 'Authentication',
            action: options.authMethod ?? 'authenticate',
            severity: 'high',
            metadata: {
                ...context.metadata,
                authMethod: options.authMethod,
            },
        };
        // Create authentication error notification
        this.createErrorNotification({
            id: 'auth-error',
            message: this.getAuthErrorMessage(error),
            context: authContext,
            timestamp: new Date(),
        });
        return this.handleError(error, authContext, {
            showNotification: options.showNotification !== false,
            severity: 'high',
        });
    }
    /**
     * Handle payment errors
     */
    handlePaymentError(error, context = {}, options = {}) {
        const paymentContext = {
            ...context,
            component: 'Payment',
            action: 'process_payment',
            severity: 'high',
            metadata: {
                ...context.metadata,
                paymentMethod: options.paymentMethod,
                amount: options.amount,
                currency: options.currency,
            },
        };
        // Create payment error notification
        this.createErrorNotification({
            id: 'payment-error',
            message: this.getPaymentErrorMessage(error),
            context: paymentContext,
            timestamp: new Date(),
        });
        return this.handleError(error, paymentContext, {
            showNotification: options.showNotification !== false,
            severity: 'high',
        });
    }
    /**
     * Handle network errors
     */
    handleNetworkError(error, context = {}, options = {}) {
        const networkContext = {
            ...context,
            component: 'Network',
            action: 'network_request',
            severity: 'medium',
            metadata: {
                ...context.metadata,
                retryable: options.retryable,
            },
        };
        // Create network error notification and recovery options
        this.createErrorNotification({
            id: 'network-error',
            message: 'Please check your internet connection and try again.',
            context: networkContext,
            timestamp: new Date(),
        });
        return this.handleError(error, networkContext, {
            showNotification: options.showNotification !== false,
            severity: 'medium',
        });
    }
    /**
     * Get error statistics
     */
    getErrorStats() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const recent = this.errorQueue.filter(error => error.timestamp >= oneHourAgo);
        const bySeverity = this.errorQueue.reduce((acc, error) => {
            const severity = error.context.severity ?? 'medium';
            acc[severity] = (acc[severity] ?? 0) + 1;
            return acc;
        }, {});
        const byComponent = this.errorQueue.reduce((acc, error) => {
            const component = error.context.component ?? 'unknown';
            acc[component] = (acc[component] ?? 0) + 1;
            return acc;
        }, {});
        return {
            total: this.errorQueue.length,
            bySeverity,
            byComponent,
            recent: recent.slice(-10),
        };
    }
    /**
     * Clear error queue
     */
    clearQueue() {
        this.errorQueue = [];
    }
    /**
     * Process error into standardized format
     */
    processError(error, context, options = {}) {
        const errorMessage = typeof error === 'string' ? error : error.message;
        const errorStack = typeof error === 'string' ? undefined : error.stack;
        const processedError = {
            id: this.generateErrorId(),
            message: errorMessage,
            context: {
                ...context,
                timestamp: new Date(),
                severity: options.severity ?? context.severity ?? 'medium',
            },
            stack: errorStack,
            timestamp: new Date(),
        };
        // Add notification if needed
        if (this.shouldShowNotification(processedError)) {
            processedError.notification = this.createErrorNotification(processedError);
        }
        // Add recovery options if applicable
        if (this.canRecover(processedError)) {
            processedError.recovery = this.createRecoveryOptions(processedError);
        }
        return processedError;
    }
    /**
     * Add error to queue
     */
    addToQueue(error) {
        this.errorQueue.push(error);
        // Maintain queue size
        if (this.errorQueue.length > this.maxQueueSize) {
            this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
        }
    }
    /**
     * Log error to registered loggers
     */
    logError(error) {
        this.errorLoggers.forEach(logger => {
            try {
                logger(error);
            }
            catch (logError) {
                // Fallback to console if logger fails
                console.error('Error logging failed:', logError);
                console.error('Original error:', error);
            }
        });
        // Fallback to console in development
        if (!this.isProduction) {
            console.error('Error:', error);
        }
    }
    /**
     * Show notification to user
     */
    showNotification(notification) {
        this.notificationHandlers.forEach(handler => {
            try {
                handler(notification);
            }
            catch (handlerError) {
                console.error('Notification handler failed:', handlerError);
            }
        });
    }
    /**
     * Determine if notification should be shown
     */
    shouldShowNotification(error) {
        const severity = error.context.severity ?? 'medium';
        return severity === 'high' || severity === 'critical';
    }
    /**
     * Create user-friendly error notification
     */
    createErrorNotification(error) {
        const severity = error.context.severity ?? 'medium';
        switch (severity) {
            case 'critical':
                return {
                    title: 'Critical Error',
                    message: 'A critical error occurred. Please contact support if this persists.',
                    type: 'error',
                    dismissible: false,
                    autoHide: false,
                };
            case 'high':
                return {
                    title: 'Error',
                    message: error.message,
                    type: 'error',
                    dismissible: true,
                    autoHide: true,
                    duration: 5000,
                };
            case 'medium':
                return {
                    title: 'Warning',
                    message: error.message,
                    type: 'warning',
                    dismissible: true,
                    autoHide: true,
                    duration: 3000,
                };
            default:
                return {
                    title: 'Info',
                    message: error.message,
                    type: 'info',
                    dismissible: true,
                    autoHide: true,
                    duration: 2000,
                };
        }
    }
    /**
     * Create API-specific error notification
     */
    createApiErrorNotification(error, options) {
        const statusCode = options.statusCode ?? 500;
        if (!isNaN(statusCode) && statusCode >= 500) {
            return {
                title: 'Server Error',
                message: 'Our servers are experiencing issues. Please try again later.',
                type: 'error',
                action: {
                    label: 'Retry',
                    handler: () => {
                        // Retry logic
                    },
                },
            };
        }
        else if (statusCode === 404) {
            return {
                title: 'Not Found',
                message: 'The requested resource was not found.',
                type: 'error',
            };
        }
        else if (statusCode === 403) {
            return {
                title: 'Access Denied',
                message: 'You do not have permission to access this resource.',
                type: 'error',
            };
        }
        else if (statusCode === 401) {
            return {
                title: 'Authentication Required',
                message: 'Please log in to continue.',
                type: 'error',
                action: {
                    label: 'Login',
                    handler: () => {
                        // Redirect to login
                    },
                },
            };
        }
        else {
            return {
                title: 'Request Failed',
                message: (error.message.trim() !== '') ? error.message : 'An error occurred while processing your request.',
                type: 'error',
            };
        }
    }
    /**
     * Create API error recovery options
     */
    createApiErrorRecovery(statusCode) {
        if (statusCode != null && statusCode >= 500) {
            return {
                canRetry: true,
                retryDelay: 5000,
                maxRetries: 3,
            };
        }
        else if (statusCode === 429) {
            return {
                canRetry: true,
                retryDelay: 10000,
                maxRetries: 2,
            };
        }
        else {
            return {
                canRetry: false,
            };
        }
    }
    /**
     * Get API error severity
     */
    getApiErrorSeverity(statusCode) {
        if (statusCode == null)
            return 'medium';
        if (statusCode >= 500)
            return 'high';
        if (statusCode === 404)
            return 'low';
        if (statusCode === 403 || statusCode === 401)
            return 'high';
        if (statusCode >= 400)
            return 'medium';
        return 'low';
    }
    /**
     * Get authentication error message
     */
    getAuthErrorMessage(error) {
        const message = error.message.toLowerCase();
        if (message.includes('invalid') || message.includes('incorrect')) {
            return 'Invalid credentials. Please check your username and password.';
        }
        else if (message.includes('expired')) {
            return 'Your session has expired. Please log in again.';
        }
        else if (message.includes('locked') || message.includes('disabled')) {
            return 'Your account has been locked. Please contact support.';
        }
        else {
            return 'Authentication failed. Please try again.';
        }
    }
    /**
     * Get payment error message
     */
    getPaymentErrorMessage(error) {
        const message = error.message.toLowerCase();
        if (message.includes('card') || message.includes('payment')) {
            return 'Payment failed. Please check your payment method and try again.';
        }
        else if (message.includes('insufficient') || message.includes('funds')) {
            return 'Insufficient funds. Please use a different payment method.';
        }
        else if (message.includes('declined')) {
            return 'Payment was declined. Please contact your bank or use a different card.';
        }
        else {
            return 'Payment processing failed. Please try again or contact support.';
        }
    }
    /**
     * Determine if error can be recovered from
     */
    canRecover(error) {
        const { component } = error.context;
        const severity = error.context.severity ?? 'medium';
        // Critical errors usually can't be recovered
        if (severity === 'critical')
            return false;
        // Network and API errors can usually be retried
        if (component === 'Network' || component === 'API')
            return true;
        // Authentication errors can be retried
        if (component === 'Authentication')
            return true;
        return false;
    }
    /**
     * Create recovery options
     */
    createRecoveryOptions(error) {
        const { component } = error.context;
        switch (component) {
            case 'Network':
                return {
                    canRetry: true,
                    retryDelay: 2000,
                    maxRetries: 3,
                };
            case 'API':
                return {
                    canRetry: true,
                    retryDelay: 1000,
                    maxRetries: 2,
                };
            case 'Authentication':
                return {
                    canRetry: true,
                    retryDelay: 0,
                    maxRetries: 1,
                };
            default:
                return {
                    canRetry: false,
                };
        }
    }
    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return `error_${String(Date.now())}_${Math.random().toString(36).substring(2, 11)}`;
    }
    extractErrorMessage(source, fallback) {
        if (typeof source === 'string') {
            return source;
        }
        if (source instanceof Error && typeof source.message === 'string') {
            return source.message;
        }
        if (isRecordWithMessage(source)) {
            const { message } = source;
            if (typeof message === 'string') {
                return message;
            }
        }
        return fallback;
    }
    /**
     * Setup global error handlers
     */
    setupGlobalErrorHandlers() {
        const browserWindow = (0, environment_1.getWindowObject)();
        if (browserWindow == null) {
            return;
        }
        const handleUnhandledRejection = (event) => {
            if (!isPromiseRejectionEvent(event)) {
                return;
            }
            const message = this.extractErrorMessage(event.reason, 'Unhandled Promise Rejection');
            this.handleError(new Error(message), {
                component: 'Global',
                action: 'unhandled_promise_rejection',
                severity: 'high',
                metadata: {
                    reason: stringifyUnknown(event.reason),
                },
            });
        };
        const handleGlobalError = (event) => {
            if (!isErrorEvent(event)) {
                return;
            }
            const message = this.extractErrorMessage(event.error, 'Global Error');
            this.handleError(new Error(message), {
                component: 'Global',
                action: 'global_error',
                severity: 'high',
                metadata: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: stringifyUnknown(event.error),
                },
            });
        };
        (0, environment_1.addEventListenerSafely)(browserWindow, 'unhandledrejection', handleUnhandledRejection);
        (0, environment_1.addEventListenerSafely)(browserWindow, 'error', handleGlobalError);
    }
}
// Export singleton instance
exports.ErrorHandler = new ErrorHandlerService();
exports.errorHandler = exports.ErrorHandler;
exports.default = exports.ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map