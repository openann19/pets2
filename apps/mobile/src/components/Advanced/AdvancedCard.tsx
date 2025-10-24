/**
 * 🚀 ADVANCED CARD COMPONENT - MOBILE
 * Professional card with advanced hover effects, micro-interactions, and API integrations
 * Enterprise-level implementation with full TypeScript support
 */

import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useCallback, useEffect } from "react";
import type { ViewStyle, TextStyle } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
} from "react-native";

import { AdvancedButton } from "./AdvancedInteractionSystem";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Card Variants
export type CardVariant =
  | "default"
  | "glass"
  | "gradient"
  | "premium"
  | "minimal"
  | "neon"
  | "holographic"
  | "floating";

export type CardSize = "xs" | "sm" | "md" | "lg" | "xl";

export type CardInteraction =
  | "hover"
  | "press"
  | "longPress"
  | "swipe"
  | "tilt"
  | "glow"
  | "bounce"
  | "elastic";

interface CardAction {
  icon?: string;
  title?: string;
  onPress?: () => void | Promise<void>;
  apiAction?: () => Promise<any>;
  variant?: "primary" | "secondary" | "danger" | "minimal";
  haptic?: "light" | "medium" | "heavy";
  disabled?: boolean;
  loading?: boolean;
}

interface AdvancedCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  variant?: CardVariant;
  size?: CardSize;
  interactions?: CardInteraction[];
  haptic?: "light" | "medium" | "heavy";
  onPress?: () => void | Promise<void>;
  onLongPress?: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  glowColor?: string;
  gradientColors?: string[];
  blurIntensity?: number;
  padding?: CardSize;
  margin?: CardSize;
  actions?: CardAction[];
  badge?: {
    text: string;
    color?: string;
    backgroundColor?: string;
  };
  status?: {
    text: string;
    color?: string;
    backgroundColor?: string;
  };
  apiAction?: () => Promise<any>;
  apiActions?: {
    [key: string]: () => Promise<any>;
  };
}

export const AdvancedCard: React.FC<AdvancedCardProps> = ({
  children,
  title,
  subtitle,
  description,
  image,
  variant = "default",
  size = "md",
  interactions = ["hover", "press"],
  haptic = "light",
  onPress,
  onLongPress,
  disabled = false,
  loading = false,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  glowColor = "#ec4899",
  gradientColors = ["#ec4899", "#db2777"],
  blurIntensity = 20,
  padding = "md",
  margin = "sm",
  actions = [],
  badge,
  status,
  apiActions = {},
}) => {
  // Animation Values
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const elevation = useRef(new Animated.Value(4)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  // State
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Haptic Feedback
  const triggerHaptic = useCallback(
    async (type: "light" | "medium" | "heavy" = haptic) => {
      if (disabled) return;

      try {
        await Haptics.impactAsync(
          type === "light"
            ? Haptics.ImpactFeedbackStyle.Light
            : type === "medium"
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Heavy,
        );
      } catch (error) {
        logger.debug("Haptic feedback not available");
      }
    },
    [disabled, haptic],
  );

  // Press Animation
  const animatePress = useCallback(
    (pressed: boolean) => {
      if (disabled || loading || isLoading) return;

      setIsPressed(pressed);

      const animations: Animated.CompositeAnimation[] = [];

      if (interactions.includes("press")) {
        animations.push(
          Animated.spring(scale, {
            toValue: pressed ? 0.98 : 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
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
            tension: 400,
            friction: 3,
            useNativeDriver: false,
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
            toValue: hovered ? 1.02 : 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
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

  // Handle Press
  const handlePress = useCallback(async () => {
    if (disabled || loading || isLoading) return;

    setIsLoading(true);
    triggerHaptic("medium");

    try {
      if (onPress) {
        await onPress();
      }
    } catch (error) {
      logger.error("Card action failed:", { error });
      triggerHaptic("heavy");
    } finally {
      setIsLoading(false);
    }
  }, [disabled, loading, isLoading, onPress, triggerHaptic]);

  // Handle Long Press
  const handleLongPress = useCallback(async () => {
    if (disabled || loading || isLoading) return;

    triggerHaptic("heavy");

    if (onLongPress) {
      await onLongPress();
    }
  }, [disabled, loading, isLoading, onLongPress, triggerHaptic]);

  // Handle Action Press
  const handleActionPress = useCallback(
    async (action: CardAction) => {
      if (action.disabled || action.loading) return;

      setIsLoading(true);

      try {
        if (action.haptic) {
          await triggerHaptic(action.haptic);
        }

        if (action.apiAction) {
          await action.apiAction();
        }

        if (action.onPress) {
          await action.onPress();
        }

        if (apiActions[action.title || ""]) {
          await apiActions[action.title || ""];
        }
      } catch (error) {
        logger.error("Card action failed:", { error });
        await triggerHaptic("heavy");
      } finally {
        setIsLoading(false);
      }
    },
    [apiActions, triggerHaptic],
  );

  // Get Card Styles
  const getCardStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "#fff",
    };

    switch (variant) {
      case "glass":
        return {
          ...baseStyles,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        };
      case "gradient":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
        };
      case "premium":
        return {
          ...baseStyles,
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(139, 92, 246, 0.3)",
        };
      case "minimal":
        return {
          ...baseStyles,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: "#e5e7eb",
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
      case "floating":
        return {
          ...baseStyles,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
    }
  };

  // Get Size Styles
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "xs":
        return { minHeight: 80 };
      case "sm":
        return { minHeight: 120 };
      case "md":
        return { minHeight: 160 };
      case "lg":
        return { minHeight: 200 };
      case "xl":
        return { minHeight: 240 };
      default:
        return { minHeight: 160 };
    }
  };

  // Get Padding Value
  const getPaddingValue = (size: CardSize): number => {
    switch (size) {
      case "xs":
        return 8;
      case "sm":
        return 12;
      case "md":
        return 16;
      case "lg":
        return 20;
      case "xl":
        return 24;
      default:
        return 16;
    }
  };

  // Get Margin Value
  const getMarginValue = (size: CardSize): number => {
    switch (size) {
      case "xs":
        return 4;
      case "sm":
        return 8;
      case "md":
        return 12;
      case "lg":
        return 16;
      case "xl":
        return 20;
      default:
        return 8;
    }
  };

  // Render Background
  const renderBackground = () => {
    switch (variant) {
      case "glass":
        return (
          <BlurView
            intensity={blurIntensity}
            style={StyleSheet.absoluteFillObject}
          />
        );
      case "gradient":
        return (
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        );
      case "premium":
        return (
          <LinearGradient
            colors={["rgba(139, 92, 246, 0.1)", "rgba(139, 92, 246, 0.05)"]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        );
      case "holographic":
        return (
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
        );
      default:
        return null;
    }
  };

  // Render Content
  const renderContent = () => {
    return (
      <View
        style={[
          styles.content,
          { padding: getPaddingValue(padding) },
          contentStyle,
        ]}
      >
        {/* Badge */}
        {badge && (
          <View
            style={[
              styles.badge,
              { backgroundColor: badge.backgroundColor || "#ef4444" },
            ]}
          >
            <Text style={[styles.badgeText, { color: badge.color || "#fff" }]}>
              {badge.text}
            </Text>
          </View>
        )}

        {/* Status */}
        {status && (
          <View
            style={[
              styles.status,
              { backgroundColor: status.backgroundColor || "#10b981" },
            ]}
          >
            <Text
              style={[styles.statusText, { color: status.color || "#fff" }]}
            >
              {status.text}
            </Text>
          </View>
        )}

        {/* Image */}
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Title */}
        {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}

        {/* Subtitle */}
        {subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        )}

        {/* Description */}
        {description && (
          <Text style={[styles.description, descriptionStyle]}>
            {description}
          </Text>
        )}

        {/* Children */}
        {children}

        {/* Actions */}
        {actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <AdvancedButton
                key={index}
                icon={action.icon}
                title={action.title}
                variant={action.variant || "minimal"}
                size="sm"
                interactions={["hover", "press"]}
                haptic={action.haptic || "light"}
                onPress={() => handleActionPress(action)}
                disabled={action.disabled}
                loading={action.loading}
                style={styles.actionButton}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Start shimmer animation
  useEffect(() => {
    if (loading || isLoading) {
      const shimmerAnimation = Animated.loop(
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      );
      shimmerAnimation.start();

      return () => {
        shimmerAnimation.stop();
      };
    }
  }, [loading, isLoading, shimmer]);

  const cardStyle = [
    getCardStyles(),
    getSizeStyles(),
    {
      margin: getMarginValue(margin),
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
    style,
  ];

  return (
    <Animated.View style={cardStyle}>
      {/* Background */}
      {renderBackground()}

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
              borderRadius: 12,
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Shimmer Overlay */}
      {(loading || isLoading) && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              opacity: shimmer.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Content */}
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
        style={styles.touchable}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Predefined Card Configurations
export const CardConfigs = {
  // Default card
  default: (props: Partial<AdvancedCardProps>) => ({
    variant: "default" as CardVariant,
    interactions: ["hover", "press"] as CardInteraction[],
    ...props,
  }),

  // Glass morphism card
  glass: (props: Partial<AdvancedCardProps>) => ({
    variant: "glass" as CardVariant,
    interactions: ["hover", "press", "glow"] as CardInteraction[],
    blurIntensity: 20,
    ...props,
  }),

  // Gradient card
  gradient: (props: Partial<AdvancedCardProps>) => ({
    variant: "gradient" as CardVariant,
    interactions: ["hover", "press", "glow"] as CardInteraction[],
    gradientColors: ["#ec4899", "#db2777"],
    ...props,
  }),

  // Premium card
  premium: (props: Partial<AdvancedCardProps>) => ({
    variant: "premium" as CardVariant,
    interactions: ["hover", "press", "glow", "bounce"] as CardInteraction[],
    glowColor: "#8b5cf6",
    ...props,
  }),

  // Minimal card
  minimal: (props: Partial<AdvancedCardProps>) => ({
    variant: "minimal" as CardVariant,
    interactions: ["hover", "press"] as CardInteraction[],
    ...props,
  }),

  // Neon card
  neon: (props: Partial<AdvancedCardProps>) => ({
    variant: "neon" as CardVariant,
    interactions: ["hover", "press", "glow", "bounce"] as CardInteraction[],
    glowColor: "#00ffff",
    ...props,
  }),

  // Holographic card
  holographic: (props: Partial<AdvancedCardProps>) => ({
    variant: "holographic" as CardVariant,
    interactions: ["hover", "press", "glow", "tilt"] as CardInteraction[],
    ...props,
  }),

  // Floating card
  floating: (props: Partial<AdvancedCardProps>) => ({
    variant: "floating" as CardVariant,
    interactions: ["hover", "press", "bounce"] as CardInteraction[],
    ...props,
  }),
};

// Styles
const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  content: {
    flex: 1,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  status: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 12,
  },
  actionButton: {
    marginLeft: 8,
  },
});

export default AdvancedCard;
