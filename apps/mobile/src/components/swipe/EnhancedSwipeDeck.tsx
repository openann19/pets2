/**
 * Enhanced Swipe Deck with Virtual Scrolling
 * Phase 1: Performance & Scalability
 * 
 * Handles 1000+ pet cards efficiently with:
 * - Optimized FlatList virtualization
 * - Smart rendering window
 * - Memory-efficient card rendering
 * - Progressive image loading
 */

import type { Pet } from '@pawfectmatch/core';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { FlatList, StyleSheet, View, type ViewStyle, type ListRenderItem } from 'react-native';
import Animated from 'react-native-reanimated';
import { InteractionManager } from 'react-native';

import {
  IMAGE_PREFETCH_CONFIG,
  LIST_VIRTUALIZATION_CONFIG,
  SWIPE_DECK_LAYOUT,
} from '@/constants/performance';
import { preloadRemoteImages } from '@/services/AssetPreloader';
import { extractPetImageUrls } from '@/utils/pet-media';
import type { AppTheme } from '@mobile/theme';
import { useTheme } from '@mobile/theme';
import { logger } from '@pawfectmatch/core';
import ModernSwipeCard from '../ModernSwipeCard';
import { useSmartFeedPreloading } from '../../hooks/feed/useSmartFeedPreloading';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Pet>);

type EnhancedSwipeDeckProps = {
  pets: Pet[];
  currentIndex: number;
  onSwipeLeft: (pet: Pet) => void;
  onSwipeRight: (pet: Pet) => void;
  onSwipeUp: (pet: Pet) => void;
  /** Callback when more pets should be loaded */
  onLoadMore?: () => Promise<void>;
  /** Whether more pets are available */
  hasMore?: boolean;
};

type CardPet = {
  _id: string;
  name: string;
  age: number;
  breed: string;
  photos: string[];
  bio: string;
  tags: string[];
  distance: number;
  compatibility: number;
  isVerified: boolean;
};

const createStyles = (theme: AppTheme, cardWidth: number, cardHeight: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    list: {
      flex: 1,
      width: '100%',
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
    },
    cardSlot: {
      height: cardHeight + SWIPE_DECK_LAYOUT.stackOffset,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardWrapper: {
      width: cardWidth,
      height: cardHeight,
      borderRadius: theme.radii['4xl'],
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 24,
      elevation: 16,
      overflow: 'visible',
    },
  });

const buildCardModel = (pet: Pet): CardPet => {
  const photos = extractPetImageUrls(pet);
  const description = (pet as any).description ?? (pet as any).bio ?? (pet as any).summary ?? '';

  return {
    _id: pet._id ?? (pet as any).id ?? Math.random().toString(36).slice(2),
    name: pet.name ?? (pet as any).displayName ?? 'Mystery Pet',
    age: typeof pet.age === 'number' ? pet.age : ((pet as any).ageYears ?? 0),
    breed: pet.breed ?? (pet as any).breedName ?? 'Unknown',
    photos,
    bio: description,
    tags: (pet as any).tags ?? [],
    distance:
      typeof (pet as any).distance === 'number'
        ? (pet as any).distance
        : ((pet as any).location?.distance ?? 0),
    compatibility:
      typeof (pet as any).compatibility === 'number'
        ? (pet as any).compatibility
        : Math.round((pet as any).compatibilityScore ?? 85),
    isVerified: Boolean((pet as any).isVerified ?? (pet as any).verified),
  };
};

/**
 * Enhanced Swipe Deck Component
 * 
 * Optimized for handling 1000+ pet cards with:
 * - Virtual scrolling (only renders visible + buffer)
 * - Smart preloading based on scroll position
 * - Memory-efficient card models
 * - Progressive image loading
 */
export const EnhancedSwipeDeck = React.memo(function EnhancedSwipeDeck({
  pets,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onLoadMore,
  hasMore = false,
}: EnhancedSwipeDeckProps): React.JSX.Element {
  const theme = useTheme();
  const cardWidth = SWIPE_DECK_LAYOUT.cardWidth;
  const cardHeight = cardWidth * SWIPE_DECK_LAYOUT.cardHeightRatio;
  const styles = useMemo(
    () => createStyles(theme, cardWidth, cardHeight),
    [theme, cardWidth, cardHeight],
  );

  const prefetched = useRef(new Set<string>());
  const listRef = useRef<FlatList<Pet>>(null);

  // Smart preloading hook
  const { registerPosition, triggerPreload } = useSmartFeedPreloading({
    preloadAhead: 5,
    threshold: 0.3,
    minRemaining: 10,
    onPreload: async (nextIndex: number) => {
      if (nextIndex >= pets.length && hasMore && onLoadMore) {
        await onLoadMore();
      }
      
      // Prefetch images for upcoming pets
      if (nextIndex < pets.length) {
        const upcoming = pets.slice(nextIndex, nextIndex + IMAGE_PREFETCH_CONFIG.ahead);
        const urls = upcoming.flatMap(extractPetImageUrls).filter((url) => {
          if (prefetched.current.has(url)) return false;
          prefetched.current.add(url);
          return true;
        });

        if (urls.length > 0) {
          await preloadRemoteImages(urls);
        }
      }
    },
    maxConcurrent: 3,
  });

  // Register position for smart preloading
  useEffect(() => {
    if (pets.length > 0) {
      registerPosition(currentIndex, pets.length);
    }
  }, [currentIndex, pets.length, registerPosition]);

  // Schedule prefetch for current position
  const schedulePrefetch = useCallback(
    (index: number) => {
      const upcoming = pets.slice(index, index + IMAGE_PREFETCH_CONFIG.ahead + 1);
      const urls = upcoming.flatMap(extractPetImageUrls).filter((url) => {
        if (prefetched.current.has(url)) return false;
        prefetched.current.add(url);
        return true;
      });

      if (urls.length === 0) {
        return;
      }

      InteractionManager.runAfterInteractions(() => {
        preloadRemoteImages(urls).catch((error: unknown) => {
          logger.warn('SwipeDeck image prefetch failed', {
            error,
            count: urls.length,
          });
        });
      });
    },
    [pets],
  );

  // Initial prefetch
  useEffect(() => {
    if (pets.length === 0) {
      return;
    }
    schedulePrefetch(currentIndex);
    void triggerPreload(currentIndex + 1);
  }, [currentIndex, pets, schedulePrefetch, triggerPreload]);

  const keyExtractor = useCallback(
    (item: Pet, index: number) => item._id ?? (item as any).id ?? `pet-${index}`,
    [],
  );

  const getItemLayout = useCallback(
    (_: Pet[] | null | undefined, index: number) => {
      const length = cardHeight + SWIPE_DECK_LAYOUT.stackOffset;
      return { length, offset: length * index, index };
    },
    [cardHeight],
  );

  const renderItem: ListRenderItem<Pet> = useCallback(
    ({ item, index }) => {
      if (index < currentIndex) {
        return <View style={styles.cardSlot} />;
      }

      const relative = index - currentIndex;
      const isActive = relative === 0;
      const translateY = relative * SWIPE_DECK_LAYOUT.stackOffset;
      const scale = Math.max(0.9, 1 - relative * 0.04);
      const opacity = relative === 0 ? 1 : Math.max(0, 1 - relative * 0.2);

      const cardModel = buildCardModel(item);

      return (
        <View style={styles.cardSlot}>
          <Animated.View
            style={[
              styles.cardWrapper,
              {
                transform: [{ translateY }, { scale }],
                opacity,
                zIndex: pets.length - index,
              } satisfies ViewStyle,
            ]}
            pointerEvents={isActive ? 'auto' : 'none'}
          >
            <ModernSwipeCard
              pet={cardModel as any}
              isTopCard={isActive}
              disabled={!isActive}
              onSwipeLeft={() => {
                onSwipeLeft(item);
                schedulePrefetch(index + 1);
              }}
              onSwipeRight={() => {
                onSwipeRight(item);
                schedulePrefetch(index + 1);
              }}
              onSwipeUp={() => {
                onSwipeUp(item);
                schedulePrefetch(index + 1);
              }}
            />
          </Animated.View>
        </View>
      );
    },
    [
      currentIndex,
      styles.cardSlot,
      styles.cardWrapper,
      pets.length,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      schedulePrefetch,
    ],
  );

  // Optimized virtualization config for 1000+ items
  const virtualizationConfig = useMemo(
    () => ({
      ...LIST_VIRTUALIZATION_CONFIG,
      // Adjust for large lists
      windowSize: Math.min(LIST_VIRTUALIZATION_CONFIG.windowSize * 2, 21), // Max 21 for performance
      maxToRenderPerBatch: Math.min(LIST_VIRTUALIZATION_CONFIG.maxToRenderPerBatch * 2, 16),
      initialNumToRender: LIST_VIRTUALIZATION_CONFIG.initialNumToRender,
      removeClippedSubviews: true, // Critical for large lists
    }),
    [],
  );

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        ref={listRef}
        data={pets}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal={false}
        scrollEnabled={false}
        removeClippedSubviews={virtualizationConfig.removeClippedSubviews}
        windowSize={virtualizationConfig.windowSize}
        maxToRenderPerBatch={virtualizationConfig.maxToRenderPerBatch}
        updateCellsBatchingPeriod={LIST_VIRTUALIZATION_CONFIG.updateCellsBatchingPeriod}
        initialNumToRender={virtualizationConfig.initialNumToRender}
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        getItemLayout={getItemLayout}
        extraData={currentIndex}
        // Performance optimizations
        maintainVisibleContentPosition={{
          minIndexForVisible: Math.max(0, currentIndex - 5),
        }}
      />
    </View>
  );
});

EnhancedSwipeDeck.displayName = 'EnhancedSwipeDeck';

export default EnhancedSwipeDeck;

