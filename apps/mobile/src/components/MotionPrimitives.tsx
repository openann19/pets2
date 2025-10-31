import React, { useEffect, useState } from 'react';
import type { ViewStyle, StyleProp } from 'react-native';
import { StyleSheet, View, AccessibilityInfo } from 'react-native';
import Animated, {
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withSpring,
  interpolate,
  Extrapolate,
  type AnimateStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { springs, fromVelocity, type SpringConfig } from '@/foundation/motion';
import { useReduceMotion } from '@/hooks/useReducedMotion';

// Prefer useReduceMotion hook from foundation
const usePrefersReducedMotion = () => {
  try {
    return useReduceMotion();
  } catch {
    // Fallback if hook not available
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
      AccessibilityInfo.isReduceMotionEnabled().then((v) => {
        setReduced(!!v);
      });
    }, []);
    return reduced;
  }
};

interface StaggeredFadeInUpListProps {
  children: React.ReactNode[];
  delay?: number;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
}

export const StaggeredFadeInUpList: React.FC<StaggeredFadeInUpListProps> = ({
  children,
  delay = 100,
  style,
  containerStyle,
}) => {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <View style={StyleSheet.flatten([containerStyle])}>
      {children.map((child, index) => {
        const enteringAnimation = reduceMotion
          ? undefined
          : FadeInUp.delay(index * delay)
              .springify()
              .damping(springs.standard.damping)
              .stiffness(springs.standard.stiffness);

        return (
          <Animated.View
            key={index}
            {...(enteringAnimation !== undefined && { entering: enteringAnimation })}
            style={style ? [style] : undefined}
          >
            {child}
          </Animated.View>
        );
      })}
    </View>
  );
};

interface PhysicsBasedScaleInProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  trigger?: boolean;
}

export const PhysicsBasedScaleIn: React.FC<PhysicsBasedScaleInProps> = ({
  children,
  delay: _delay = 0,
  style,
  trigger = true,
}) => {
  const s = useSharedValue(0.3);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (trigger) {
      s.value = withSpring(1, springs.snappy);
    }
  }, [trigger]);

  const styleA = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 1 : s.value,
    transform: [{ scale: reduceMotion ? 1 : s.value }],
  }));
  return <Animated.View style={[styleA, ...(style ? [style] : [])] as any}>{children}</Animated.View>;
};

interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slideLeft' | 'slideRight';
  duration?: number;
  style?: ViewStyle;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 300,
  style,
}) => {
  const entering =
    type === 'fade'
      ? FadeInUp.duration(duration)
      : type === 'slideLeft'
        ? SlideInLeft.duration(duration)
        : type === 'slideRight'
          ? SlideInRight.duration(duration)
          : FadeInUp.duration(duration);
  return (
    <Animated.View
      entering={entering}
      style={style as StyleProp<AnimateStyle<ViewStyle>> | undefined}
    >
      {children}
    </Animated.View>
  );
};

interface GestureWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GestureWrapper: React.FC<GestureWrapperProps> = ({ children, style }) => {
  return <View style={style}>{children}</View>;
};

interface ScrollTriggerProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'slideIn' | 'scale' | 'scaleIn';
  triggerPoint?: number;
  style?: ViewStyle;
}

export const ScrollTrigger: React.FC<ScrollTriggerProps> = ({
  children,
  animation = 'fade',
  triggerPoint = 0.8,
  style,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    // Simulate scroll trigger
    opacity.value = withSpring(1, springs.gentle);
    if (animation === 'slide' || animation === 'slideIn') {
      translateY.value = withSpring(0, springs.gentle);
    }
    if (animation === 'scale' || animation === 'scaleIn') {
      scale.value = withSpring(1, springs.gentle);
    }
  }, [triggerPoint, animation]);

  const animatedStyle = useAnimatedStyle(() => {
    if (animation === 'slide' || animation === 'slideIn') {
      return {
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
      };
    }
    if (animation === 'scale' || animation === 'scaleIn') {
      return {
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
      };
    }
    return { opacity: opacity.value };
  });

  return <Animated.View style={[animatedStyle, ...(style ? [style] : [])] as any}>{children}</Animated.View>;
};

// ===== NEW ENHANCED PRIMITIVES (Phase 1) =====

/**
 * Velocity-based scale animation
 * Scales based on gesture velocity for natural feel
 */
interface VelocityBasedScaleProps {
  children: React.ReactNode;
  velocity: SharedValue<number>;
  minScale?: number;
  maxScale?: number;
  enabled?: boolean;
  style?: ViewStyle;
}

export const VelocityBasedScale: React.FC<VelocityBasedScaleProps> = ({
  children,
  velocity,
  minScale = 0.95,
  maxScale = 1.05,
  enabled = true,
  style,
}) => {
  const reduceMotion = usePrefersReducedMotion();
  const scale = useSharedValue(1);
  
  useAnimatedReaction(
    () => velocity.value,
    (v) => {
      if (!enabled || reduceMotion) return;
      const absVelocity = Math.abs(v);
      const targetScale = interpolate(
        absVelocity,
        [0, 1000],
        [1, maxScale],
        Extrapolate.CLAMP
      );
      scale.value = withSpring(targetScale, fromVelocity(absVelocity));
    }
  );
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reduceMotion ? 1 : scale.value }],
  }));
  
  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
};

/**
 * Overshoot spring animation
 * Creates playful bounce with configurable overshoot
 */
interface OvershootSpringProps {
  children: React.ReactNode;
  overshoot?: number; // 0-1, how much overshoot
  trigger?: boolean;
  style?: ViewStyle;
}

export const OvershootSpring: React.FC<OvershootSpringProps> = ({
  children,
  overshoot = 0.2,
  trigger = true,
  style,
}) => {
  const scale = useSharedValue(0.8);
  const reduceMotion = usePrefersReducedMotion();
  
  useEffect(() => {
    if (trigger && !reduceMotion) {
      scale.value = withSpring(
        1,
        {
          ...springs.overshoot,
          overshootClamping: false,
        }
      );
    }
  }, [trigger]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 1 : scale.value,
    transform: [{ scale: reduceMotion ? 1 : scale.value }],
  }));
  
  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
};

/**
 * Enhanced staggered entrance
 * Better performance and more options than StaggeredFadeInUpList
 */
interface StaggeredEntranceProps {
  children: React.ReactNode[];
  delay?: number;
  animation?: 'fade' | 'scale' | 'slide' | 'both';
  springConfig?: SpringConfig;
  style?: ViewStyle;
}

export const StaggeredEntrance: React.FC<StaggeredEntranceProps> = ({
  children,
  delay = 100,
  animation = 'fade',
  springConfig = springs.standard,
  style,
}) => {
  const reduceMotion = usePrefersReducedMotion();
  
  return (
    <>
      {children.map((child, index) => {
        const opacity = useSharedValue(0);
        const scale = useSharedValue(0.9);
        const translateY = useSharedValue(20);
        
        useEffect(() => {
          if (!reduceMotion) {
            opacity.value = withSpring(1, springConfig);
            if (animation === 'scale' || animation === 'both') {
              scale.value = withSpring(1, springConfig);
            }
            if (animation === 'slide' || animation === 'both') {
              translateY.value = withSpring(0, springConfig);
            }
          }
        }, []);
        
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: reduceMotion ? 1 : opacity.value,
          transform: [
            { scale: reduceMotion ? 1 : scale.value },
            { translateY: reduceMotion ? 0 : translateY.value },
          ],
        }));
        
        return (
          <Animated.View key={index} style={[animatedStyle, style]}>
            {child}
          </Animated.View>
        );
      })}
    </>
  );
};

export default {
  StaggeredFadeInUpList,
  PhysicsBasedScaleIn,
  PageTransition,
  GestureWrapper,
  ScrollTrigger,
  VelocityBasedScale,
  OvershootSpring,
  StaggeredEntrance,
};

// Re-export springs from foundation for convenience
export { springs, fromVelocity, type SpringConfig } from '@/foundation/motion';
