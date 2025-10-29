import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { Animated, StyleSheet, View } from 'react-native';

interface ShimmerPlaceholderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  delay?: number;
}

export const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  delay = 0,
}) => {
  const [animatedValue] = useState(() => new Animated.Value(0));
  const [visible, setVisible] = React.useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, delay);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [delay]);

  useEffect(() => {
    if (!visible) return;

    Animated.loop(
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
      ]),
    ).start();
  }, [visible, animatedValue]);

  const translateX = useMemo(
    () =>
      animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [
          typeof width === 'number' ? -width : -100,
          typeof width === 'number' ? width : 100,
        ],
      }),
    [animatedValue, width],
  );

  if (!visible) {
    return null;
  }

  return (
    <View
      // Cast style to any to align with RN style unions
      style={
        [
          styles.container,
          {
            width,
            height,
            borderRadius,
            backgroundColor: '#E5E5E5',
          },
          style as any,
        ] as any
      }
    >
      <Animated.View
        style={
          [
            styles.shimmer,
            {
              transform: [{ translateX: translateX as any }],
            },
          ] as any
        }
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
});

// Preset components
export const ShimmerCard: React.FC<{ delay?: number }> = ({ delay }) => (
  <View style={{ padding: 16 }}>
    <ShimmerPlaceholder
      width={60}
      height={60}
      borderRadius={30}
      delay={delay ?? 0}
    />
    <View style={{ marginTop: 12 }}>
      <ShimmerPlaceholder
        width="80%"
        height={16}
        delay={delay ?? 0}
      />
      <ShimmerPlaceholder
        width="60%"
        height={14}
        style={{ marginTop: 8 }}
        delay={delay ?? 0}
      />
    </View>
  </View>
);

export const ShimmerList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View>
    {Array.from({ length: count }).map((_, index) => (
      <ShimmerCard
        key={index}
        delay={index * 50}
      />
    ))}
  </View>
);
