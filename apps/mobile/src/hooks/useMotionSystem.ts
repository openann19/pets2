import { useEffect, useRef, useState } from "react";
import { Easing, Dimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
  type SharedValue,
} from "react-native-reanimated";

// Simplified MotionSystem and Accessibility definitions
const MotionSystem = {
  springs: {
    standard: { tension: 300, friction: 30 },
    gentle: { tension: 120, friction: 14 },
    bouncy: { tension: 180, friction: 12 },
  },
  timings: {
    fast: 200,
    standard: 300,
    slow: 500,
  },
  easings: {
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  },
};

const Accessibility = {
  reduceMotion: false,
  motion: {
    prefersReducedMotion: false,
    reducedMotionConfigs: {
      timings: {
        standard: 300,
      },
    },
  },
};

// Custom hook for spring animations with physics
export const useSpring = (
  initialValue = 0,
  config: keyof typeof MotionSystem.springs = "standard",
) => {
  const animatedValue = useSharedValue(initialValue);

  const animate = (
    toValue: number,
    customConfig?: Partial<{ tension: number; friction: number }>,
  ) => {
    const { prefersReducedMotion } = Accessibility.motion;
    
    if (prefersReducedMotion) {
      animatedValue.value = withTiming(toValue, { duration: 200 });
      return { start: () => {} };
    }

    // Convert Animated.spring config to Reanimated 2 withSpring config
    const springConfig = customConfig
      ? {
          damping: customConfig.friction ?? 15,
          stiffness: customConfig.tension ?? 300,
        }
      : {
          damping: MotionSystem.springs[config].friction,
          stiffness: MotionSystem.springs[config].tension,
        };

    animatedValue.value = withSpring(toValue, springConfig);
    return { start: () => {} };
  };

  return { value: animatedValue, animatedValue, animate };
};

// Hook for transform animations
export const useTransform = (
  initialValue = 0,
  config: keyof typeof MotionSystem.springs = "gentle",
) => {
  const { value, animatedValue, animate } = useSpring(initialValue, config);

  const transforms = useAnimatedStyle(() => ({
    translateX: interpolate(
      animatedValue.value,
      [0, 1],
      [0, 50],
      Extrapolate.CLAMP,
    ),
    translateY: interpolate(
      animatedValue.value,
      [0, 1],
      [0, 20],
      Extrapolate.CLAMP,
    ),
    scale: interpolate(
      animatedValue.value,
      [0, 1],
      [0.8, 1],
      Extrapolate.CLAMP,
    ),
    opacity: interpolate(
      animatedValue.value,
      [0, 1],
      [0, 1],
      Extrapolate.CLAMP,
    ),
  }));

  return { value, animatedValue, animate, transforms };
};

// Hook for staggered animations (like list items appearing one by one)
export const useStaggeredFadeIn = (
  itemCount: number,
  delay = 100,
  config: keyof typeof MotionSystem.springs = "gentle",
) => {
  const animatedValues = useRef(
    Array.from({ length: itemCount }, () => useSharedValue(0)),
  ).current;

  const [values, setValues] = useState(new Array(itemCount).fill(0));

  useEffect(() => {
    animatedValues.forEach((animatedValue, index) => {
      animatedValue.value = withDelay(
        index * delay,
        withSpring(1, {
          damping: MotionSystem.springs[config].friction,
          stiffness: MotionSystem.springs[config].tension,
        }),
      );
      // Update local state for compatibility
      setValues((prev) => {
        const newValues = [...prev];
        newValues[index] = 1;
        return newValues;
      });
    });
  }, [animatedValues, delay, config]);

  const transforms = animatedValues.map((animatedValue) => {
    return useAnimatedStyle(() => ({
      opacity: interpolate(
        animatedValue.value,
        [0, 1],
        [0, 1],
        Extrapolate.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            animatedValue.value,
            [0, 1],
            [20, 0],
            Extrapolate.CLAMP,
          ),
        },
      ],
    }));
  });

  const animate = () => {
    // Start all animations
    animatedValues.forEach((animatedValue, index) => {
      animatedValue.value = withDelay(
        index * delay,
        withSpring(1, {
          damping: MotionSystem.springs[config].friction,
          stiffness: MotionSystem.springs[config].tension,
        }),
      );
    });
    return Promise.resolve();
  };

  return { values, animatedValues, animate, transforms };
};

// Hook for entrance animations with different effects
export const useEntranceAnimation = (
  type: "fadeIn" | "slideIn" | "scaleIn" | "bounceIn" = "slideIn",
  config: keyof typeof MotionSystem.springs = "standard",
) => {
  const { value, animatedValue, animate } = useSpring(0, config);

  const animatedStyle = useAnimatedStyle(() => {
    switch (type) {
      case "slideIn":
        return {
          opacity: interpolate(
            animatedValue.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP,
          ),
          transform: [
            {
              translateY: interpolate(
                animatedValue.value,
                [0, 1],
                [30, 0],
                Extrapolate.CLAMP,
              ),
            },
          ],
        };
      case "scaleIn":
        return {
          opacity: interpolate(
            animatedValue.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP,
          ),
          transform: [
            {
              scale: interpolate(
                animatedValue.value,
                [0, 1],
                [0.8, 1],
                Extrapolate.CLAMP,
              ),
            },
          ],
        };
      case "bounceIn":
        return {
          opacity: interpolate(
            animatedValue.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP,
          ),
          transform: [
            {
              scale: interpolate(
                animatedValue.value,
                [0, 1],
                [0.7, 1],
                Extrapolate.CLAMP,
              ),
            },
          ],
        };
      case "fadeIn":
      default:
        return {
          opacity: interpolate(
            animatedValue.value,
            [0, 1],
            [0, 1],
            Extrapolate.CLAMP,
          ),
          transform: [{ translateY: 0 }],
        };
    }
  });

  const startEntrance = () => {
    return animate(1);
  };

  return {
    value,
    animatedValue,
    animate: startEntrance,
    style: animatedStyle,
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
  const scaleAnim = useSharedValue(0);
  const opacityAnim = useSharedValue(1);

  const startRipple = (callback?: () => void) => {
    scaleAnim.value = withSequence(
      withTiming(2, { duration }),
      withTiming(0, { duration: 0 }),
    );
    opacityAnim.value = withSequence(
      withTiming(1, { duration: 0 }),
      withTiming(0, { duration }),
      withTiming(1, { duration: 0 }),
    );
    // Execute callback after animation completes
    setTimeout(() => callback?.(), duration * 2);
  };

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  return { startRipple, rippleStyle };
};

// Hook for shimmer/glow effects
export const useGlowEffect = (intensity = 1, duration = 2000) => {
  const glowAnim = useSharedValue(0);

  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(intensity, { duration: duration / 2 }),
        withTiming(0, { duration: duration / 2 }),
      ),
      -1,
      false,
    );
  }, [glowAnim, intensity, duration]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: interpolate(
      glowAnim.value,
      [0, 1],
      [0.1, 0.8],
      Extrapolate.CLAMP,
    ),
    shadowRadius: interpolate(
      glowAnim.value,
      [0, 1],
      [4, 16],
      Extrapolate.CLAMP,
    ),
  }));

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
