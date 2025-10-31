import type { Pet } from '@pawfectmatch/core';
import React, { useCallback, useMemo, useRef } from 'react';
import { FlatList, InteractionManager, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  IMAGE_PREFETCH_CONFIG,
  LIST_VIRTUALIZATION_CONFIG,
  SWIPE_DECK_LAYOUT,
} from '@/constants/performance';
import { preloadRemoteImages } from '@/services/AssetPreloader';
import { extractPetImageUrls, extractPetTags } from '@/utils/pet-media';
import type { AppTheme } from '@mobile/theme';
import { useTheme } from '@mobile/theme';
import { logger } from '@pawfectmatch/core';
import ModernSwipeCard from '../ModernSwipeCard';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Pet>);

type SwipeDeckProps = {
  pets: Pet[];
  currentIndex: number;
  onSwipeLeft: (pet: Pet) => void;
  onSwipeRight: (pet: Pet) => void;
  onSwipeUp: (pet: Pet) => void;
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
  const tags = extractPetTags(pet);
  // Use type guards for optional properties
  const description = (pet as Pet & { description?: string }).description ??
                     (pet as Pet & { bio?: string }).bio ??
                     (pet as Pet & { summary?: string }).summary ?? '';

  return {
    _id: pet._id ?? (pet as Pet & { id?: string }).id ?? Math.random().toString(36).slice(2),
    name: pet.name ?? (pet as Pet & { displayName?: string }).displayName ?? 'Mystery Pet',
    age: typeof pet.age === 'number' ? pet.age : ((pet as Pet & { ageYears?: number }).ageYears ?? 0),
    breed: pet.breed ?? (pet as Pet & { breedName?: string }).breedName ?? 'Unknown',
    photos,
    bio: description,
    tags,
    distance:
      typeof (pet as Pet & { distance?: number }).distance === 'number'
        ? (pet as Pet & { distance?: number }).distance!
        : ((pet as Pet & { location?: { distance?: number } }).location?.distance ?? 0),
    compatibility:
      typeof (pet as Pet & { compatibility?: number }).compatibility === 'number'
        ? (pet as Pet & { compatibility?: number }).compatibility!
        : Math.round((pet as Pet & { compatibilityScore?: number }).compatibilityScore ?? 85),
    isVerified: Boolean((pet as Pet & { isVerified?: boolean }).isVerified ?? (pet as Pet & { verified?: boolean }).verified),
  };
};

export const SwipeDeck = React.memo(function SwipeDeck({
  pets,
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
}: SwipeDeckProps): React.JSX.Element {
  const theme = useTheme();
  const cardWidth = SWIPE_DECK_LAYOUT.cardWidth;
  const cardHeight = cardWidth * SWIPE_DECK_LAYOUT.cardHeightRatio;
  const styles = useMemo(
    () => createStyles(theme, cardWidth, cardHeight),
    [theme, cardWidth, cardHeight],
  );

  const prefetched = useRef(new Set<string>());

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

  React.useEffect(() => {
    if (pets.length === 0) {
      return;
    }
    schedulePrefetch(currentIndex);
  }, [currentIndex, pets, schedulePrefetch]);

  const keyExtractor = useCallback(
    (item: Pet, index: number) => item._id ?? (item as Pet & { id?: string }).id ?? `pet-${index}`,
    [],
  );

  const getItemLayout = useCallback(
    (_: Pet[] | null | undefined, index: number) => {
      const length = cardHeight + SWIPE_DECK_LAYOUT.stackOffset;
      return { length, offset: length * index, index };
    },
    [cardHeight],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Pet; index: number }) => {
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
              pet={cardModel}
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

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={pets}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal={false}
        scrollEnabled={false}
        removeClippedSubviews={LIST_VIRTUALIZATION_CONFIG.removeClippedSubviews}
        windowSize={LIST_VIRTUALIZATION_CONFIG.windowSize}
        maxToRenderPerBatch={LIST_VIRTUALIZATION_CONFIG.maxToRenderPerBatch}
        updateCellsBatchingPeriod={LIST_VIRTUALIZATION_CONFIG.updateCellsBatchingPeriod}
        initialNumToRender={LIST_VIRTUALIZATION_CONFIG.initialNumToRender}
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        getItemLayout={getItemLayout}
        extraData={currentIndex}
      />
    </View>
  );
});

SwipeDeck.displayName = 'SwipeDeck';

export default SwipeDeck;
