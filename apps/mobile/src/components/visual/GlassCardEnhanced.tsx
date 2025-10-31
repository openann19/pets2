/**
 * 🎨 Enhanced Glass Card Component
 * Consumes visualEnhancements2025 config for glass morphism effects
 */

import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useVisualEnhancements } from '../../hooks/useVisualEnhancements';
import { useTheme } from '../../theme';
import { durations, motionEasing } from '@/foundation/motion';

interface GlassCardEnhancedProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'light' | 'medium' | 'strong';
}

export function GlassCardEnhanced({
  children,
  style,
  variant = 'medium',
}: GlassCardEnhancedProps) {
  const { canUseGlassMorphism, glassMorphismConfig } = useVisualEnhancements();
  const theme = useTheme();

  const opacity = useSharedValue(glassMorphismConfig?.opacity ?? 0.5);
  const reflectionProgress = useSharedValue(0);

  // Animate reflection if enabled
  React.useEffect(() => {
    if (!canUseGlassMorphism || !glassMorphismConfig?.reflection) return;

    reflectionProgress.value = withRepeat(
      withTiming(1, { 
        duration: durations.lg * 10, // 3200ms for reflection sweep
        easing: motionEasing.enter,
      }),
      -1,
      false,
    );
  }, [canUseGlassMorphism, glassMorphismConfig?.reflection]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!canUseGlassMorphism) return {};

    return {
      opacity: glassMorphismConfig?.animated
        ? opacity.value
        : (glassMorphismConfig?.opacity ?? 0.5),
    };
  });

  const reflectionStyle = useAnimatedStyle(() => {
    if (!canUseGlassMorphism || !glassMorphismConfig?.reflection) {
      return { opacity: 0 };
    }

    const reflectionOpacity = Math.sin(reflectionProgress.value * Math.PI * 2) * 0.3 + 0.2;
    return {
      opacity: reflectionOpacity,
    };
  });

  if (!canUseGlassMorphism) {
    // Fallback to regular card
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>
        {children}
      </View>
    );
  }

  const blurIntensity = glassMorphismConfig?.blurIntensity ?? 20;
  const baseOpacity = glassMorphismConfig?.opacity ?? 0.5;

  const variantStyles = {
    light: { blur: 10, opacity: 0.7 },
    medium: { blur: blurIntensity, opacity: baseOpacity },
    strong: { blur: Math.min(blurIntensity * 1.5, 30), opacity: baseOpacity * 0.7 },
  }[variant];

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={variantStyles.blur}
        style={StyleSheet.absoluteFillObject}
        blurType="light"
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: `rgba(255, 255, 255, ${variantStyles.opacity})`,
          },
          animatedStyle,
        ]}
      />
      {glassMorphismConfig?.reflection && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
            reflectionStyle,
          ]}
        />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  content: {
    padding: 16,
    zIndex: 1,
  },
});

