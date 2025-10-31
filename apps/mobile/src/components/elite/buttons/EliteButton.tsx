import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  type AnimatedStyleProp,
} from 'react-native-reanimated';

import { useTheme } from '@mobile/theme';
import { springs, durations, motionEasing } from '@/foundation/motion';
import { BorderRadius, Colors, GlobalStyles, Spacing } from '../../../styles/GlobalStyles';
import { getPremiumGradients } from '../constants/gradients';
import { getPremiumShadows } from '../constants/shadows';

/**
 * EliteButton Component
 * Premium button with multiple variants, sizes, and animation effects
 */

interface EliteButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'holographic' | 'neon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  loading?: boolean;
  gradient?: string[];
  ripple?: boolean;
  glow?: boolean;
  shimmer?: boolean;
  magnetic?: boolean; // Add magnetic effect prop
  pressEffect?: boolean; // Add press effect prop
}

export const EliteButton: React.FC<EliteButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  gradient,
  ripple = true,
  glow = true,
  shimmer = false,
  style,
  onPress,
  disabled,
  ...props
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const shimmerOffset = useSharedValue(-100);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const glowIntensity = useSharedValue(1);

  // Shimmer animation
  useEffect(() => {
    if (shimmer) {
      shimmerOffset.value = withSequence(
        withTiming(100, { 
          duration: durations.lg * 10, // 3200ms for shimmer sweep
          easing: motionEasing.enter,
        }),
        withDelay(durations.lg * 5, withTiming(-100, { duration: 0 })),
      );
    }
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value * 0.4,
    shadowRadius: glowIntensity.value * 20,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, springs.gentle);
    glowIntensity.value = withSpring(1.2, springs.gentle);

    if (ripple) {
      rippleScale.value = 0;
      rippleOpacity.value = 0.6;
      rippleScale.value = withTiming(2, { 
        duration: durations.md,
        easing: motionEasing.enter,
      });
      rippleOpacity.value = withTiming(0, { 
        duration: durations.md,
        easing: motionEasing.exit,
      });
    }

    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.gentle);
    glowIntensity.value = withSpring(1, springs.gentle);
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: Number(BorderRadius['2xl']) || 16,
      overflow: 'hidden',
      position: 'relative',
    };
    const SHADOWS = getPremiumShadows(theme);

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, ...(GlobalStyles.buttonSecondary as ViewStyle) };
      case 'ghost':
        return { ...baseStyle, ...(GlobalStyles.buttonGhost as ViewStyle) };
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
        };
      case 'holographic':
        return { ...baseStyle, ...SHADOWS.holographicGlow };
      case 'neon':
        return { ...baseStyle, ...SHADOWS.neonGlow };
      default:
        return {
          ...baseStyle,
          ...(GlobalStyles.buttonPrimary as ViewStyle),
          ...(glow ? (SHADOWS.primaryGlow as ViewStyle) : ({} as ViewStyle)),
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return GlobalStyles.buttonTextSecondary as ViewStyle;
      case 'ghost':
      case 'glass':
        return { ...(GlobalStyles.buttonTextSecondary as ViewStyle), color: Colors.white };
      case 'holographic':
      case 'neon':
        return {
          ...(GlobalStyles.buttonTextPrimary as ViewStyle),
          color: Colors.white,
          fontWeight: 'bold',
        };
      default:
        return GlobalStyles.buttonTextPrimary as ViewStyle;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          minHeight: 36,
        } as ViewStyle;
      case 'lg':
        return {
          paddingHorizontal: Spacing['3xl'],
          paddingVertical: Spacing.lg,
          minHeight: 56,
        } as ViewStyle;
      case 'xl':
        return {
          paddingHorizontal: Spacing['4xl'],
          paddingVertical: Spacing.xl,
          minHeight: 64,
        } as ViewStyle;
      default:
        return { ...(GlobalStyles.buttonContent as ViewStyle), minHeight: 48 };
    }
  };

  const getGradientColors = (): string[] => {
    if (gradient) return gradient;

    const gradients = getPremiumGradients(theme);

    switch (variant) {
      case 'secondary':
        return [...gradients.secondary];
      case 'glass':
        return [...gradients.glass];
      case 'holographic':
        return [...gradients.holographic];
      case 'neon':
        return [...gradients.neon];
      default:
        return [...gradients.primary];
    }
  };

  const ButtonContent = (
    <View style={[getSizeStyle(), { opacity: (disabled ?? false) ? 0.6 : 1 }] as ViewStyle[]}>
      {loading ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator
            color={
              variant === 'primary' || variant === 'holographic' || variant === 'neon'
                ? Colors.white
                : Colors.primary
            }
            size="small"
          />
          <Text
            style={
              [
                GlobalStyles.buttonText as ViewStyle,
                getTextStyle(),
                { marginLeft: Spacing.sm },
              ] as ViewStyle[]
            }
          >
            Loading...
          </Text>
        </View>
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : size === 'lg' ? 24 : size === 'xl' ? 28 : 20}
              color={
                variant === 'primary' || variant === 'holographic' || variant === 'neon'
                  ? Colors.white
                  : Colors.primary
              }
              style={{ marginRight: Spacing.xs }}
            />
          )}
          <Text style={[GlobalStyles.buttonText as ViewStyle, getTextStyle()] as ViewStyle[]}>
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={animatedStyle as AnimatedStyleProp<ViewStyle>}>
      <TouchableOpacity
        style={[getButtonStyle(), glow ? glowStyle : undefined, style ?? undefined] as ViewStyle[]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled ?? loading}
        {...props}
      >
        {/* Ripple Effect */}
        {ripple && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255,255,255,0.3)',
                marginTop: -50,
                marginLeft: -50,
              } as ViewStyle,
              rippleStyle as AnimatedStyleProp<ViewStyle>,
            ]}
          />
        )}

        {/* Shimmer Effect */}
        {shimmer && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.1)',
              } as ViewStyle,
              shimmerStyle as AnimatedStyleProp<ViewStyle>,
            ]}
          />
        )}

        {/* Gradient Background */}
        <LinearGradient
          colors={getGradientColors()}
          style={{
            borderRadius: Number(BorderRadius['2xl']) || 16,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {ButtonContent}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default EliteButton;
