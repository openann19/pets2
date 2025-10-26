/**
 * 🚀 ADVANCED INTERACTION SYSTEM - MOBILE
 * Professional-grade hover effects, micro-interactions, and API integrations
 * Enterprise-level implementation with full TypeScript support
 */

import { BlurView } from "expo-blur";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useCallback, useEffect } from "react";
import type { ViewStyle, TextStyle } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
  AccessibilityInfo,
} from "react-native";

// Lazy load dimensions to avoid issues in test environment
const getScreenDimensions = () => {
  try {
    return Dimensions.get("window");
  } catch (error) {
    // Fallback for test environment
    return { width: 375, height: 812 };
  }
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getScreenDimensions();

// Advanced Animation Configuration
const ANIMATION_CONFIG = {
  spring: {
    tension: 300,
    friction: 10,
    useNativeDriver: true,
  },
  timing: {
    duration: 200,
    useNativeDriver: true,
  },
  bounce: {
    tension: 400,
    friction: 3,
    useNativeDriver: true,
  },
  elastic: {
    tension: 200,
    friction: 4,
    useNativeDriver: true,
  },
};

// Haptic Feedback Patterns
const HAPTIC_PATTERNS = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  selection: 0, // Using light impact as fallback since SelectionFeedbackStyle not available
  notification: Haptics.NotificationFeedbackType.Success,
};

// Advanced Button Variants
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "glass"
  | "neon"
  | "holographic"
  | "gradient"
  | "minimal"
  | "premium";

export type InteractionType =
  | "hover"
  | "press"
  | "longPress"
  | "swipe"
  | "tilt"
  | "glow"
  | "bounce"
  | "elastic";

export type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface AdvancedButtonProps {
  title?: string;
  icon?: string;
  variant?: ButtonVariant;
  size?: Size;
  interactions?: InteractionType[];
  haptic?: keyof typeof HAPTIC_PATTERNS;
  onPress?: () => void | Promise<void>;
  onLongPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
  apiAction?: () => Promise<any>;
  glowColor?: string;
  gradientColors?: string[];
  blurIntensity?: number;
}

function AdvancedButtonComponent({
  title,
  icon,
  variant = "primary",
  size = "md",
  interactions = ["hover", "press"],
  haptic = "medium",
  onPress,
  onLongPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  children,
  apiAction,
  glowColor = "#ec4899",
  gradientColors = ["#ec4899", "#db2777"],
  blurIntensity = 20,
}: AdvancedButtonProps): React.JSX.Element {
  // Animation Values
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const elevation = useRef(new Animated.Value(4)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;

  // State
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  // Check accessibility settings
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsAccessibilityEnabled);
  }, []);

  // Haptic Feedback
  const triggerHaptic = useCallback(
    async (type: keyof typeof HAPTIC_PATTERNS = haptic) => {
      if (disabled || isAccessibilityEnabled) return;

      try {
        switch (type) {
          case "light":
          case "medium":
          case "heavy":
            await Haptics.impactAsync(HAPTIC_PATTERNS[type]);
            break;
          case "selection":
            await Haptics.selectionAsync();
            break;
          case "notification":
            await Haptics.notificationAsync(HAPTIC_PATTERNS[type]);
            break;
        }
      } catch (error) {
        logger.debug("Haptic feedback not available");
      }
    },
    [disabled, isAccessibilityEnabled, haptic],
  );

  // Advanced Press Animation
  const animatePress = useCallback(
    (pressed: boolean) => {
      if (disabled || loading || isLoading) return;

      setIsPressed(pressed);

      const animations: Animated.CompositeAnimation[] = [];

      if (interactions.includes("press")) {
        animations.push(
          Animated.spring(scale, {
            toValue: pressed ? 0.95 : 1,
            ...ANIMATION_CONFIG.spring,
          }),
        );
      }

      if (interactions.includes("glow")) {
        animations.push(
          Animated.timing(glow, {
            toValue: pressed ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
          }),
        );
      }

      if (interactions.includes("bounce")) {
        animations.push(
          Animated.spring(elevation, {
            toValue: pressed ? 12 : 4,
            ...ANIMATION_CONFIG.bounce,
          }),
        );
      }

      if (animations.length > 0) {
        Animated.parallel(animations).start();
      }

      if (pressed) {
        triggerHaptic("light");
      }
    },
    [
      disabled,
      loading,
      isLoading,
      interactions,
      scale,
      glow,
      elevation,
      triggerHaptic,
    ],
  );

  // Hover Animation
  const animateHover = useCallback(
    (hovered: boolean) => {
      if (disabled || loading || isLoading) return;

      setIsHovered(hovered);

      const animations: Animated.CompositeAnimation[] = [];

      if (interactions.includes("hover")) {
        animations.push(
          Animated.spring(scale, {
            toValue: hovered ? 1.05 : 1,
            ...ANIMATION_CONFIG.spring,
          }),
        );
      }

      if (interactions.includes("glow")) {
        animations.push(
          Animated.timing(glow, {
            toValue: hovered ? 0.5 : 0,
            duration: 300,
            useNativeDriver: false,
          }),
        );
      }

      if (animations.length > 0) {
        Animated.parallel(animations).start();
      }
    },
    [disabled, loading, isLoading, interactions, scale, glow],
  );

  // Tilt Animation with PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () =>
        interactions.includes("tilt") && !disabled,
      onPanResponderGrant: () => {
        triggerHaptic("light");
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!interactions.includes("tilt")) return;

        const { dx, dy } = gestureState;
        const maxTilt = 10;

        const tiltXValue = Math.max(
          -maxTilt,
          Math.min(maxTilt, (dy / 100) * maxTilt),
        );
        const tiltYValue = Math.max(
          -maxTilt,
          Math.min(maxTilt, -(dx / 100) * maxTilt),
        );

        tiltX.setValue(tiltXValue);
        tiltY.setValue(tiltYValue);
      },
      onPanResponderRelease: () => {
        if (!interactions.includes("tilt")) return;

        Animated.parallel([
          Animated.spring(tiltX, {
            toValue: 0,
            ...ANIMATION_CONFIG.spring,
          }),
          Animated.spring(tiltY, {
            toValue: 0,
            ...ANIMATION_CONFIG.spring,
          }),
        ]).start();
      },
    }),
  ).current;

  // Handle Press
  const handlePress = useCallback(async () => {
    if (disabled || loading || isLoading) return;

    setIsLoading(true);
    triggerHaptic("medium");

    try {
      if (apiAction) {
        await apiAction();
      }
      if (onPress) {
        await onPress();
      }
    } catch (error) {
      logger.error("Button action failed:", { error });
      triggerHaptic("notification");
    } finally {
      setIsLoading(false);
    }
  }, [disabled, loading, isLoading, apiAction, onPress, triggerHaptic]);

  // Handle Long Press
  const handleLongPress = useCallback(async () => {
    if (disabled || loading || isLoading) return;

    triggerHaptic("heavy");

    if (onLongPress) {
      await onLongPress();
    }
  }, [disabled, loading, isLoading, onLongPress, triggerHaptic]);

  // Get Variant Styles
  const getVariantStyles = useCallback(() => {
    const baseStyles = {
      borderRadius: 12,
      overflow: "hidden" as const,
    };

    switch (variant) {
      case "glass":
        return {
          ...baseStyles,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        };
      case "neon":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: glowColor,
        };
      case "holographic":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
        };
      case "gradient":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
        };
      case "minimal":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: "#e5e7eb",
        };
      case "premium":
        return {
          ...baseStyles,
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(139, 92, 246, 0.3)",
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: "#ec4899",
        };
    }
  }, [variant, glowColor]);

  // Get Size Styles
  const getSizeStyles = useCallback(() => {
    switch (size) {
      case "xs":
        return { paddingHorizontal: 8, paddingVertical: 4, minHeight: 28 };
      case "sm":
        return { paddingHorizontal: 12, paddingVertical: 6, minHeight: 36 };
      case "md":
        return { paddingHorizontal: 16, paddingVertical: 8, minHeight: 44 };
      case "lg":
        return { paddingHorizontal: 20, paddingVertical: 12, minHeight: 52 };
      case "xl":
        return { paddingHorizontal: 24, paddingVertical: 16, minHeight: 60 };
      default:
        return { paddingHorizontal: 16, paddingVertical: 8, minHeight: 44 };
    }
  }, [size]);

  // Render Content
  const renderContent = () => {
    if (children) return children;

    return (
      <View style={styles.contentContainer}>
        {icon && (
          <Text
            style={[
              styles.icon,
              textStyle,
              { fontSize: getSizeStyles().minHeight * 0.4 },
            ]}
          >
            {icon}
          </Text>
        )}
        {title && (
          <Text
            style={[
              styles.title,
              textStyle,
              { fontSize: getSizeStyles().minHeight * 0.35 },
            ]}
          >
            {title}
          </Text>
        )}
      </View>
    );
  };

  // Render Button
  const renderButton = () => {
    const buttonStyle = [
      getVariantStyles(),
      getSizeStyles(),
      style,
      {
        transform: [
          { scale },
          {
            rotateX: tiltX.interpolate({
              inputRange: [-10, 10],
              outputRange: ["-10deg", "10deg"],
            }),
          },
          {
            rotateY: tiltY.interpolate({
              inputRange: [-10, 10],
              outputRange: ["-10deg", "10deg"],
            }),
          },
        ],
        opacity: disabled ? 0.6 : opacity,
        elevation,
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: glow.interpolate({
          inputRange: [0, 1],
          outputRange: [0.1, 0.3],
        }),
        shadowRadius: glow.interpolate({
          inputRange: [0, 1],
          outputRange: [4, 12],
        }),
      },
    ];

    const content = (
      <Animated.View style={buttonStyle}>
        {/* Glow Overlay */}
        {interactions.includes("glow") && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: glowColor,
                opacity: glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.2],
                }),
                borderRadius: getVariantStyles().borderRadius,
              },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Gradient Background */}
        {variant === "gradient" && (
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {/* Holographic Effect */}
        {variant === "holographic" && (
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.1)",
              "rgba(255,255,255,0.05)",
              "rgba(255,255,255,0.1)",
            ]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {/* Blur Background */}
        {(variant === "glass" || variant === "premium") && (
          <BlurView
            intensity={blurIntensity}
            style={StyleSheet.absoluteFillObject}
          />
        )}

        {/* Content */}
        {renderContent()}

        {/* Loading Overlay */}
        {(loading || isLoading) && (
          <View style={styles.loadingOverlay}>
            <Animated.View
              style={[
                styles.loadingSpinner,
                {
                  transform: [
                    {
                      rotate: rotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        )}
      </Animated.View>
    );

    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={() => {
          animatePress(true);
        }}
        onPressOut={() => {
          animatePress(false);
        }}
        disabled={disabled || loading || isLoading}
        activeOpacity={0.9}
        {...(interactions.includes("tilt") ? panResponder.panHandlers : {})}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={
          disabled ? "Button is disabled" : "Double tap to activate"
        }
      >
        {content}
      </TouchableOpacity>
    );
  };

  // Start loading animation
  useEffect(() => {
    if (loading || isLoading) {
      const rotationAnimation = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      );
      rotationAnimation.start();

      return () => {
        rotationAnimation.stop();
      };
    }
  }, [loading, isLoading, rotation]);

  return renderButton();
}

export const AdvancedButton = AdvancedButtonComponent;

// Advanced Card Component
interface AdvancedCardProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  interactions?: InteractionType[];
  haptic?: keyof typeof HAPTIC_PATTERNS;
  onPress?: () => void | Promise<void>;
  disabled?: boolean;
  style?: ViewStyle;
  glowColor?: string;
  gradientColors?: string[];
  blurIntensity?: number;
  padding?: Size;
}

export function AdvancedCard({
  children,
  variant = "primary",
  interactions = ["hover", "press"],
  haptic = "light",
  onPress,
  disabled = false,
  style,
  glowColor = "#ec4899",
  gradientColors = ["#ec4899", "#db2777"],
  blurIntensity = 20,
  padding = "md",
}: AdvancedCardProps): React.JSX.Element {
  // Reuse AdvancedButton logic for card
  return (
    <AdvancedButton
      variant={variant}
      interactions={interactions}
      haptic={haptic}
      onPress={onPress}
      disabled={disabled}
      style={style}
      glowColor={glowColor}
      gradientColors={gradientColors}
      blurIntensity={blurIntensity}
    >
      <View style={[styles.cardContent, { padding: getPaddingValue(padding) }]}>
        {children}
      </View>
    </AdvancedButton>
  );
}

// Helper Functions
const getPaddingValue = (size: Size): number => {
  switch (size) {
    case "xs":
      return 4;
    case "sm":
      return 8;
    case "md":
      return 16;
    case "lg":
      return 24;
    case "xl":
      return 32;
    default:
      return 16;
  }
};

// Styles
const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
    color: "#fff",
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#fff",
    borderTopColor: "transparent",
    borderRadius: 10,
  },
  cardContent: {
    flex: 1,
  },
});

export default AdvancedButton;
