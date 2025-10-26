/**
 * Service Worker Mocks for Testing
 */
// Mock ServiceWorker registration
export class MockServiceWorkerRegistration {
    scope: string;
    active: { state: string; scriptURL: string; onstatechange: null };
    installing: unknown;
    waiting: unknown;
    pushManager;
    sync;
    navigationPreload;
    updateViaCache;
    constructor() {
        this.scope = 'https://example.com/';
        this.active = {
            state: 'activated',
            scriptURL: 'https://example.com/sw.js',
            onstatechange: null,
        };
        this.installing = null;
        this.waiting = null;
        this.pushManager = {
            subscribe: jest.fn().mockResolvedValue({
                endpoint: 'https://fcm.googleapis.com/fcm/send/example',
                keys: {
                    auth: 'mock-auth-key',
                    p256dh: 'mock-p256dh-key',
                },
                toJSON: () => ({
                    endpoint: 'https://fcm.googleapis.com/fcm/send/example',
                    keys: {
                        auth: 'mock-auth-key',
                        p256dh: 'mock-p256dh-key',
                    },
                }),
            }),
            getSubscription: jest.fn().mockResolvedValue(null),
            permissionState: jest.fn().mockResolvedValue('granted'),
        };
        this.sync = {
            register: jest.fn().mockResolvedValue(undefined),
            getTags: jest.fn().mockResolvedValue([]),
        };
        this.navigationPreload = {
            enable: jest.fn().mockResolvedValue(undefined),
            disable: jest.fn().mockResolvedValue(undefined),
            getState: jest.fn().mockResolvedValue({}),
            setHeaderValue: jest.fn().mockResolvedValue(undefined),
        };
        this.updateViaCache = 'imports';
    }
    async update() {
        return this;
    }
    async unregister() {
        return true;
    }
    async showNotification(_title: string, _options?: NotificationOptions): Promise<void> {
        return;
    }
    async getNotifications(_options?: GetNotificationOptions): Promise<Notification[]> {
        return [];
    }
}
// Mock ServiceWorkerContainer
export class MockServiceWorkerContainer {
    controller: ServiceWorker | null;
    ready: Promise<MockServiceWorkerRegistration>;
    oncontrollerchange: ((event: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onmessageerror: ((event: MessageEvent) => void) | null;
    constructor() {
        this.controller = null;
        this.ready = Promise.resolve(new MockServiceWorkerRegistration());
        this.oncontrollerchange = null;
        this.onmessage = null;
        this.onmessageerror = null;
    }
    async register(_scriptURL: string, _options?: RegistrationOptions): Promise<MockServiceWorkerRegistration> {
        return new MockServiceWorkerRegistration();
    }
    async getRegistration(_clientURL?: string): Promise<MockServiceWorkerRegistration | undefined> {
        return new MockServiceWorkerRegistration();
    }
    async getRegistrations(): Promise<MockServiceWorkerRegistration[]> {
        return [new MockServiceWorkerRegistration()];
    }
    startMessages() { }
}
// Mock Notification API
export class MockNotification {
    static permission: NotificationPermission = 'granted';
    static async requestPermission(): Promise<NotificationPermission> {
        return MockNotification.permission;
    }
    static async get(_tag?: string): Promise<Notification | null> {
        return null;
    }
    static async getNotifications(): Promise<Notification[]> {
        return [];
    }
    constructor(_title: string, _options?: NotificationOptions) {
        // Constructor implementation
    }
    close(): void { }
    addEventListener(_type: string, _listener: EventListener): void { }
    removeEventListener(_type: string, _listener: EventListener): void { }
    dispatchEvent(_event: Event): boolean {
        return true;
    }
}
// Mock Push API
export class MockPushManager {
    supportedContentEncodings: string[];
    constructor() {
        this.supportedContentEncodings = ['aes128gcm'];
    }
    async subscribe(_options?: PushSubscriptionOptionsInit): Promise<PushSubscription> {
        return {
            endpoint: 'https://fcm.googleapis.com/fcm/send/example',
            expirationTime: null,
            options: (_options || {}) as PushSubscriptionOptions,
            getKey: (_name: string): ArrayBuffer => new Uint8Array([1, 2, 3, 4]).buffer,
            unsubscribe: async () => Promise.resolve(true),
            toJSON: () => ({
                endpoint: 'https://fcm.googleapis.com/fcm/send/example',
                keys: {
                    auth: 'mock-auth-key',
                    p256dh: 'mock-p256dh-key',
                },
            }),
        };
    }
    async getSubscription(): Promise<PushSubscription | null> {
        return null;
    }
    async permissionState(_options?: PushSubscriptionOptionsInit): Promise<NotificationPermission> {
        return 'granted';
    }
}
// Setup global mocks
export function setupServiceWorkerMocks() {
    Object.defineProperty(global, 'Notification', {
        value: MockNotification,
        writable: true,
    });
    Object.defineProperty(global.navigator, 'serviceWorker', {
        value: new MockServiceWorkerContainer(),
        writable: true,
    });
}
export default {
    MockServiceWorkerRegistration,
    MockServiceWorkerContainer,
    MockNotification,
    MockPushManager,
    setupServiceWorkerMocks,
};
//# sourceMappingURL=service-worker.js.map