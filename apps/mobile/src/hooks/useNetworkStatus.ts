/**
 * Network Status Hook
 * 
 * Monitors network connectivity and provides network-aware functionality.
 * 
 * Features:
 * - Real-time network status monitoring
 * - Offline mode detection
 * - Connection type detection
 * - Network change callbacks
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { logger } from '@pawfectmatch/core';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  details: NetInfoState['details'] | null;
}

export interface UseNetworkStatusOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface UseNetworkStatusReturn {
  networkStatus: NetworkStatus;
  isOnline: boolean;
  isOffline: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for monitoring network status
 */
export function useNetworkStatus(
  options: UseNetworkStatusOptions = {}
): UseNetworkStatusReturn {
  const { onConnect, onDisconnect } = options;

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
    details: null,
  });

  const updateNetworkStatus = useCallback(
    (state: NetInfoState) => {
      const newStatus: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        details: state.details,
      };

      const wasConnected = networkStatus.isConnected;
      const isNowConnected = newStatus.isConnected;

      setNetworkStatus(newStatus);

      // Call callbacks on state change
      if (!wasConnected && isNowConnected) {
        onConnect?.();
        logger.info('Network connected', { type: newStatus.type });
      } else if (wasConnected && !isNowConnected) {
        onDisconnect?.();
        logger.warn('Network disconnected');
      }
    },
    [networkStatus.isConnected, onConnect, onDisconnect]
  );

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(updateNetworkStatus);

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(updateNetworkStatus);

    return () => {
      unsubscribe();
    };
  }, [updateNetworkStatus]);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    updateNetworkStatus(state);
  }, [updateNetworkStatus]);

  return {
    networkStatus,
    isOnline: networkStatus.isConnected && networkStatus.isInternetReachable,
    isOffline: !networkStatus.isConnected || !networkStatus.isInternetReachable,
    refresh,
  };
}

/**
 * Hook for executing operations with network awareness
 */
export function useNetworkAwareOperation<T>(
  operation: () => Promise<T>,
  options: {
    onOffline?: () => void;
    retryOnReconnect?: boolean;
  } = {}
) {
  const { networkStatus, isOnline } = useNetworkStatus({
    onConnect: options.retryOnReconnect ? () => operation() : undefined,
  });

  const execute = useCallback(async (): Promise<T> => {
    if (!isOnline) {
      options.onOffline?.();
      throw new Error('No internet connection');
    }

    return operation();
  }, [isOnline, operation, options]);

  return {
    execute,
    isOnline,
    networkStatus,
  };
}

