/**
 * PWA Utilities
 * Service worker management, offline capabilities, and PWA features
 */
export interface PWAConfig {
    enableServiceWorker: boolean;
    enableOfflineMode: boolean;
    enableBackgroundSync: boolean;
    enablePushNotifications: boolean;
    enablePeriodicSync: boolean;
    cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}
export interface OfflineAction {
    id: string;
    type: 'like' | 'pass' | 'message' | 'profile-update';
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
    timestamp: number;
    retryCount: number;
}
export interface PWAState {
    isOnline: boolean;
    isInstalled: boolean;
    isStandalone: boolean;
    serviceWorkerRegistered: boolean;
    backgroundSyncSupported: boolean;
    pushNotificationSupported: boolean;
    offlineActions: OfflineAction[];
}
/**
 * Hook for PWA functionality
 */
export declare function usePWA(config?: Partial<PWAConfig>): {
    state: PWAState;
    registerServiceWorker: () => Promise<boolean>;
    checkInstallation: () => void;
};
/**
 * Hook for offline action management
 */
export declare function useOfflineActions(): {
    actions: OfflineAction[];
    addOfflineAction: (action: Omit<OfflineAction, "id" | "timestamp" | "retryCount">) => string;
    removeOfflineAction: (actionId: string) => void;
    retryOfflineAction: (actionId: string) => Promise<boolean>;
};
/**
 * Hook for push notifications
 */
export declare function usePushNotifications(): {
    permission: "default" | "granted" | "denied";
    subscription: PushSubscription | null;
    requestPermission: () => Promise<boolean>;
    subscribeToPush: () => Promise<false | PushSubscription>;
    unsubscribeFromPush: () => Promise<void>;
};
/**
 * PWA installation utilities
 */
export declare const pwaUtils: {
    showInstallPrompt: () => Promise<boolean>;
    isInstallable: () => boolean;
    getInstallationStatus: () => {
        isStandalone: boolean;
        isInstalled: boolean;
        canInstall: boolean;
    };
    clearAllCaches: () => Promise<void>;
    getCacheUsage: () => Promise<{
        used: number;
        quota: number;
        usage: number;
    } | null>;
};
//# sourceMappingURL=pwa-utils.d.ts.map