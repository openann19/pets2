/**
 * LoadingSkeleton Component
 * 
 * Reusable skeleton loading component for consistent loading states across the app.
 * Prevents layout shifts and provides visual feedback during async operations.
 * 
 * Features:
 * - Multiple skeleton types (text, card, list, avatar)
 * - Animated shimmer effect
 * - Accessible loading indicators
 * - Theme-aware styling
 */

import React from 'react';
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

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

/**
 * Base skeleton component with shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  testID,
}: SkeletonProps): React.JSX.Element {
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

    const opacity = 0.5 + (shimmer.value * 0.3);
    return {
      opacity,
    };
  });

  const baseStyle = {
    width,
    height,
    borderRadius,
    backgroundColor: theme.colors.border,
  };

  return (
    <Animated.View
      style={[baseStyle as ViewStyle, animatedStyle, style]}
      testID={testID}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    />
  );
}

/**
 * Text skeleton with customizable lines
 */
export function TextSkeleton({
  lines = 3,
  lineHeight = 16,
  spacing = 8,
  lastLineWidth = '75%',
}: {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: string | number;
}): React.JSX.Element {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          style={{
            marginBottom: index < lines - 1 ? spacing : 0,
          }}
        />
      ))}
    </View>
  );
}

/**
 * Card skeleton for card-based layouts
 */
export function CardSkeleton({
  showAvatar = true,
  lines = 2,
}: {
  showAvatar?: boolean;
  lines?: number;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.lg,
        },
      ]}
    >
      {showAvatar && (
        <View style={styles.cardHeader}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={styles.cardHeaderText}>
            <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      )}
      <TextSkeleton lines={lines} spacing={8} />
    </View>
  );
}

/**
 * List skeleton for list-based layouts
 */
export function ListSkeleton({
  items = 5,
  showAvatar = true,
  showSubtitle = true,
}: {
  items?: number;
  showAvatar?: boolean;
  showSubtitle?: boolean;
}): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={styles.listContainer}>
      {Array.from({ length: items }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.listItem,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
              padding: theme.spacing.md,
            },
            index < items - 1 && {
              borderBottomWidth: 1,
            },
          ]}
        >
          {showAvatar && (
            <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
          )}
          <View style={styles.listItemContent}>
            <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
            {showSubtitle && <Skeleton width="50%" height={12} />}
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Avatar skeleton for profile pictures
 */
export function AvatarSkeleton({
  size = 64,
}: {
  size?: number;
}): React.JSX.Element {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
}

const styles = StyleSheet.create({
  textContainer: {
    width: '100%',
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  listContainer: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
  },
});

