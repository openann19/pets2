/**
 * Advanced Notification Service
 * Comprehensive push notification management with smart features, background sync, and rich notifications
 */
export interface NotificationData {
    id?: string;
    type: 'match' | 'message' | 'like' | 'reminder' | 'promotion' | 'custom';
    title: string;
    body: string;
    icon?: string;
    image?: string;
    url?: string;
    data?: Record<string, unknown>;
    actions?: NotificationAction[];
    requireInteraction?: boolean;
    vibrate?: number[];
    tag?: string;
    renotify?: boolean;
    silent?: boolean;
    timestamp?: number;
    scheduledFor?: number;
    expiresAt?: number;
}
export interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
}
export interface NotificationPreferences {
    enabled: boolean;
    types: {
        match: boolean;
        message: boolean;
        like: boolean;
        reminder: boolean;
        promotion: boolean;
    };
    quietHours: {
        enabled: boolean;
        start: string;
        end: string;
    };
    frequency: 'immediate' | 'batched' | 'digest';
    sound: boolean;
    vibration: boolean;
}
export interface NotificationAnalytics {
    sent: number;
    delivered: number;
    clicked: number;
    dismissed: number;
    failed: number;
    byType: Record<string, number>;
}
declare class AdvancedNotificationService {
    private serviceWorker;
    private preferences;
    private analytics;
    private messageQueue;
    private scheduledNotifications;
    private isOnline;
    constructor();
    private init;
    /**
     * Register service worker
     */
    private registerServiceWorker;
    private setupServiceWorkerListeners;
    /**
     * Request notification permission
     */
    requestPermission(): Promise<boolean>;
    /**
     * Check if notifications are supported and permitted
     */
    isSupported(): Promise<boolean>;
    /**
     * Send a notification
     */
    sendNotification(notification: NotificationData): Promise<boolean>;
    /**
     * Schedule a notification for later
     */
    scheduleNotification(notification: NotificationData, delay: number): Promise<string>;
    /**
     * Cancel a scheduled notification
     */
    cancelNotification(id: string): Promise<boolean>;
    /**
     * Send smart notification based on user behavior
     */
    sendSmartNotification(type: string, data: unknown): Promise<boolean>;
    /**
     * Send batch of notifications
     */
    sendBatchNotifications(notifications: NotificationData[]): Promise<boolean[]>;
    /**
     * Send digest notification
     */
    sendDigestNotification(notifications: NotificationData[]): Promise<boolean>;
    /**
     * Update notification preferences
     */
    updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void>;
    /**
     * Get current preferences
     */
    getPreferences(): NotificationPreferences;
    /**
     * Get notification analytics
     */
    getAnalytics(): NotificationAnalytics;
    /**
     * Clear all notifications
     */
    clearAllNotifications(): Promise<void>;
    /**
     * Get stored notifications
     */
    getStoredNotifications(): Promise<NotificationData[]>;
    /**
     * Setup event listeners
     */
    private setupEventListeners;
    /**
     * Handle service worker messages
     */
    private handleServiceWorkerMessage;
    /**
     * Handle notification click
     */
    private handleNotificationClick;
    /**
     * Handle notification action
     */
    private handleNotificationAction;
    /**
     * Check if notification should be sent based on preferences
     */
    private shouldSendNotification;
    /**
     * Check if currently in quiet hours
     */
    private isQuietHours;
    /**
     * Parse time string to minutes
     */
    private parseTime;
    /**
     * Get next available time outside quiet hours
     */
    private getNextAvailableTime;
    /**
     * Generate smart notification based on type and data
     */
    private generateSmartNotification;
    /**
     * Create digest notification
     */
    private createDigestNotification;
    /**
     * Show basic notification (fallback)
     */
    private showBasicNotification;
    /**
     * Process queued messages
     */
    private processMessageQueue;
    /**
     * Update analytics
     */
    private updateAnalytics;
    /**
     * Get default preferences
     */
    private getDefaultPreferences;
    /**
     * Get default analytics
     */
    private getDefaultAnalytics;
    /**
     * Load preferences from storage
     */
    private loadPreferences;
    /**
     * Save preferences to storage
     */
    private savePreferences;
    /**
     * Load analytics from storage
     */
    private loadAnalytics;
    /**
     * Save analytics to storage
     */
    private saveAnalytics;
}
declare const advancedNotificationService: AdvancedNotificationService;
export default advancedNotificationService;
//# sourceMappingURL=AdvancedNotificationService.d.ts.map