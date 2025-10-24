export interface UseNotificationsReturn {
    notificationsEnabled: boolean;
    notificationPermission: NotificationPermission;
    showNotificationPrompt: boolean;
    checkNotificationSupport: () => boolean;
    requestNotificationPermission: () => Promise<void>;
    dismissNotificationPrompt: () => void;
}
export declare const useNotifications: () => UseNotificationsReturn;
//# sourceMappingURL=useNotifications.d.ts.map