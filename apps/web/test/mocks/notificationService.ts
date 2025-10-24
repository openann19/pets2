/**
 * Mock notification service for testing
 * Provides typed mocks for notification functionality
 */

interface NotificationPermission {
    granted: 'granted';
    denied: 'denied';
    default: 'default';
}

interface NotificationOptions {
    body?: string;
    icon?: string;
    image?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    requireInteraction?: boolean;
    silent?: boolean;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

interface SentNotification {
    title: string;
    options?: NotificationOptions;
    timestamp: number;
    id: string;
}

/**
 * Mock notification service
 */
export class MockNotificationService {
    private notifications: SentNotification[] = [];
    private permission: keyof NotificationPermission = 'default';
    private permissionRequestResult: keyof NotificationPermission = 'granted';

    // Jest mocks
    public requestPermission = jest.fn();
    public showNotification = jest.fn();
    public scheduleNotification = jest.fn();
    public cancelNotification = jest.fn();
    public clearAllNotifications = jest.fn();

    constructor() {
        this.setupMockImplementations();
    }

    private setupMockImplementations(): void {
        this.requestPermission.mockImplementation(async () => {
            this.permission = this.permissionRequestResult;
            return this.permission;
        });

        this.showNotification.mockImplementation((title: string, options?: NotificationOptions) => {
            if (this.permission !== 'granted') {
                throw new Error('Notification permission denied');
            }

            const notification: SentNotification = {
                title,
                timestamp: Date.now(),
                id: this.generateId(),
            };

            if (options !== undefined) {
                notification.options = options;
            }

            this.notifications.push(notification);
            return notification.id;
        });

        this.scheduleNotification.mockImplementation((title: string, options?: NotificationOptions & { delay: number }) => {
            if (this.permission !== 'granted') {
                throw new Error('Notification permission denied');
            }

            const notification: SentNotification = {
                title,
                timestamp: Date.now() + (options?.delay ?? 0),
                id: this.generateId(),
            };

            if (options !== undefined) {
                // Remove delay from options before storing
                const { delay: _delay, ...notificationOptions } = options;
                notification.options = notificationOptions;
            }

            this.notifications.push(notification);
            return notification.id;
        });

        this.cancelNotification.mockImplementation((id: string) => {
            const index = this.notifications.findIndex(n => n.id === id);
            if (index > -1) {
                this.notifications.splice(index, 1);
                return true;
            }
            return false;
        });

        this.clearAllNotifications.mockImplementation(() => {
            this.notifications = [];
        });
    }

    /**
     * Set the permission state for testing
     */
    setPermission(permission: keyof NotificationPermission): void {
        this.permission = permission;
    }

    /**
     * Set what permission request should return
     */
    setPermissionRequestResult(result: keyof NotificationPermission): void {
        this.permissionRequestResult = result;
    }

    /**
     * Get current permission state
     */
    getPermission(): keyof NotificationPermission {
        return this.permission;
    }

    /**
     * Get all sent notifications
     */
    getNotifications(): SentNotification[] {
        return [...this.notifications];
    }

    /**
     * Get notifications with specific title
     */
    getNotificationsByTitle(title: string): SentNotification[] {
        return this.notifications.filter(n => n.title.includes(title));
    }

    /**
     * Get notifications with specific tag
     */
    getNotificationsByTag(tag: string): SentNotification[] {
        return this.notifications.filter(n => n.options?.tag === tag);
    }

    /**
     * Check if a notification was sent
     */
    wasNotificationSent(title: string): boolean {
        return this.notifications.some(n => n.title.includes(title));
    }

    /**
     * Get the last notification sent
     */
    getLastNotification(): SentNotification | undefined {
        return this.notifications[this.notifications.length - 1];
    }

    /**
     * Get count of notifications sent
     */
    getNotificationCount(): number {
        return this.notifications.length;
    }

    /**
     * Reset all mocks and clear notifications
     */
    reset(): void {
        this.notifications = [];
        this.permission = 'default';
        this.permissionRequestResult = 'granted';

        this.requestPermission.mockClear();
        this.showNotification.mockClear();
        this.scheduleNotification.mockClear();
        this.cancelNotification.mockClear();
        this.clearAllNotifications.mockClear();
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 11);
    }
}

/**
 * Create a fresh mock notification service
 */
export function createMockNotificationService(): MockNotificationService {
    return new MockNotificationService();
}

/**
 * Global mock notification service for tests
 */
export const mockNotificationService = createMockNotificationService();

/**
 * Mock the browser Notification API
 */
export function mockBrowserNotifications(): void {
    // Mock the global Notification constructor
    global.Notification = jest.fn().mockImplementation((title: string, options?: NotificationOptions) => {
        return {
            title,
            body: options?.body,
            icon: options?.icon,
            tag: options?.tag,
            close: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
        };
    }) as unknown as typeof Notification;

    // Mock static methods
    Object.defineProperty(global.Notification, 'permission', {
        value: 'default',
        writable: true,
    });
    Object.defineProperty(global.Notification, 'requestPermission', {
        value: jest.fn().mockResolvedValue('granted'),
        writable: true,
    });

    // Mock navigator.serviceWorker
    Object.defineProperty(global, 'navigator', {
        value: {
            serviceWorker: {
                ready: Promise.resolve({
                    showNotification: jest.fn(),
                    getNotifications: jest.fn().mockResolvedValue([]),
                }),
                register: jest.fn().mockResolvedValue({}),
            },
        },
        writable: true,
    });
}

/**
 * Helper assertions for notification testing
 */
export const notificationAssertions = {
    /**
     * Assert that a notification was shown with specific title
     */
    expectNotificationShown: (service: MockNotificationService, title: string) => {
        if (service.wasNotificationSent(title) === false) {
            throw new Error(`Expected notification with title "${title}" to be sent`);
        }
    },

    /**
     * Assert that no notifications were sent
     */
    expectNoNotifications: (service: MockNotificationService) => {
        const count = service.getNotificationCount();
        if (count > 0) {
            throw new Error(`Expected no notifications, but ${count.toString()} were sent`);
        }
    },

    /**
     * Assert specific number of notifications were sent
     */
    expectNotificationCount: (service: MockNotificationService, expectedCount: number) => {
        const actualCount = service.getNotificationCount();
        if (actualCount !== expectedCount) {
            throw new Error(`Expected ${expectedCount.toString()} notifications, but ${actualCount.toString()} were sent`);
        }
    },

    /**
     * Assert that permission was requested
     */
    expectPermissionRequested: (service: MockNotificationService) => {
        if (service.requestPermission.mock.calls.length === 0) {
            throw new Error('Expected permission to be requested');
        }
    },

    /**
     * Assert that a notification has specific options
     */
    expectNotificationWithOptions: (service: MockNotificationService, title: string, expectedOptions: Partial<NotificationOptions>) => {
        const notifications = service.getNotificationsByTitle(title);
        if (notifications.length === 0) {
            throw new Error(`No notification found with title "${title}"`);
        }

        const notification = notifications[notifications.length - 1];
        if (notification === undefined) {
            throw new Error('No notification found');
        }

        const options = notification.options ?? {};

        Object.entries(expectedOptions).forEach(([key, value]) => {
            const optionValue = (options as Record<string, unknown>)[key];
            if (optionValue !== value) {
                const valueStr = JSON.stringify(value);
                const optionValueStr = JSON.stringify(optionValue);
                throw new Error(`Expected notification option "${key}" to be "${valueStr}", but got "${optionValueStr}"`);
            }
        });
    },
};