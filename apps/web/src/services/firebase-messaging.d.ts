/**
 * Firebase Cloud Messaging Service
 * Handles push notifications for web and mobile
 */
export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
    requireInteraction?: boolean;
    silent?: boolean;
}
export interface NotificationPermission {
    permission: NotificationPermission;
    token: string | null;
    error: string | null;
}
declare class FirebaseMessagingService {
    private token;
    private isSupported;
    private permission;
    private messageHandlers;
    initialize(): Promise<NotificationPermission>;
    private requestPermission;
    private getFCMToken;
    private sendTokenToServer;
    private setupMessageListener;
    private showNotification;
    getToken(): string | null;
    getPermission(): NotificationPermission;
    isMessagingSupported(): boolean;
    onMessage(handler: (payload: unknown) => void): () => void;
    refreshToken(): Promise<string | null>;
    sendTestNotification(): Promise<void>;
}
export declare const firebaseMessaging: FirebaseMessagingService;
export declare function useFirebaseMessaging(): {
    requestPermission: () => Promise<NotificationPermission>;
    sendTestNotification: () => Promise<void>;
    refreshToken: () => Promise<string | null>;
    onMessage: (handler: (payload: unknown) => void) => () => void;
    isSupported: boolean;
    permission: NotificationPermission;
    token: string | null;
    error: string | null;
    isInitialized: boolean;
};
export default firebaseMessaging;
//# sourceMappingURL=firebase-messaging.d.ts.map