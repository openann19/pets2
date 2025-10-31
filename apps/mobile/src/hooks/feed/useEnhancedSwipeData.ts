/**
 * Enhanced Swipe Data Hook
 * Phase 1: Performance & Scalability Integration
 * 
 * Combines all Phase 1 features:
 * - Feed caching with React Query
 * - Smart preloading
 * - Optimized virtual scrolling support
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFilterStore } from '../../store/filterStore';
import type { Pet, PetFilters } from '../../types/api';
import { matchesAPI } from '../../services/api';
import { useFeedCaching } from './useFeedCaching';
import { useSmartFeedPreloading } from './useSmartFeedPreloading';

export interface SwipeFilters {
  species: string;
  breed: string;
  ageMin: number;
  ageMax: number;
  distance: number;
}

export interface SwipeData {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  currentIndex: number;
  filters: SwipeFilters;
  showFilters: boolean;
  showMatchModal: boolean;
  matchedPet: Pet | null;
}

export interface SwipeActions {
  loadPets: () => Promise<void>;
  handleSwipe: (action: 'like' | 'pass' | 'superlike') => Promise<void>;
  handleButtonSwipe: (action: 'like' | 'pass' | 'superlike') => void;
  setCurrentIndex: (index: number) => void;
  setShowFilters: (show: boolean) => void;
  setShowMatchModal: (show: boolean) => void;
  setMatchedPet: (pet: Pet | null) => void;
  setFilters: (filters: SwipeFilters) => void;
  refreshPets: () => void;
  /** Prefetch next page of pets */
  prefetchNextPage: () => Promise<void>;
}

/**
 * Enhanced Swipe Data Hook with Caching & Preloading
 * 
 * Replaces useSwipeData with Phase 1 enhancements:
 * - Intelligent caching with React Query
 * - Smart preloading of next profiles
 * - Background refresh (stale-while-revalidate)
 */
export function useEnhancedSwipeData(): SwipeData & SwipeActions {
  const { user } = useAuthStore();
  const { filters: filterStoreFilters, setFilters: setFilterStoreFilters } = useFilterStore();

  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Convert filter store to local filters
  const filters: SwipeFilters = {
    species: filterStoreFilters.species ?? '',
    breed: filterStoreFilters.breed ?? '',
    ageMin: filterStoreFilters.minAge ?? 0,
    ageMax: filterStoreFilters.maxAge ?? 20,
    distance: filterStoreFilters.maxDistance ?? 50,
  };

  // Build API filters
  const apiFilters: PetFilters = {
    ...(filters.species && { species: filters.species }),
    ...(filters.breed && { breed: filters.breed }),
    ...(filters.ageMin > 0 && { minAge: filters.ageMin }),
    ...(filters.ageMax < 20 && { maxAge: filters.ageMax }),
    maxDistance: filters.distance,
  };

  // Feed caching hook
  const {
    pets: cachedPets,
    isLoading,
    error: cacheError,
    refetch: refetchFeed,
    invalidateCache,
    prefetchNextPage: prefetchNext,
    getCacheStats,
  } = useFeedCaching({
    filters: apiFilters,
    enabled: !!user,
    onSuccess: (pets) => {
      logger.info('Feed cached successfully', {
        count: pets.length,
        filters,
        cacheStats: getCacheStats(),
      });
    },
    onError: (error) => {
      logger.error('Feed cache error', { error, filters });
    },
  });

  // Smart preloading hook
  const { registerPosition, triggerPreload, clearPreloads } = useSmartFeedPreloading({
    preloadAhead: 5,
    threshold: 0.3,
    minRemaining: 10,
    onPreload: async (nextIndex: number) => {
      // Prefetch next page if we're running low
      if (nextIndex >= cachedPets.length - 2 && hasMore) {
        await prefetchNext();
      } else if (nextIndex < cachedPets.length) {
        // Preload images for upcoming pets
        await triggerPreload(nextIndex);
      }
    },
    maxConcurrent: 3,
  });

  // Register position for smart preloading
  useEffect(() => {
    if (cachedPets.length > 0) {
      registerPosition(currentIndex, cachedPets.length);
    }
  }, [currentIndex, cachedPets.length, registerPosition]);

  // Load pets (wraps cache refetch)
  const loadPets = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      await refetchFeed();
      setCurrentIndex(0);
      logger.info('Pets loaded via cache', {
        count: cachedPets.length,
        filters,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Failed to load pets', { error });
    }
  }, [user, refetchFeed, cachedPets.length, filters]);

  // Handle swipe actions with optimistic updates
  const handleSwipe = useCallback(
    async (action: 'like' | 'pass' | 'superlike') => {
      const currentPet = cachedPets[currentIndex];
      const userPetId = user?.pets?.[0] || user?.activePetId;
      if (!currentPet || !userPetId) return;

      // Optimistic update: Move to next pet immediately
      const originalIndex = currentIndex;
      setCurrentIndex((prev) => prev + 1);

      try {
        // Real API call for swipe action
        if (action === 'like' || action === 'superlike') {
          const match = await matchesAPI.createMatch(userPetId, currentPet._id);

          // Check if it's a mutual match
          if (match) {
            setMatchedPet(currentPet);
            setShowMatchModal(true);
          }
        }

        // Trigger preload for next pets
        if (originalIndex < cachedPets.length - 1) {
          void triggerPreload(originalIndex + 1);
        }

        // Load more pets when running low (background)
        if (originalIndex >= cachedPets.length - 2 && hasMore) {
          setTimeout(() => {
            void prefetchNext();
          }, 100);
        }

        logger.info('Swipe action completed', {
          action,
          petId: currentPet._id,
          isMatch: action === 'like' || action === 'superlike',
        });
      } catch (err: unknown) {
        // Rollback optimistic update on error
        setCurrentIndex(originalIndex);
        const error = err instanceof Error ? err : new Error(String(err));
        const errorMessage = err instanceof Error ? err.message : 'Failed to process swipe';

        // Try to extract structured error from response
        let errorData: any = err;

        if (err && typeof err === 'object') {
          const errObj = err as any;
          if (errObj.response?.data) {
            errorData = errObj.response.data;
          } else if (errObj.data) {
            errorData = errObj.data;
          }
        }

        // Check if error is SWIPE_LIMIT_EXCEEDED
        if (errorData?.code === 'SWIPE_LIMIT_EXCEEDED' || errorMessage.includes('swipe limit')) {
          // Throw structured error for modal handling
          throw {
            code: 'SWIPE_LIMIT_EXCEEDED',
            message: errorData?.message || errorMessage,
            currentLimit: errorData?.currentLimit || 5,
            usedToday: errorData?.usedToday || 5,
          };
        }

        Alert.alert('Error', errorMessage);
        logger.error('Swipe action failed', { error, errorData });
      }
    },
    [cachedPets, currentIndex, user, hasMore, triggerPreload, prefetchNext],
  );

  // Handle button swipe (immediate)
  const handleButtonSwipe = useCallback(
    (action: 'like' | 'pass' | 'superlike') => {
      void handleSwipe(action);
    },
    [handleSwipe],
  );

  // Refresh pets (invalidates cache and refetches)
  const refreshPets = useCallback(() => {
    invalidateCache();
    void loadPets();
  }, [invalidateCache, loadPets]);

  // Set filters (invalidates cache)
  const setFilters = useCallback(
    (newFilters: SwipeFilters) => {
      setFilterStoreFilters({
        species: newFilters.species,
        breed: newFilters.breed,
        minAge: newFilters.ageMin,
        maxAge: newFilters.ageMax,
        maxDistance: newFilters.distance,
      });
      // Invalidate cache when filters change
      invalidateCache();
    },
    [setFilterStoreFilters, invalidateCache],
  );

  // Prefetch next page
  const prefetchNextPage = useCallback(async () => {
    await prefetchNext();
    setHasMore(true); // Update hasMore based on prefetch result
  }, [prefetchNext]);

  // Load pets on component mount
  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  // Cleanup preloads on unmount
  useEffect(() => {
    return () => {
      clearPreloads();
    };
  }, [clearPreloads]);

  return {
    // Data
    pets: cachedPets,
    isLoading,
    error: cacheError?.message || null,
    currentIndex,
    filters,
    showFilters,
    showMatchModal,
    matchedPet,

    // Actions
    loadPets,
    handleSwipe,
    handleButtonSwipe,
    setCurrentIndex,
    setShowFilters,
    setShowMatchModal,
    setMatchedPet,
    setFilters,
    refreshPets,
    prefetchNextPage,
  };
}

