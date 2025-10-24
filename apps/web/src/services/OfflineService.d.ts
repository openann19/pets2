/**
 * Offline Service
 * Comprehensive offline support with data caching, sync capabilities, and offline mode management
 */
export type EventData = Record<string, unknown>;
export interface OfflineAction {
    id: string;
    type: 'create' | 'update' | 'delete';
    endpoint: string;
    data: EventData;
    timestamp: number;
    retries: number;
    maxRetries: number;
}
export interface CacheEntry {
    key: string;
    data: EventData;
    timestamp: number;
    expiresAt?: number;
    version: number;
}
export interface SyncStatus {
    isOnline: boolean;
    isSyncing: boolean;
    lastSync: number;
    pendingActions: number;
    failedActions: number;
    syncProgress: number;
}
export interface OfflineConfig {
    maxCacheSize: number;
    cacheExpiration: number;
    maxRetries: number;
    retryDelay: number;
    syncInterval: number;
    enableBackgroundSync: boolean;
    enablePreload: boolean;
}
declare class OfflineService {
    private db;
    private isOnline;
    private isSyncing;
    private lastSync;
    private pendingActions;
    private failedActions;
    private syncInterval;
    private config;
    private listeners;
    constructor();
    /**
     * Initialize the offline service
     */
    initialize(): Promise<boolean>;
    /**
     * Initialize IndexedDB
     */
    private initIndexedDB;
    /**
     * Cache data for offline access
     */
    cacheData(key: string, data: Record<string, unknown>, expiresIn?: number): Promise<void>;
    /**
     * Get cached data
     */
    getCachedData(key: string): Promise<Record<string, unknown> | null>;
    /**
     * Remove cached data
     */
    removeCachedData(key: string): Promise<void>;
    /**
     * Clear all cached data
     */
    clearCache(): Promise<void>;
    /**
     * Queue action for offline execution
     */
    queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>): Promise<string>;
    /**
     * Remove action from queue
     */
    removeAction(id: string): Promise<void>;
    /**
     * Get pending actions
     */
    getPendingActions(): OfflineAction[];
    /**
     * Get failed actions
     */
    getFailedActions(): OfflineAction[];
    /**
     * Sync pending actions
     */
    sync(): Promise<void>;
    /**
     * Execute a single action
     */
    private executeAction;
    /**
     * Load pending actions from IndexedDB
     */
    private loadPendingActions;
    /**
     * Start sync interval
     */
    private startSyncInterval;
    /**
     * Stop sync interval
     */
    private stopSyncInterval;
    /**
     * Cleanup cache based on size and expiration
     */
    private cleanupCache;
    /**
     * Remove multiple cache entries
     */
    private removeEntries;
    /**
     * Setup event listeners
     */
    private setupEventListeners;
    /**
     * Save sync state
     */
    private saveSyncState;
    /**
     * Get sync status
     */
    getSyncStatus(): SyncStatus;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<OfflineConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): OfflineConfig;
    /**
     * Add event listener
     */
    on(event: string, callback: Function): void;
    /**
     * Remove event listener
     */
    off(event: string, callback: Function): void;
    /**
     * Emit event
     */
    private emit;
    /**
     * Get default configuration
     */
    private getDefaultConfig;
}
declare const offlineService: OfflineService;
export default offlineService;
//# sourceMappingURL=OfflineService.d.ts.map