"use strict";
/**
 * Offline Queue Manager
 * Manages request queue for offline scenarios with priority, persistence, and conflict resolution
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfflineQueueManager = void 0;
const logger_1 = require("../utils/logger");
const DEFAULT_CONFIG = {
    maxSize: 1000,
    persistence: 'memory',
    syncInterval: 30000,
    maxRetries: 3,
    retryDelay: 1000,
};
class OfflineQueueManager {
    config;
    queue = [];
    processing = new Set();
    storage = null;
    syncIntervalId;
    isOnline = true;
    listeners = [];
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.initializeStorage();
        void this.loadQueue();
        this.startSyncInterval();
    }
    /**
     * Add item to queue
     */
    async enqueue(item) {
        // Check queue size
        if (this.queue.length >= this.config.maxSize) {
            // Remove lowest priority items
            this.queue.sort((a, b) => this.comparePriority(a.priority, b.priority));
            const removed = this.queue.pop();
            logger_1.logger.warn('Queue full, removing lowest priority item', {
                removedItem: removed?.id,
                queueSize: this.queue.length,
            });
        }
        const queueItem = {
            ...item,
            id: this.generateId(),
            timestamp: Date.now(),
            retryCount: 0,
        };
        // Insert based on priority
        this.insertByPriority(queueItem);
        await this.persistQueue();
        this.notifyListeners();
        logger_1.logger.debug('Item enqueued', {
            id: queueItem.id,
            endpoint: queueItem.endpoint,
            priority: queueItem.priority,
            queueSize: this.queue.length,
        });
        // Try to process immediately if online
        if (this.isOnline) {
            void this.processQueue();
        }
        return queueItem.id;
    }
    /**
     * Process queue items
     */
    async processQueue() {
        if (!this.isOnline || this.processing.size > 0) {
            return;
        }
        const processableItems = this.queue.filter(item => !this.processing.has(item.id) && item.retryCount < item.maxRetries);
        if (processableItems.length === 0) {
            return;
        }
        // Process items in priority order
        for (const item of processableItems) {
            if (!this.isOnline) {
                break;
            }
            this.processing.add(item.id);
            try {
                await this.processItem(item);
                this.removeItem(item.id);
                logger_1.logger.debug('Item processed successfully', { id: item.id });
            }
            catch (_error) {
                item.retryCount++;
                if (item.retryCount >= item.maxRetries) {
                    logger_1.logger.error('Item failed after max retries', {
                        id: item.id,
                        endpoint: item.endpoint,
                        retries: item.retryCount,
                    });
                    this.removeItem(item.id);
                }
                else {
                    logger_1.logger.debug('Item failed, will retry', {
                        id: item.id,
                        retries: item.retryCount,
                    });
                    await this.persistQueue();
                }
            }
            finally {
                this.processing.delete(item.id);
            }
        }
        this.notifyListeners();
    }
    /**
     * Process individual item
     */
    async processItem(_item) {
        // This would be implemented by the actual API client
        throw new Error('processItem must be implemented by subclass');
    }
    /**
     * Get queue statistics
     */
    getStats() {
        const criticalItems = this.queue.filter(item => item.priority === 'critical').length;
        const oldestItem = this.queue.length > 0 ? this.queue[0]?.timestamp : undefined;
        return {
            totalItems: this.queue.length,
            pendingItems: this.queue.length - this.processing.size,
            processingItems: this.processing.size,
            failedItems: this.queue.filter(item => item.retryCount >= item.maxRetries).length,
            criticalItems,
            oldestItemTimestamp: oldestItem,
        };
    }
    /**
     * Clear queue
     */
    async clearQueue() {
        this.queue = [];
        this.processing.clear();
        await this.persistQueue();
        this.notifyListeners();
    }
    /**
     * Get items by priority
     */
    getItemsByPriority(priority) {
        return this.queue.filter(item => item.priority === priority);
    }
    /**
     * Remove item from queue
     */
    removeItem(id) {
        const index = this.queue.findIndex(item => item.id === id);
        if (index !== -1) {
            this.queue.splice(index, 1);
            void this.persistQueue();
            this.notifyListeners();
        }
    }
    /**
     * Set online status
     */
    setOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        if (isOnline) {
            logger_1.logger.info('Online, starting queue processing');
            void this.processQueue();
        }
        else {
            logger_1.logger.info('Offline, queueing requests');
        }
    }
    /**
     * Subscribe to queue stats changes
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index !== -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    /**
     * Insert item by priority
     */
    insertByPriority(item) {
        const priorityValue = this.getPriorityValue(item.priority);
        let insertIndex = this.queue.length;
        for (let i = 0; i < this.queue.length; i++) {
            const queueItem = this.queue[i];
            if (queueItem && this.getPriorityValue(queueItem.priority) < priorityValue) {
                insertIndex = i;
                break;
            }
        }
        this.queue.splice(insertIndex, 0, item);
    }
    /**
     * Compare priorities
     */
    comparePriority(a, b) {
        return this.getPriorityValue(a) - this.getPriorityValue(b);
    }
    /**
     * Get numeric priority value
     */
    getPriorityValue(priority) {
        const values = {
            critical: 0,
            high: 1,
            normal: 2,
            low: 3,
        };
        return values[priority];
    }
    /**
     * Initialize storage
     */
    initializeStorage() {
        if (this.config.persistence === 'localStorage' && typeof window !== 'undefined') {
            this.storage = window.localStorage;
        }
    }
    /**
     * Persist queue to storage
     */
    async persistQueue() {
        if (!this.storage) {
            return;
        }
        try {
            const data = JSON.stringify(this.queue);
            this.storage.setItem('offline_queue', data);
        }
        catch (error) {
            logger_1.logger.error('Failed to persist queue', { error });
        }
    }
    /**
     * Load queue from storage
     */
    async loadQueue() {
        if (!this.storage) {
            return;
        }
        try {
            const data = this.storage.getItem('offline_queue');
            if (data) {
                this.queue = JSON.parse(data);
                logger_1.logger.info('Queue loaded from storage', { itemCount: this.queue.length });
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to load queue', { error });
        }
    }
    /**
     * Start sync interval
     */
    startSyncInterval() {
        this.syncIntervalId = setInterval(() => {
            if (this.isOnline) {
                void this.processQueue();
            }
        }, this.config.syncInterval);
    }
    /**
     * Notify listeners of stats changes
     */
    notifyListeners() {
        const stats = this.getStats();
        this.listeners.forEach(listener => {
            try {
                listener(stats);
            }
            catch (error) {
                logger_1.logger.error('Listener error', { error });
            }
        });
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * Cleanup resources
     */
    destroy() {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
        }
    }
}
exports.OfflineQueueManager = OfflineQueueManager;
