/**
 * PROJECT HYPERION: BASE BUTTON COMPONENT
 *
 * Foundational button component that only handles:
 * - Basic press events and styling
 * - Loading and disabled states
 * - Theme-based styling
 * - Accessibility support
 *
 * This follows the Single Responsibility Principle - no visual effects here.
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { forwardRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  type TouchableOpacityProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { springs, durations, motionEasing } from '@/foundation/motion';

// === TYPES ===
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface BaseButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  loading?: boolean | undefined;
  disabled?: boolean | undefined;
  icon?: string | undefined;
  leftIcon?: string | undefined;
  rightIcon?: string | undefined;
  style?: ViewStyle | undefined;
  textStyle?: TextStyle | undefined;
  onPress?: (() => void) | undefined;
  premium?: boolean | undefined;
  haptic?: boolean | undefined;
  glow?: boolean | undefined;
}

// === SIZE CONFIGURATIONS (theme-based) ===
function getSizeConfig(theme: AppTheme, size: ButtonSize) {
  const map = {
    sm: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.body.size - 2,
      borderRadius: theme.radii.md,
      minHeight: 36,
      iconSize: 16,
    },
    md: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.body.size,
      borderRadius: theme.radii.lg,
      minHeight: 44,
      iconSize: 20,
    },
    lg: {
      paddingHorizontal: theme.spacing['2xl'],
      paddingVertical: theme.spacing.lg,
      fontSize: theme.typography.h2.size,
      borderRadius: theme.radii.xl,
      minHeight: 52,
      iconSize: 24,
    },
    xl: {
      paddingHorizontal: theme.spacing['3xl'],
      paddingVertical: theme.spacing.xl,
      fontSize: theme.typography.h1.size,
      borderRadius: theme.radii['2xl'],
      minHeight: 60,
      iconSize: 28,
    },
  } as const;
  return map[size];
}

// === MAIN COMPONENT ===
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const BaseButton = forwardRef<TouchableOpacity, BaseButtonProps>(
  (
    {
      title,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      icon,
      leftIcon,
      rightIcon,
      style,
      textStyle,
      onPress,
      premium = true,
      haptic = true,
      glow = false,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const reducedMotion = useReduceMotion();
    // Map icon to leftIcon for convenience
    const effectiveLeftIcon = icon || leftIcon;
    const sizeConfig = getSizeConfig(theme, size);
    const isDisabled = disabled || loading;

    // Premium animations
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
      const glowValue = glow
        ? interpolate(
            glowOpacity.value,
            [0, 1],
            [0.1, 0.3],
            Extrapolate.CLAMP,
          )
        : 0.1;

      return {
        transform: [{ scale: scale.value }],
        shadowOpacity: glowValue,
        shadowRadius: glowOpacity.value * 12 + 4,
        shadowColor: variant === 'primary' ? theme.colors.primary : theme.colors.border,
        elevation: glowOpacity.value * 8 + 2,
      };
    });

    // Get variant styles
    const getVariantStyles = (): ViewStyle => {
      const baseStyles: ViewStyle = {
        borderRadius: sizeConfig.borderRadius,
        minHeight: sizeConfig.minHeight,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
      };

      switch (variant) {
        case 'primary':
          return {
            ...baseStyles,
            backgroundColor: theme.colors.primary,
            ...(theme.shadows.elevation1 as ViewStyle),
          };
        case 'secondary':
          return {
            ...baseStyles,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...(theme.shadows.elevation1 as ViewStyle),
          };
        case 'ghost':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
          };
        case 'outline':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: theme.colors.primary,
          };
        default:
          return baseStyles;
      }
    };

    // Get text styles
    const getTextStyles = (): TextStyle => {
      const baseTextStyles: TextStyle = {
        fontSize: sizeConfig.fontSize,
        fontWeight: '600',
        textAlign: 'center',
      };

      switch (variant) {
        case 'primary':
        case 'secondary':
          return {
            ...baseTextStyles,
            color: variant === 'primary' ? theme.colors.onPrimary : theme.colors.onSurface,
          };
        case 'ghost':
        case 'outline':
          return {
            ...baseTextStyles,
            color: theme.colors.primary,
          };
        default:
          return {
            ...baseTextStyles,
            color: theme.colors.onSurface,
          };
      }
    };

    // Get icon color
    const getIconColor = (): string => {
      switch (variant) {
        case 'primary':
          return theme.colors.onPrimary;
        case 'secondary':
          return theme.colors.onSurface;
        case 'ghost':
        case 'outline':
          return theme.colors.primary;
        default:
          return theme.colors.onSurface;
      }
    };

    // Handle press with haptics and animations
    const handlePress = () => {
      if (isDisabled) return;
      
      if (haptic && !reducedMotion) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      onPress?.();
    };

    const handlePressIn = () => {
      if (isDisabled || reducedMotion) return;
      
      'worklet';
      scale.value = withSpring(0.96, springs.velocity);
      
      if (glow) {
        glowOpacity.value = withTiming(1, { 
          duration: durations.xs,
          easing: motionEasing.enter,
        });
      }
    };

    const handlePressOut = () => {
      if (isDisabled || reducedMotion) return;
      
      'worklet';
      scale.value = withSpring(1, springs.velocity);
      
      if (glow) {
        glowOpacity.value = withTiming(0, { 
          duration: durations.sm,
          easing: motionEasing.exit,
        });
      }
    };

    // Render content
    const renderContent = () => {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color={getIconColor()}
            />
            <Text style={StyleSheet.flatten([getTextStyles(), { marginLeft: theme.spacing.sm }])}>
              Loading...
            </Text>
          </View>
        );
      }

      return (
        <>
          {effectiveLeftIcon && (
            <Ionicons
              name={effectiveLeftIcon}
              size={sizeConfig.iconSize}
              color={getIconColor()}
              style={{ marginRight: theme.spacing.sm }}
            />
          )}
          <Text style={StyleSheet.flatten([getTextStyles(), textStyle])}>{title}</Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={sizeConfig.iconSize}
              color={getIconColor()}
              style={{ marginLeft: theme.spacing.sm }}
            />
          )}
        </>
      );
    };

    const Container = premium ? AnimatedTouchableOpacity : TouchableOpacity;

    return (
      <Container
        ref={ref as any}
        style={StyleSheet.flatten([
          getVariantStyles(),
          {
            paddingHorizontal: sizeConfig.paddingHorizontal,
            paddingVertical: sizeConfig.paddingVertical,
            opacity: isDisabled ? 0.6 : 1,
          },
          premium ? animatedStyle : undefined,
          style,
        ]) as any}
        onPress={handlePress}
        onPressIn={premium ? handlePressIn : undefined}
        onPressOut={premium ? handlePressOut : undefined}
        disabled={isDisabled}
        activeOpacity={premium ? 1 : 0.8}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        {...props}
      >
        {renderContent()}
      </Container>
    );
  },
);

// === STYLES ===
const styles = StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Display name for debugging
BaseButton.displayName = 'BaseButton';

export default BaseButton;
