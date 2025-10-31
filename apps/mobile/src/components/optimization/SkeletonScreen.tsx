/**
 * Skeleton Screen Component
 * 
 * Provides skeleton loading states with layout preservation
 * Prevents content layout shift (CLS) during loading
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

interface SkeletonScreenProps {
  /** Number of skeleton items to show */
  itemCount?: number;
  /** Height of each skeleton item */
  itemHeight?: number;
  /** Spacing between items */
  spacing?: number;
  /** Custom style */
  style?: ViewStyle | ViewStyle[];
  /** Whether to show shimmer effect */
  shimmer?: boolean;
}

/**
 * Individual skeleton item with shimmer
 */
function SkeletonItem({
  height,
  shimmer = true,
}: {
  height: number;
  shimmer?: boolean;
}): React.JSX.Element {
  const theme = useTheme();
  const shimmerOpacity = useSharedValue(0.3);

  React.useEffect(() => {
    if (shimmer) {
      shimmerOpacity.value = withRepeat(
        withTiming(0.7, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }
  }, [shimmer, shimmerOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: shimmer ? shimmerOpacity.value : 0.3,
  }));

  return (
    <Animated.View
      style={[
        {
          height,
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radii.md,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Skeleton screen with layout preservation
 */
export function SkeletonScreen({
  itemCount = 5,
  itemHeight = 100,
  spacing = 16,
  style,
  shimmer = true,
}: SkeletonScreenProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }, style]}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <View key={index} style={{ marginBottom: spacing }}>
          <SkeletonItem height={itemHeight} shimmer={shimmer} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

/**
 * Specific skeleton variants for common screens
 */
export function ListSkeletonScreen(): React.JSX.Element {
  return <SkeletonScreen itemCount={8} itemHeight={120} />;
}

export function CardSkeletonScreen(): React.JSX.Element {
  return <SkeletonScreen itemCount={4} itemHeight={200} spacing={20} />;
}

export function ChatSkeletonScreen(): React.JSX.Element {
  return <SkeletonScreen itemCount={10} itemHeight={60} spacing={8} />;
}
