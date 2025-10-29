import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Props = {
  width?: number;
  height?: number;
  radius?: number;
};

export default function Shimmer({ width = undefined, height = 16, radius = 8 }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    const loop = () => {
      t.value = 0;
      t.value = withTiming(1, { duration: 1100 }, () => {
        loop();
      });
    };
    loop();
  }, []);

  const stripe = useAnimatedStyle(() => ({
    left: `${-50 + 150 * t.value}%` as any,
  }));

  const dynamicStyle = width !== undefined ? { width } : {};

  return (
    <View style={[styles.base, { height, borderRadius: radius }, dynamicStyle]}>
      <Animated.View style={[styles.stripe, stripe]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' },
  stripe: { position: 'absolute', top: 0, bottom: 0, width: '50%' },
});
