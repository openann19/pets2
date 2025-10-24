/**
 * PWA Utilities
 * Handles service worker registration, install prompts, and PWA features
 */
/**
 * Register service worker
 */
export declare function registerServiceWorker(): Promise<ServiceWorkerRegistration | null>;
/**
 * Unregister service worker
 */
export declare function unregisterServiceWorker(): Promise<boolean>;
/**
 * Setup install prompt handler
 */
export declare function setupInstallPrompt(): void;
/**
 * Show install prompt
 */
export declare function showInstallPrompt(): Promise<boolean>;
/**
 * Check if app is installed
 */
export declare function isAppInstalled(): boolean;
/**
 * Check if install prompt is available
 */
export declare function canInstall(): boolean;
/**
 * Request persistent storage
 */
export declare function requestPersistentStorage(): Promise<boolean>;
/**
 * Get storage estimate
 */
export declare function getStorageEstimate(): Promise<StorageEstimate | null>;
/**
 * Check if running as PWA
 */
export declare function isPWA(): boolean;
/**
 * Get display mode
 */
export declare function getDisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen';
/**
 * Initialize PWA features
 */
export declare function initializePWA(): void;
//# sourceMappingURL=pwa.d.ts.map