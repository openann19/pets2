/**
 * Toast Notification Utility
 * Wrapper around sonner for consistent toast notifications
 */
import { toast as sonnerToast } from 'sonner';
export const toast = {
    success: (message, options) => {
        sonnerToast.success(message, {
            description: options?.description,
            duration: options?.duration || 3000,
        });
    },
    error: (message, options) => {
        sonnerToast.error(message, {
            description: options?.description,
            duration: options?.duration || 5000,
        });
    },
    info: (message, options) => {
        sonnerToast.info(message, {
            description: options?.description,
            duration: options?.duration || 3000,
        });
    },
    warning: (message, options) => {
        sonnerToast.warning(message, {
            description: options?.description,
            duration: options?.duration || 4000,
        });
    },
    loading: (message) => {
        return sonnerToast.loading(message);
    },
    dismiss: (toastId) => {
        sonnerToast.dismiss(toastId);
    },
    promise: (promise, messages) => {
        return sonnerToast.promise(promise, messages);
    },
};
// Predefined moderation toasts
export const moderationToasts = {
    reportSuccess: () => { toast.success('Report submitted', {
        description: 'Thank you for helping keep our community safe',
    }); },
    reportError: () => { toast.error('Failed to submit report', {
        description: 'Please try again later',
    }); },
    blockSuccess: (userName) => { toast.success('User blocked', {
        description: userName ? `${userName} has been blocked` : 'You will no longer see content from this user',
    }); },
    blockError: () => { toast.error('Failed to block user', {
        description: 'Please try again',
    }); },
    unblockSuccess: (userName) => { toast.success('User unblocked', {
        description: userName ? `${userName} has been unblocked` : 'User has been unblocked',
    }); },
    unblockError: () => { toast.error('Failed to unblock user'); },
    muteSuccess: (duration) => {
        const hours = Math.floor(duration / 60);
        const mins = duration % 60;
        const durationText = hours > 0
            ? `${hours}h ${mins}m`
            : `${mins} minutes`;
        toast.success('User muted', {
            description: `Muted for ${durationText}`,
        });
    },
    muteError: () => { toast.error('Failed to mute user'); },
    unmuteSuccess: () => { toast.success('User unmuted'); },
    unmuteError: () => { toast.error('Failed to unmute user'); },
};
//# sourceMappingURL=toast.js.map