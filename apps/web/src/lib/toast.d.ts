/**
 * Toast Notification Utility
 * Wrapper around sonner for consistent toast notifications
 */
interface ToastOptions {
    description?: string;
    duration?: number;
}
export declare const toast: {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
    loading: (message: string) => any;
    dismiss: (toastId?: string | number) => void;
    promise: <T>(promise: Promise<T>, messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
    }) => any;
};
export declare const moderationToasts: {
    reportSuccess: () => void;
    reportError: () => void;
    blockSuccess: (userName?: string) => void;
    blockError: () => void;
    unblockSuccess: (userName?: string) => void;
    unblockError: () => void;
    muteSuccess: (duration: number) => void;
    muteError: () => void;
    unmuteSuccess: () => void;
    unmuteError: () => void;
};
export {};
//# sourceMappingURL=toast.d.ts.map