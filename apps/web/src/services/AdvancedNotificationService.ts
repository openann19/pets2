/**
 * Advanced Notification Service
 * Comprehensive push notification management with smart features, background sync, and rich notifications
 */
import { logger } from '@pawfectmatch/core';
class AdvancedNotificationService {
    serviceWorker = null;
    preferences;
    analytics;
    messageQueue = [];
    scheduledNotifications = new Map();
    isOnline = true;
    constructor() {
        this.preferences = this.getDefaultPreferences();
        this.analytics = this.getDefaultAnalytics();
        this.init();
        this.setupEventListeners();
    }
    async init() {
        await this.registerServiceWorker();
        await this.loadPreferences();
        await this.loadAnalytics();
        this.isOnline = navigator.onLine;
    }
    /**
     * Register service worker
     */
    async registerServiceWorker() {
        try {
            if (!('serviceWorker' in navigator)) {
                logger.warn('Service workers are not supported');
                return;
            }
            if (!('PushManager' in window)) {
                logger.warn('Push notifications are not supported');
                return;
            }
            this.serviceWorker = await navigator.serviceWorker.ready;
            this.setupServiceWorkerListeners();
        }
        catch (error) {
            logger.error(`Service worker registration failed: ${error}`);
        }
    }
    setupServiceWorkerListeners() {
        if (this.serviceWorker && this.serviceWorker.active) {
            navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
        }
    }
    /**
     * Request notification permission
     */
    async requestPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                logger.info('Notification permission granted');
                return true;
            }
            logger.warn('Notification permission denied');
            return false;
        }
        catch (error) {
            logger.error(`Failed to request permission: ${error}`);
            return false;
        }
    }
    /**
     * Check if notifications are supported and permitted
     */
    async isSupported() {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            return false;
        }
        const permission = await this.requestPermission();
        return permission;
    }
    /**
     * Send a notification
     */
    async sendNotification(notification) {
        try {
            if (!this.shouldSendNotification(notification)) {
                logger.info('Notification skipped due to user preferences');
                return false;
            }
            if (this.isQuietHours()) {
                const delay = this.getNextAvailableTime();
                await this.scheduleNotification(notification, delay);
                logger.info('Notification scheduled for after quiet hours');
                return true;
            }
            if (!this.isOnline) {
                this.messageQueue.push(notification);
                logger.info('User is offline, notification queued');
                return true;
            }
            if (this.serviceWorker && this.serviceWorker.active) {
                await this.serviceWorker.active.postMessage({
                    type: 'show-notification',
                    notification,
                });
            }
            else {
                this.showBasicNotification(notification);
            }
            // Update analytics
            this.updateAnalytics('sent', notification.type);
            return true;
        }
        catch (error) {
            logger.error(`Failed to send notification: ${error}`);
            this.updateAnalytics('failed', notification.type);
            return false;
        }
    }
    /**
     * Schedule a notification for later
     */
    async scheduleNotification(notification, delay) {
        try {
            const id = notification.id || `scheduled-${Date.now()}`;
            notification.id = id;
            notification.scheduledFor = Date.now() + delay;
            this.scheduledNotifications.set(id, notification);
            // Send to service worker
            if (this.serviceWorker && this.serviceWorker.active) {
                await this.serviceWorker.active.postMessage({
                    type: 'schedule-notification',
                    notification: {
                        ...notification,
                        delay,
                    },
                });
            }
            return id;
        }
        catch (error) {
            logger.error(`Failed to schedule notification: ${error}`);
            throw error;
        }
    }
    /**
     * Cancel a scheduled notification
     */
    async cancelNotification(id) {
        try {
            this.scheduledNotifications.delete(id);
            if (this.serviceWorker && this.serviceWorker.active) {
                await this.serviceWorker.active.postMessage({
                    type: 'cancel-notification',
                    id,
                });
            }
            return true;
        }
        catch (error) {
            logger.error(`Failed to cancel notification: ${error}`);
            return false;
        }
    }
    /**
     * Send smart notification based on user behavior
     */
    async sendSmartNotification(type, data) {
        try {
            const notification = await this.generateSmartNotification(type, data);
            return this.sendNotification(notification);
        }
        catch (error) {
            logger.error(`Failed to send smart notification: ${error}`);
            return false;
        }
    }
    /**
     * Send batch of notifications
     */
    async sendBatchNotifications(notifications) {
        const results = await Promise.allSettled(notifications.map((notification) => this.sendNotification(notification)));
        return results.map((result) => (result.status === 'fulfilled' ? result.value : false));
    }
    /**
     * Send digest notification
     */
    async sendDigestNotification(notifications) {
        try {
            if (notifications.length === 0)
                return false;
            const digest = this.createDigestNotification(notifications);
            return this.sendNotification(digest);
        }
        catch (error) {
            logger.error(`Failed to send digest notification: ${error}`);
            return false;
        }
    }
    /**
     * Update notification preferences
     */
    async updatePreferences(preferences) {
        this.preferences = { ...this.preferences, ...preferences };
        await this.savePreferences();
    }
    /**
     * Get current preferences
     */
    getPreferences() {
        return { ...this.preferences };
    }
    /**
     * Get notification analytics
     */
    getAnalytics() {
        return { ...this.analytics };
    }
    /**
     * Clear all notifications
     */
    async clearAllNotifications() {
        try {
            if (this.serviceWorker && this.serviceWorker.active) {
                await this.serviceWorker.active.postMessage({
                    type: 'clear-all-notifications',
                });
            }
        }
        catch (error) {
            logger.error(`Failed to clear notifications: ${error}`);
        }
    }
    /**
     * Get stored notifications
     */
    async getStoredNotifications() {
        try {
            return new Promise((resolve) => {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data.notifications || []);
                };
                if (this.serviceWorker && this.serviceWorker.active) {
                    this.serviceWorker.active.postMessage({ type: 'get-notifications' }, [
                        messageChannel.port2,
                    ]);
                }
                else {
                    resolve([]);
                }
            });
        }
        catch (error) {
            logger.error(`Failed to get stored notifications: ${error}`);
            return [];
        }
    }
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processMessageQueue();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        // Visibility change events
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.processMessageQueue();
            }
        });
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.savePreferences();
            this.saveAnalytics();
        });
    }
    /**
     * Handle service worker messages
     */
    handleServiceWorkerMessage(event) {
        const { data } = event;
        switch (data.type) {
            case 'notification-clicked':
                this.handleNotificationClick(data.notification);
                break;
            case 'notification-action':
                this.handleNotificationAction(data.action, data.notification);
                break;
            case 'notification-dismissed':
                this.updateAnalytics('dismissed', data.notification.type);
                break;
            default:
                logger.warn(`Unknown service worker message: ${data.type}`);
        }
    }
    /**
     * Handle notification click
     */
    handleNotificationClick(notification) {
        this.updateAnalytics('clicked', notification.type);
        if (notification.url) {
            window.open(notification.url, '_blank');
        }
    }
    /**
     * Handle notification action
     */
    handleNotificationAction(action, notification) {
        logger.info(`Notification action: ${action}`, { notification });
        // Handle specific actions
        switch (action) {
            case 'reply':
                // Open reply interface
                break;
            case 'like_back':
                // Like back functionality
                break;
            case 'snooze':
                // Snooze notification
                break;
            default:
                logger.warn(`Unknown action: ${action}`);
        }
    }
    /**
     * Check if notification should be sent based on preferences
     */
    shouldSendNotification(notification) {
        if (!this.preferences.enabled)
            return false;
        const typeEnabled = this.preferences.types[notification.type];
        if (!typeEnabled)
            return false;
        return true;
    }
    /**
     * Check if currently in quiet hours
     */
    isQuietHours() {
        if (!this.preferences.quietHours.enabled)
            return false;
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const startTime = this.parseTime(this.preferences.quietHours.start);
        const endTime = this.parseTime(this.preferences.quietHours.end);
        if (startTime <= endTime) {
            return currentTime >= startTime && currentTime <= endTime;
        }
        else {
            return currentTime >= startTime || currentTime <= endTime;
        }
    }
    /**
     * Parse time string to minutes
     */
    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return (hours ?? 0) * 60 + (minutes ?? 0);
    }
    /**
     * Get next available time outside quiet hours
     */
    getNextAvailableTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
        return tomorrow.getTime() - now.getTime();
    }
    /**
     * Generate smart notification based on type and data
     */
    async generateSmartNotification(type, data) {
        const typedData = data;
        // Implementation would use AI/ML to generate personalized notifications
        switch (type) {
            case 'match':
                return {
                    type: 'match',
                    title: 'New Match! 🐾',
                    body: `You and ${typedData['petName']} are a perfect match!`,
                    image: typedData['petImage'],
                    url: `/matches/${typedData['matchId']}`,
                    data: { matchId: typedData['matchId'] },
                    actions: [
                        { action: 'view', title: 'View Match' },
                        { action: 'chat', title: 'Start Chat' },
                    ],
                    requireInteraction: true,
                    vibrate: [200, 100, 200],
                };
            case 'message':
                return {
                    type: 'message',
                    title: `Message from ${typedData['senderName']}`,
                    body: typedData['message'],
                    image: typedData['senderAvatar'],
                    url: `/chat/${typedData['chatId']}`,
                    data: { chatId: typedData['chatId'] },
                    actions: [
                        { action: 'reply', title: 'Reply' },
                        { action: 'view', title: 'View Chat' },
                    ],
                };
            default: {
                const url = typedData['url'];
                return {
                    type: 'custom',
                    title: typedData['title'] || 'Notification',
                    body: typedData['body'] || '',
                    ...(url ? { url } : {}),
                };
            }
        }
    }
    /**
     * Create digest notification
     */
    createDigestNotification(notifications) {
        const typeCounts = notifications.reduce((acc, notif) => {
            acc[notif.type] = (acc[notif.type] || 0) + 1;
            return acc;
        }, {});
        const summary = Object.entries(typeCounts)
            .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
            .join(', ');
        return {
            type: 'custom',
            title: 'Daily Summary',
            body: `You have ${notifications.length} new notifications: ${summary}`,
            url: '/notifications',
            data: { notifications },
            actions: [
                { action: 'view', title: 'View All' },
                { action: 'dismiss', title: 'Dismiss' },
            ],
        };
    }
    /**
     * Show basic notification (fallback)
     */
    showBasicNotification(notification) {
        if (Notification.permission === 'granted') {
            // Create options with explicit default values for TypeScript strict mode
            const options = {
                body: notification.body,
                icon: notification.icon || '/icons/icon-192x192.png',
                data: notification.data,
            };
            // Only add optional properties if they exist
            if (notification.tag) {
                options.tag = notification.tag;
            }
            if (notification.requireInteraction !== undefined) {
                options.requireInteraction = notification.requireInteraction;
            }
            if (notification.silent !== undefined) {
                options.silent = notification.silent;
            }
            new Notification(notification.title, options);
        }
    }
    /**
     * Process queued messages
     */
    async processMessageQueue() {
        if (this.messageQueue.length === 0)
            return;
        const queue = [...this.messageQueue];
        this.messageQueue = [];
        for (const notification of queue) {
            await this.sendNotification(notification);
        }
    }
    /**
     * Update analytics
     */
    updateAnalytics(event, type) {
        this.analytics[event]++;
        this.analytics.byType[type] = (this.analytics.byType[type] || 0) + 1;
    }
    /**
     * Get default preferences
     */
    getDefaultPreferences() {
        return {
            enabled: true,
            types: {
                match: true,
                message: true,
                like: true,
                reminder: true,
                promotion: false,
            },
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00',
            },
            frequency: 'immediate',
            sound: true,
            vibration: true,
        };
    }
    /**
     * Get default analytics
     */
    getDefaultAnalytics() {
        return {
            sent: 0,
            delivered: 0,
            clicked: 0,
            dismissed: 0,
            failed: 0,
            byType: {},
        };
    }
    /**
     * Load preferences from storage
     */
    async loadPreferences() {
        try {
            const stored = localStorage.getItem('notification_preferences');
            if (stored) {
                this.preferences = { ...this.preferences, ...JSON.parse(stored) };
            }
        }
        catch (error) {
            logger.error(`Failed to load preferences: ${error}`);
        }
    }
    /**
     * Save preferences to storage
     */
    async savePreferences() {
        try {
            localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
        }
        catch (error) {
            logger.error(`Failed to save preferences: ${error}`);
        }
    }
    /**
     * Load analytics from storage
     */
    async loadAnalytics() {
        try {
            const stored = localStorage.getItem('notification_analytics');
            if (stored) {
                this.analytics = { ...this.analytics, ...JSON.parse(stored) };
            }
        }
        catch (error) {
            logger.error(`Failed to load analytics: ${error}`);
        }
    }
    /**
     * Save analytics to storage
     */
    async saveAnalytics() {
        try {
            localStorage.setItem('notification_analytics', JSON.stringify(this.analytics));
        }
        catch (error) {
            logger.error('Failed to save analytics:', { error });
        }
    }
}
const advancedNotificationService = new AdvancedNotificationService();
export default advancedNotificationService;
//# sourceMappingURL=AdvancedNotificationService.js.map