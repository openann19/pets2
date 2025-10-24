interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}
export declare class PushNotificationManager {
    private static instance;
    private registration;
    private subscription;
    private isSupported;
    private permissionState;
    private constructor();
    static getInstance(): PushNotificationManager;
    private checkSupport;
    initialize(): Promise<boolean>;
    private registerServiceWorker;
    requestPermission(): Promise<NotificationPermission>;
    subscribe(): Promise<PushSubscriptionData | null>;
    unsubscribe(): Promise<boolean>;
    sendTestNotification(): Promise<void>;
    showLocalNotification(title: string, options?: NotificationOptions): void;
    checkPermissionStatus(): Promise<NotificationPermission>;
    getSubscriptionStatus(): {
        isSupported: boolean;
        permission: NotificationPermission;
        isSubscribed: boolean;
        subscription: PushSubscriptionData | null;
    };
    private urlBase64ToUint8Array;
    private subscriptionToJSON;
    private sendSubscriptionToServer;
    private removeSubscriptionFromServer;
    private getAuthToken;
    private notifyUpdate;
    sendMessageToServiceWorker(message: unknown): Promise<any>;
    queueMessageForSync(message: unknown): Promise<void>;
    checkForUpdates(): Promise<void>;
    static isSupported(): Promise<boolean>;
    static getPermission(): Promise<NotificationPermission>;
}
export declare const getPushNotificationManager: () => PushNotificationManager;
export {};
//# sourceMappingURL=push-notifications.d.ts.map