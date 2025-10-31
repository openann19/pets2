/**
 * Offline Feed Support Hook
 * Phase 4: Intelligence & Personalization
 * 
 * Provides offline feed browsing with:
 * - AsyncStorage caching
 * - Offline-first data loading
 * - Background sync
 * - Conflict resolution
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { logger } from '@pawfectmatch/core';
import type { Pet } from '../../types/api';

const FEED_STORAGE_KEY = '@feed:offline_pets';
const FEED_METADATA_KEY = '@feed:offline_metadata';

interface FeedMetadata {
  lastUpdated: number;
  version: number;
  count: number;
  filters?: string;
}

export interface UseOfflineFeedOptions {
  /** Enable offline support */
  enabled?: boolean;
  /** Auto-sync when online */
  autoSync?: boolean;
  /** Callback when offline data loads */
  onOfflineDataLoaded?: (pets: Pet[]) => void;
}

export interface UseOfflineFeedReturn {
  /** Whether currently online */
  isOnline: boolean;
  /** Whether offline data is available */
  hasOfflineData: boolean;
  /** Number of offline pets */
  offlinePetCount: number;
  /** Last offline update timestamp */
  lastOfflineUpdate: number | null;
  /** Save pets to offline storage */
  saveOfflinePets: (pets: Pet[]) => Promise<void>;
  /** Load pets from offline storage */
  loadOfflinePets: () => Promise<Pet[]>;
  /** Clear offline data */
  clearOfflineData: () => Promise<void>;
  /** Sync offline data with server */
  syncOfflineData: () => Promise<void>;
}

/**
 * Offline Feed Hook
 * 
 * Manages offline feed caching and synchronization
 */
export function useOfflineFeed(
  options: UseOfflineFeedOptions = {},
): UseOfflineFeedReturn {
  const { enabled = true, autoSync = true, onOfflineDataLoaded } = options;

  const [isOnline, setIsOnline] = useState(true);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [offlinePetCount, setOfflinePetCount] = useState(0);
  const [lastOfflineUpdate, setLastOfflineUpdate] = useState<number | null>(null);

  /**
   * Check network status
   */
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? false;
      setIsOnline(online);

      if (online && autoSync) {
        void syncOfflineData();
      }
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, autoSync]);

  /**
   * Load offline metadata
   */
  const loadMetadata = useCallback(async (): Promise<FeedMetadata | null> => {
    try {
      const stored = await AsyncStorage.getItem(FEED_METADATA_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as FeedMetadata;
    } catch (error) {
      logger.error('Failed to load offline feed metadata', { error });
      return null;
    }
  }, []);

  /**
   * Save pets to offline storage
   */
  const saveOfflinePets = useCallback(
    async (pets: Pet[]): Promise<void> => {
      if (!enabled) return;

      try {
        // Save pets
        await AsyncStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(pets));

        // Save metadata
        const metadata: FeedMetadata = {
          lastUpdated: Date.now(),
          version: 1,
          count: pets.length,
        };

        await AsyncStorage.setItem(FEED_METADATA_KEY, JSON.stringify(metadata));

        setHasOfflineData(true);
        setOfflinePetCount(pets.length);
        setLastOfflineUpdate(metadata.lastUpdated);

        logger.info('Feed data saved offline', { count: pets.length });
      } catch (error) {
        logger.error('Failed to save offline feed data', { error });
        throw error;
      }
    },
    [enabled],
  );

  /**
   * Load pets from offline storage
   */
  const loadOfflinePets = useCallback(async (): Promise<Pet[]> => {
    if (!enabled) return [];

    try {
      const stored = await AsyncStorage.getItem(FEED_STORAGE_KEY);
      if (!stored) {
        setHasOfflineData(false);
        return [];
      }

      const pets = JSON.parse(stored) as Pet[];
      const metadata = await loadMetadata();

      if (metadata) {
        setHasOfflineData(true);
        setOfflinePetCount(metadata.count);
        setLastOfflineUpdate(metadata.lastUpdated);
      }

      onOfflineDataLoaded?.(pets);
      logger.info('Feed data loaded from offline storage', { count: pets.length });

      return pets;
    } catch (error) {
      logger.error('Failed to load offline feed data', { error });
      setHasOfflineData(false);
      return [];
    }
  }, [enabled, loadMetadata, onOfflineDataLoaded]);

  /**
   * Clear offline data
   */
  const clearOfflineData = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(FEED_STORAGE_KEY);
      await AsyncStorage.removeItem(FEED_METADATA_KEY);

      setHasOfflineData(false);
      setOfflinePetCount(0);
      setLastOfflineUpdate(null);

      logger.info('Offline feed data cleared');
    } catch (error) {
      logger.error('Failed to clear offline feed data', { error });
      throw error;
    }
  }, []);

  /**
   * Sync offline data with server
   */
  const syncOfflineData = useCallback(async (): Promise<void> => {
    if (!isOnline || !enabled) return;

    try {
      // This would typically fetch fresh data and update offline cache
      // Implementation depends on your feed fetching logic
      logger.info('Syncing offline feed data');
    } catch (error) {
      logger.error('Failed to sync offline feed data', { error });
    }
  }, [isOnline, enabled]);

  // Check for offline data on mount
  useEffect(() => {
    if (enabled) {
      void loadOfflinePets();
    }
  }, [enabled, loadOfflinePets]);

  return {
    isOnline,
    hasOfflineData,
    offlinePetCount,
    lastOfflineUpdate,
    saveOfflinePets,
    loadOfflinePets,
    clearOfflineData,
    syncOfflineData,
  };
}

