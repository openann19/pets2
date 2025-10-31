/**
 * PROJECT HYPERION: UNIFIED FX CONTAINER
 *
 * Single, powerful container component that replaces:
 * - GlassContainer
 * - HolographicContainer
 * - GlowContainer
 * - And other scattered effect containers
 *
 * Features:
 * - Configurable visual effects via props
 * - Performance optimized with proper memoization
 * - Accessibility aware
 * - Consistent with unified design system
 */

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { useMemo, useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyleProp } from 'react-native-reanimated';

import { useGlowAnimation, useEntranceAnimation } from '../../hooks/useUnifiedAnimations';
import { useShimmerEffect } from '../../hooks/usePremiumAnimations';
import { useTheme } from '@/theme';

// === TYPES ===
export type FXContainerType = 'glass' | 'glow' | 'holographic' | 'neon' | 'gradient' | 'default';
export type FXContainerVariant = 'subtle' | 'medium' | 'strong' | 'intense';

export interface FXContainerProps {
  children: ReactNode;
  type?: FXContainerType;
  variant?: FXContainerVariant;
  isAnimated?: boolean;
  hasShimmer?: boolean;
  hasGlow?: boolean;
  hasEntrance?: boolean;
  entranceType?: 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounceIn';
  glowColor?: string;
  glowIntensity?: number;
  shimmerDuration?: number;
  gradientName?: string;
  gradientColors?: string[];
  style?: ViewStyle;
  disabled?: boolean;
}

// === MAIN COMPONENT ===
const FXContainer: React.FC<FXContainerProps> = ({
  children,
  type = 'default',
  variant = 'medium',
  isAnimated = true,
  hasShimmer = false,
  hasGlow = false,
  hasEntrance = false,
  entranceType = 'slideIn',
  glowColor,
  glowIntensity = 1,
  shimmerDuration: _shimmerDuration = 2000,
  gradientName: _gradientName,
  gradientColors,
  style,
  disabled = false,
}) => {
  const theme = useTheme();

  // Get base styles based on type and variant
  const baseStyles = useMemo(() => {
    const styles: ViewStyle = {
      borderRadius: theme.radii.xl,
      overflow: 'hidden',
    };

    switch (type) {
      case 'glass':
        return {
          ...styles,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: `rgba(255, 255, 255, ${variant === 'subtle' ? 0.2 : variant === 'strong' ? 0.4 : 0.3})`,
          ...theme.shadows.elevation2,
        };

      case 'glow':
        return {
          ...styles,
          backgroundColor: theme.colors.bg,
          ...theme.shadows.elevation2,
        };

      case 'holographic':
        return {
          ...styles,
          backgroundColor: 'transparent',
          ...theme.shadows.elevation2,
        };

      case 'neon':
        return {
          ...styles,
          backgroundColor: theme.colors.bg,
          borderWidth: 2,
          borderColor: '#00f5ff',
        };

      case 'gradient':
        return {
          ...styles,
          backgroundColor: 'transparent',
          ...theme.shadows.elevation2,
        };

      default:
        return {
          ...styles,
          backgroundColor: theme.colors.bg,
          ...theme.shadows.elevation1,
        };
    }
  }, [type, variant, theme]);

  // Glow animation
  const { animatedStyle: glowStyle } = useGlowAnimation(
    disabled ? 'transparent' : glowColor || theme.colors.primary,
    disabled ? 0 : glowIntensity,
    2000,
  );

  // Shimmer animation
  const { animatedStyle: shimmerStyle } = useShimmerEffect(!disabled && hasShimmer && isAnimated);

  // Entrance animation
  const { start: startEntrance, animatedStyle: entranceStyle } = useEntranceAnimation(
    entranceType,
    0,
  );

  // Start entrance animation if enabled
  useEffect(() => {
    if (hasEntrance && isAnimated && !disabled) {
      startEntrance();
    }
  }, [hasEntrance, isAnimated, disabled, startEntrance]);

  // Render content with appropriate wrapper
  const renderContent = () => {
    let content = children;

    // Apply shimmer overlay
    if (hasShimmer && isAnimated && !disabled) {
      content = (
        <View style={StyleSheet.absoluteFill}>
          {content}
          <Animated.View
            style={StyleSheet.flatten([
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              shimmerStyle as any,
            ])}
            pointerEvents="none"
          />
        </View>
      );
    }

    // Apply gradient background
    if (type === 'gradient') {
      const fallbackGradient = theme.palette.gradients.primary;
      const colors = gradientColors ?? fallbackGradient;

      content = (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          {content}
        </LinearGradient>
      );
    }

    return content;
  };

  // Main container
  const AnimatedContainer = Animated.View;

  const appliedGlowStyle = (hasGlow && !disabled ? glowStyle : undefined) as
    | AnimatedStyleProp<ViewStyle>
    | undefined;
  const appliedEntranceStyle = (hasEntrance && !disabled ? entranceStyle : undefined) as
    | AnimatedStyleProp<ViewStyle>
    | undefined;

  const animatedContainerStyle: AnimatedStyleProp<ViewStyle>[] = [
    baseStyles as AnimatedStyleProp<ViewStyle>,
    appliedGlowStyle,
    appliedEntranceStyle,
    style as AnimatedStyleProp<ViewStyle>,
  ].filter((value): value is AnimatedStyleProp<ViewStyle> => Boolean(value));

  return isAnimated ? (
    <AnimatedContainer style={animatedContainerStyle}>{renderContent()}</AnimatedContainer>
  ) : (
    <View style={StyleSheet.flatten([baseStyles, style])}>{renderContent()}</View>
  );
};

// === PRESET CONFIGURATIONS ===
export const FXContainerPresets = {
  // Glass morphism container
  glass: (props: Omit<FXContainerProps, 'type'>) => (
    <FXContainer
      {...props}
      type="glass"
    />
  ),

  // Glowing container
  glow: (props: Omit<FXContainerProps, 'type'>) => (
    <FXContainer
      {...props}
      type="glow"
      hasGlow={true}
      glowIntensity={1.5}
    />
  ),

  // Neon container
  neon: (props: Omit<FXContainerProps, 'type'>) => (
    <FXContainer
      {...props}
      type="neon"
      hasGlow={true}
      glowColor="#00f5ff"
      glowIntensity={2}
      hasShimmer={true}
      shimmerDuration={1000}
    />
  ),

  // Premium gradient container
  premium: (props: Omit<FXContainerProps, 'type'>) => (
    <FXContainer
      {...props}
      type="gradient"
      gradientName="primary"
      hasGlow={true}
      hasEntrance={true}
      entranceType="slideIn"
    />
  ),
};

export default FXContainer;
