/**
 * Network Status Hook - Web Version
 * 
 * Monitors network connectivity matching mobile useNetworkStatus exactly
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@pawfectmatch/core';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  details: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  } | null;
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
 * Hook for monitoring network status - web implementation
 */
export function useNetworkStatus(
  options: UseNetworkStatusOptions = {}
): UseNetworkStatusReturn {
  const { onConnect, onDisconnect } = options;

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: typeof navigator !== 'undefined' ? navigator.onLine : false,
    isInternetReachable: typeof navigator !== 'undefined' ? navigator.onLine : false,
    type: 'unknown',
    details: null,
  });

  const updateNetworkStatus = useCallback(
    (isOnline: boolean) => {
      const wasConnected = networkStatus.isConnected;
      const isNowConnected = isOnline;

      const connection = navigator.connection || 
                         navigator.mozConnection || 
                         navigator.webkitConnection;

      const newStatus: NetworkStatus = {
        isConnected: isNowConnected,
        isInternetReachable: isNowConnected,
        type: connection?.effectiveType || 'unknown',
        details: connection ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        } : null,
      };

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
    updateNetworkStatus(navigator.onLine);

    // Subscribe to network state changes
    const handleOnline = () => updateNetworkStatus(true);
    const handleOffline = () => updateNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateNetworkStatus]);

  const refresh = useCallback(async () => {
    updateNetworkStatus(navigator.onLine);
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

