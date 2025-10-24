/**
 * 🎯 ERROR DISPLAY HOOK
 * Automatically displays user-friendly error messages using toast notifications
 * Integrates with ApiError classification system
 */
import { ApiError } from '@/services/api';
export interface ErrorDisplayOptions {
    /** Show success message on recovery */
    showRecovery?: boolean;
    /** Custom error message override */
    customMessage?: string;
    /** Context for logging */
    context?: Record<string, unknown>;
    /** Callback after error displayed */
    onError?: (error: ApiError) => void;
}
/**
 * Hook to display errors with user-friendly messages
 */
export declare function useErrorDisplay(): {
    displayError: (error: unknown, options?: ErrorDisplayOptions) => ApiError;
    displaySuccess: (title: string, message: string) => void;
};
//# sourceMappingURL=useErrorDisplay.d.ts.map