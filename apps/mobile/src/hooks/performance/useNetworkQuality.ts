/**
 * Network Quality Hook
 * 
 * Detects network quality (fast/slow/offline) for adaptive optimizations
 */
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type NetworkQuality = 'fast' | 'slow' | 'offline';

interface NetworkInfo {
  quality: NetworkQuality;
  isConnected: boolean;
  type: string | null;
  details: NetInfoState['details'];
}

/**
 * Hook to monitor network quality for adaptive optimizations
 */
export function useNetworkQuality(): NetworkQuality {
  const [quality, setQuality] = useState<NetworkQuality>('slow');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (!state.isConnected) {
        setQuality('offline');
        return;
      }

      // Determine quality based on connection type
      const type = state.type;
      if (type === 'wifi' || type === 'ethernet') {
        setQuality('fast');
      } else if (type === 'cellular') {
        // Could be enhanced with actual bandwidth measurement
        setQuality('slow');
      } else {
        setQuality('slow');
      }
    });

    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      if (!state.isConnected) {
        setQuality('offline');
      } else if (state.type === 'wifi' || state.type === 'ethernet') {
        setQuality('fast');
      } else {
        setQuality('slow');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return quality;
}

/**
 * Enhanced hook with full network info
 */
export function useNetworkInfo(): NetworkInfo {
  const [info, setInfo] = useState<NetworkInfo>({
    quality: 'slow',
    isConnected: false,
    type: null,
    details: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      let quality: NetworkQuality = 'slow';
      
      if (!state.isConnected) {
        quality = 'offline';
      } else if (state.type === 'wifi' || state.type === 'ethernet') {
        quality = 'fast';
      }

      setInfo({
        quality,
        isConnected: state.isConnected ?? false,
        type: state.type,
        details: state.details,
      });
    });

    NetInfo.fetch().then((state: NetInfoState) => {
      let quality: NetworkQuality = 'slow';
      
      if (!state.isConnected) {
        quality = 'offline';
      } else if (state.type === 'wifi' || state.type === 'ethernet') {
        quality = 'fast';
      }

      setInfo({
        quality,
        isConnected: state.isConnected ?? false,
        type: state.type,
        details: state.details,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return info;
}
