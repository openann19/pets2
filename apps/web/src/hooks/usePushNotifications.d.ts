interface UsePushNotificationsOptions {
    autoInitialize?: boolean;
    onPermissionGranted?: () => void;
    onPermissionDenied?: () => void;
    onSubscribed?: () => void;
    onUnsubscribed?: () => void;
    onNotificationReceived?: (notification: unknown) => void;
    onUpdateAvailable?: () => void;
}
export declare function usePushNotifications(options?: UsePushNotificationsOptions): {
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    isInitializing: boolean;
    error: Error | null;
    initialize: () => Promise<void>;
    requestPermission: () => Promise<NotificationPermission>;
    subscribe: () => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
    showNotification: (title: string, options?: NotificationOptions) => void;
    sendTestNotification: () => Promise<void>;
    checkForUpdates: () => Promise<void>;
    queueMessage: (message: unknown) => Promise<void>;
    canSubscribe: boolean;
    canRequestPermission: boolean;
};
export declare function useNotificationSettings(): {
    settings: {
        messages: boolean;
        matches: boolean;
        likes: boolean;
        superLikes: boolean;
        calls: boolean;
        promotional: boolean;
        updates: boolean;
    };
    isSaving: boolean;
    toggleSetting: (key: "matches" | "likes" | "messages" | "updates" | "calls" | "superLikes" | "promotional") => void;
    enableAll: () => void;
    disableAll: () => void;
    saveSettings: (newSettings: {
        messages: boolean;
        matches: boolean;
        likes: boolean;
        superLikes: boolean;
        calls: boolean;
        promotional: boolean;
        updates: boolean;
    }) => Promise<boolean>;
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    isInitializing: boolean;
    error: Error | null;
    initialize: () => Promise<void>;
    requestPermission: () => Promise<NotificationPermission>;
    subscribe: () => Promise<boolean>;
    unsubscribe: () => Promise<boolean>;
    showNotification: (title: string, options?: NotificationOptions) => void;
    sendTestNotification: () => Promise<void>;
    checkForUpdates: () => Promise<void>;
    queueMessage: (message: unknown) => Promise<void>;
    canSubscribe: boolean;
    canRequestPermission: boolean;
};
export {};
//# sourceMappingURL=usePushNotifications.d.ts.map