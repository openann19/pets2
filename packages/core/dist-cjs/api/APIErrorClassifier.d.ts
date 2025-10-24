/**
 * API Error Classifier
 * Classifies errors and determines retry eligibility
 */
export declare enum ErrorType {
    NETWORK = "NETWORK",
    AUTHENTICATION = "AUTHENTICATION",
    AUTHORIZATION = "AUTHORIZATION",
    VALIDATION = "VALIDATION",
    SERVER = "SERVER",
    CLIENT = "CLIENT",
    TIMEOUT = "TIMEOUT",
    RATE_LIMIT = "RATE_LIMIT",
    UNKNOWN = "UNKNOWN"
}
export interface ErrorClassification {
    type: ErrorType;
    retryable: boolean;
    userMessage: string;
    statusCode?: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export declare class APIErrorClassifier {
    private static readonly ERROR_MESSAGES;
    /**
     * Classify an error
     */
    classify(error: unknown, context?: {
        endpoint?: string;
        method?: string;
        statusCode?: number;
    }): ErrorClassification;
    /**
     * Classify error by HTTP status code
     */
    private classifyByStatusCode;
    /**
     * Classify error by error message
     */
    private classifyByMessage;
    /**
     * Check if error is network error
     */
    private isNetworkError;
    /**
     * Check if error is timeout error
     */
    private isTimeoutError;
    /**
     * Check if error is authentication error
     */
    private isAuthenticationError;
    /**
     * Check if error is generally retryable
     */
    private isRetryableError;
    /**
     * Extract status code from error
     */
    private extractStatusCode;
    /**
     * Extract error message
     */
    private extractErrorMessage;
    /**
     * Get user-friendly error message
     */
    getUserMessage(error: unknown, context?: {
        endpoint?: string;
        method?: string;
        statusCode?: number;
    }): string;
}
