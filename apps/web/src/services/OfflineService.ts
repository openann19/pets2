/**
 * Offline Service
 * Comprehensive offline support with data caching, sync capabilities, and offline mode management
 */
import { logger } from '@pawfectmatch/core';
import { errorHandler } from '@pawfectmatch/core/dist/services/ErrorHandler';
class OfflineService {
    db = null;
    isOnline = navigator.onLine;
    isSyncing = false;
    lastSync = 0;
    pendingActions = [];
    failedActions = [];
    syncInterval = null;
    config;
    listeners = new Map();
    constructor() {
        this.config = this.getDefaultConfig();
        this.setupEventListeners();
    }
    /**
     * Initialize the offline service
     */
    async initialize() {
        try {
            // Initialize IndexedDB
            await this.initIndexedDB();
            // Load pending actions
            await this.loadPendingActions();
            // Start sync interval if online
            if (this.isOnline) {
                this.startSyncInterval();
            }
            logger.info('Offline Service initialized successfully', {
                component: 'OfflineService',
                action: 'initialize',
                metadata: {
                    isOnline: this.isOnline,
                    pendingActions: this.pendingActions.length,
                },
            });
            return true;
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to initialize offline service'), {
                component: 'OfflineService',
                action: 'initialize',
                severity: 'high',
            }, {
                showNotification: true,
            });
            return false;
        }
    }
    /**
     * Initialize IndexedDB
     */
    async initIndexedDB() {
        await new Promise((resolve, reject) => {
            const request = indexedDB.open('PawfectMatchOffline', 1);
            request.onerror = () => {
                reject(request.error);
            };
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create object stores
                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                    cacheStore.createIndex('timestamp', 'timestamp');
                    cacheStore.createIndex('expiresAt', 'expiresAt');
                }
                if (!db.objectStoreNames.contains('actions')) {
                    const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
                    actionsStore.createIndex('timestamp', 'timestamp');
                    actionsStore.createIndex('type', 'type');
                }
                if (!db.objectStoreNames.contains('sync')) {
                    db.createObjectStore('sync', { keyPath: 'key' });
                }
            };
        });
    }
    /**
     * Cache data for offline access
     */
    async cacheData(key, data, expiresIn) {
        try {
            if (!this.db)
                throw new Error('Database not initialized');
            const entry = {
                key,
                data: data,
                timestamp: Date.now(),
                version: 1,
            };
            if (typeof expiresIn === 'number') {
                entry.expiresAt = Date.now() + expiresIn;
            }
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            await store.put(entry);
            // Check cache size and clean up if needed
            await this.cleanupCache();
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to cache data'), {
                component: 'OfflineService',
                action: 'cache_data',
                severity: 'medium',
                metadata: {
                    key,
                    expiresIn,
                },
            }, {
                showNotification: false, // Don't show notification for cache operations
            });
        }
    }
    /**
     * Get cached data
     */
    async getCachedData(key) {
        try {
            if (!this.db)
                return null;
            const transaction = this.db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.get(key);
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    const entry = request.result;
                    if (!entry) {
                        resolve(null);
                        return;
                    }
                    // Check if expired
                    if (entry.expiresAt && Date.now() > entry.expiresAt) {
                        this.removeCachedData(key);
                        resolve(null);
                        return;
                    }
                    resolve(entry.data);
                };
                request.onerror = () => {
                    resolve(null);
                };
            });
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to get cached data'), {
                component: 'OfflineService',
                action: 'get_cached_data',
                severity: 'low',
                metadata: {
                    key,
                },
            }, {
                showNotification: false, // Don't show notification for cache operations
            });
            return null;
        }
    }
    /**
     * Remove cached data
     */
    async removeCachedData(key) {
        try {
            if (!this.db)
                return;
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            await store.delete(key);
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to remove cached data'), {
                component: 'OfflineService',
                action: 'remove_cached_data',
                severity: 'low',
                metadata: {
                    key,
                },
            }, {
                showNotification: false, // Don't show notification for cache operations
            });
        }
    }
    /**
     * Clear all cached data
     */
    async clearCache() {
        try {
            if (!this.db)
                return;
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            await store.clear();
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to clear cache'), {
                component: 'OfflineService',
                action: 'clear_cache',
                severity: 'medium',
            }, {
                showNotification: false, // Don't show notification for cache operations
            });
        }
    }
    /**
     * Queue action for offline execution
     */
    async queueAction(action) {
        try {
            const offlineAction = {
                ...action,
                id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                retries: 0,
                maxRetries: this.config.maxRetries,
            };
            // Store in IndexedDB
            if (this.db) {
                const transaction = this.db.transaction(['actions'], 'readwrite');
                const store = transaction.objectStore('actions');
                await store.put(offlineAction);
            }
            this.pendingActions.push(offlineAction);
            this.emit('actionQueued', offlineAction);
            // Try to sync immediately if online
            if (this.isOnline) {
                this.sync();
            }
            return offlineAction.id;
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to queue action'), {
                component: 'OfflineService',
                action: 'queue_action',
                severity: 'high',
                metadata: {
                    actionType: action.type,
                    endpoint: action.endpoint,
                },
            }, {
                showNotification: true,
            });
            throw error;
        }
    }
    /**
     * Remove action from queue
     */
    async removeAction(id) {
        try {
            // Remove from IndexedDB
            if (this.db) {
                const transaction = this.db.transaction(['actions'], 'readwrite');
                const store = transaction.objectStore('actions');
                await store.delete(id);
            }
            // Remove from memory
            this.pendingActions = this.pendingActions.filter((action) => action.id !== id);
            this.failedActions = this.failedActions.filter((action) => action.id !== id);
            this.emit('actionRemoved', id);
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to remove action'), {
                component: 'OfflineService',
                action: 'remove_action',
                severity: 'medium',
                metadata: {
                    actionId: id,
                },
            }, {
                showNotification: false, // Don't show notification for action removal
            });
        }
    }
    /**
     * Get pending actions
     */
    getPendingActions() {
        return [...this.pendingActions];
    }
    /**
     * Get failed actions
     */
    getFailedActions() {
        return [...this.failedActions];
    }
    /**
     * Sync pending actions
     */
    async sync() {
        if (this.isSyncing || !this.isOnline)
            return;
        this.isSyncing = true;
        this.emit('syncStarted');
        try {
            const actionsToSync = [...this.pendingActions];
            let successCount = 0;
            for (const action of actionsToSync) {
                try {
                    await this.executeAction(action);
                    await this.removeAction(action.id);
                    successCount++;
                }
                catch (error) {
                    logger.error('Failed to execute action', error instanceof Error ? error : new Error('Action execution failed'), {
                        component: 'OfflineService',
                        action: 'sync_action',
                        metadata: {
                            actionId: action.id,
                            actionType: action.type,
                            endpoint: action.endpoint,
                            retries: action.retries,
                        },
                    });
                    // Increment retry count
                    action.retries++;
                    if (action.retries >= action.maxRetries) {
                        // Move to failed actions
                        this.failedActions.push(action);
                        await this.removeAction(action.id);
                        errorHandler.handleError(error instanceof Error ? error : new Error('Action failed after max retries'), {
                            component: 'OfflineService',
                            action: 'sync_action_failed',
                            severity: 'high',
                            metadata: {
                                actionId: action.id,
                                actionType: action.type,
                                endpoint: action.endpoint,
                                maxRetries: action.maxRetries,
                            },
                        }, {
                            showNotification: true,
                        });
                    }
                    else {
                        // Schedule retry
                        setTimeout(() => {
                            this.sync();
                        }, this.config.retryDelay);
                    }
                }
            }
            this.lastSync = Date.now();
            this.emit('syncCompleted', { successCount, totalCount: actionsToSync.length });
            logger.info('Sync completed', {
                component: 'OfflineService',
                action: 'sync_completed',
                metadata: {
                    successCount,
                    totalCount: actionsToSync.length,
                },
            });
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Sync failed'), {
                component: 'OfflineService',
                action: 'sync_failed',
                severity: 'high',
            }, {
                showNotification: true,
            });
            this.emit('syncFailed', error);
        }
        finally {
            this.isSyncing = false;
        }
    }
    /**
     * Execute a single action
     */
    async executeAction(action) {
        const { type, endpoint, data } = action;
        let response;
        switch (type) {
            case 'create':
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                break;
            case 'update':
                response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                break;
            case 'delete':
                response = await fetch(endpoint, {
                    method: 'DELETE',
                });
                break;
            default:
                throw new Error(`Unknown action type: ${type}`);
        }
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    }
    /**
     * Load pending actions from IndexedDB
     */
    async loadPendingActions() {
        try {
            if (!this.db)
                return;
            const transaction = this.db.transaction(['actions'], 'readonly');
            const store = transaction.objectStore('actions');
            const request = store.getAll();
            request.onsuccess = () => {
                this.pendingActions = request.result || [];
                this.emit('actionsLoaded', this.pendingActions);
                logger.info('Pending actions loaded', {
                    component: 'OfflineService',
                    action: 'load_pending_actions',
                    metadata: {
                        count: this.pendingActions.length,
                    },
                });
            };
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to load pending actions'), {
                component: 'OfflineService',
                action: 'load_pending_actions',
                severity: 'medium',
            }, {
                showNotification: false, // Don't show notification for startup operations
            });
        }
    }
    /**
     * Start sync interval
     */
    startSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        this.syncInterval = setInterval(() => {
            if (this.isOnline && this.pendingActions.length > 0) {
                this.sync();
            }
        }, this.config.syncInterval);
    }
    /**
     * Stop sync interval
     */
    stopSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }
    /**
     * Cleanup cache based on size and expiration
     */
    async cleanupCache() {
        try {
            if (!this.db)
                return;
            const transaction = this.db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            const request = store.getAll();
            request.onsuccess = () => {
                const entries = request.result;
                const now = Date.now();
                // Remove expired entries
                const validEntries = entries.filter((entry) => !entry.expiresAt || entry.expiresAt > now);
                // Sort by timestamp (oldest first)
                validEntries.sort((a, b) => a.timestamp - b.timestamp);
                // Calculate size and remove oldest if over limit
                let totalSize = 0;
                const maxSizeBytes = this.config.maxCacheSize * 1024 * 1024;
                for (let i = 0; i < validEntries.length; i++) {
                    const entrySize = JSON.stringify(validEntries[i]).length;
                    totalSize += entrySize;
                    if (totalSize > maxSizeBytes) {
                        // Remove oldest entries
                        const entriesToRemove = validEntries.slice(0, i);
                        this.removeEntries(entriesToRemove);
                        break;
                    }
                }
            };
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to cleanup cache'), {
                component: 'OfflineService',
                action: 'cleanup_cache',
                severity: 'low',
            }, {
                showNotification: false, // Don't show notification for cache operations
            });
        }
    }
    /**
     * Remove multiple cache entries
     */
    async removeEntries(entries) {
        try {
            if (!this.db || entries.length === 0)
                return;
            const transaction = this.db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            for (const entry of entries) {
                await store.delete(entry.key);
            }
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to remove entries'), {
                component: 'OfflineService',
                action: 'remove_entries',
                severity: 'low',
                metadata: {
                    entryCount: entries.length,
                },
            }, {
                showNotification: false, // Don't show notification for cache operations
            });
        }
    }
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.startSyncInterval();
            this.emit('online');
            this.sync();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.stopSyncInterval();
            this.emit('offline');
        });
        // Before unload
        window.addEventListener('beforeunload', () => {
            this.saveSyncState();
        });
    }
    /**
     * Save sync state
     */
    async saveSyncState() {
        try {
            if (!this.db)
                return;
            const transaction = this.db.transaction(['sync'], 'readwrite');
            const store = transaction.objectStore('sync');
            await store.put({
                key: 'syncState',
                lastSync: this.lastSync,
                pendingCount: this.pendingActions.length,
                failedCount: this.failedActions.length,
            });
        }
        catch (error) {
            errorHandler.handleError(error instanceof Error ? error : new Error('Failed to save sync state'), {
                component: 'OfflineService',
                action: 'save_sync_state',
                severity: 'low',
            }, {
                showNotification: false, // Don't show notification for state saving
            });
        }
    }
    /**
     * Get sync status
     */
    getSyncStatus() {
        return {
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
            lastSync: this.lastSync,
            pendingActions: this.pendingActions.length,
            failedActions: this.failedActions.length,
            syncProgress: this.pendingActions.length > 0
                ? (this.pendingActions.length - this.failedActions.length) / this.pendingActions.length
                : 1,
        };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        // Restart sync interval if interval changed
        if (config.syncInterval && this.isOnline) {
            this.startSyncInterval();
        }
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    /**
     * Remove event listener
     */
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    /**
     * Emit event
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => callback(data));
        }
    }
    /**
     * Get default configuration
     */
    getDefaultConfig() {
        return {
            maxCacheSize: 50, // 50MB
            cacheExpiration: 24 * 60 * 60 * 1000, // 24 hours
            maxRetries: 3,
            retryDelay: 5000, // 5 seconds
            syncInterval: 30000, // 30 seconds
            enableBackgroundSync: true,
            enablePreload: true,
        };
    }
}
const offlineService = new OfflineService();
export default offlineService;
//# sourceMappingURL=OfflineService.js.map