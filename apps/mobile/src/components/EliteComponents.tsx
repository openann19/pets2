import { Ionicons, type ComponentProps } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode, useEffect } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type ScrollViewProps,
  type TouchableOpacityProps,
  type ViewStyle,
  StyleSheet,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../contexts/ThemeContext";
import {
  AnimationConfigs,
  BorderRadius,
  Colors,
  GlobalStyles,
  Shadows,
  Spacing,
} from "../styles/GlobalStyles";

// === STYLES ===
const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glassWhite,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  headerContainer: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center" as const,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end" as const,
  },
  onlineIndicator: {
    position: "absolute" as const,
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});

// === ELITE CONTAINER COMPONENTS ===

interface EliteContainerProps {
  children: ReactNode;
  gradient?: string;
  style?: ViewStyle;
}

export const EliteContainer: React.FC<EliteContainerProps> = ({
  children,
  gradient = "gradientPrimary",
  style,
}) => {
  const { colors } = useTheme();

  const gradientColors =
    (colors[gradient as keyof typeof colors] as string[]) ??
    colors.gradientPrimary;

  return (
    <View style={[GlobalStyles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        style={GlobalStyles.backgroundGradient}
      />
      <SafeAreaView style={GlobalStyles.safeArea}>{children}</SafeAreaView>
    </View>
  );
};

interface EliteScrollContainerProps extends ScrollViewProps {
  children: ReactNode;
  gradient?: keyof typeof Colors;
}

export const EliteScrollContainer: React.FC<EliteScrollContainerProps> = ({
  children,
  gradient = "gradientPrimary",
  ...props
}) => {
  return (
    <EliteContainer gradient={gradient}>
      <ScrollView
        contentContainerStyle={GlobalStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        {...props}
      >
        {children}
      </ScrollView>
    </EliteContainer>
  );
};

// === ELITE HEADER COMPONENTS ===

interface EliteHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  onBack?: () => void;
  rightComponent?: ReactNode;
  blur?: boolean;
}

export const EliteHeader: React.FC<EliteHeaderProps> = ({
  title,
  subtitle,
  showLogo: _showLogo = false,
  onBack,
  rightComponent,
  blur = true,
}) => {
  const triggerHaptic = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBackPress = () => {
    runOnJS(triggerHaptic)();
    onBack?.();
  };

  const HeaderContent = (
    <View style={GlobalStyles.headerContent}>
      {onBack && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
      )}

      <View style={styles.headerTitleContainer}>
        <Text style={GlobalStyles.heading2}>{title}</Text>
        {subtitle != null && subtitle.length > 0 && (
          <Text style={GlobalStyles.bodySmall}>{subtitle}</Text>
        )}
      </View>

      <View style={styles.headerRight}>{rightComponent}</View>
    </View>
  );

  if (blur) {
    return (
      <View style={GlobalStyles.headerBlur}>
        <BlurView intensity={95} style={{ flex: 1 }}>
          {HeaderContent}
        </BlurView>
      </View>
    );
  }

  return <View style={styles.headerContainer}>{HeaderContent}</View>;
};

interface ElitePageHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const ElitePageHeader: React.FC<ElitePageHeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
}) => {
  return (
    <Animated.View style={GlobalStyles.header}>
      {showLogo && (
        <BlurView intensity={20} style={GlobalStyles.logoContainer}>
          <Text style={GlobalStyles.logo}>🐾 PawfectMatch</Text>
        </BlurView>
      )}
      <Text style={GlobalStyles.title}>{title}</Text>
      {subtitle != null && subtitle.length > 0 && (
        <Text style={GlobalStyles.subtitle}>{subtitle}</Text>
      )}
    </Animated.View>
  );
};

// === PREMIUM GRADIENT COLORS ===
export const PREMIUM_GRADIENTS = {
  primary: ["#ec4899", "#f472b6", "#f9a8d4"],
  secondary: ["#0ea5e9", "#38bdf8", "#7dd3fc"],
  premium: ["#a855f7", "#c084fc", "#d8b4fe"],
  sunset: ["#f59e0b", "#f97316", "#fb923c"],
  ocean: ["#0ea5e9", "#06b6d4", "#22d3ee"],
  holographic: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"],
  neon: ["#00f5ff", "#ff00ff", "#ffff00"],
  glass: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"],
};

// === PREMIUM SHADOWS ===
export const PREMIUM_SHADOWS = {
  primaryGlow: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  secondaryGlow: {
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  holographicGlow: {
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
  },
  neonGlow: {
    shadowColor: "#00f5ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 25,
  },
};

// === ELITE BUTTON COMPONENTS ===

interface EliteButtonProps extends TouchableOpacityProps {
  title: string;
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "glass"
    | "holographic"
    | "neon";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: string;
  loading?: boolean;
  gradient?: string[];
  ripple?: boolean;
  glow?: boolean;
  shimmer?: boolean;
}

export const EliteButton: React.FC<EliteButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  gradient,
  ripple = true,
  glow = true,
  shimmer = false,
  style,
  onPress,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);
  const shimmerOffset = useSharedValue(-100);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const glowIntensity = useSharedValue(1);

  // Shimmer animation
  useEffect(() => {
    if (shimmer) {
      shimmerOffset.value = withSequence(
        withTiming(100, { duration: 2000 }),
        withDelay(1000, withTiming(-100, { duration: 0 })),
      );
    }
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value * 0.4,
    shadowRadius: glowIntensity.value * 20,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, AnimationConfigs.spring);
    glowIntensity.value = withSpring(1.2, AnimationConfigs.spring);

    if (ripple) {
      rippleScale.value = 0;
      rippleOpacity.value = 0.6;
      rippleScale.value = withTiming(2, { duration: 300 });
      rippleOpacity.value = withTiming(0, { duration: 300 });
    }

    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfigs.spring);
    glowIntensity.value = withSpring(1, AnimationConfigs.spring);
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius["2xl"],
      overflow: "hidden" as const,
      position: "relative" as const,
    };

    switch (variant) {
      case "secondary":
        return { ...baseStyle, ...GlobalStyles.buttonSecondary };
      case "ghost":
        return { ...baseStyle, ...GlobalStyles.buttonGhost };
      case "glass":
        return {
          ...baseStyle,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
        };
      case "holographic":
        return { ...baseStyle, ...PREMIUM_SHADOWS.holographicGlow };
      case "neon":
        return { ...baseStyle, ...PREMIUM_SHADOWS.neonGlow };
      default:
        return {
          ...baseStyle,
          ...GlobalStyles.buttonPrimary,
          ...(glow ? PREMIUM_SHADOWS.primaryGlow : {}),
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return GlobalStyles.buttonTextSecondary;
      case "ghost":
      case "glass":
        return { ...GlobalStyles.buttonTextSecondary, color: Colors.white };
      case "holographic":
      case "neon":
        return {
          ...GlobalStyles.buttonTextPrimary,
          color: Colors.white,
          fontWeight: "bold" as const,
        };
      default:
        return GlobalStyles.buttonTextPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          minHeight: 36,
        };
      case "lg":
        return {
          paddingHorizontal: Spacing["3xl"],
          paddingVertical: Spacing.lg,
          minHeight: 56,
        };
      case "xl":
        return {
          paddingHorizontal: Spacing["4xl"],
          paddingVertical: Spacing.xl,
          minHeight: 64,
        };
      default:
        return { ...GlobalStyles.buttonContent, minHeight: 48 };
    }
  };

  const getGradientColors = () => {
    if (gradient) return gradient;

    switch (variant) {
      case "secondary":
        return PREMIUM_GRADIENTS.secondary;
      case "glass":
        return PREMIUM_GRADIENTS.glass;
      case "holographic":
        return PREMIUM_GRADIENTS.holographic;
      case "neon":
        return PREMIUM_GRADIENTS.neon;
      default:
        return PREMIUM_GRADIENTS.primary;
    }
  };

  const ButtonContent = (
    <View style={[getSizeStyle(), { opacity: (disabled ?? false) ? 0.6 : 1 }]}>
      {loading ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator
            color={
              variant === "primary" ||
              variant === "holographic" ||
              variant === "neon"
                ? Colors.white
                : Colors.primary
            }
            size="small"
          />
          <Text
            style={[
              GlobalStyles.buttonText,
              getTextStyle(),
              { marginLeft: Spacing.sm },
            ]}
          >
            Loading...
          </Text>
        </View>
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={
                size === "sm"
                  ? 16
                  : size === "lg"
                    ? 24
                    : size === "xl"
                      ? 28
                      : 20
              }
              color={
                variant === "primary" ||
                variant === "holographic" ||
                variant === "neon"
                  ? Colors.white
                  : Colors.primary
              }
              style={{ marginRight: Spacing.xs }}
            />
          )}
          <Text style={[GlobalStyles.buttonText, getTextStyle()]}>{title}</Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[getButtonStyle(), glow ? glowStyle : {}, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled ?? loading}
        {...props}
      >
        {/* Ripple Effect */}
        {ripple && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "rgba(255,255,255,0.3)",
                marginTop: -50,
                marginLeft: -50,
              },
              rippleStyle,
            ]}
          />
        )}

        {/* Shimmer Effect */}
        {shimmer && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255,255,255,0.1)",
              },
              shimmerStyle,
            ]}
          />
        )}

        {/* Gradient Background */}
        <LinearGradient
          colors={getGradientColors()}
          style={{
            borderRadius: BorderRadius["2xl"],
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {ButtonContent}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// === ELITE CARD COMPONENTS ===

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
  const scale = useSharedValue(1);
  const shimmerOffset = useSharedValue(-100);

  // Shimmer animation
  useEffect(() => {
    if (shimmer) {
      shimmerOffset.value = withSequence(
        withTiming(100, { duration: 2000 }),
        withDelay(1000, withTiming(-100, { duration: 0 })),
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
    scale.value = withSpring(0.98, AnimationConfigs.spring);
    if (onPress) {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfigs.spring);
  };

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius["2xl"],
      overflow: "hidden" as const,
      position: "relative" as const,
    };

    switch (variant) {
      case "glass":
        return {
          ...baseStyle,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.37,
          shadowRadius: 32,
          elevation: 15,
        };
      case "holographic":
        return {
          ...baseStyle,
          ...PREMIUM_SHADOWS.holographicGlow,
        };
      case "glow":
        return {
          ...baseStyle,
          ...PREMIUM_SHADOWS.primaryGlow,
        };
      default:
        return {
          ...baseStyle,
          ...GlobalStyles.card,
          ...Shadows[shadow],
        };
    }
  };

  const getGradientColors = () => {
    switch (variant) {
      case "glass":
        return PREMIUM_GRADIENTS.glass;
      case "holographic":
        return PREMIUM_GRADIENTS.holographic;
      case "glow":
        return PREMIUM_GRADIENTS.primary;
      default:
        return gradient
          ? ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]
          : undefined;
    }
  };

  const CardContent = (
    <View style={[GlobalStyles.cardContent, style]}>{children}</View>
  );

  const cardStyle = getCardStyle();
  const gradientColors = getGradientColors();

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={[cardStyle, style]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          {/* Shimmer Effect */}
          {shimmer && (
            <Animated.View
              style={[
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
              ]}
            />
          )}

          {/* Gradient Background */}
          {gradientColors ? (
            <LinearGradient
              colors={gradientColors}
              style={{
                borderRadius: BorderRadius["2xl"],
                flex: 1,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {blur ? (
                <BlurView
                  intensity={15}
                  style={{ borderRadius: BorderRadius["2xl"], flex: 1 }}
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
                  style={{ borderRadius: BorderRadius["2xl"], flex: 1 }}
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
    <Animated.View style={[cardStyle, animatedStyle, style]}>
      {/* Shimmer Effect */}
      {shimmer && (
        <Animated.View
          style={[
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
          ]}
        />
      )}

      {/* Gradient Background */}
      {gradientColors ? (
        <LinearGradient
          colors={gradientColors}
          style={{
            borderRadius: BorderRadius["2xl"],
            flex: 1,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {blur ? (
            <BlurView
              intensity={15}
              style={{ borderRadius: BorderRadius["2xl"], flex: 1 }}
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
              style={{ borderRadius: BorderRadius["2xl"], flex: 1 }}
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

// === ANIMATION COMPONENTS ===

interface FadeInUpProps {
  children: ReactNode;
  delay?: number;
}

export const FadeInUp: React.FC<FadeInUpProps> = ({ children, delay = 0 }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    }, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ children, delay = 0 }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 300 });
    }, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

interface StaggeredContainerProps {
  children: ReactNode;
  delay?: number;
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({ 
  children, 
  delay = 100 
}) => {
  return <View>{children}</View>;
};

interface GestureWrapperProps {
  children: ReactNode;
  onSwipe?: (direction: string) => void;
}

export const GestureWrapper: React.FC<GestureWrapperProps> = ({ 
  children, 
  onSwipe 
}) => {
  return <View>{children}</View>;
};

// === ELITE LOADING COMPONENT ===
interface EliteLoadingProps {
  size?: "small" | "large";
  color?: string;
}

export const EliteLoading: React.FC<EliteLoadingProps> = ({
  size = "large",
  color = Colors.primary,
}) => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

// === ELITE EMPTY STATE COMPONENT ===
interface EliteEmptyStateProps {
  icon?: string;
  title: string;
  message: string;
}

export const EliteEmptyState: React.FC<EliteEmptyStateProps> = ({
  icon = "ellipse-outline",
  title,
  message,
}) => {
  const { colors } = useTheme();

  return (
    <View style={{ alignItems: "center", justifyContent: "center", padding: Spacing.xl }}>
      <Ionicons name={icon as ComponentProps<typeof Ionicons>['name']} size={64} color={Colors.gray400} />
      <Text style={{ 
        fontSize: 20, 
        fontWeight: "bold", 
        marginTop: Spacing.lg,
        color: Colors.gray700 
      }}>
        {title}
      </Text>
      <Text style={{ 
        fontSize: 14, 
        marginTop: Spacing.sm,
        color: Colors.gray600,
        textAlign: "center" 
      }}>
        {message}
      </Text>
    </View>
  );
};

export default {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  ElitePageHeader,
  EliteCard,
  EliteButton,
  EliteLoading,
  EliteEmptyState,
  FadeInUp,
  ScaleIn,
  StaggeredContainer,
  GestureWrapper,
  PREMIUM_GRADIENTS,
  PREMIUM_SHADOWS,
};
