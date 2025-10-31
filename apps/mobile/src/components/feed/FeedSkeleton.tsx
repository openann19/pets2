/**
 * Feed Skeleton Loading Component
 * Phase 2: Enhanced Loading States
 * 
 * Professional skeleton screens for feed loading with:
 * - Animated shimmer effects
 * - Progressive image loading placeholders
 * - Smooth animations
 * - Accessible loading indicators
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@mobile/theme';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { Skeleton } from '../common/LoadingSkeleton';
import { SWIPE_DECK_LAYOUT } from '@/constants/performance';

export interface FeedSkeletonProps {
  /** Number of skeleton cards to show */
  cardCount?: number;
  /** Show image placeholder */
  showImage?: boolean;
  /** Show text content placeholders */
  showText?: boolean;
  /** Custom test ID */
  testID?: string;
}

/**
 * Feed Skeleton Component
 * 
 * Shows animated skeleton placeholders for feed cards
 * matching the exact dimensions and layout of actual cards
 */
export function FeedSkeleton({
  cardCount = 3,
  showImage = true,
  showText = true,
  testID = 'feed-skeleton',
}: FeedSkeletonProps): React.JSX.Element {
  const theme = useTheme();
  const reducedMotion = useReduceMotion();
  const cardWidth = SWIPE_DECK_LAYOUT.cardWidth;
  const cardHeight = cardWidth * SWIPE_DECK_LAYOUT.cardHeightRatio;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.lg,
        },
        cardWrapper: {
          width: cardWidth,
          height: cardHeight,
          borderRadius: theme.radii['4xl'],
          backgroundColor: theme.colors.surface,
          marginBottom: SWIPE_DECK_LAYOUT.stackOffset,
          shadowColor: theme.colors.shadow,
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 16 },
          shadowRadius: 24,
          elevation: 16,
          overflow: 'hidden',
        },
        imagePlaceholder: {
          width: '100%',
          height: '60%',
          backgroundColor: theme.colors.border,
        },
        contentContainer: {
          padding: theme.spacing.lg,
          paddingTop: theme.spacing.md,
        },
        headerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        namePlaceholder: {
          flex: 1,
          marginRight: theme.spacing.md,
        },
        badgePlaceholder: {
          width: 60,
          height: 24,
        },
        textRow: {
          marginBottom: theme.spacing.sm,
        },
        tagsContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginTop: theme.spacing.sm,
        },
        tagPlaceholder: {
          width: 80,
          height: 24,
          marginRight: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
          borderRadius: theme.radii.full,
        },
      }),
    [theme, cardWidth, cardHeight],
  );

  return (
    <View style={styles.container} testID={testID} accessibilityRole="progressbar" accessibilityLabel="Loading feed">
      {Array.from({ length: cardCount }).map((_, index) => {
        const translateY = index * SWIPE_DECK_LAYOUT.stackOffset;
        const scale = Math.max(0.9, 1 - index * 0.04);
        const opacity = Math.max(0, 1 - index * 0.2);

        return (
          <View
            key={index}
            style={[
              styles.cardWrapper,
              {
                transform: [{ translateY }, { scale }],
                opacity,
                zIndex: cardCount - index,
                position: 'absolute',
              } satisfies ViewStyle,
            ]}
            accessibilityLabel={`Loading card ${index + 1}`}
          >
            {showImage && <Skeleton width="100%" height="60%" borderRadius={0} style={styles.imagePlaceholder} />}
            {showText && (
              <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                  <View style={styles.namePlaceholder}>
                    <Skeleton width="70%" height={20} />
                  </View>
                  <Skeleton width={60} height={24} borderRadius={theme.radii.full} style={styles.badgePlaceholder} />
                </View>
                <View style={styles.textRow}>
                  <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
                  <Skeleton width="85%" height={14} style={{ marginBottom: 8 }} />
                  <Skeleton width="60%" height={14} />
                </View>
                <View style={styles.tagsContainer}>
                  <Skeleton width={80} height={24} borderRadius={theme.radii.full} style={styles.tagPlaceholder} />
                  <Skeleton width={80} height={24} borderRadius={theme.radii.full} style={styles.tagPlaceholder} />
                  <Skeleton width={80} height={24} borderRadius={theme.radii.full} style={styles.tagPlaceholder} />
                </View>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

/**
 * Progressive Image Skeleton
 * 
 * Shows progressive loading for images with blur-up effect
 */
export function ProgressiveImageSkeleton({
  width = '100%',
  height = 200,
  borderRadius = 0,
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
}): React.JSX.Element {
  const theme = useTheme();
  const reducedMotion = useReduceMotion();
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    if (!reducedMotion) {
      shimmer.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    }
  }, [reducedMotion, shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return {
        opacity: 0.6,
      };
    }

    const opacity = 0.4 + (shimmer.value * 0.4);
    return {
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.border,
        },
        animatedStyle,
      ]}
      accessibilityLabel="Loading image"
      accessibilityRole="image"
    />
  );
}

/**
 * Feed Loading State Component
 * 
 * Full-screen loading state for feed initialization
 */
export function FeedLoadingState({
  message = 'Finding matches...',
  showSkeletons = true,
}: {
  message?: string;
  showSkeletons?: boolean;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.bg,
      }}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading feed"
    >
      {showSkeletons ? (
        <FeedSkeleton cardCount={2} />
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Skeleton width={64} height={64} borderRadius={32} style={{ marginBottom: 16 }} />
          <Skeleton width={200} height={16} style={{ marginTop: 8 }} />
        </View>
      )}
    </View>
  );
}

