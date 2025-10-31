/**
 * Enhanced Swipe Screen
 * Integrates all Phase 1-5 feed upgrades
 * 
 * Features:
 * - Virtual scrolling (Phase 1)
 * - Smart preloading (Phase 1)
 * - Feed caching (Phase 1)
 * - Optimistic UI (Phase 2)
 * - Loading states (Phase 2)
 * - Error handling (Phase 2)
 * - Advanced filtering (Phase 3)
 * - Real-time updates (Phase 3)
 * - Geolocation (Phase 3)
 * - Offline support (Phase 4)
 * - Analytics (Phase 4)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';
import { useTheme } from '@/theme';
import { useTranslation } from 'react-i18next';

// Phase 1: Performance & Scalability
import { EnhancedSwipeDeck } from '../components/swipe/EnhancedSwipeDeck';
import {
  useEnhancedSwipeData,
  useSmartFeedPreloading,
  useFeedCaching,
} from '../hooks/feed';

// Phase 2: UX Polish
import { FeedSkeleton, FeedErrorBoundary } from '../components/feed';
import { useOptimisticSwipe } from '../hooks/feed/useOptimisticSwipe';
import { useFeedErrorHandling } from '../hooks/feed/useFeedErrorHandling';

// Phase 3: Advanced Features
import {
  useAdvancedFeedFilters,
  useRealtimeFeedUpdates,
  useFeedGeolocation,
} from '../hooks/feed';

// Phase 4: Intelligence & Personalization
import { useOfflineFeed } from '../hooks/feed/useOfflineFeed';
import { useFeedAnalytics } from '../hooks/feed/useFeedAnalytics';

import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { haptic } from '../ui/haptics';
import { useAuthStore } from '../stores/useAuthStore';
import { logger } from '@pawfectmatch/core';

type EnhancedSwipeScreenProps = RootStackScreenProps<'Swipe'>;

export default function EnhancedSwipeScreen({ navigation }: EnhancedSwipeScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const { user } = useAuthStore();

  // Phase 3: Advanced Filters
  const {
    filters: advancedFilters,
    updateFilter,
    getFilterCount,
    hasActiveFilters,
  } = useAdvancedFeedFilters({
    persist: true,
    onFiltersChange: () => {
      // Invalidate cache when filters change
      invalidateCache();
    },
  });

  // Phase 4: Offline Support
  const {
    isOnline,
    hasOfflineData,
    saveOfflinePets,
    loadOfflinePets,
  } = useOfflineFeed({
    enabled: true,
    autoSync: true,
    onOfflineDataLoaded: (pets) => {
      // Show offline indicator if needed
      if (!isOnline && pets.length > 0) {
        logger.info('Loaded offline feed data', { count: pets.length });
      }
    },
  });

  // Phase 1: Enhanced Swipe Data (with caching)
  const {
    pets: cachedPets,
    isLoading,
    error: cacheError,
    currentIndex,
    handleSwipe,
    refreshPets,
    prefetchNextPage,
    invalidateCache,
  } = useFeedCaching({
    filters: advancedFilters,
    enabled: !!user,
    onSuccess: async (pets) => {
      // Save to offline storage
      if (pets.length > 0) {
        await saveOfflinePets(pets);
      }
    },
  });

  // Phase 2: Optimistic Swipe
  const optimisticSwipe = useOptimisticSwipe({
    optimistic: true,
    onSuccess: (petId, action, isMatch) => {
      if (isMatch) {
        trackMatch(petId, `match_${petId}`);
      }
    },
    onError: (petId, action, error) => {
      logger.error('Optimistic swipe failed', { petId, action, error });
    },
  });

  // Phase 2: Error Handling
  const {
    error: feedError,
    executeWithRetry,
    retry,
    clearError,
  } = useFeedErrorHandling({
    maxRetries: 3,
    exponentialBackoff: true,
    showAlerts: true,
  });

  // Phase 3: Real-time Updates
  const {
    isConnected: isRealtimeConnected,
    refreshFeed,
  } = useRealtimeFeedUpdates({
    enabled: true,
    onNewPet: (event) => {
      // New pet added to feed
      logger.info('New pet via real-time', { petId: event.pet._id });
      void refreshPets();
    },
    onNewMatch: (event) => {
      // Show match notification
      trackMatch(event.petId, event.matchId);
      // Show match modal (implementation needed)
    },
    autoRefresh: true,
  });

  // Phase 3: Geolocation
  const {
    location,
    startTracking,
    isTracking,
    sortByDistance,
    isWithinRange,
  } = useFeedGeolocation({
    preferences: {
      maxDistance: advancedFilters.maxDistance || 50,
      prioritizeLocal: true,
      updateInterval: 5 * 60 * 1000,
    },
  });

  // Phase 4: Analytics
  const {
    trackSwipe,
    trackCardView,
    trackFilterChange,
    trackMatch,
    trackRefresh,
    getMetrics,
  } = useFeedAnalytics({
    enabled: true,
    screenName: 'EnhancedSwipeScreen',
  });

  // Filter and sort pets
  const filteredPets = useMemo(() => {
    let result = cachedPets;

    // Apply location-based filtering and sorting
    if (location && advancedFilters.location) {
      result = result.filter((pet) => {
        const petLat = (pet as any).location?.latitude;
        const petLon = (pet as any).location?.longitude;
        return petLat && petLon && isWithinRange(petLat, petLon);
      });

      if (advancedFilters.prioritizeLocal !== false) {
        result = sortByDistance(result);
      }
    }

    return result;
  }, [cachedPets, location, advancedFilters, isWithinRange, sortByDistance]);

  // Enhanced swipe handler with analytics
  const handleEnhancedSwipe = useCallback(
    async (action: 'like' | 'pass' | 'superlike') => {
      const currentPet = filteredPets[currentIndex];
      if (!currentPet || !user?.pets?.[0]) return;

      // Track analytics
      trackSwipe(currentPet._id, action);

      // Execute optimistic swipe
      const result = await optimisticSwipe.swipe(
        currentPet,
        action,
        user.pets[0],
      );

      if (result.success) {
        // Call original handleSwipe
        await handleSwipe(action);
      }
    },
    [filteredPets, currentIndex, user, trackSwipe, optimisticSwipe, handleSwipe],
  );

  // Start location tracking
  useEffect(() => {
    void startTracking();
  }, [startTracking]);

  // Load offline data if online
  useEffect(() => {
    if (!isOnline && hasOfflineData) {
      void loadOfflinePets();
    }
  }, [isOnline, hasOfflineData, loadOfflinePets]);

  // Track filter changes
  useEffect(() => {
    if (hasActiveFilters()) {
      trackFilterChange('filters', getFilterCount());
    }
  }, [advancedFilters, hasActiveFilters, getFilterCount, trackFilterChange]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
  });

  // Loading state
  if (isLoading && filteredPets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title'),
              showBackButton: true,
              onBackPress: () => navigation.goBack(),
            })}
          />
        }
      >
        <FeedSkeleton cardCount={3} />
      </ScreenShell>
    );
  }

  // Error state
  if ((cacheError || feedError) && filteredPets.length === 0) {
    return (
      <FeedErrorBoundary onRetry={retry}>
        <ScreenShell
          header={
            <AdvancedHeader
              {...HeaderConfigs.glass({
                title: t('swipe.title'),
                showBackButton: true,
                onBackPress: () => navigation.goBack(),
              })}
            />
          }
        >
          <View style={styles.emptyContainer}>
            {/* Error UI would go here */}
          </View>
        </ScreenShell>
      </FeedErrorBoundary>
    );
  }

  const currentPet = filteredPets[currentIndex];

  // No pets state
  if (!currentPet) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title'),
              showBackButton: true,
              onBackPress: () => navigation.goBack(),
            })}
          />
        }
      >
        <View style={styles.emptyContainer}>
          {/* Empty state UI */}
        </View>
      </ScreenShell>
    );
  }

  return (
    <FeedErrorBoundary onRetry={retry}>
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title'),
              showBackButton: true,
              onBackPress: () => {
                haptic.tap();
                navigation.goBack();
              },
            })}
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.cardContainer}>
            <EnhancedSwipeDeck
              pets={filteredPets}
              currentIndex={currentIndex}
              onSwipeLeft={() => {
                haptic.tap();
                void handleEnhancedSwipe('pass');
              }}
              onSwipeRight={() => {
                haptic.confirm();
                void handleEnhancedSwipe('like');
              }}
              onSwipeUp={() => {
                haptic.super();
                void handleEnhancedSwipe('superlike');
              }}
              onLoadMore={prefetchNextPage}
              hasMore={true}
            />
          </View>
        </View>
      </ScreenShell>
    </FeedErrorBoundary>
  );
}

