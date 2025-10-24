/**
 * ULTRA PREMIUM Push Notification Service 🔔
 * Production-ready with FCM, APNS, and Web Push support
 */
interface PushNotification {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    image?: string;
    tag?: string;
    data?: unknown;
    requireInteraction?: boolean;
    actions?: NotificationAction[];
    vibrate?: number[];
    sound?: string;
    timestamp?: number;
}
interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
}
interface NotificationAnalytics {
    sent: number;
    delivered: number;
    clicked: number;
    dismissed: number;
    failed: number;
}
declare class NotificationService {
    private serviceWorker;
    private pushSubscription;
    private fcmToken;
    private apnsToken;
    private analytics;
    private messageQueue;
    private isOnline;
    constructor();
    private initialize;
    private registerServiceWorker;
    private setupEventListeners;
    private setupConnectivityListener;
    requestPermission(): Promise<NotificationPermission>;
    private subscribeToPush;
    private urlBase64ToUint8Array;
    private sendSubscriptionToServer;
    private getPlatform;
    private getDeviceInfo;
    sendNotification(notification: PushNotification): Promise<void>;
    private showBasicNotification;
    private handleNotificationClick;
    private handleNotificationClose;
    private processQueuedMessages;
    unsubscribe(): Promise<void>;
    getAnalytics(): NotificationAnalytics;
    testNotification(): Promise<void>;
    sendMatchNotification(matchData: unknown): Promise<void>;
    sendMessageNotification(messageData: unknown): Promise<void>;
    sendLikeNotification(likeData: unknown): Promise<void>;
    sendReminderNotification(reminder: unknown): Promise<void>;
    registerForAPNS(): Promise<void>;
    registerForFCM(): Promise<void>;
    private getFirebaseMessaging;
    private sendFCMTokenToServer;
}
export declare const notificationService: NotificationService;
export default notificationService;
//# sourceMappingURL=NotificationService.d.ts.map