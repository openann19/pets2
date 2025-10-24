"use strict";
/**
 * API Error Classifier
 * Classifies errors and determines retry eligibility
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIErrorClassifier = exports.ErrorType = void 0;
var ErrorType;
(function (ErrorType) {
    ErrorType["NETWORK"] = "NETWORK";
    ErrorType["AUTHENTICATION"] = "AUTHENTICATION";
    ErrorType["AUTHORIZATION"] = "AUTHORIZATION";
    ErrorType["VALIDATION"] = "VALIDATION";
    ErrorType["SERVER"] = "SERVER";
    ErrorType["CLIENT"] = "CLIENT";
    ErrorType["TIMEOUT"] = "TIMEOUT";
    ErrorType["RATE_LIMIT"] = "RATE_LIMIT";
    ErrorType["UNKNOWN"] = "UNKNOWN";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
class APIErrorClassifier {
    static ERROR_MESSAGES = {
        [ErrorType.NETWORK]: 'Network connection failed. Please check your internet connection.',
        [ErrorType.AUTHENTICATION]: 'Your session has expired. Please sign in again.',
        [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
        [ErrorType.VALIDATION]: 'Invalid input. Please check your data and try again.',
        [ErrorType.SERVER]: 'Server error. Please try again later.',
        [ErrorType.CLIENT]: 'Invalid request. Please check your input.',
        [ErrorType.TIMEOUT]: 'Request timed out. Please try again.',
        [ErrorType.RATE_LIMIT]: 'Too many requests. Please wait a moment.',
        [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };
    /**
     * Classify an error
     */
    classify(error, context) {
        const statusCode = context?.statusCode || this.extractStatusCode(error);
        // Classify by status code first
        if (statusCode) {
            return this.classifyByStatusCode(statusCode);
        }
        // Classify by error message
        const errorMessage = this.extractErrorMessage(error);
        return this.classifyByMessage(errorMessage, error);
    }
    /**
     * Classify error by HTTP status code
     */
    classifyByStatusCode(statusCode) {
        switch (true) {
            case statusCode >= 500:
                return {
                    type: ErrorType.SERVER,
                    retryable: true,
                    userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.SERVER],
                    statusCode,
                    severity: 'high',
                };
            case statusCode === 401:
                return {
                    type: ErrorType.AUTHENTICATION,
                    retryable: false,
                    userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.AUTHENTICATION],
                    statusCode,
                    severity: 'high',
                };
            case statusCode === 403:
                return {
                    type: ErrorType.AUTHORIZATION,
                    retryable: false,
                    userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.AUTHORIZATION],
                    statusCode,
                    severity: 'medium',
                };
            case statusCode === 404:
                return {
                    type: ErrorType.CLIENT,
                    retryable: false,
                    userMessage: 'Resource not found.',
                    statusCode,
                    severity: 'low',
                };
            case statusCode === 408:
                return {
                    type: ErrorType.TIMEOUT,
                    retryable: true,
                    userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.TIMEOUT],
                    statusCode,
                    severity: 'medium',
                };
            case statusCode === 429:
                return {
                    type: ErrorType.RATE_LIMIT,
                    retryable: true,
                    userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.RATE_LIMIT],
                    statusCode,
                    severity: 'medium',
                };
            case statusCode >= 400:
                return {
                    type: ErrorType.VALIDATION,
                    retryable: false,
                    userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.VALIDATION],
                    statusCode,
                    severity: 'medium',
                };
            default:
                return {
                    type: ErrorType.UNKNOWN,
                    retryable: false,
                    userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.UNKNOWN],
                    statusCode,
                    severity: 'low',
                };
        }
    }
    /**
     * Classify error by error message
     */
    classifyByMessage(errorMessage, error) {
        const lowerMessage = errorMessage.toLowerCase();
        // Network errors
        if (this.isNetworkError(lowerMessage)) {
            return {
                type: ErrorType.NETWORK,
                retryable: true,
                userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.NETWORK],
                severity: 'high',
            };
        }
        // Timeout errors
        if (this.isTimeoutError(lowerMessage)) {
            return {
                type: ErrorType.TIMEOUT,
                retryable: true,
                userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.TIMEOUT],
                severity: 'medium',
            };
        }
        // Auth errors
        if (this.isAuthenticationError(lowerMessage)) {
            return {
                type: ErrorType.AUTHENTICATION,
                retryable: false,
                userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.AUTHENTICATION],
                severity: 'high',
            };
        }
        // Unknown error
        return {
            type: ErrorType.UNKNOWN,
            retryable: this.isRetryableError(error),
            userMessage: APIErrorClassifier.ERROR_MESSAGES[ErrorType.UNKNOWN],
            severity: 'medium',
        };
    }
    /**
     * Check if error is network error
     */
    isNetworkError(message) {
        const networkKeywords = [
            'network',
            'connection',
            'econnrefused',
            'enotfound',
            'econnreset',
            'fetch failed',
            'network error',
        ];
        return networkKeywords.some(keyword => message.includes(keyword));
    }
    /**
     * Check if error is timeout error
     */
    isTimeoutError(message) {
        const timeoutKeywords = [
            'timeout',
            'timed out',
            'etimedout',
            'request timeout',
        ];
        return timeoutKeywords.some(keyword => message.includes(keyword));
    }
    /**
     * Check if error is authentication error
     */
    isAuthenticationError(message) {
        const authKeywords = [
            'unauthorized',
            'authentication',
            'token',
            'invalid credentials',
            'session expired',
        ];
        return authKeywords.some(keyword => message.includes(keyword));
    }
    /**
     * Check if error is generally retryable
     */
    isRetryableError(error) {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            return this.isNetworkError(message) || this.isTimeoutError(message);
        }
        return false;
    }
    /**
     * Extract status code from error
     */
    extractStatusCode(error) {
        if (error && typeof error === 'object') {
            if ('status' in error && typeof error.status === 'number') {
                return error.status;
            }
            if ('statusCode' in error && typeof error.statusCode === 'number') {
                return error.statusCode;
            }
            if ('response' in error && typeof error.response === 'object' && error.response !== null) {
                const response = error.response;
                return response.status || response.statusCode;
            }
        }
        return undefined;
    }
    /**
     * Extract error message
     */
    extractErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        if (error && typeof error === 'object') {
            if ('message' in error && typeof error.message === 'string') {
                return error.message;
            }
        }
        return String(error);
    }
    /**
     * Get user-friendly error message
     */
    getUserMessage(error, context) {
        const classification = this.classify(error, context);
        return classification.userMessage;
    }
}
exports.APIErrorClassifier = APIErrorClassifier;
