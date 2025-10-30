import React, { useEffect, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, View, AccessibilityInfo } from 'react-native';
import Animated, {
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      setReduced(!!v);
    });
  }, []);
  return reduced;
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
        return (
          <Animated.View
            key={index}
            entering={
              reduceMotion
                ? undefined
                : FadeInUp.delay(index * delay)
                    .springify()
                    .damping(25)
                    .stiffness(300)
            }
            style={style}
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
  delay = 0,
  style,
  trigger = true,
}) => {
  const s = useSharedValue(0.3);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (trigger) {
      s.value = withSpring(1, { damping: 10, stiffness: 600, mass: 0.5 });
    }
  }, [trigger]);

  const styleA = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 1 : s.value,
    transform: [{ scale: reduceMotion ? 1 : s.value }],
  }));
  return <Animated.View style={[styleA, style]}>{children}</Animated.View>;
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
      style={style}
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
    opacity.value = withSpring(1, { damping: 10, stiffness: 100 });
    if (animation === 'slide' || animation === 'slideIn') {
      translateY.value = withSpring(0, { damping: 10, stiffness: 100 });
    }
    if (animation === 'scale' || animation === 'scaleIn') {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
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

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
};

export default {
  StaggeredFadeInUpList,
  PhysicsBasedScaleIn,
  PageTransition,
  GestureWrapper,
  ScrollTrigger,
};
