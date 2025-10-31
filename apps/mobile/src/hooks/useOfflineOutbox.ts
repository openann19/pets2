/**
 * Hook for Offline Outbox
 * Phase 2 Product Enhancement - Offline message sync
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { outboxSyncService } from '../services/outboxSyncService';
import type { OutboxItem } from '@pawfectmatch/core/types/phase2-contracts';
import { featureFlags, logger } from '@pawfectmatch/core';
import { useEffect } from 'react';

export function useQueuedMessages() {
  const isEnabled = featureFlags.isEnabled('offlineOutbox');

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<OutboxItem[]>({
    queryKey: ['queuedMessages'],
    queryFn: () => outboxSyncService.getQueuedMessages(),
    enabled: isEnabled,
    staleTime: 10_000, // 10 seconds
    gcTime: 60_000, // 1 minute
  });

  return {
    queuedMessages: data || [],
    isLoading,
    error,
    refetch,
    isEnabled,
  };
}

export function useSyncOutbox() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('offlineOutbox');

  return useMutation({
    mutationFn: () => outboxSyncService.syncQueuedMessages(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queuedMessages'] });
    },
    enabled: isEnabled,
  });
}

export function useQueueMessage() {
  const queryClient = useQueryClient();
  const isEnabled = featureFlags.isEnabled('offlineOutbox');

  return useMutation({
    mutationFn: (item: Omit<OutboxItem, 'id' | 'timestamp' | 'status' | 'retries'>) =>
      outboxSyncService.queueMessage(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queuedMessages'] });
    },
    enabled: isEnabled,
  });
}

/**
 * Hook that automatically syncs outbox when connectivity is restored
 */
export function useAutoSyncOutbox() {
  const { mutate: syncOutbox } = useSyncOutbox();
  const { refetch: refetchQueued } = useQueuedMessages();
  const isEnabled = featureFlags.isEnabled('offlineOutbox');

  useEffect(() => {
    if (!isEnabled) return;

    // Dynamically import NetInfo to avoid breaking if not installed
    import('@react-native-community/netinfo').then((NetInfo) => {
      const unsubscribe = NetInfo.default.addEventListener((state) => {
        if (state.isConnected && state.isInternetReachable) {
          // Connectivity restored, sync outbox
          refetchQueued().then((result) => {
            if (result.data && result.data.length > 0) {
              syncOutbox();
            }
          });
        }
      });

      return () => {
        unsubscribe();
      };
    }).catch((error) => {
      // NetInfo not available, skip auto-sync
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn('NetInfo not available for auto-sync', { error: errorMessage });
    });
  }, [isEnabled, syncOutbox, refetchQueued]);
}

