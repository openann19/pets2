/**
 * Offline Sync Service for PawfectMatch Mobile App
 * Handles offline data persistence, background sync, and conflict resolution
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import type { NetInfoState } from "@react-native-community/netinfo";
import { logger } from "@pawfectmatch/core";

interface OfflineQueueItem {
  id: string;
  type: "api" | "user_action";
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  priority: "low" | "normal" | "high" | "critical";
  onConflict: "overwrite" | "merge" | "skip";
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingItems: number;
  failedItems: number;
  isSyncing: boolean;
}

class OfflineSyncService {
  private static instance: OfflineSyncService | undefined;
  private queue: OfflineQueueItem[] = [];
  private isInitialized = false;
  private isOnline = false;
  private syncInProgress = false;
  private syncListeners: ((status: SyncStatus) => void)[] = [];

  private readonly QUEUE_KEY = "@pawfectmatch_offline_queue";
  private readonly SYNC_STATUS_KEY = "@pawfectmatch_sync_status";
  private readonly MAX_RETRY_COUNT = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): OfflineSyncService {
    if (OfflineSyncService.instance === undefined) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  /**
   * Initialize the offline sync service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load persisted queue
      await this.loadQueue();

      // Setup network monitoring
      this.setupNetworkMonitoring();

      // Start background sync
      this.startBackgroundSync();

      this.isInitialized = true;
      logger.info("Offline sync service initialized");
    } catch (error) {
      logger.error("Failed to initialize offline sync service", { error });
    }
  }

  /**
   * Add an API call to the offline queue
   */
  async queueApiCall(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    data?: Record<string, unknown>,
    priority: OfflineQueueItem["priority"] = "normal",
    onConflict: OfflineQueueItem["onConflict"] = "overwrite",
  ): Promise<string> {
    const queueItem: OfflineQueueItem = {
      id: `${String(Date.now())}_${Math.random().toString(36).substring(2, 11)}`,
      type: "api",
      endpoint,
      method,
      data: data ?? {},
      timestamp: Date.now(),
      retryCount: 0,
      priority,
      onConflict,
    };

    this.queue.push(queueItem);
    await this.persistQueue();

    logger.info("API call queued for offline sync", {
      id: queueItem.id,
      endpoint,
      method,
      priority,
    });

    // Try to sync immediately if online
    if (this.isOnline) {
      void this.processQueue();
    }

    this.notifyListeners();
    return queueItem.id;
  }

  /**
   * Queue a user action for offline processing
   */
  async queueUserAction(
    actionType: string,
    data: Record<string, unknown>,
    priority: OfflineQueueItem["priority"] = "normal",
  ): Promise<string> {
    const queueItem: OfflineQueueItem = {
      id: `${String(Date.now())}_${Math.random().toString(36).substring(2, 11)}`,
      type: "user_action",
      endpoint: `/actions/${actionType}`,
      method: "POST",
      data,
      timestamp: Date.now(),
      retryCount: 0,
      priority,
      onConflict: "overwrite", // Default conflict resolution for user actions
    };

    this.queue.push(queueItem);
    await this.persistQueue();

    logger.info("User action queued for offline sync", {
      id: queueItem.id,
      actionType,
      priority,
    });

    if (this.isOnline) {
      void this.processQueue();
    }

    this.notifyListeners();
    return queueItem.id;
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    return {
      isOnline: this.isOnline,
      lastSyncTime: await this.getLastSyncTime(),
      pendingItems: this.queue.length,
      failedItems: this.queue.filter(
        (item) => item.retryCount >= this.MAX_RETRY_COUNT,
      ).length,
      isSyncing: this.syncInProgress,
    };
  }

  /**
   * Manually trigger sync
   */
  async syncNow(): Promise<void> {
    if (!this.isOnline) {
      throw new Error("Cannot sync while offline");
    }

    await this.processQueue();
  }

  /**
   * Clear failed items from queue
   */
  async clearFailedItems(): Promise<void> {
    this.queue = this.queue.filter(
      (item) => item.retryCount < this.MAX_RETRY_COUNT,
    );
    await this.persistQueue();
    this.notifyListeners();
    logger.info("Failed items cleared from offline queue");
  }

  /**
   * Add sync status listener
   */
  addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  // Private methods

  private async loadQueue(): Promise<void> {
    try {
      const storedQueue = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (storedQueue !== null && storedQueue !== "") {
        this.queue = JSON.parse(storedQueue) as OfflineQueueItem[];
        logger.info("Offline queue loaded", { itemCount: this.queue.length });
      }
    } catch (error) {
      logger.error("Failed to load offline queue", { error });
      this.queue = [];
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      logger.error("Failed to persist offline queue", { error });
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        logger.info("Network connection restored, starting sync");
        void this.processQueue();
      } else if (wasOnline && !this.isOnline) {
        logger.info("Network connection lost");
      }

      this.notifyListeners();
    });

    // Get initial state
    void NetInfo.fetch().then((state: NetInfoState) => {
      this.isOnline = state.isConnected ?? false;
      this.notifyListeners();
    });
  }

  private startBackgroundSync(): void {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress && this.queue.length > 0) {
        void this.processQueue();
      }
    }, this.SYNC_INTERVAL);
  }

  private async processQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.notifyListeners();

    try {
      // Sort queue by priority (critical > high > normal > low)
      const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
      this.queue.sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
      );

      const itemsToProcess = [...this.queue];
      const successfulItems: string[] = [];
      const failedItems: string[] = [];

      for (const item of itemsToProcess) {
        try {
          await this.processQueueItem(item);
          successfulItems.push(item.id);
        } catch (error) {
          logger.error("Failed to process queue item", {
            itemId: item.id,
            endpoint: item.endpoint,
            error,
          });

          item.retryCount++;

          if (item.retryCount >= this.MAX_RETRY_COUNT) {
            failedItems.push(item.id);
          }
        }
      }

      // Remove successful items from queue
      this.queue = this.queue.filter(
        (item) => !successfulItems.includes(item.id),
      );

      // Keep failed items for manual retry
      this.queue = this.queue.filter(
        (item) =>
          !failedItems.includes(item.id) ||
          item.retryCount < this.MAX_RETRY_COUNT,
      );

      await this.persistQueue();
      await this.updateLastSyncTime();

      logger.info("Queue processing completed", {
        processed: successfulItems.length,
        failed: failedItems.length,
        remaining: this.queue.length,
      });
    } catch (error) {
      logger.error("Queue processing failed", { error });
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    const { api } = await import("./api");

    // Import the API service dynamically to avoid circular dependencies
    const apiService = api;

    switch (item.method) {
      case "GET":
        await apiService.request(item.endpoint);
        break;
      case "POST":
        await apiService.request(item.endpoint, {
          method: "POST",
          body: JSON.stringify(item.data),
        });
        break;
      case "PUT":
        await apiService.request(item.endpoint, {
          method: "PUT",
          body: JSON.stringify(item.data),
        });
        break;
      case "DELETE":
        await apiService.request(item.endpoint, {
          method: "DELETE",
        });
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${String(item.method)}`);
    }
  }

  private async updateLastSyncTime(): Promise<void> {
    try {
      const syncStatus: SyncStatus = {
        isOnline: this.isOnline,
        lastSyncTime: Date.now(),
        pendingItems: this.queue.length,
        failedItems: this.queue.filter(
          (item) => item.retryCount >= this.MAX_RETRY_COUNT,
        ).length,
        isSyncing: this.syncInProgress,
      };
      await AsyncStorage.setItem(
        this.SYNC_STATUS_KEY,
        JSON.stringify(syncStatus),
      );
    } catch (error) {
      logger.error("Failed to update last sync time", { error });
    }
  }

  private async getLastSyncTime(): Promise<number | null> {
    try {
      // Read from AsyncStorage
      const stored = await AsyncStorage.getItem("last_sync_time");
      if (stored) {
        const timestamp = parseInt(stored, 10);
        if (!isNaN(timestamp)) {
          return timestamp;
        }
      }
      return null;
    } catch (error) {
      logger.error("Failed to read last sync time", { error });
      return null;
    }
  }

  private async notifyListeners(): Promise<void> {
    const status = await this.getSyncStatus();
    this.syncListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        logger.error("Error notifying sync listener", { error });
      }
    });
  }
}

// Export singleton instance
export const offlineSync = OfflineSyncService.getInstance();

// Export types
export type { OfflineQueueItem, SyncStatus };
export default offlineSync;
