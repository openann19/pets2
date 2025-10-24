import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Dimensions, Platform } from "react-native";

import { MotionSystem, Accessibility } from "../styles/EnhancedDesignTokens";

// === PROJECT HYPERION: MOTION & ANIMATION HOOKS ===

// Custom hook for spring animations with physics
export const useSpring = (
  initialValue = 0,
  config: keyof typeof MotionSystem.springs = "standard",
) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;
  const [value, setValue] = useState(initialValue);

  // Listen to animation value changes
  useEffect(() => {
    const listener = animatedValue.addListener(({ value: newValue }) => {
      setValue(newValue);
    });
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue]);

  const animate = (
    toValue: number,
    customConfig?: Partial<typeof MotionSystem.springs.standard>,
  ) => {
    const springConfig = {
      ...MotionSystem.springs[config],
      ...customConfig,
      toValue,
      useNativeDriver: true,
    };

    // Check for reduced motion preference
    const { prefersReducedMotion } = Accessibility.motion;
    if (prefersReducedMotion) {
      springConfig.timing =
        Accessibility.motion.reducedMotionConfigs.timings.standard;
    }

    return Animated.spring(animatedValue, springConfig);
  };

  return { value, animatedValue, animate };
};

// Hook for transform animations
export const useTransform = (
  initialValue = 0,
  config: keyof typeof MotionSystem.springs = "gentle",
) => {
  const { value, animatedValue, animate } = useSpring(initialValue, config);

  const transforms = {
    translateX: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 50],
    }),
    translateY: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20],
    }),
    scale: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    }),
    rotate: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    }),
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  return { value, animatedValue, animate, transforms };
};

// Hook for staggered animations (like list items appearing one by one)
export const useStaggeredFadeIn = (
  itemCount: number,
  delay = 100,
  config: keyof typeof MotionSystem.springs = "gentle",
) => {
  const animatedValues = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0)),
  ).current;

  const [values, setValues] = useState(new Array(itemCount).fill(0));

  // Listen to all animation values
  useEffect(() => {
    const listeners = animatedValues.map((animatedValue, index) =>
      animatedValue.addListener(({ value: newValue }) => {
        setValues((prev) => {
          const newValues = [...prev];
          newValues[index] = newValue;
          return newValues;
        });
      }),
    );

    return () => {
      listeners.forEach((listener, index) => {
        animatedValues[index].removeListener(listener);
      });
    };
  }, [animatedValues]);

  const animate = () => {
    const animations = animatedValues.map((animatedValue, index) =>
      Animated.spring(animatedValue, {
        ...MotionSystem.springs[config],
        toValue: 1,
        delay: index * delay,
        useNativeDriver: true,
      }),
    );

    return Animated.stagger(delay, animations);
  };

  const transforms = animatedValues.map((animatedValue, index) => ({
    opacity: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  }));

  return { values, animatedValues, animate, transforms };
};

// Hook for entrance animations with different effects
export const useEntranceAnimation = (
  type: "fadeInUp" | "scaleIn" | "slideInLeft" | "slideInRight" = "fadeInUp",
  config: keyof typeof MotionSystem.springs = "standard",
) => {
  const { value, animatedValue, animate } = useSpring(0, config);

  const getTransform = () => {
    switch (type) {
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
                outputRange: [-50, 0],
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
                outputRange: [50, 0],
              }),
            },
          ],
        };
      default:
        return {
          opacity: animatedValue,
          transform: [{ translateY: 0 }],
        };
    }
  };

  const startEntrance = () => {
    return animate(1);
  };

  return {
    value,
    animatedValue,
    animate: startEntrance,
    style: getTransform(),
  };
};

// Hook for magnetic/touch-following effects
export const useMagneticEffect = (sensitivity = 0.3, maxDistance = 50) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  const handleTouchStart = (
    touchX: number,
    touchY: number,
    centerX: number,
    centerY: number,
  ) => {
    setIsActive(true);
    calculatePosition(touchX, touchY, centerX, centerY);
  };

  const handleTouchMove = (
    touchX: number,
    touchY: number,
    centerX: number,
    centerY: number,
  ) => {
    if (isActive) {
      calculatePosition(touchX, touchY, centerX, centerY);
    }
  };

  const handleTouchEnd = () => {
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
  };

  const calculatePosition = (
    touchX: number,
    touchY: number,
    centerX: number,
    centerY: number,
  ) => {
    const deltaX = touchX - centerX;
    const deltaY = touchY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < maxDistance) {
      setPosition({
        x: deltaX * sensitivity,
        y: deltaY * sensitivity,
      });
    } else {
      // Cap at max distance
      const angle = Math.atan2(deltaY, deltaX);
      setPosition({
        x: Math.cos(angle) * maxDistance * sensitivity,
        y: Math.sin(angle) * maxDistance * sensitivity,
      });
    }
  };

  return {
    position,
    isActive,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};

// Hook for 3D tilt effects using device gyroscope
export const useGyroscopeTilt = (sensitivity = 0.5, maxTilt = 15) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // This would integrate with react-native-sensors or similar
  // For now, we'll simulate with touch-based tilt
  const [isEnabled, setIsEnabled] = useState(false);

  const updateTilt = (deltaX: number, deltaY: number) => {
    if (!isEnabled) return;

    setTilt({
      x: Math.max(-maxTilt, Math.min(maxTilt, deltaX * sensitivity)),
      y: Math.max(-maxTilt, Math.min(maxTilt, deltaY * sensitivity)),
    });
  };

  const resetTilt = () => {
    setTilt({ x: 0, y: 0 });
  };

  const transform = {
    transform: [{ rotateX: `${tilt.y}deg` }, { rotateY: `${-tilt.x}deg` }],
  };

  return {
    tilt,
    isEnabled,
    setIsEnabled,
    updateTilt,
    resetTilt,
    transform,
  };
};

// Hook for ripple effects on press
export const useRippleEffect = (
  duration: number = MotionSystem.timings.standard,
) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const startRipple = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 2,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset for next use
      scaleAnim.setValue(0);
      opacityAnim.setValue(1);
      callback?.();
    });
  };

  const rippleStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return { startRipple, rippleStyle };
};

// Hook for shimmer/glow effects
export const useGlowEffect = (intensity = 1, duration = 2000) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startGlow = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: intensity,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false, // Glow effects need layout
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ).start();
    };

    startGlow();
  }, [glowAnim, intensity, duration]);

  const glowStyle = {
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.8],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 16],
    }),
  };

  return { glowStyle, glowValue: glowAnim };
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (
  triggerPoint = 0.8,
  config: keyof typeof MotionSystem.springs = "gentle",
) => {
  const [isVisible, setIsVisible] = useState(false);
  const { value, animatedValue, animate } = useSpring(0, config);

  const checkVisibility = (
    scrollY: number,
    elementY: number,
    elementHeight: number,
  ) => {
    const windowHeight = Dimensions.get("window").height;
    const triggerY = elementY + elementHeight * triggerPoint;

    if (scrollY + windowHeight > triggerY && !isVisible) {
      setIsVisible(true);
      animate(1);
    } else if (scrollY + windowHeight < triggerY && isVisible) {
      setIsVisible(false);
      animate(0);
    }
  };

  return { isVisible, value, animatedValue, checkVisibility };
};

export default {
  useSpring,
  useTransform,
  useStaggeredFadeIn,
  useEntranceAnimation,
  useMagneticEffect,
  useGyroscopeTilt,
  useRippleEffect,
  useGlowEffect,
  useScrollAnimation,
};
