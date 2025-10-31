/**
 * 🎨 3D Card Component
 * Consumes visualEnhancements2025 config for 3D card effects
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useVisualEnhancements } from '../../hooks/useVisualEnhancements';
import { getSpringConfig } from '../../foundation/motion';

interface ThreeDCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function ThreeDCard({ children, style, onPress }: ThreeDCardProps) {
  const { canUse3DCards, threeDCardsConfig } = useVisualEnhancements();

  const rotationX = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const scale = useSharedValue(1);

  const tiltDegrees = threeDCardsConfig?.tiltDegrees ?? 10;
  const depthShadow = threeDCardsConfig?.depthShadow ?? false;

  // Gesture handler
  const pan = Gesture.Pan()
    .onChange((event) => {
      if (!canUse3DCards) return;

      const { translationX, translationY } = event;
      const screenWidth = 400; // TODO: Get from Dimensions
      const screenHeight = 800;

      // Calculate rotation based on pan position
      rotationY.value = (translationX / screenWidth) * tiltDegrees;
      rotationX.value = (-translationY / screenHeight) * tiltDegrees;
    })
    .onEnd(() => {
      if (!canUse3DCards) return;

      // Spring back to center
      const springConfig = getSpringConfig('gentle');
      rotationX.value = withSpring(0, springConfig);
      rotationY.value = withSpring(0, springConfig);
      scale.value = withSpring(1, springConfig);
    });

  const animatedStyle = useAnimatedStyle(() => {
    if (!canUse3DCards) {
      return {};
    }

    const perspective = 1000;
    const rotateX = `${rotationX.value}deg`;
    const rotateY = `${rotationY.value}deg`;

    return {
      transform: [
        { perspective },
        { rotateX },
        { rotateY },
        { scale: scale.value },
      ],
      // Depth shadow if enabled
      shadowColor: depthShadow ? '#000' : undefined,
      shadowOffset: depthShadow
        ? {
            width: rotationY.value * 2,
            height: rotationX.value * 2,
          }
        : undefined,
      shadowOpacity: depthShadow ? 0.3 + Math.abs(rotationY.value) * 0.1 : undefined,
      shadowRadius: depthShadow ? 10 + Math.abs(rotationY.value) : undefined,
    };
  });

  if (!canUse3DCards) {
    // Fallback to regular card
    return <View style={[styles.card, style]}>{children}</View>;
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, style, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
});

