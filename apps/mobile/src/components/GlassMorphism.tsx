import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode } from "react";
import { View, type ViewStyle, type ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { BorderRadius, Spacing } from "../styles/GlobalStyles";

// === GLASS MORPHISM CONSTANTS ===
export const GLASS_CONFIGS = {
  // Blur intensities
  blur: {
    light: 10,
    medium: 20,
    heavy: 40,
    ultra: 80,
  },

  // Transparency levels
  transparency: {
    light: 0.1,
    medium: 0.2,
    heavy: 0.3,
    ultra: 0.5,
  },

  // Border styles
  borders: {
    light: {
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    medium: {
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    heavy: {
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.4)",
    },
  },

  // Shadow styles
  shadows: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    heavy: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  },
} as const;

// === GLASS CONTAINER COMPONENT ===
interface GlassContainerProps extends ViewProps {
  children: ReactNode;
  intensity?: keyof typeof GLASS_CONFIGS.blur;
  transparency?: keyof typeof GLASS_CONFIGS.transparency;
  border?: keyof typeof GLASS_CONFIGS.borders;
  shadow?: keyof typeof GLASS_CONFIGS.shadows;
  borderRadius?: keyof typeof BorderRadius;
  animated?: boolean;
  hover?: boolean;
  style?: ViewStyle;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  intensity = "medium",
  transparency = "medium",
  border = "light",
  shadow = "medium",
  borderRadius = "2xl",
  animated = false,
  hover = false,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (hover) {
      scale.value = withSpring(0.98);
      opacity.value = withSpring(0.9);
    }
  };

  const handlePressOut = () => {
    if (hover) {
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
    }
  };

  const glassStyle: ViewStyle = {
    borderRadius: BorderRadius[borderRadius],
    overflow: "hidden",
    ...GLASS_CONFIGS.borders[border],
    ...GLASS_CONFIGS.shadows[shadow],
    ...style,
  };

  const gradientColors = [
    `rgba(255, 255, 255, ${GLASS_CONFIGS.transparency[transparency]})`,
    `rgba(255, 255, 255, ${GLASS_CONFIGS.transparency[transparency] * 0.5})`,
  ];

  return (
    <Animated.View
      style={[glassStyle, animated ? animatedStyle : undefined]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      {...props}
    >
      <BlurView
        intensity={GLASS_CONFIGS.blur[intensity]}
        style={{
          flex: 1,
          borderRadius: BorderRadius[borderRadius],
        }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: BorderRadius[borderRadius],
            padding: Spacing.lg,
          }}
        >
          {children}
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

// === GLASS CARD COMPONENT ===
interface GlassCardProps extends ViewProps {
  children: ReactNode;
  variant?: "default" | "premium" | "frosted" | "crystal";
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  hover?: boolean;
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = "default",
  size = "md",
  animated = true,
  hover = true,
  style,
  ...props
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case "premium":
        return {
          intensity: "heavy" as const,
          transparency: "heavy" as const,
          border: "heavy" as const,
          shadow: "heavy" as const,
        };
      case "frosted":
        return {
          intensity: "ultra" as const,
          transparency: "ultra" as const,
          border: "medium" as const,
          shadow: "medium" as const,
        };
      case "crystal":
        return {
          intensity: "light" as const,
          transparency: "light" as const,
          border: "light" as const,
          shadow: "light" as const,
        };
      default:
        return {
          intensity: "medium" as const,
          transparency: "medium" as const,
          border: "light" as const,
          shadow: "medium" as const,
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return { padding: Spacing.md };
      case "lg":
        return { padding: Spacing.xl };
      case "xl":
        return { padding: Spacing["2xl"] };
      default:
        return { padding: Spacing.lg };
    }
  };

  const config = getVariantConfig();
  const sizeConfig = getSizeConfig();

  return (
    <GlassContainer
      intensity={config.intensity}
      transparency={config.transparency}
      border={config.border}
      shadow={config.shadow}
      animated={animated}
      hover={hover}
      style={[sizeConfig, style]}
      {...props}
    >
      {children}
    </GlassContainer>
  );
};

// === GLASS BUTTON COMPONENT ===
interface GlassButtonProps extends ViewProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onPress,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getVariantConfig = () => {
    switch (variant) {
      case "primary":
        return {
          intensity: "medium" as const,
          transparency: "medium" as const,
          border: "medium" as const,
          shadow: "medium" as const,
        };
      case "secondary":
        return {
          intensity: "light" as const,
          transparency: "light" as const,
          border: "light" as const,
          shadow: "light" as const,
        };
      case "ghost":
        return {
          intensity: "light" as const,
          transparency: "light" as const,
          border: "light" as const,
          shadow: "light" as const,
        };
      default:
        return {
          intensity: "medium" as const,
          transparency: "medium" as const,
          border: "medium" as const,
          shadow: "medium" as const,
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          minHeight: 36,
        };
      case "lg":
        return {
          paddingHorizontal: Spacing["2xl"],
          paddingVertical: Spacing.lg,
          minHeight: 56,
        };
      default:
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
          minHeight: 48,
        };
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    opacity.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  };

  const config = getVariantConfig();
  const sizeConfig = getSizeConfig();

  return (
    <Animated.View
      style={[animatedStyle, style]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <GlassContainer
        intensity={config.intensity}
        transparency={config.transparency}
        border={config.border}
        shadow={config.shadow}
        borderRadius="xl"
        style={[
          sizeConfig,
          {
            justifyContent: "center",
            alignItems: "center",
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        {...props}
      >
        {children}
      </GlassContainer>
    </Animated.View>
  );
};

// === GLASS HEADER COMPONENT ===
interface GlassHeaderProps extends ViewProps {
  children: ReactNode;
  intensity?: keyof typeof GLASS_CONFIGS.blur;
  style?: ViewStyle;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({
  children,
  intensity = "heavy",
  style,
  ...props
}) => {
  return (
    <GlassContainer
      intensity={intensity}
      transparency="light"
      border="light"
      shadow="light"
      borderRadius="none"
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </GlassContainer>
  );
};

// === GLASS MODAL COMPONENT ===
interface GlassModalProps extends ViewProps {
  children: ReactNode;
  visible: boolean;
  onClose?: () => void;
  style?: ViewStyle;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  children,
  visible,
  onClose,
  style,
  ...props
}) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1);
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        },
        animatedStyle,
      ]}
      onTouchStart={onClose}
    >
      <GlassCard
        variant="premium"
        size="lg"
        style={[
          {
            maxWidth: "90%",
            maxHeight: "80%",
          },
          style,
        ]}
        {...props}
      >
        {children}
      </GlassCard>
    </Animated.View>
  );
};

// === GLASS NAVIGATION COMPONENT ===
interface GlassNavigationProps extends ViewProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const GlassNavigation: React.FC<GlassNavigationProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <GlassContainer
      intensity="heavy"
      transparency="light"
      border="light"
      shadow="medium"
      borderRadius="none"
      style={[
        {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </GlassContainer>
  );
};

export default {
  GLASS_CONFIGS,
  GlassContainer,
  GlassCard,
  GlassButton,
  GlassHeader,
  GlassModal,
  GlassNavigation,
};
