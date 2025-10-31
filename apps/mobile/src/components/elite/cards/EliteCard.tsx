import React, { useEffect, type ReactNode } from "react";
import {
  View,
  TouchableOpacity,
  type ViewStyle,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Animated from "react-native-reanimated";

import { springs, durations, motionEasing } from '@/foundation/motion';
import { GlobalStyles, BorderRadius, Shadows } from "../../../styles/GlobalStyles";
import { getPremiumGradients } from "../constants/gradients";
import { getPremiumShadows } from "../constants/shadows";
import { useTheme } from '@/theme';

/**
 * EliteCard Component
 * Premium card component with multiple variants and animation effects
 */

interface EliteCardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: "default" | "glass" | "holographic" | "glow";
  gradient?: boolean;
  blur?: boolean;
  shadow?: keyof typeof Shadows;
  shimmer?: boolean;
}

export const EliteCard: React.FC<EliteCardProps> = ({
  children,
  style,
  onPress,
  variant = "default",
  gradient = false,
  blur = false,
  shadow = "lg",
  shimmer = false,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const shimmerOffset = useSharedValue(-100);

  // Shimmer animation
  useEffect(() => {
    if (shimmer) {
      shimmerOffset.value = withSequence(
        withTiming(100, { 
          duration: durations.lg * 10, // 3200ms for shimmer sweep
          easing: motionEasing.enter,
        }),
        withDelay(durations.lg * 5, withTiming(-100, { duration: 0 })),
      );
    }
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springs.gentle);
    if (onPress) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.gentle);
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle = {
      borderRadius: Number(BorderRadius["2xl"]) || 16,
      overflow: "hidden" as const,
      position: "relative" as const,
    };
    const SHADOWS = getPremiumShadows(theme);

    switch (variant) {
      case "glass":
        return {
          ...baseStyle,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
          shadowColor: theme.colors.onSurface,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.37,
          shadowRadius: 32,
          elevation: 15,
        };
      case "holographic":
        return {
          ...baseStyle,
          ...SHADOWS.holographicGlow,
        };
      case "glow":
        return {
          ...baseStyle,
          ...SHADOWS.primaryGlow,
        };
      default:
        return {
          ...baseStyle,
          ...GlobalStyles.card,
          ...Shadows[shadow],
        };
    }
  };

  const getGradientColors = (): string[] | undefined => {
    const gradients = getPremiumGradients(theme);
    switch (variant) {
      case "glass":
        return [...gradients.glass];
      case "holographic":
        return [...gradients.holographic];
      case "glow":
        return [...gradients.primary];
      default:
        return gradient
          ? ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]
          : undefined;
    }
  };

  const CardContent = (
    <View style={StyleSheet.flatten([GlobalStyles.cardContent, style])}>
      {children}
    </View>
  );

  const cardStyle = getCardStyle();
  const gradientColors = getGradientColors();

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={StyleSheet.flatten([cardStyle, style])}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          {shimmer && (
            <Animated.View
              style={StyleSheet.flatten([
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  zIndex: 1,
                },
                shimmerStyle,
              ])}
            />
          )}

          {gradientColors ? (
            <LinearGradient
              colors={gradientColors}
              style={{
                borderRadius: Number(BorderRadius["2xl"]) || 16,
                flex: 1,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {blur ? (
                <BlurView
                  intensity={15}
                  style={{ borderRadius: Number(BorderRadius["2xl"]) || 16, flex: 1 }}
                >
                  {CardContent}
                </BlurView>
              ) : (
                CardContent
              )}
            </LinearGradient>
          ) : (
            <>
              {blur ? (
                <BlurView
                  intensity={15}
                  style={{ borderRadius: Number(BorderRadius["2xl"]) || 16, flex: 1 }}
                >
                  {CardContent}
                </BlurView>
              ) : (
                CardContent
              )}
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={StyleSheet.flatten([cardStyle, animatedStyle, style])}
    >
      {shimmer && (
        <Animated.View
          style={StyleSheet.flatten([
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255,255,255,0.1)",
              zIndex: 1,
            },
            shimmerStyle,
          ])}
        />
      )}

      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          style={{
            borderRadius: Number(BorderRadius["2xl"]) || 16,
            flex: 1,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {blur ? (
            <BlurView
              intensity={15}
              style={{ borderRadius: Number(BorderRadius["2xl"]) || 16, flex: 1 }}
            >
              {CardContent}
            </BlurView>
          ) : (
            CardContent
          )}
        </LinearGradient>
      ) : (
        <>
          {blur ? (
            <BlurView
              intensity={15}
              style={{ borderRadius: Number(BorderRadius["2xl"]) || 16, flex: 1 }}
            >
              {CardContent}
            </BlurView>
          ) : (
            CardContent
          )}
        </>
      )}
    </Animated.View>
  );
};

export default EliteCard;
