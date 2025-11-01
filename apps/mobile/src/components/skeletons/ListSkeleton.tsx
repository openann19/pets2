/**
 * Skeleton Components
 * Loading placeholders for lists, cards, and avatars
 *
 * Features:
 * - Semantic token-based styling
 * - Fade-in animation (≤200ms)
 * - No layout shift on show/hide
 * - Proper accessibility labels
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

export interface SkeletonBaseProps {
  /**
   * Width of skeleton
   */
  width?: number | string;

  /**
   * Height of skeleton
   */
  height?: number;

  /**
   * Border radius (uses theme.radii by default)
   */
  radius?: number;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Delay before showing (ms)
   */
  delay?: number;

  /**
   * Animation duration (ms, default: 200)
   */
  duration?: number;
}

/**
 * Base skeleton component with fade-in animation
 */
function SkeletonBase({
  width = '100%',
  height = 20,
  radius,
  style,
  delay = 0,
  duration = 200,
}: SkeletonBaseProps): React.JSX.Element {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (delay > 0 && !mountedRef.current) {
      const timer = setTimeout(() => {
        mountedRef.current = true;
        opacity.value = withTiming(1, {
          duration,
          easing: Easing.out(Easing.ease),
        });
      }, delay);

      return () => clearTimeout(timer);
    } else if (!mountedRef.current) {
      mountedRef.current = true;
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.ease),
      });
    }
    return undefined;
  }, [delay, duration, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const defaultRadius = radius ?? 12;
  const skeletonColor = theme.colors.bg;

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: defaultRadius,
          backgroundColor: skeletonColor,
        },
        animatedStyle,
        style,
      ]}
      accessibilityRole="none"
      accessibilityLabel="Loading"
    />
  );
}

/**
 * List Skeleton
 * For use in FlatList or ScrollView
 */
export interface ListSkeletonProps {
  /**
   * Number of items to render
   */
  count?: number;

  /**
   * Item height (default: 80)
   */
  itemHeight?: number;

  /**
   * Spacing between items
   */
  spacing?: number;

  /**
   * Stagger delay between items (ms)
   */
  staggerDelay?: number;
}

export function ListSkeleton({
  count = 5,
  itemHeight = 80,
  spacing = 12,
  staggerDelay = 50,
}: ListSkeletonProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.listItem,
            {
              marginBottom: index < count - 1 ? spacing : 0,
              paddingHorizontal: theme.spacing.md,
            },
          ]}
        >
          <SkeletonBase
            width={48}
            height={48}
            radius={theme.radii.full}
            delay={index * staggerDelay}
            style={styles.avatar}
          />
          <View style={styles.listContent}>
            <SkeletonBase
              width="70%"
              height={16}
              delay={index * staggerDelay}
              style={styles.title}
            />
            <SkeletonBase
              width="50%"
              height={14}
              delay={index * staggerDelay + staggerDelay / 2}
              style={styles.subtitle}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Card Skeleton
 * For use in grid or card layouts
 */
export interface CardSkeletonProps {
  /**
   * Number of cards to render
   */
  count?: number;

  /**
   * Card height (default: 240)
   */
  cardHeight?: number;

  /**
   * Image height ratio (0-1, default: 0.65)
   */
  imageRatio?: number;

  /**
   * Stagger delay between cards (ms)
   */
  staggerDelay?: number;
}

export function CardSkeleton({
  count = 3,
  cardHeight = 240,
  imageRatio = 0.65,
  staggerDelay = 80,
}: CardSkeletonProps): React.JSX.Element {
  const theme = useTheme();
  const imageHeight = cardHeight * imageRatio;
  const contentHeight = cardHeight - imageHeight;

  return (
    <View style={styles.cardContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.card,
            {
              height: cardHeight,
              borderRadius: theme.radii.lg,
              marginBottom: theme.spacing.md,
            },
          ]}
        >
          <SkeletonBase
            width="100%"
            height={imageHeight}
            radius={theme.radii.lg}
            delay={index * staggerDelay}
            style={styles.cardImage}
          />
          <View
            style={[
              styles.cardContent,
              {
                padding: theme.spacing.md,
                height: contentHeight,
              },
            ]}
          >
            <SkeletonBase
              width="80%"
              height={18}
              delay={index * staggerDelay + staggerDelay / 2}
              style={styles.cardTitle}
            />
            <SkeletonBase
              width="60%"
              height={14}
              delay={index * staggerDelay + staggerDelay}
              style={styles.cardSubtitle}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Avatar Skeleton
 * For profile pictures and avatars
 */
export interface AvatarSkeletonProps {
  /**
   * Size of avatar (default: 48)
   */
  size?: number;

  /**
   * Delay before showing (ms)
   */
  delay?: number;
}

export function AvatarSkeleton({ size = 48, delay = 0 }: AvatarSkeletonProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <SkeletonBase
      width={size}
      height={size}
      radius={theme.radii.full}
      delay={delay}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    // No extra styles needed
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    overflow: 'hidden',
  },
  cardImage: {
    // No extra styles needed
  },
  cardContent: {
    justifyContent: 'center',
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardSubtitle: {
    // No extra styles needed
  },
});
