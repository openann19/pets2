import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { Pet } from '@pawfectmatch/core';
import { FeedCard } from './FeedCard';
import { haptic } from '../../ui/haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Estimated dimensions for virtualization
const CARD_HEIGHT = screenHeight * 0.7;
const CARD_WIDTH = screenWidth * 0.9;
const CARD_MARGIN = 16;

interface VirtualizedFeedProps {
  pets: Pet[];
  onSwipe: (pet: Pet, action: 'like' | 'pass' | 'superlike') => void;
  onCardPress?: (pet: Pet) => void;
  onEndReached?: () => void;
  isLoading?: boolean;
  estimatedItemSize?: number;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: any;
  testID?: string;
}

interface FeedItemProps {
  pet: Pet;
  index: number;
  onSwipe: (pet: Pet, action: 'like' | 'pass' | 'superlike') => void;
  onCardPress?: (pet: Pet) => void;
}

const FeedItem: React.FC<FeedItemProps> = React.memo(({
  pet,
  index,
  onSwipe,
  onCardPress
}) => {

  const handleLike = useCallback(() => {
    haptic.confirm();
    onSwipe(pet, 'like');
  }, [pet, onSwipe]);

  const handlePass = useCallback(() => {
    haptic.tap();
    onSwipe(pet, 'pass');
  }, [pet, onSwipe]);

  const handleSuperlike = useCallback(() => {
    haptic.super();
    onSwipe(pet, 'superlike');
  }, [pet, onSwipe]);

  const handleCardPress = useCallback(() => {
    onCardPress?.(pet);
  }, [pet, onCardPress]);

  return (
    <View
      style={styles.cardContainer}
      testID={`feed-item-${index}`}
    >
      <FeedCard
        pet={pet}
        onLike={handleLike}
        onPass={handlePass}
        onSuperlike={handleSuperlike}
        onPress={handleCardPress}
        style={styles.card}
        testID={`feed-card-${index}`}
      />
    </View>
  );
});

FeedItem.displayName = 'FeedItem';

export const VirtualizedFeed: React.FC<VirtualizedFeedProps> = React.memo(({
  pets,
  onSwipe,
  onCardPress,
  onEndReached,
  isLoading = false,
  estimatedItemSize = CARD_HEIGHT + CARD_MARGIN * 2,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  testID = 'virtualized-feed'
}) => {
  // Memoize data to prevent unnecessary re-renders
  const feedData = useMemo(() => pets, [pets]);

  // Key extractor for FlashList
  const keyExtractor = useCallback((item: Pet, index: number) => {
    return `${item._id || item.id}-${index}`;
  }, []);

  // Render item function
  const renderItem = useCallback(({ item, index }: { item: Pet; index: number }) => {
    return (
      <FeedItem
        pet={item}
        index={index}
        onSwipe={onSwipe}
        {...(onCardPress && { onCardPress })}
      />
    );
  }, [onSwipe, onCardPress]);

  // Handle end reached with debouncing
  const handleEndReached = useCallback(() => {
    if (!isLoading && onEndReached) {
      onEndReached();
    }
  }, [isLoading, onEndReached]);

  // Empty state component
  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      {/* Empty state will be handled by parent component */}
    </View>
  ), []);

  // Loading footer component
  const ListFooterComponent = useMemo(() => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingFooter}>
        {/* Loading indicator will be handled by parent */}
      </View>
    );
  }, [isLoading]);

  const flashListProps = useMemo(() => ({
    data: feedData,
    keyExtractor,
    renderItem,
    estimatedItemSize,
    showsVerticalScrollIndicator,
    onEndReached: handleEndReached,
    onEndReachedThreshold: 0.5,
    ListEmptyComponent,
    ListFooterComponent,
    contentContainerStyle: [
      styles.contentContainer,
      contentContainerStyle
    ],
    // Performance optimizations
    initialNumToRender: 3,
    maxToRenderPerBatch: 5,
    windowSize: 5,
    removeClippedSubviews: Platform.OS === 'android',
    // Accessibility
    accessibilityLabel: 'Pet discovery feed',
    testID,
  }), [
    feedData,
    keyExtractor,
    renderItem,
    estimatedItemSize,
    showsVerticalScrollIndicator,
    handleEndReached,
    ListEmptyComponent,
    ListFooterComponent,
    contentContainerStyle,
    testID
  ]);

  return (
    <View style={styles.container}>
      <FlashList
        {...flashListProps}
      />
    </View>
  );
});

VirtualizedFeed.displayName = 'VirtualizedFeed';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
  },
  cardContainer: {
    alignItems: 'center',
    marginVertical: CARD_MARGIN / 2,
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: screenHeight * 0.5,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default VirtualizedFeed;