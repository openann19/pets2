import { useCallback, useState } from 'react';
import { matchesAPI } from '../../../services/api';
import { logger } from '@pawfectmatch/core';
import type { User } from '@pawfectmatch/core';

export interface UseSettingsSyncOptions {
  onSyncSuccess?: () => void;
  onSyncError?: (error: Error) => void;
}

export interface UseSettingsSyncReturn {
  isSyncing: boolean;
  syncSettings: (settings: User['preferences']) => Promise<boolean>;
  error: string | null;
}

/**
 * Hook for syncing settings with backend
 */
export function useSettingsSync({
  onSyncSuccess,
  onSyncError,
}: UseSettingsSyncOptions = {}): UseSettingsSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncSettings = useCallback(
    async (settings: User['preferences']): Promise<boolean> => {
      setIsSyncing(true);
      setError(null);

      try {
        await matchesAPI.updateUserSettings(settings);
        logger.info('Settings synced successfully', { settings });
        onSyncSuccess?.();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to sync settings';
        setError(errorMessage);
        logger.error('Failed to sync settings', { error: errorMessage });
        onSyncError?.(err instanceof Error ? err : new Error(errorMessage));
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    [onSyncSuccess, onSyncError],
  );

  return {
    isSyncing,
    syncSettings,
    error,
  };
}
