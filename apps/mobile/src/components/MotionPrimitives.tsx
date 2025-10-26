import React, { useEffect, useRef } from "react";
import type { ViewStyle, FlatListProps } from "react-native";
import { StyleSheet } from "react-native";
import { View, Animated, ScrollView, FlatList } from "react-native";
import { Theme } from "../theme/unified-theme";

// === PROJECT HYPERION: MOTION & ANIMATION PRIMITIVES ===
const MotionSystem = Theme.motion;

// Staggered FadeInUp List Component
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
  const animatedValues = useRef(
    children.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((animatedValue, index) =>
      Animated.spring(animatedValue, {
        damping: 25,
        stiffness: 300,
        mass: 1,
        toValue: 1,
        delay: index * delay,
        useNativeDriver: true,
      }),
    );

    Animated.stagger(delay, animations).start();
  }, [animatedValues, delay]);

  return (
    <View style={StyleSheet.flatten([containerStyle])}>
      {children.map((child, index) => {
        const animatedValue = animatedValues[index];
        return (
          <Animated.View
            key={index}
            style={StyleSheet.flatten([
              {
                opacity: animatedValue,
                transform: [
                  {
                    translateY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
              style,
            ])}
          >
            {child}
          </Animated.View>
        );
      })}
    </View>
  );
};

// Physics-Based ScaleIn Component
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
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      Animated.spring(animatedValue, {
        damping: 10,
        stiffness: 600,
        mass: 0.5,
        toValue: 1,
        delay,
        useNativeDriver: true,
      }).start();
    }
  }, [animatedValue, delay, trigger]);

  return (
    <Animated.View
      style={StyleSheet.flatten([
        {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ],
        },
        style,
      ])}
    >
      {children}
    </Animated.View>
  );
};

// Seamless PageTransition Component
interface PageTransitionProps {
  children: React.ReactNode;
  type?: "fade" | "slideLeft" | "slideRight" | "scale" | "sharedElement";
  duration?: number;
  style?: ViewStyle;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = "fade",
  duration = 300,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      useNativeDriver: true,
    }).start();
  }, [animatedValue, duration]);

  const getTransitionStyle = () => {
    switch (type) {
      case "fade":
        return {
          opacity: animatedValue,
        };

      case "slideLeft":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };

      case "slideRight":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };

      case "scale":
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        };

      case "sharedElement":
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        };

      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  return (
    <Animated.View style={StyleSheet.flatten([getTransitionStyle(), style])}>
      {children}
    </Animated.View>
  );
};

// GestureWrapper Higher-Order Component
interface GestureWrapperProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
  style?: ViewStyle;
}

export const GestureWrapper: React.FC<GestureWrapperProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onRotate,
  style,
}) => {
  // This would integrate with react-native-gesture-handler
  // For now, returning a basic wrapper
  return <View style={style}>{children}</View>;
};

// Enhanced FlatList with Staggered Animations
interface AnimatedFlatListProps<T> extends FlatListProps<T> {
  animationType?: "staggered" | "fadeIn" | "slideIn" | "none";
  animationDelay?: number;
}

export function AnimatedFlatList<T>({
  animationType = "staggered",
  animationDelay = 100,
  ...props
}: AnimatedFlatListProps<T>) {
  const animatedValues = useRef<Map<number, Animated.Value>>(new Map()).current;

  const getAnimatedStyle = (index: number) => {
    if (animationType === "none") return {};

    let animatedValue = animatedValues.get(index);
    if (!animatedValue) {
      animatedValue = new Animated.Value(0);
      animatedValues.set(index, animatedValue);

      // Trigger animation
      Animated.spring(animatedValue, {
        damping: 25,
        stiffness: 300,
        mass: 1,
        toValue: 1,
        delay: index * animationDelay,
        useNativeDriver: true,
      }).start();
    }

    switch (animationType) {
      case "staggered":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        };

      case "fadeIn":
        return {
          opacity: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        };

      case "slideIn":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };

      default:
        return {};
    }
  };

  return (
    <FlatList
      {...props}
      renderItem={(info) => (
        <Animated.View style={getAnimatedStyle(info.index)}>
          {props.renderItem?.(info)}
        </Animated.View>
      )}
    />
  );
}

// Scroll-triggered Animation Container
interface ScrollTriggerProps {
  children: React.ReactNode;
  triggerPoint?: number; // 0-1, where 1 is bottom of screen
  animation?: "fadeInUp" | "scaleIn" | "slideInLeft" | "slideInRight";
  delay?: number;
  style?: ViewStyle;
}

export const ScrollTrigger: React.FC<ScrollTriggerProps> = ({
  children,
  triggerPoint = 0.8,
  animation = "fadeInUp",
  delay = 0,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  // This would integrate with scroll position
  // For now, trigger immediately
  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(animatedValue, {
          damping: 20,
          stiffness: 400,
          mass: 0.8,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animatedValue, delay]);

  const getAnimationStyle = () => {
    switch (animation) {
      case "fadeInUp":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };

      case "scaleIn":
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };

      case "slideInLeft":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            },
          ],
        };

      case "slideInRight":
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };

      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  return (
    <Animated.View style={StyleSheet.flatten([getAnimationStyle(), style])}>
      {children}
    </Animated.View>
  );
};

export default {
  StaggeredFadeInUpList,
  PhysicsBasedScaleIn,
  PageTransition,
  GestureWrapper,
  AnimatedFlatList,
  ScrollTrigger,
};
