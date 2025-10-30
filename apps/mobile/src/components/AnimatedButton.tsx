import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { AccessibilityInfo, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
// import { animationConfig } from '@pawfectmatch/core';
import { logger } from '../services/logger';

interface AnimatedButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  disabled?: boolean;
  hapticFeedback?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'menuitem';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  children,
  style,
  textStyle,
  disabled = false,
  hapticFeedback = true,
  variant = 'primary',
  size = 'md',
  loading = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Get animation configuration (fallback values)
  const buttonConfig = useMemo(
    () => ({
      pressScale: 0.95,
      bounceScale: 1.02,
      springDamping: 15,
      springStiffness: 200,
      rotationDegrees: 2,
      loadingAnimation: true,
      hapticFeedback: true,
      enabled: true,
    }),
    [],
  );
  const mobileConfig = {
    hapticFeedback: true,
  };
  const isEnabled = Boolean(buttonConfig.enabled);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then(setReduceMotion)
      .catch(() => {
        setReduceMotion(false);
      });
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => {
      // Handle subscription cleanup - type cast needed for RN compatibility
      if (sub && typeof (sub as { remove?: () => void }).remove === 'function') {
        (sub as { remove: () => void }).remove();
      }
    };
  }, []);

  const triggerHaptic = useCallback(() => {
    if (hapticFeedback && buttonConfig.hapticFeedback && mobileConfig.hapticFeedback && Haptics) {
      Haptics.impactAsync(
        variant === 'danger'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light,
      ).catch((error: unknown) => {
        logger.error('AnimatedButton haptic error', {
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });
    }
  }, [hapticFeedback, variant, buttonConfig.hapticFeedback, mobileConfig.hapticFeedback]);

  const handlePress = useCallback((): void => {
    if (disabled || loading) return;

    // Trigger haptic feedback
    runOnJS(triggerHaptic)();

    if (reduceMotion || !isEnabled) {
      // Minimal feedback only
      scale.value = withTiming(buttonConfig.pressScale, { duration: 80 });
      scale.value = withTiming(1, { duration: 80 });
    } else {
      // Enhanced button press animation with rotation
      scale.value = withSequence(
        withSpring(buttonConfig.pressScale, {
          damping: buttonConfig.springDamping,
          stiffness: buttonConfig.springStiffness,
        }),
        withSpring(buttonConfig.bounceScale, {
          damping: buttonConfig.springDamping * 0.8,
          stiffness: buttonConfig.springStiffness * 0.7,
        }),
        withSpring(1, {
          damping: buttonConfig.springDamping * 1.2,
          stiffness: buttonConfig.springStiffness * 0.8,
        }),
      );

      // Subtle rotation for playful effect
      rotation.value = withSequence(
        withTiming(-buttonConfig.rotationDegrees, { duration: 50 }),
        withTiming(buttonConfig.rotationDegrees, { duration: 100 }),
        withTiming(0, { duration: 50 }),
      );

      // Shimmer effect on press (if enabled)
      if (buttonConfig.loadingAnimation) {
        shimmer.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        );
      }
    }

    onPress();
  }, [
    disabled,
    loading,
    onPress,
    scale,
    rotation,
    shimmer,
    triggerHaptic,
    reduceMotion,
    isEnabled,
    buttonConfig,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    // 2025 Standard: Dynamic shadow depth
    const shadowOpacity = interpolate(
      scale.value,
      [buttonConfig.pressScale, 1, buttonConfig.bounceScale],
      [0.15, 0.25, 0.35],
      Extrapolate.CLAMP,
    );

    const shadowRadius = interpolate(
      scale.value,
      [buttonConfig.pressScale, 1, buttonConfig.bounceScale],
      [6, 8, 12],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
      opacity: disabled ? 0.5 : opacity.value,
      shadowOpacity,
      shadowRadius,
    };
  });

  // Loading spinner animation
  useEffect(() => {
    if (loading && !reduceMotion) {
      rotation.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(0, { duration: 0 }),
      );
    }
  }, [loading, rotation, reduceMotion]);

  const variantStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    ghost: styles.ghostButton,
    danger: styles.dangerButton,
  };

  const sizeStyles = {
    sm: styles.smallButton,
    md: styles.mediumButton,
    lg: styles.largeButton,
  };

  return (
    <Animated.View
      style={StyleSheet.flatten([
        animatedStyle,
        styles.shadow,
        Platform.OS === 'android' && {
          elevation: interpolate(scale.value, [0.92, 1, 1.02], [2, 4, 6]) as unknown as number,
        },
      ])}
    >
      <TouchableOpacity
        style={StyleSheet.flatten([
          styles.button,
          variantStyles[variant],
          sizeStyles[size],
          style,
          disabled && styles.disabled,
        ])}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        {typeof children === 'string' ? (
          <Text
            style={StyleSheet.flatten([styles.text, textStyle, disabled && styles.disabledText])}
          >
            {loading ? '...' : children}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF6B9D',
  },
  secondaryButton: {
    backgroundColor: '#6366F1',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  dangerButton: {
    backgroundColor: 'Theme.colors.status.error',
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mediumButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  largeButton: {
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'Theme.colors.neutral[0]',
  },
  shadow: {
    shadowColor: 'Theme.colors.neutral[950]',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default AnimatedButton;
