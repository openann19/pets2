/**
 * Offline Hook
 * React hook for managing offline state and operations
 */
import { logger } from '@pawfectmatch/core';
import { useCallback, useEffect, useState } from 'react';
import OfflineService from '../services/OfflineService';
export const useOffline = () => {
    const [state, setState] = useState({
        isOnline: navigator.onLine,
        isSyncing: false,
        lastSync: 0,
        pendingActions: 0,
        failedActions: 0,
        syncProgress: 1,
    });
    // Update status from service - defined early to use in initialization
    const updateStatus = useCallback(() => {
        const status = OfflineService.getSyncStatus();
        setState((prev) => ({
            ...prev,
            isOnline: status.isOnline,
            isSyncing: status.isSyncing,
            lastSync: status.lastSync,
            pendingActions: status.pendingActions,
            failedActions: status.failedActions,
            syncProgress: status.syncProgress,
        }));
    }, []);
    // Initialize offline service
    useEffect(() => {
        const initializeOffline = async () => {
            try {
                await OfflineService.initialize();
                updateStatus();
            }
            catch (error) {
                logger.error('Failed to initialize offline service:', { error });
            }
        };
        initializeOffline();
    }, [updateStatus]);
    // Setup event listeners
    useEffect(() => {
        const handleOnline = () => {
            setState((prev) => ({ ...prev, isOnline: true }));
        };
        const handleOffline = () => {
            setState((prev) => ({ ...prev, isOnline: false }));
        };
        const handleSyncStarted = () => {
            setState((prev) => ({ ...prev, isSyncing: true }));
        };
        const handleSyncCompleted = () => {
            setState((prev) => ({
                ...prev,
                isSyncing: false,
                lastSync: Date.now(),
            }));
            updateStatus();
        };
        const handleSyncFailed = () => {
            setState((prev) => ({ ...prev, isSyncing: false }));
        };
        const handleActionQueued = () => {
            updateStatus();
        };
        const handleActionRemoved = () => {
            updateStatus();
        };
        // Add event listeners
        OfflineService.on('online', handleOnline);
        OfflineService.on('offline', handleOffline);
        OfflineService.on('syncStarted', handleSyncStarted);
        OfflineService.on('syncCompleted', handleSyncCompleted);
        OfflineService.on('syncFailed', handleSyncFailed);
        OfflineService.on('actionQueued', handleActionQueued);
        OfflineService.on('actionRemoved', handleActionRemoved);
        // Cleanup
        return () => {
            OfflineService.off('online', handleOnline);
            OfflineService.off('offline', handleOffline);
            OfflineService.off('syncStarted', handleSyncStarted);
            OfflineService.off('syncCompleted', handleSyncCompleted);
            OfflineService.off('syncFailed', handleSyncFailed);
            OfflineService.off('actionQueued', handleActionQueued);
            OfflineService.off('actionRemoved', handleActionRemoved);
        };
    }, []);
    // Cache data
    const cacheData = useCallback(async (key, data, expiresIn) => {
        await OfflineService.cacheData(key, data, expiresIn);
    }, []);
    // Get cached data
    const getCachedData = useCallback(async (key) => await OfflineService.getCachedData(key), []);
    // Remove cached data
    const removeCachedData = useCallback(async (key) => {
        await OfflineService.removeCachedData(key);
    }, []);
    // Clear cache
    const clearCache = useCallback(async () => {
        await OfflineService.clearCache();
    }, []);
    // Queue action
    const queueAction = useCallback(async (action) => await OfflineService.queueAction(action), []);
    // Remove action
    const removeAction = useCallback(async (id) => {
        await OfflineService.removeAction(id);
    }, []);
    // Sync
    const sync = useCallback(async () => {
        await OfflineService.sync();
    }, []);
    // Get pending actions
    const getPendingActions = useCallback(() => OfflineService.getPendingActions(), []);
    // Get failed actions
    const getFailedActions = useCallback(() => OfflineService.getFailedActions(), []);
    // Refresh status
    const refreshStatus = useCallback(() => {
        updateStatus();
    }, [updateStatus]);
    return {
        ...state,
        cacheData,
        getCachedData,
        removeCachedData,
        clearCache,
        queueAction,
        removeAction,
        sync,
        getPendingActions,
        getFailedActions,
        refreshStatus,
    };
};
//# sourceMappingURL=useOffline.js.map