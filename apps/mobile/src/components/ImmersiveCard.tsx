import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, forwardRef } from "react";
import type {
  ViewStyle,
  TouchableOpacityProps,
} from "react-native";
import { StyleSheet, TouchableOpacity as RNTouchableOpacity } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { View, TouchableOpacity, Text, Animated } from "react-native";

import {
  useGyroscopeTilt,
  useEntranceAnimation,
} from "../hooks/useMotionSystem";
import {
  DynamicColors,
  EnhancedShadows,
  SemanticColors,
  EnhancedTypography,
} from "../theme/Provider";

// === PROJECT HYPERION: IMMERSIVE CARD COMPONENT ===

export type ImmersiveCardVariant =
  | "default"
  | "glass"
  | "holographic"
  | "elevated"
  | "minimal";

export type ImmersiveCardSize = "sm" | "md" | "lg" | "xl";

export interface ImmersiveCardProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  variant?: ImmersiveCardVariant;
  size?: ImmersiveCardSize;
  tiltEnabled?: boolean;
  magneticHover?: boolean;
  shimmerEffect?: boolean;
  entranceAnimation?: "fadeIn" | "slideIn" | "scaleIn" | "bounceIn" | "none";
  gradientName?: keyof typeof DynamicColors.gradients;
  glowColor?: keyof typeof EnhancedShadows.glow;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  onPress?: () => void;
}

// Size configurations
const sizeConfigs = {
  sm: {
    padding: 12,
    borderRadius: 12,
    minHeight: 80,
  },
  md: {
    padding: 16,
    borderRadius: 16,
    minHeight: 120,
  },
  lg: {
    padding: 20,
    borderRadius: 20,
    minHeight: 160,
  },
  xl: {
    padding: 24,
    borderRadius: 24,
    minHeight: 200,
  },
};

const ImmersiveCard = forwardRef<RNTouchableOpacity, ImmersiveCardProps>(
  (
    {
      children,
      variant = "default",
      size = "md",
      tiltEnabled = true,
      magneticHover = true,
      shimmerEffect = false,
      entranceAnimation = "none",
      gradientName,
      glowColor,
      style,
      contentStyle,
      onPress,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const cardRef = useRef<View>(null);

    // Animation hooks
    const gyroscope = useGyroscopeTilt(0.3, 10);
    const entrance = useEntranceAnimation(
      entranceAnimation !== "none" ? entranceAnimation : "slideIn",
    );

    // Size config
    const sizeConfig = sizeConfigs[size];

    // Get variant styles
    const getVariantStyles = (): ViewStyle => {
      const baseStyles: ViewStyle = {
        borderRadius: sizeConfig.borderRadius,
        minHeight: sizeConfig.minHeight,
        overflow: "hidden",
        position: "relative",
      };

      switch (variant) {
        case "default":
          return {
            ...baseStyles,
            backgroundColor: SemanticColors.background.secondary,
            ...EnhancedShadows.depth.lg,
          };

        case "glass":
          return {
            ...baseStyles,
            ...DynamicColors.glass.medium,
            ...EnhancedShadows.depth.sm,
          };

        case "holographic":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            ...EnhancedShadows.depth.lg,
          };

        case "elevated":
          return {
            ...baseStyles,
            backgroundColor: SemanticColors.background.secondary,
            ...EnhancedShadows.depth.xl,
          };

        case "minimal":
          return {
            ...baseStyles,
            backgroundColor: SemanticColors.background.secondary,
            ...EnhancedShadows.depth.sm,
            borderWidth: 1,
            borderColor: SemanticColors.border.subtle,
          };

        default:
          return baseStyles;
      }
    };

    // Handle press states
    const handlePressIn = () => {
      setIsPressed(true);
      if (entranceAnimation !== "none") {
        entrance.animate();
      }
    };

    const handlePressOut = () => {
      setIsPressed(false);
    };

    // Handle hover/magnetic effects (simulated for mobile)
    const handleTouchStart = () => {
      setIsHovered(true);
    };

    const handleTouchEnd = () => {
      setIsHovered(false);
    };

    // Handle gyroscope updates (would be connected to actual gyroscope)
    const handlePanGesture = (event: {
      nativeEvent: { translationX: number; translationY: number };
    }) => {
      if (!tiltEnabled) return;

      const { translationX, translationY } = event.nativeEvent;
      gyroscope.updateTilt(translationX, translationY);
    };

    const handlePanEnd = () => {
      gyroscope.resetTilt();
    };

    // Shimmer effect
    const renderShimmer = () => {
      if (!shimmerEffect) return null;

      return (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.1)",
            transform: [{ skewX: "-20deg" }],
          }}
        >
          <Animated.View
            style={{
              width: "20%",
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.3)",
            }}
          />
        </Animated.View>
      );
    };

    // Glow effect
    const getGlowStyle = (): ViewStyle => {
      if (!glowColor || !isHovered) return {};

      const glowShadows = EnhancedShadows.glow;
      if (glowColor && glowShadows[glowColor]) {
        return glowShadows[glowColor];
      }
      return {};
    };

    // Render card content
    const renderContent = () => {
      const content = (
        <View
          ref={cardRef}
          style={StyleSheet.flatten([
            {
              padding: sizeConfig.padding,
              flex: 1,
              justifyContent: "center",
            },
            contentStyle,
          ])}
        >
          {children}
          {renderShimmer()}
        </View>
      );

      // Wrap with gradient for holographic variant
      if (variant === "holographic" && gradientName) {
        const gradient = DynamicColors.gradients[gradientName];
        return (
          <LinearGradient
            colors={gradient.colors as any}
            locations={[...gradient.locations]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
            {content}
          </LinearGradient>
        );
      }

      return content;
    };

    // Main card render  
    const cardContent = (
      <Animated.View
        style={[
          getVariantStyles(),
          getGlowStyle(),
          tiltEnabled ? gyroscope.transform : undefined,
          entranceAnimation !== "none" ? entrance.style : undefined,
          isPressed ? { transform: [{ scale: 0.98 }] } : undefined,
          style,
        ].filter(Boolean)}
      >
        {renderContent()}
      </Animated.View>
    );

    // Wrap with gesture handler for tilt effects
    if (tiltEnabled) {
      return (
        <PanGestureHandler
          onGestureEvent={handlePanGesture}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handlePanEnd();
            }
          }}
        >
          <Animated.View>
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={onPress}
              activeOpacity={1}
              style={{ borderRadius: sizeConfig.borderRadius }}
              {...props}
            >
              {cardContent}
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      );
    }

    // Simple touchable version
    return (
      <TouchableOpacity
        ref={ref}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        style={{ borderRadius: sizeConfig.borderRadius }}
        {...props}
      >
        {cardContent}
      </TouchableOpacity>
    );
  },
);

ImmersiveCard.displayName = "ImmersiveCard";

export default ImmersiveCard;
