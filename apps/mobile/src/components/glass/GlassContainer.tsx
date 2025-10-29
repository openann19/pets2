import React, { type ReactNode } from 'react';
import { View, type ViewStyle, type ViewProps, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

import { BorderRadius, Spacing } from '../../animation';
import { BLUR_CONFIGS, TRANSPARENCY_CONFIGS, BORDER_CONFIGS, SHADOW_CONFIGS } from './configs';

/**
 * GlassContainer Component
 * Base glass morphism container with blur, transparency, borders, and shadows
 */

interface GlassContainerProps extends ViewProps {
  children: ReactNode;
  intensity?: keyof typeof BLUR_CONFIGS;
  transparency?: keyof typeof TRANSPARENCY_CONFIGS;
  border?: keyof typeof BORDER_CONFIGS;
  shadow?: keyof typeof SHADOW_CONFIGS;
  borderRadius?: keyof typeof BorderRadius;
  animated?: boolean;
  hover?: boolean;
  style?: ViewStyle;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  intensity = 'medium',
  transparency = 'medium',
  border = 'light',
  shadow = 'medium',
  borderRadius = '2xl',
  animated = false,
  hover = false,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (hover) {
      scale.value = withSpring(0.98);
      opacity.value = withSpring(0.9);
    }
  };

  const handlePressOut = () => {
    if (hover) {
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
    }
  };

  // Convert BorderRadius string value to number for Animated
  const getBorderRadiusValue = (key: keyof typeof BorderRadius): number => {
    const value = BorderRadius[key];
    // Remove 'px', 'rem', etc. and convert to number
    const numeric = parseFloat(value.replace('px', '').replace('rem', ''));
    return isNaN(numeric) ? 0 : numeric;
  };

  const glassStyle: ViewStyle = {
    borderRadius: getBorderRadiusValue(borderRadius),
    overflow: 'hidden',
    ...BORDER_CONFIGS[border],
    ...SHADOW_CONFIGS[shadow],
    ...style,
  };

  const gradientColors = [
    `rgba(255, 255, 255, ${TRANSPARENCY_CONFIGS[transparency]})`,
    `rgba(255, 255, 255, ${TRANSPARENCY_CONFIGS[transparency] * 0.5})`,
  ];

  return (
    <Animated.View
      style={StyleSheet.flatten([glassStyle, animated ? animatedStyle : undefined])}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      {...props}
    >
      <BlurView
        intensity={BLUR_CONFIGS[intensity]}
        style={{
          flex: 1,
          borderRadius: getBorderRadiusValue(borderRadius),
        }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: getBorderRadiusValue(borderRadius),
            padding: Spacing.lg,
          }}
        >
          {children}
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

export default GlassContainer;
