/**
 * Interactive Component v2
 * Ultra micro-interactions: unified press behavior with scale, shadow soften, haptics
 * 
 * Features:
 * - Token-driven: durations/easings from theme.motion
 * - Variants: subtle, lift, ghost
 * - Spring animations (emphasized easing)
 * - Haptic mapping: light/medium/success/false
 * - Respects reduced motion (disables scale/shadow)
 * - Platform-aware (Android ripple optional)
 * - A11y-safe
 * 
 * PressIn: scale to 0.98 in 180–220ms, shadow soften one step
 * PressOut: spring back to 1.00 with emphasized easing
 */

import React from 'react';
import { Pressable, type PressableProps, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme';
import { motion, getEasingArray, getSpringConfig } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type InteractiveVariant = 'subtle' | 'lift' | 'ghost';
export type HapticType = 'light' | 'medium' | 'success' | false;

export interface InteractiveProps extends PressableProps {
  /**
   * Variant style
   * - subtle: Default press feedback (0.98 scale)
   * - lift: Slight elevation on hover (1.02 scale)
   * - ghost: Minimal feedback (opacity only)
   */
  variant?: InteractiveVariant;
  
  /**
   * Haptic feedback type
   * - 'light': Tab switch, FAB tap, card tap
   * - 'medium': Primary confirm
   * - 'success': Success morph, premium unlock
   * - false: No haptic (destructive previews, navigation-only)
   */
  haptic?: HapticType;
  
  /**
   * Disable all motion effects (for reduce motion or manual override)
   */
  disabledMotion?: boolean;
  
  /**
   * Additional animated style
   */
  animatedStyle?: ReturnType<typeof useAnimatedStyle>;
}

/**
 * Interactive v2 - Ultra micro-interactions wrapper
 * 
 * Token-driven, spring-animated press feedback with haptic mapping
 * 
 * Usage:
 * ```tsx
 * <Interactive variant="lift" haptic="medium" onPress={handlePress}>
 *   <Card>...</Card>
 * </Interactive>
 * ```
 */
export function Interactive({
  children,
  variant = 'subtle',
  haptic = 'light',
  disabledMotion = false,
  animatedStyle,
  style,
  disabled,
  ...pressableProps
}: InteractiveProps): React.JSX.Element {
  const theme = useTheme();
  const reducedMotion = useReduceMotion();
  const guards = useMotionGuards();
  
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Determine scale targets based on variant
  const getScaleTargets = (): { pressed: number; normal: number } => {
    switch (variant) {
      case 'lift':
        return { pressed: motion.scale.pressed, normal: motion.scale.lift };
      case 'ghost':
        return { pressed: 1, normal: 1 }; // No scale, opacity only
      case 'subtle':
      default:
        return { pressed: motion.scale.pressed, normal: 1 };
    }
  };
  
  const scaleTargets = getScaleTargets();
  const shouldAnimate = !disabledMotion && !reducedMotion && !disabled;
  const springConfig = getSpringConfig('standard');
  
  // Initialize scale based on variant
  React.useEffect(() => {
    if (variant === 'lift' && shouldAnimate) {
      scale.value = motion.scale.lift;
    } else {
      scale.value = scaleTargets.normal;
    }
  }, [variant, shouldAnimate]);
  
  const animatedStyles = useAnimatedStyle(() => {
    const baseStyle: Record<string, unknown> = {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
    
    // Shadow opacity reduction (only for subtle/lift variants)
    if (shouldAnimate && variant !== 'ghost') {
      const elevationValue = Platform.OS === 'android' 
        ? Math.max(0, ((theme.shadows?.elevation2 as any)?.['elevation'] ?? 0) * shadowOpacity.value)
        : undefined;
      
      if (Platform.OS === 'android' && elevationValue !== undefined) {
        baseStyle['elevation'] = elevationValue;
      } else {
        baseStyle['shadowOpacity'] = shadowOpacity.value;
      }
    }
    
    return baseStyle;
  }, [theme.shadows, shouldAnimate, variant]);
  
  const handlePressIn = (e: any) => {
    if (shouldAnimate) {
      // PressIn: scale to pressed state with timing
      scale.value = withTiming(
        scaleTargets.pressed,
        {
          duration: guards.getAdaptiveDuration(motion.duration.fast),
          easing: getEasingArray('standard'),
        }
      );
      
      // Shadow soften one step
      if (variant !== 'ghost') {
        shadowOpacity.value = withTiming(0.7, {
          duration: motion.duration.fast,
        });
      }
      
      // Ghost variant: opacity only
      if (variant === 'ghost') {
        opacity.value = withTiming(motion.opacity.pressed, {
          duration: motion.duration.fast,
        });
      }
    }
    
    // Haptic feedback mapping
    if (haptic !== false) {
      if (haptic === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else if (haptic === 'medium') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }
    
    pressableProps.onPressIn?.(e);
  };
  
  const handlePressOut = (e: any) => {
    if (shouldAnimate) {
      // PressOut: spring back with emphasized easing
      scale.value = withSpring(
        scaleTargets.normal,
        {
          ...springConfig,
          damping: springConfig.damping * 1.1, // Slightly more bounce
        }
      );
      
      // Shadow restore
      if (variant !== 'ghost') {
        shadowOpacity.value = withTiming(1, {
          duration: motion.duration.base,
          easing: getEasingArray('emphasized'),
        });
      }
      
      // Ghost variant: opacity restore
      if (variant === 'ghost') {
        opacity.value = withTiming(1, {
          duration: motion.duration.base,
          easing: getEasingArray('emphasized'),
        });
      }
    }
    
    pressableProps.onPressOut?.(e);
  };
  
  // Disabled state: reduce opacity
  React.useEffect(() => {
    if (disabled) {
      opacity.value = withTiming(motion.opacity.disabled, {
        duration: motion.duration.fast,
      });
    } else {
      opacity.value = withTiming(1, {
        duration: motion.duration.fast,
      });
    }
  }, [disabled]);
  
  const combinedStyle = [
    animatedStyles,
    animatedStyle,
    style,
  ];
  
  return (
    <AnimatedPressable
      {...pressableProps}
      disabled={disabled}
      style={combinedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {children}
    </AnimatedPressable>
  );
}

