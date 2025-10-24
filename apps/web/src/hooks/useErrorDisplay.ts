/**
 * 🎯 ERROR DISPLAY HOOK
 * Automatically displays user-friendly error messages using toast notifications
 * Integrates with ApiError classification system
 */
import { useToast } from '@/components/ui/toast'
import { logger } from '@pawfectmatch/core';
;
import { ApiError } from '@/services/api';
import { useCallback } from 'react';
/**
 * Hook to display errors with user-friendly messages
 */
export function useErrorDisplay() {
    const toast = useToast();
    const displayError = useCallback((error, options = {}) => {
        // Normalize error
        let apiError;
        if (error instanceof ApiError) {
            apiError = error;
        }
        else if (error instanceof Error) {
            apiError = new ApiError(500, error.message);
        }
        else if (typeof error === 'string') {
            apiError = new ApiError(500, error);
        }
        else {
            apiError = new ApiError(500, 'An unexpected error occurred');
        }
        // Get user-friendly message
        const message = options.customMessage ?? apiError.getUserFriendlyMessage();
        // Display toast based on severity
        switch (apiError.severity) {
            case 'critical':
            case 'high':
                toast.error('Error', message);
                break;
            case 'medium':
                toast.error('Error', message);
                break;
            case 'low':
                toast.warning('Notice', message);
                break;
        }
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            logger.error('[Error Display]', { error: apiError.toJSON() }, options.context);
        }
        // Call custom error handler
        options.onError?.(apiError);
        return apiError;
    }, [toast]);
    const displaySuccess = useCallback((title, message) => {
        toast.success(title, message);
    }, [toast]);
    return {
        displayError,
        displaySuccess,
    };
}
//# sourceMappingURL=useErrorDisplay.js.map