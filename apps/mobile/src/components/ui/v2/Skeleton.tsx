import React, { useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  variant?: 'rect' | 'circle';
  radius?: number;
  style?: any;
}

export function Skeleton({
  width = '100%',
  height = 20,
  variant = 'rect',
  radius,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const borderRadius =
    radius || (variant === 'circle' ? height / 2 : theme.radius.sm);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.bgAlt,
          opacity,
        },
        style,
      ]}
      accessibilityRole="none"
      accessibilityLabel="Loading"
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});
