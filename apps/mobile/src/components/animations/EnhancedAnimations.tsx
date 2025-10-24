import React, { useRef, useEffect } from "react";
import type { ViewStyle, TextStyle } from "react-native";
import { Animated, Easing, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Enhanced Animation Hooks and Components

export const useSpringAnimation = (initialValue = 0, config = {}) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animate = (toValue: number, customConfig = {}) => {
    return Animated.spring(animatedValue, {
      toValue,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
      ...config,
      ...customConfig,
    });
  };

  return { animatedValue, animate };
};

export const useSequenceAnimation = () => {
  const createSequence = (animations: Animated.CompositeAnimation[]) => {
    return Animated.sequence(animations);
  };

  const createStagger = (
    animations: Animated.CompositeAnimation[],
    delay = 100,
  ) => {
    return Animated.stagger(delay, animations);
  };

  return { createSequence, createStagger };
};

export const usePulseAnimation = (duration = 1000) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [duration]);

  return pulseAnim;
};

export const useFloatingAnimation = (amplitude = 10, duration = 2000) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    float.start();

    return () => {
      float.stop();
    };
  }, [duration]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -amplitude],
  });

  return { translateY };
};

export const useShimmerAnimation = (duration = 1500) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    shimmer.start();

    return () => {
      shimmer.stop();
    };
  }, [duration]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  return { translateX, shimmerAnim };
};

export const useParallaxAnimation = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const createParallaxStyle = (speed = 0.5, offset = 0): ViewStyle => ({
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, 1],
          outputRange: [offset, offset + speed],
          extrapolate: "extend",
        }),
      },
    ],
  });

  return { scrollY, createParallaxStyle };
};

// Enhanced Animation Components

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  duration = 500,
  delay = 0,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, delay]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = "right",
  duration = 500,
  delay = 0,
  distance = 50,
  style,
}) => {
  const slideAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, delay]);

  const getTransform = () => {
    switch (direction) {
      case "left":
        return [
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -distance],
            }),
          },
        ];
      case "right":
        return [
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, distance],
            }),
          },
        ];
      case "up":
        return [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -distance],
            }),
          },
        ];
      case "down":
        return [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, distance],
            }),
          },
        ];
      default:
        return [];
    }
  };

  return (
    <Animated.View style={[style, { transform: getTransform() }]}>
      {children}
    </Animated.View>
  );
};

interface ScaleInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
  style?: ViewStyle;
}

export const ScaleInView: React.FC<ScaleInViewProps> = ({
  children,
  duration = 500,
  delay = 0,
  initialScale = 0.8,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(initialScale)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, delay, initialScale]);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      {children}
    </Animated.View>
  );
};

interface RotateInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  initialRotation?: string;
  style?: ViewStyle;
}

export const RotateInView: React.FC<RotateInViewProps> = ({
  children,
  duration = 500,
  delay = 0,
  initialRotation = "180deg",
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, delay]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [initialRotation, "0deg"],
  });

  return (
    <Animated.View style={[style, { transform: [{ rotate: rotation }] }]}>
      {children}
    </Animated.View>
  );
};

interface TypewriterTextProps {
  text: string;
  duration?: number;
  delay?: number;
  style?: TextStyle;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  duration = 1000,
  delay = 0,
  style,
  onComplete,
}) => {
  const [displayText, setDisplayText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => {
            if (prev >= text.length - 1) {
              clearInterval(interval);
              onComplete?.();
              return prev;
            }
            return prev + 1;
          });
        }, duration / text.length);

        return () => {
          clearInterval(interval);
        };
      }
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [text, duration, delay, currentIndex]);

  useEffect(() => {
    setDisplayText(text.substring(0, currentIndex + 1));
  }, [currentIndex, text]);

  return (
    <Animated.Text style={style}>
      {displayText}
      {currentIndex < text.length && (
        <Animated.Text style={[style, { opacity: usePulseAnimation(500) }]}>
          |
        </Animated.Text>
      )}
    </Animated.Text>
  );
};

// Custom Easing Functions
export const customEasing = {
  // Bouncy entrance
  bounceIn: Easing.out(Easing.back(2)),

  // Smooth elastic
  elastic: Easing.elastic(2),

  // Custom bezier curves
  smoothInOut: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  quickOut: Easing.bezier(0.25, 0.46, 0.45, 0.94),

  // Physics-based
  spring: (tension = 100, friction = 8) =>
    Easing.out(Easing.poly(tension / 100)),
};

// Animation Presets
export const animationPresets = {
  // Message entrance
  messageSlideIn: {
    duration: 300,
    easing: customEasing.smoothInOut,
    useNativeDriver: true,
  },

  // Button press
  buttonPress: {
    duration: 150,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  },

  // Modal entrance
  modalSlideUp: {
    duration: 400,
    easing: customEasing.bounceIn,
    useNativeDriver: true,
  },

  // Loading spinner
  loadingSpin: {
    duration: 1000,
    easing: Easing.linear,
    useNativeDriver: true,
  },
};

// Gesture-based animations
export const createSwipeAnimation = (
  gestureState: any,
  screenWidth: number,
  onSwipeComplete?: (direction: "left" | "right") => void,
) => {
  const translateX = new Animated.Value(0);
  const opacity = new Animated.Value(1);

  const handleSwipe = () => {
    const { dx, vx } = gestureState;
    const threshold = screenWidth * 0.3;
    const velocity = Math.abs(vx) > 0.5;

    if (Math.abs(dx) > threshold || velocity) {
      const direction = dx > 0 ? "right" : "left";
      const toValue = direction === "right" ? screenWidth : -screenWidth;

      Animated.parallel([
        Animated.timing(translateX, {
          toValue,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onSwipeComplete?.(direction);
      });
    } else {
      // Snap back
      Animated.spring(translateX, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  };

  return {
    translateX,
    opacity,
    handleSwipe,
    style: {
      transform: [{ translateX }],
      opacity,
    },
  };
};

export default {
  useSpringAnimation,
  useSequenceAnimation,
  usePulseAnimation,
  useFloatingAnimation,
  useShimmerAnimation,
  useParallaxAnimation,
  FadeInView,
  SlideInView,
  ScaleInView,
  RotateInView,
  TypewriterText,
  customEasing,
  animationPresets,
  createSwipeAnimation,
};
