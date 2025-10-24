/**
 * Service Worker Mocks for Testing
 */
// Mock ServiceWorker registration
export class MockServiceWorkerRegistration {
    scope;
    active;
    installing;
    waiting;
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
    async showNotification(_title, _options) {
        return;
    }
    async getNotifications(_options) {
        return [];
    }
}
// Mock ServiceWorkerContainer
export class MockServiceWorkerContainer {
    controller;
    ready;
    oncontrollerchange;
    onmessage;
    onmessageerror;
    constructor() {
        this.controller = null;
        this.ready = Promise.resolve(new MockServiceWorkerRegistration());
        this.oncontrollerchange = null;
        this.onmessage = null;
        this.onmessageerror = null;
    }
    async register(_scriptURL, _options) {
        return new MockServiceWorkerRegistration();
    }
    async getRegistration(_clientURL) {
        return new MockServiceWorkerRegistration();
    }
    async getRegistrations() {
        return [new MockServiceWorkerRegistration()];
    }
    startMessages() { }
}
// Mock Notification API
export class MockNotification {
    static permission = 'granted';
    static async requestPermission() {
        return MockNotification.permission;
    }
    static async get(_tag) {
        return null;
    }
    static async getNotifications() {
        return [];
    }
    constructor(_title, _options) {
        // Constructor implementation
    }
    close() { }
    addEventListener(_type, _listener) { }
    removeEventListener(_type, _listener) { }
    dispatchEvent(_event) {
        return true;
    }
}
// Mock Push API
export class MockPushManager {
    supportedContentEncodings;
    constructor() {
        this.supportedContentEncodings = ['aes128gcm'];
    }
    async subscribe(_options) {
        return {
            endpoint: 'https://fcm.googleapis.com/fcm/send/example',
            expirationTime: null,
            options,
            getKey: (_name) => new Uint8Array([1, 2, 3, 4]),
            toJSON: () => ({
                endpoint: 'https://fcm.googleapis.com/fcm/send/example',
                keys: {
                    auth: 'mock-auth-key',
                    p256dh: 'mock-p256dh-key',
                },
            }),
        };
    }
    async getSubscription() {
        return null;
    }
    async permissionState(_options) {
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