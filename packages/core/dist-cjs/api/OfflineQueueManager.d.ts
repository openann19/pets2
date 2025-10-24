/**
 * Offline Queue Manager
 * Manages request queue for offline scenarios with priority, persistence, and conflict resolution
 */
export type QueuePriority = 'critical' | 'high' | 'normal' | 'low';
export type ConflictResolution = 'overwrite' | 'merge' | 'skip';
export interface QueueItem {
    id: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: unknown;
    headers?: Record<string, string>;
    timestamp: number;
    priority: QueuePriority;
    retryCount: number;
    maxRetries: number;
    conflictResolution: ConflictResolution;
    metadata?: Record<string, unknown>;
}
export interface QueueConfig {
    maxSize: number;
    persistence: 'memory' | 'localStorage' | 'indexedDB' | 'asyncStorage';
    syncInterval: number;
    maxRetries: number;
    retryDelay: number;
}
export interface QueueStats {
    totalItems: number;
    pendingItems: number;
    processingItems: number;
    failedItems: number;
    criticalItems: number;
    oldestItemTimestamp?: number;
}
export declare class OfflineQueueManager {
    private config;
    private queue;
    private processing;
    private storage;
    private syncIntervalId?;
    protected isOnline: boolean;
    private listeners;
    constructor(config?: Partial<QueueConfig>);
    /**
     * Add item to queue
     */
    enqueue(item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<string>;
    /**
     * Process queue items
     */
    processQueue(): Promise<void>;
    /**
     * Process individual item
     */
    protected processItem(_item: QueueItem): Promise<void>;
    /**
     * Get queue statistics
     */
    getStats(): QueueStats;
    /**
     * Clear queue
     */
    clearQueue(): Promise<void>;
    /**
     * Get items by priority
     */
    getItemsByPriority(priority: QueuePriority): QueueItem[];
    /**
     * Remove item from queue
     */
    removeItem(id: string): void;
    /**
     * Set online status
     */
    setOnlineStatus(isOnline: boolean): void;
    /**
     * Subscribe to queue stats changes
     */
    subscribe(listener: (stats: QueueStats) => void): () => void;
    /**
     * Insert item by priority
     */
    private insertByPriority;
    /**
     * Compare priorities
     */
    private comparePriority;
    /**
     * Get numeric priority value
     */
    private getPriorityValue;
    /**
     * Initialize storage
     */
    private initializeStorage;
    /**
     * Persist queue to storage
     */
    private persistQueue;
    /**
     * Load queue from storage
     */
    private loadQueue;
    /**
     * Start sync interval
     */
    private startSyncInterval;
    /**
     * Notify listeners of stats changes
     */
    private notifyListeners;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Cleanup resources
     */
    destroy(): void;
}
