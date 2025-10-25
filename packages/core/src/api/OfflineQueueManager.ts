/**
 * Offline Queue Manager
 * Manages request queue for offline scenarios with priority, persistence, and conflict resolution
 */

import { logger } from '../utils/logger';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

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

type PersistedQueueItem = Omit<QueueItem, 'retryCount' | 'timestamp'> & {
  retryCount?: number;
  timestamp?: number;
};

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

const DEFAULT_CONFIG: QueueConfig = {
  maxSize: 1000,
  persistence: 'memory',
  syncInterval: 30000,
  maxRetries: 3,
  retryDelay: 1000,
};

export class OfflineQueueManager {
  private config: QueueConfig;
  private queue: QueueItem[] = [];
  private processing: Set<string> = new Set();
  private storage: StorageLike | null = null;
  private syncIntervalId?: ReturnType<typeof setInterval>;
  protected isOnline = true;
  private listeners: Array<(stats: QueueStats) => void> = [];

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeStorage();
    void this.loadQueue();
    this.startSyncInterval();
  }

  /**
   * Add item to queue
   */
  async enqueue(item: Omit<QueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    // Check queue size
    if (this.queue.length >= this.config.maxSize) {
      // Remove lowest priority items
      this.queue.sort((a, b) => this.comparePriority(a.priority, b.priority));
      const removed = this.queue.pop();
      logger.warn('Queue full, removing lowest priority item', {
        removedItem: removed?.id,
        queueSize: this.queue.length,
      });
    }

    const queueItem: QueueItem = {
      ...item,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    // Insert based on priority
    this.insertByPriority(queueItem);
    
    await this.persistQueue();
    this.notifyListeners();

    logger.debug('Item enqueued', {
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
  async processQueue(): Promise<void> {
    if (!this.isOnline || this.processing.size > 0) {
      return;
    }

    const processableItems = this.queue.filter(
      item => !this.processing.has(item.id) && item.retryCount < item.maxRetries
    );

    if (processableItems.length === 0) {
      return;
    }

    // Process items in priority order
    for (const item of processableItems) {
      if (this.shouldPauseProcessing()) {
        break;
      }

      this.processing.add(item.id);
      
      try {
        await this.processItem(item);
        this.removeItem(item.id);
        logger.debug('Item processed successfully', { id: item.id });
      } catch (_error) {
        item.retryCount++;

        if (item.retryCount >= item.maxRetries) {
          logger.error('Item failed after max retries', {
            error: _error,
            id: item.id,
            endpoint: item.endpoint,
            retries: item.retryCount,
          });
          this.removeItem(item.id);
        } else {
          logger.debug('Item failed, will retry', {
            error: _error,
            id: item.id,
            retries: item.retryCount,
          });
          await this.persistQueue();
        }
      } finally {
        this.processing.delete(item.id);
      }
    }

    this.notifyListeners();
  }

  /**
   * Process individual item
   */
  protected processItem(_item: QueueItem): Promise<void> {
    // This would be implemented by the actual API client
    return Promise.reject(new Error('processItem must be implemented by subclass'));
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const criticalItems = this.queue.filter(item => item.priority === 'critical').length;
    const firstItem = this.queue[0];
    const oldestItem = firstItem?.timestamp;

    const stats: QueueStats = {
      totalItems: this.queue.length,
      pendingItems: this.queue.length - this.processing.size,
      processingItems: this.processing.size,
      failedItems: this.queue.filter(item => item.retryCount >= item.maxRetries).length,
      criticalItems,
    };

    if (oldestItem !== undefined) {
      stats.oldestItemTimestamp = oldestItem;
    }

    return stats;
  }

  /**
   * Clear queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    this.processing.clear();
    await this.persistQueue();
    this.notifyListeners();
  }

  /**
   * Get items by priority
   */
  getItemsByPriority(priority: QueuePriority): QueueItem[] {
    return this.queue.filter(item => item.priority === priority);
  }

  /**
   * Remove item from queue
   */
  removeItem(id: string): void {
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
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    
    if (isOnline) {
      logger.info('Online, starting queue processing');
      void this.processQueue();
    } else {
      logger.info('Offline, queueing requests');
    }
  }

  /**
   * Subscribe to queue stats changes
   */
  subscribe(listener: (stats: QueueStats) => void): () => void {
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
  private insertByPriority(item: QueueItem): void {
    const priorityValue = this.getPriorityValue(item.priority);
    
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const existingItem = this.queue[i];
      if (existingItem != null && this.getPriorityValue(existingItem.priority) < priorityValue) {
        insertIndex = i;
        break;
      }
    }
    
    this.queue.splice(insertIndex, 0, item);
  }

  /**
   * Compare priorities
   */
  private comparePriority(a: QueuePriority, b: QueuePriority): number {
    return this.getPriorityValue(a) - this.getPriorityValue(b);
  }

  /**
   * Get numeric priority value
   */
  private getPriorityValue(priority: QueuePriority): number {
    const values: Record<QueuePriority, number> = {
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
  private initializeStorage(): void {
    if (this.config.persistence === 'localStorage' && typeof window !== 'undefined') {
      this.storage = window.localStorage;
    }
  }

  /**
   * Persist queue to storage
   */
  protected persistQueue(): Promise<void> {
    const storage = this.storage;
    if (!storage) {
      return Promise.resolve();
    }

    try {
      const data = JSON.stringify(this.queue);
      storage.setItem('offline_queue', data);
      return Promise.resolve();
    } catch (_error) {
      logger.error('Failed to persist queue', { error: _error });
      return Promise.resolve();
    }
  }

  /**
   * Load queue from storage
   */
  protected loadQueue(): Promise<void> {
    const storage = this.storage;
    if (!storage) {
      return Promise.resolve();
    }

    try {
      const data = storage.getItem('offline_queue');
      if (!data) {
        return Promise.resolve();
      }

      const parsed: unknown = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        logger.warn('Discarding persisted queue due to invalid shape');
        return Promise.resolve();
      }

      const restoredQueue: QueueItem[] = [];
      for (const entry of parsed) {
        if (this.isValidQueueItem(entry)) {
          const persisted: PersistedQueueItem = entry;
          restoredQueue.push({
            ...persisted,
            retryCount: persisted.retryCount ?? 0,
            timestamp: persisted.timestamp ?? Date.now(),
          });
        }
      }

      this.queue = restoredQueue;
      logger.info('Queue loaded from storage', { itemCount: this.queue.length });
    } catch (_error) {
      logger.error('Failed to load queue', { error: _error });
    }

    return Promise.resolve();
  }

  /**
   * Start sync interval
   */
  private startSyncInterval(): void {
    this.syncIntervalId = setInterval(() => {
      if (this.isOnline) {
        void this.processQueue();
      }
    }, this.config.syncInterval);
  }

  /**
   * Notify listeners of stats changes
   */
  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach(listener => {
      try {
        listener(stats);
      } catch (_error) {
        logger.error('Listener error', { error: _error });
      }
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomSegment = Math.random().toString(36).substring(2, 11);
    return `${timestamp}_${randomSegment}`;
  }

  /**
   * Hook for subclasses to pause queue processing when external state changes
   */
  protected shouldPauseProcessing(): boolean {
    return !this.isOnline;
  }

  private isValidQueueItem(entry: unknown): entry is PersistedQueueItem {
    if (typeof entry !== 'object' || entry === null) {
      return false;
    }

    const candidate = entry as Partial<PersistedQueueItem>;
    const hasValidRetryCount =
      candidate.retryCount === undefined || typeof candidate.retryCount === 'number';
    const hasValidTimestamp =
      candidate.timestamp === undefined || typeof candidate.timestamp === 'number';

    return (
      typeof candidate.id === 'string' &&
      typeof candidate.endpoint === 'string' &&
      typeof candidate.method === 'string' &&
      typeof candidate.priority === 'string' &&
      typeof candidate.maxRetries === 'number' &&
      hasValidRetryCount &&
      hasValidTimestamp
    );
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
  }
}

