/**
 * 🎨 Animated Gradient Text Component
 * Consumes visualEnhancements2025 config for typography animations
 */

import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaskedView } from '@react-native-masked-view/masked-view';
import { useVisualEnhancements } from '../../hooks/useVisualEnhancements';

interface AnimatedGradientTextProps {
  children: string;
  variant?: 'primary' | 'secondary' | 'premium' | 'neon' | 'rainbow' | 'holographic';
  style?: TextStyle;
}

const GRADIENT_COLORS = {
  primary: ['#ec4899', '#db2777'],
  secondary: ['#a855f7', '#9333ea'],
  premium: ['#ec4899', '#a855f7', '#3b82f6'],
  neon: ['#f093fb', '#f5576c'],
  rainbow: ['#ff6b6b', '#4ecdc4', '#45b7b8', '#96ceb4', '#ffeaa7'],
  holographic: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
};

export function AnimatedGradientText({
  children,
  variant = 'primary',
  style,
}: AnimatedGradientTextProps) {
  const { canUseTypography, typographyConfig } = useVisualEnhancements();

  const gradientPosition = useSharedValue(0);
  const animationSpeed = typographyConfig?.gradientText?.animationSpeed ?? 1.5;

  React.useEffect(() => {
    if (!canUseTypography) return;

    // Animate gradient position
    gradientPosition.value = withRepeat(
      withTiming(1, {
        duration: 3000 / animationSpeed,
      }),
      -1,
      false,
    );
  }, [canUseTypography, animationSpeed]);

  const animatedGradientStyle = useAnimatedStyle(() => {
    if (!canUseTypography) {
      return {};
    }

    return {
      opacity: 1,
    };
  });

  const gradientColors = GRADIENT_COLORS[variant] || GRADIENT_COLORS.primary;

  if (!canUseTypography) {
    // Fallback to solid color
    return <Text style={[styles.text, style]}>{children}</Text>;
  }

  return (
    <MaskedView
      style={styles.maskedView}
      maskElement={<Text style={[styles.text, style]}>{children}</Text>}
    >
      <Animated.View style={[animatedGradientStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={[styles.text, style, { opacity: 0 }]}>{children}</Text>
        </LinearGradient>
      </Animated.View>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  maskedView: {
    flexDirection: 'row',
    height: 'auto',
  },
  gradient: {
    flex: 1,
  },
  text: {
    fontSize: 16,
  fontWeight: '600',
  },
});

