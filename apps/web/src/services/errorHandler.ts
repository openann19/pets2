import { logger } from '@pawfectmatch/core';
class ErrorHandlerService {
    isProduction = process.env.NODE_ENV === 'production';
    handleError(error, context = {}, options = {}) {
        const errorMessage = typeof error === 'string' ? error : error.message;
        // Log error
        if (options.logError !== false) {
            if (this.isProduction) {
                logger.error('Error:', { errorMessage, context });
            }
            else {
                logger.error('Error:', { error, context });
            }
        }
        // Show notification if needed
        if (options.showNotification !== false &&
            this.shouldShowNotification(context.severity ?? 'medium')) {
            this.showNotification({
                title: 'Error',
                message: errorMessage,
                type: 'error',
                dismissible: true,
                autoHide: true,
                duration: 5000,
            });
        }
    }
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
        this.handleError(error, apiContext, {
            showNotification: options.showNotification !== false,
            severity: this.getApiErrorSeverity(options.statusCode),
        });
    }
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
        this.handleError(error, networkContext, {
            showNotification: options.showNotification !== false,
            severity: 'medium',
        });
    }
    shouldShowNotification(severity) {
        return severity === 'high' || severity === 'critical';
    }
    showNotification(notification) {
        // In a real implementation, this would integrate with a notification system
        // For now, we'll just log it
        logger.warn('Notification:', { notification });
    }
    getApiErrorSeverity(statusCode) {
        if (statusCode === undefined)
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
}
export const errorHandler = new ErrorHandlerService();
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map