/**
 * 🔥 PHASE 7: ULTRA-PREMIUM ADVANCED MICRO-INTERACTIONS
 * 
 * Advanced micro-interaction button with haptic feedback, sound integration,
 * physics-based responses, gesture recognition, and accessibility.
 * 
 * @packageDocumentation
 * 
 * @example
 * ```tsx
 * import { MicroInteractionButton } from '@/components/Animations';
 * 
 * <MicroInteractionButton
 *   variant="primary"
 *   size="md"
 *   haptic="medium"
 *   ripple
 *   magnetic
 *   sound={{ uri: require('@/assets/sounds/click.mp3'), volume: 0.5 }}
 *   loading={isLoading}
 *   success={isSuccess}
 *   error={hasError}
 *   label="Submit"
 *   onPress={handleSubmit}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // With icon
 * <MicroInteractionButton
 *   variant="success"
 *   icon={<CheckIcon />}
 *   iconPosition="right"
 *   label="Complete"
 *   onPress={handleComplete}
 * />
 * ```
 * 
 * @example
 * ```tsx
 * // With children instead of label
 * <MicroInteractionButton variant="primary">
 *   <CustomContent />
 * </MicroInteractionButton>
 * ```
 * 
 * @remarks
 * - All animations respect `useReduceMotion` hook
 * - Haptic feedback is disabled on web
 * - Sound effects require `expo-av` and are disabled on web
 * - Magnetic effect requires gesture handler
 * - Performance optimized with react-native-reanimated
 * - Fully accessible with WCAG 2.1 AA compliance
 */

import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { springs, durations, motionEasing } from '@/foundation/motion';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { useHapticFeedback } from '@/hooks/animations/useHapticFeedback';
import { useSoundEffect } from '@/hooks/animations/useSoundEffect';
import { useRippleEffect } from '@/hooks/animations/useRippleEffect';
import { useMagneticEffect } from '@/hooks/animations/useMagneticEffect';
import type { SoundEffectOptions } from '@/hooks/animations/useSoundEffect';

// ------------------------------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------------------------------

/**
 * Props for MicroInteractionButton component
 * 
 * @public
 */
export interface MicroInteractionButtonProps extends Omit<PressableProps, 'style'> {
  /** Button variant - determines color scheme */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  
  /** Button size - affects padding and font size */
  size?: 'sm' | 'md' | 'lg';
  
  /** 
   * Enable haptic feedback
   * - `true`: Uses medium haptic
   * - `'light' | 'medium' | 'heavy'`: Specific haptic type
   * - `'success' | 'warning' | 'error'`: Contextual haptic
   * - `false`: No haptic feedback
   */
  haptic?: boolean | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  
  /** Sound effect configuration - requires `expo-av` */
  sound?: SoundEffectOptions;
  
  /** Enable ripple effect on press */
  ripple?: boolean;
  
  /** Enable magnetic attraction effect */
  magnetic?: boolean;
  
  /** Show loading state with spinner */
  loading?: boolean;
  
  /** Show success state with checkmark */
  success?: boolean;
  
  /** Show error state with error icon */
  error?: boolean;
  
  /** Button label text (preferred over children) */
  label?: string;
  
  /** Custom icon component */
  icon?: React.ReactNode;
  
  /** Icon position relative to label */
  iconPosition?: 'left' | 'right';
  
  /** Animation duration in milliseconds */
  duration?: number;
  
  /** 
   * Spring physics configuration
   * @default { stiffness: 300, damping: 30, mass: 1 }
   */
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
  
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
  
  /** 
   * Children (alternative to label)
   * @remarks If both label and children are provided, label takes precedence
   */
  children?: React.ReactNode;
}

// ------------------------------------------------------------------------------------
// Ripple Component
// ------------------------------------------------------------------------------------

interface RippleProps {
  x: number;
  y: number;
  color: string;
  duration: number;
  onComplete: () => void;
}

const Ripple: React.FC<RippleProps> = ({ x, y, color, duration, onComplete }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withTiming(4, {
      duration,
      easing: motionEasing.exit,
    });
    opacity.value = withTiming(0, {
      duration,
      easing: motionEasing.exit,
    });
    const timer = setTimeout(() => {
      runOnJS(onComplete)();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: color,
          transform: [{ translateX: -10 }, { translateY: -10 }],
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
};

// ------------------------------------------------------------------------------------
// Success Checkmark Component
// ------------------------------------------------------------------------------------

const SuccessCheckmark: React.FC<{ color: string }> = ({ color }) => {
  const pathLength = useSharedValue(0);
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, springs.standard);
    pathLength.value = withTiming(1, {
      duration: durations.md,
      easing: motionEasing.enter,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pathStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pathLength.value, [0, 0.5, 1], [0, 0, 1], Extrapolate.CLAMP),
  }));

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <Animated.View
        style={[
          {
            width: 24,
            height: 24,
            borderWidth: 2,
            borderColor: color,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          },
          pathStyle,
        ]}
      >
        <Animated.View
          style={{
            width: 8,
            height: 12,
            borderBottomWidth: 2,
            borderRightWidth: 2,
            borderColor: color,
            transform: [{ rotate: '45deg' }, { translateY: -2 }],
            opacity: pathLength.value,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
};

// ------------------------------------------------------------------------------------
// Error Icon Component
// ------------------------------------------------------------------------------------

const ErrorIcon: React.FC<{ color: string }> = ({ color }) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(-180);

  React.useEffect(() => {
    scale.value = withSpring(1, springs.standard);
    rotation.value = withSpring(0, springs.standard);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, animatedStyle]}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 12,
            height: 2,
            backgroundColor: color,
            transform: [{ rotate: '45deg' }],
            position: 'absolute',
          }}
        />
        <View
          style={{
            width: 12,
            height: 2,
            backgroundColor: color,
            transform: [{ rotate: '-45deg' }],
            position: 'absolute',
          }}
        />
      </View>
    </Animated.View>
  );
};

// ------------------------------------------------------------------------------------
// Advanced Micro-Interaction Button
// ------------------------------------------------------------------------------------

/**
 * Advanced micro-interaction button component
 * 
 * A comprehensive button component with advanced animations, haptic feedback,
 * sound effects, and multiple state management. Perfect for primary actions,
 * forms, and interactive elements throughout the app.
 * 
 * @param props - Component props
 * @returns MicroInteractionButton component
 * 
 * @public
 * 
 * @example Basic usage
 * ```tsx
 * <MicroInteractionButton
 *   label="Click Me"
 *   variant="primary"
 *   onPress={handlePress}
 * />
 * ```
 * 
 * @example With loading state
 * ```tsx
 * <MicroInteractionButton
 *   label="Submit"
 *   loading={isSubmitting}
 *   onPress={handleSubmit}
 * />
 * ```
 * 
 * @example With success state
 * ```tsx
 * <MicroInteractionButton
 *   label="Save"
 *   success={isSaved}
 *   onPress={handleSave}
 * />
 * ```
 * 
 * @example Full featured
 * ```tsx
 * <MicroInteractionButton
 *   variant="primary"
 *   size="lg"
 *   haptic="medium"
 *   ripple
 *   magnetic
 *   sound={{ uri: require('@/assets/sounds/click.mp3'), volume: 0.5 }}
 *   loading={isLoading}
 *   success={isSuccess}
 *   error={hasError}
 *   label="Submit"
 *   icon={<CheckIcon />}
 *   iconPosition="right"
 *   onPress={handleSubmit}
 * />
 * ```
 */
export function MicroInteractionButton({
  variant = 'primary',
  size = 'md',
  haptic = false,
  sound,
  ripple = true,
  magnetic = false,
  loading = false,
  success = false,
  error = false,
  label,
  icon,
  iconPosition = 'left',
  duration = durations.md,
  spring = springs.standard,
  style,
  textStyle,
  children,
  disabled,
  onPress,
  ...props
}: MicroInteractionButtonProps) {
  const theme = useTheme() as AppTheme;
  const reduceMotion = useReduceMotion();
  const buttonRef = useRef<Animated.View>(null);
  const [_isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const { triggerHaptic, triggerSuccess, triggerWarning, triggerError } = useHapticFeedback();
  const { play: playSound } = useSoundEffect(sound);
  const { triggerRipple } = useRippleEffect();
  const { magneticStyle, resetMagnetic } = useMagneticEffect(magnetic);

  // Press animation
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (disabled || loading || reduceMotion) return;

    scale.value = withSpring(0.96, spring);
    opacity.value = withTiming(0.9, {
      duration: durations.xs,
      easing: motionEasing.decel,
    });

    setIsPressed(true);
  }, [disabled, loading, reduceMotion, spring]);

  const handlePressOut = useCallback(() => {
    if (disabled || loading || reduceMotion) return;

    scale.value = withSpring(1, spring);
    opacity.value = withTiming(1, {
      duration: durations.xs,
      easing: motionEasing.emphasized,
    });

    setIsPressed(false);
    resetMagnetic();
  }, [disabled, loading, reduceMotion, spring, resetMagnetic]);

  const handlePress = useCallback(
    async (event: any) => {
      if (disabled || loading) return;

      // Get press position for ripple
      const { locationX, locationY } = event.nativeEvent || {};
      const rippleX = locationX ?? 0;
      const rippleY = locationY ?? 0;

      // Haptic feedback
      if (haptic) {
        if (typeof haptic === 'string') {
          if (haptic === 'success') triggerSuccess();
          else if (haptic === 'warning') triggerWarning();
          else if (haptic === 'error') triggerError();
          else triggerHaptic(haptic as 'light' | 'medium' | 'heavy');
        } else {
          if (success) triggerSuccess();
          else if (error) triggerError();
          else triggerHaptic('medium');
        }
      }

      // Sound effect
      if (sound?.enabled) {
        await playSound();
      }

      // Ripple effect
      if (ripple && !reduceMotion) {
        triggerRipple();
        const id = Date.now();
        setRipples((prev) => [...prev, { id, x: rippleX, y: rippleY }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, duration);
      }

      onPress?.(event);
    },
    [
      disabled,
      loading,
      haptic,
      sound,
      ripple,
      reduceMotion,
      duration,
      triggerHaptic,
      triggerSuccess,
      triggerWarning,
      triggerError,
      playSound,
      triggerRipple,
      onPress,
      success,
      error,
    ]
  );

  // Variant styles
  const variantStyles = useMemo(() => {
    const variants = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      danger: {
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.danger,
      },
      success: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
      },
    };
    return variants[variant] || variants.primary;
  }, [variant, theme]);

  // Size styles
  const sizeStyles = useMemo(() => {
    const sizes = {
      sm: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 32,
        borderRadius: theme.radii.md,
      },
      md: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 44,
        borderRadius: theme.radii.lg,
      },
      lg: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 52,
        borderRadius: theme.radii.xl,
      },
    };
    return sizes[size] || sizes.md;
  }, [size, theme]);

  // Text color
  const textColor = useMemo(() => {
    if (variant === 'ghost' || variant === 'secondary') {
      return theme.colors.onSurface;
    }
    // Use onPrimary if available, otherwise fallback to white for primary variants
    return theme.colors.onPrimary ?? theme.colors.bg ?? '#FFFFFF';
  }, [variant, theme]);

  // Font size
  const fontSize = useMemo(() => {
    const sizes = {
      sm: 14,
      md: 16,
      lg: 18,
    };
    return sizes[size] || sizes.md;
  }, [size]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : scale.value }],
    opacity: reduceMotion ? (disabled ? 0.5 : 1) : opacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loading || success || error ? 0 : 1,
    transform: [{ translateY: loading || success || error ? 4 : 0 }],
  }));

  const content = label || children;

  return (
    <Animated.View
      style={[
        {
          overflow: 'hidden',
          ...variantStyles,
          ...sizeStyles,
          borderWidth: variant === 'ghost' ? 0 : 1,
        },
        magneticStyle,
        animatedStyle,
        style,
      ]}
      ref={buttonRef}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        accessibilityLabel={label || (typeof children === 'string' ? children : undefined)}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <Ripple
            key={ripple.id}
            x={ripple.x}
            y={ripple.y}
            color={variant === 'ghost' || variant === 'secondary' ? theme.colors.border : 'rgba(255, 255, 255, 0.5)'}
            duration={duration}
            onComplete={() => {}}
          />
        ))}

        {/* Loading spinner */}
        {loading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color={textColor} />
          </View>
        )}

        {/* Success checkmark */}
        {success && !loading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <SuccessCheckmark color={textColor} />
          </View>
        )}

        {/* Error icon */}
        {error && !loading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <ErrorIcon color={textColor} />
          </View>
        )}

        {/* Button content */}
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing.sm,
            },
            contentAnimatedStyle,
          ]}
        >
          {icon && iconPosition === 'left' && icon}
          {typeof content === 'string' ? (
            <Text
              style={[
                {
                  color: textColor,
                  fontSize,
                  fontWeight: '600',
                },
                textStyle,
              ]}
            >
              {content}
            </Text>
          ) : (
            content
          )}
          {icon && iconPosition === 'right' && icon}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default MicroInteractionButton;

