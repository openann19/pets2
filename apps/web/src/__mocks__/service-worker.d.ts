/**
 * Service Worker Mocks for Testing
 */
export declare class MockServiceWorkerRegistration {
    scope: string;
    active: unknown;
    installing: unknown | null;
    waiting: unknown | null;
    pushManager: unknown;
    sync: unknown;
    navigationPreload: unknown;
    updateViaCache: string;
    constructor();
    update(): Promise<this>;
    unregister(): Promise<boolean>;
    showNotification(_title: string, _options?: NotificationOptions): Promise<void>;
    getNotifications(_options?: GetNotificationOptions): Promise<never[]>;
}
export declare class MockServiceWorkerContainer {
    controller: ServiceWorker | null;
    ready: Promise<ServiceWorkerRegistration>;
    oncontrollerchange: ((event: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onmessageerror: ((event: MessageEvent) => void) | null;
    constructor();
    register(_scriptURL: string, _options?: RegistrationOptions): Promise<MockServiceWorkerRegistration>;
    getRegistration(_clientURL?: string): Promise<MockServiceWorkerRegistration>;
    getRegistrations(): Promise<MockServiceWorkerRegistration[]>;
    startMessages(): void;
}
export declare class MockNotification {
    static permission: 'default' | 'denied' | 'granted';
    static requestPermission(): Promise<"default" | "granted" | "denied">;
    static get(_tag: string): Promise<null>;
    static getNotifications(): Promise<never[]>;
    constructor(_title: string, _options?: unknown);
    close(): void;
    addEventListener(_type: string, _listener: EventListener): void;
    removeEventListener(_type: string, _listener: EventListener): void;
    dispatchEvent(_event: Event): boolean;
}
export declare class MockPushManager {
    supportedContentEncodings: string[];
    constructor();
    subscribe(_options?: unknown): Promise<{
        endpoint: string;
        expirationTime: null;
        options: any;
        getKey: (_name: string) => Uint8Array<ArrayBuffer>;
        toJSON: () => {
            endpoint: string;
            keys: {
                auth: string;
                p256dh: string;
            };
        };
    }>;
    getSubscription(): Promise<null>;
    permissionState(_options?: unknown): Promise<string>;
}
export declare function setupServiceWorkerMocks(): Promise<void>;
declare const _default: {
    MockServiceWorkerRegistration: typeof MockServiceWorkerRegistration;
    MockServiceWorkerContainer: typeof MockServiceWorkerContainer;
    MockNotification: typeof MockNotification;
    MockPushManager: typeof MockPushManager;
    setupServiceWorkerMocks: typeof setupServiceWorkerMocks;
};
export default _default;
//# sourceMappingURL=service-worker.d.ts.map