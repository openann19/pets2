/**
 * useSyncStatus Hook
 * Monitors offline sync queue status and provides retry functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { OfflineSyncService } from '../services/OfflineSyncService';
import { logger } from '@pawfectmatch/core';

export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  error: Error | null;
}

export interface UseSyncStatusReturn extends SyncStatus {
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for monitoring offline sync queue status
 */
export function useSyncStatus(): UseSyncStatusReturn {
  const { isOnline } = useNetworkStatus();
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    error: null,
  });

  const updateStatus = useCallback(async () => {
    try {
      const service = OfflineSyncService.getInstance();
      const syncStatus = await service.getSyncStatus();

      setStatus({
        isSyncing: syncStatus.isSyncing,
        pendingCount: syncStatus.pendingItems,
        lastSyncTime: syncStatus.lastSyncTime ? new Date(syncStatus.lastSyncTime) : null,
        error: null,
      });
    } catch (error) {
      logger.error('Failed to update sync status', { error });
      setStatus((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, []);

  // Update status on mount and periodically
  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [updateStatus]);

  // Update status when network comes online
  useEffect(() => {
    if (isOnline) {
      updateStatus();
    }
  }, [isOnline, updateStatus]);

  const retry = useCallback(async () => {
    if (!isOnline) {
      logger.warn('Cannot retry sync - device is offline');
      return;
    }

    try {
      setStatus((prev) => ({ ...prev, isSyncing: true, error: null }));
      const service = OfflineSyncService.getInstance();
      await service.syncNow();
      await updateStatus();
      logger.info('Sync retry completed successfully');
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Sync retry failed', { error: errorObj });
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: errorObj,
      }));
    }
  }, [isOnline, updateStatus]);

  const refresh = useCallback(async () => {
    await updateStatus();
  }, [updateStatus]);

  return {
    ...status,
    retry,
    refresh,
  };
}

