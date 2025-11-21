// apps/mobile/src/components/ui/Button.tsx
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  AccessibilityInfo,
  type GestureResponderEvent,
  Pressable,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "glass"
  | "holographic"
  | "neon"
  | "premium"
  | "gradient"
  | "cyber"
  | "rainbow"
  | "minimal"
  | "intense"
  | "subtle"
  | "strong"
  | "medium"
  | "gradient-primary"
  | "gradient-secondary";

export type ButtonSize = "xs" | "sm" | "md" | "base" | "lg" | "xl";
export type InteractionType =
  | "hover"
  | "press"
  | "longPress"
  | "swipe"
  | "tilt"
  | "glow"
  | "bounce"
  | "elastic"
  | "magnetic"
  | "ripple"
  | "shimmer";
export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "notification";

export interface ButtonProps
  extends Omit<React.ComponentProps<typeof Pressable>, "onPress"> {
  title?: string;
  children?: React.ReactNode;

  variant?: ButtonVariant;
  size?: ButtonSize;

  interactions?: InteractionType[];
  glowEffect?: boolean;
  magneticEffect?: boolean;
  rippleEffect?: boolean;
  shimmerEffect?: boolean;
  pressEffect?: boolean;
  gradientEffect?: boolean;
  tiltEffect?: boolean;

  glowColor?: string;
  glowIntensity?: number;
  magneticSensitivity?: number; // 0..1
  shimmerDuration?: number;
  gradientName?: string;
  gradientColors?: string[];

  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";

  loading?: boolean;
  disabled?: boolean;

  onPress?: () => void | Promise<void>;
  onLongPress?: () => void | Promise<void>;
  hapticFeedback?: boolean;
  hapticType?: HapticType;

  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;

  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const SIZE = {
  xs: { ph: 8, pv: 4, h: 28, fs: 12, is: 14 },
  sm: { ph: 12, pv: 6, h: 36, fs: 14, is: 16 },
  md: { ph: 16, pv: 8, h: 44, fs: 16, is: 18 },
  base: { ph: 16, pv: 8, h: 44, fs: 16, is: 18 },
  lg: { ph: 20, pv: 12, h: 52, fs: 18, is: 20 },
  xl: { ph: 24, pv: 16, h: 60, fs: 20, is: 22 },
} as const;

const HAPTIC_MAP = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  notification: Haptics.NotificationFeedbackType.Success,
} as const;

const ButtonBase = forwardRef<View, ButtonProps>(function Button(
  {
    title,
    children,

    variant = "primary",
    size = "md",

    interactions = ["press", "ripple"],
    glowEffect = false,
    magneticEffect = false,
    rippleEffect = true,
    shimmerEffect = false,
    pressEffect = true,
    gradientEffect = false,
    tiltEffect = false,

    glowColor = "#ec4899",
    glowIntensity = 1,
    magneticSensitivity = 0.35,
    shimmerDuration = 2000,
    gradientColors,

    leftIcon,
    rightIcon,
    icon,
    iconPosition = "left",

    loading = false,
    disabled = false,

    onPress,
    onLongPress,
    hapticFeedback = true,
    hapticType = "medium",

    style,
    textStyle,
    accessibilityLabel,
    accessibilityHint,
    testID,
    ...rest
  },
  ref,
) {
  // --- Reduce motion & haptics availability
  const reduceMotion = useRef(false);
  const [hapticsAvailable, setHapticsAvailable] = useState(true);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(
      (v) => (reduceMotion.current = v),
    );
    Haptics.isAvailableAsync()
      .then(setHapticsAvailable)
      .catch(() => setHapticsAvailable(false));
  }, []);

  const S = SIZE[size];

  // --- Animated values
  const scale = useRef(new Animated.Value(1)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current; // loader
  const shimmer = useRef(new Animated.Value(0)).current;

  // Ripple (iOS/Universal overlay)
  const rippleX = useRef(new Animated.Value(0)).current;
  const rippleY = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0.01)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const rippleRadius = 140; // px

  const isRippleEnabled = rippleEffect || interactions.includes("ripple");
  const wantsMagnetic = magneticEffect || interactions.includes("magnetic");
  const wantsTilt = tiltEffect || interactions.includes("tilt");
  const wantsGlow = glowEffect || interactions.includes("glow");
  const wantsShimmer = shimmerEffect || interactions.includes("shimmer");

  // --- Haptics
  const doHaptic = useCallback(
    async (type: HapticType = hapticType) => {
      if (!hapticFeedback || !hapticsAvailable) return;
      try {
        if (type === "selection") return Haptics.selectionAsync();
        if (type === "notification")
          return Haptics.notificationAsync(HAPTIC_MAP.notification);
        const style =
          HAPTIC_MAP[type as "light" | "medium" | "heavy"] ?? HAPTIC_MAP.medium;
        return Haptics.impactAsync(style);
      } catch {
        /* noop */
      }
    },
    [hapticFeedback, hapticsAvailable, hapticType],
  );

  // --- Variant base style
  const baseStyle = useMemo<StyleProp<ViewStyle>>(() => {
    const common: ViewStyle = {
      borderRadius: 12,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      paddingHorizontal: S.ph,
      paddingVertical: S.pv,
      minHeight: S.h,
    };

    switch (variant) {
      case "primary":
        return [{ ...common, backgroundColor: "#ec4899" }];
      case "secondary":
        return [{ ...common, backgroundColor: "#0ea5e9" }];
      case "ghost":
        return [{ ...common, backgroundColor: "transparent" }];
      case "outline":
        return [
          {
            ...common,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: "#ec4899",
          },
        ];
      case "glass":
        return [
          {
            ...common,
            backgroundColor: "rgba(255,255,255,0.08)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.18)",
          },
        ];
      case "neon":
        return [
          {
            ...common,
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: glowColor,
          },
        ];
      case "premium":
        return [
          {
            ...common,
            backgroundColor: "rgba(139,92,246,0.10)",
            borderWidth: 1,
            borderColor: "rgba(139,92,246,0.30)",
          },
        ];
      case "holographic":
        return [{ ...common, backgroundColor: "transparent" }];
      case "gradient":
      case "gradient-primary":
      case "gradient-secondary":
        return [{ ...common, backgroundColor: "transparent" }];
      case "minimal":
        return [
          {
            ...common,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: "#e5e7eb",
          },
        ];
      default:
        return [{ ...common, backgroundColor: "#ec4899" }];
    }
  }, [variant, glowColor, S]);

  // --- Text color
  const textColor = useMemo(() => {
    switch (variant) {
      case "ghost":
      case "outline":
      case "minimal":
        return "#374151";
      case "glass":
      case "holographic":
      case "neon":
      case "gradient":
      case "gradient-primary":
      case "gradient-secondary":
      case "premium":
      case "primary":
      case "secondary":
      default:
        return "#ffffff";
    }
  }, [variant]);

  // --- Press in/out animations
  const pressIn = useCallback(
    (e?: GestureResponderEvent) => {
      if (disabled || loading) return;

      if (pressEffect && !reduceMotion.current) {
        Animated.spring(scale, {
          toValue: 0.96,
          friction: 8,
          tension: 240,
          useNativeDriver: true,
        }).start();
      }
      if (wantsGlow) {
        Animated.timing(glow, {
          toValue: 1,
          duration: 160,
          useNativeDriver: false,
        }).start();
      }

      if (isRippleEnabled && Platform.OS !== "android") {
        const { locationX, locationY } = e?.nativeEvent ?? {
          locationX: 0,
          locationY: 0,
        };
        rippleX.setValue(locationX - rippleRadius);
        rippleY.setValue(locationY - rippleRadius);
        rippleScale.setValue(0.01);
        rippleOpacity.setValue(0.18);
        Animated.parallel([
          Animated.timing(rippleScale, {
            toValue: 1,
            duration: reduceMotion.current ? 100 : 350,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: reduceMotion.current ? 200 : 450,
            useNativeDriver: true,
          }),
        ]).start();
      }

      if (wantsMagnetic) {
        // A tiny attract to press point (visual depth)
        const { locationX = 0, locationY = 0 } = e?.nativeEvent ?? {};
        const nx = (locationX / Math.max(1, SCREEN_WIDTH)) * 2 - 1; // -1..1
        Animated.parallel([
          Animated.timing(tiltY, {
            toValue: -nx * 6 * magneticSensitivity,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(tiltX, {
            toValue: 3 * magneticSensitivity,
            duration: 140,
            useNativeDriver: true,
          }),
        ]).start();
      }

      doHaptic("light");
    },
    [
      disabled,
      loading,
      pressEffect,
      wantsGlow,
      isRippleEnabled,
      rippleRadius,
      wantsMagnetic,
      magneticSensitivity,
      doHaptic,
      scale,
      glow,
      rippleX,
      rippleY,
      rippleScale,
      rippleOpacity,
      tiltX,
      tiltY,
    ],
  );

  const pressOut = useCallback(() => {
    if (pressEffect && !reduceMotion.current) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 220,
        useNativeDriver: true,
      }).start();
    }
    if (wantsGlow) {
      Animated.timing(glow, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }
    if (wantsMagnetic || wantsTilt) {
      Animated.parallel([
        Animated.spring(tiltX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(tiltY, { toValue: 0, useNativeDriver: true }),
      ]).start();
    }
  }, [
    pressEffect,
    wantsGlow,
    wantsMagnetic,
    wantsTilt,
    scale,
    glow,
    tiltX,
    tiltY,
  ]);

  // --- Handlers
  const handlePress = useCallback(async () => {
    if (disabled || loading) return;
    doHaptic("medium");
    try {
      await onPress?.();
    } catch {
      doHaptic("notification");
    }
  }, [disabled, loading, onPress, doHaptic]);

  const handleLong = useCallback(async () => {
    if (disabled || loading) return;
    doHaptic("heavy");
    await onLongPress?.();
  }, [disabled, loading, onLongPress, doHaptic]);

  // --- Loader & shimmer anim loops
  useEffect(() => {
    if (loading) {
      const loop = Animated.loop(
        Animated.timing(rotate, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => {
        rotate.setValue(0);
        loop.stop();
      };
    }
  }, [loading, rotate]);

  useEffect(() => {
    if (wantsShimmer && !reduceMotion.current) {
      const loop = Animated.loop(
        Animated.timing(shimmer, {
          toValue: 1,
          duration: shimmerDuration,
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => {
        shimmer.setValue(0);
        loop.stop();
      };
    }
  }, [wantsShimmer, shimmerDuration, shimmer]);

  // --- Assemble animated styles
  const animatedContainer: StyleProp<ViewStyle> = [
    baseStyle,
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
      // iOS shadow “glow”; Android uses extra overlay below
      ...(Platform.OS === "ios" && {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: glow.interpolate({
          inputRange: [0, 1],
          outputRange: [0.08, 0.35],
        }) as unknown as number,
        shadowRadius: glow.interpolate({
          inputRange: [0, 1],
          outputRange: [4, 16 * glowIntensity],
        }) as unknown as number,
      }),
      ...(Platform.OS === "android" && { elevation: 6 }),
    },
    style,
  ];

  // --- Icon render
  const renderIcon = useCallback(
    (pos: "left" | "right") => {
      const name =
        pos === "left"
          ? (leftIcon ?? (iconPosition === "left" ? icon : undefined))
          : (rightIcon ?? (iconPosition === "right" ? icon : undefined));
      if (!name) return null;
      return (
        <Ionicons
          name={name}
          size={S.is}
          color={loading ? "transparent" : textColor}
          style={pos === "left" ? styles.iconLeft : styles.iconRight}
        />
      );
    },
    [leftIcon, rightIcon, icon, iconPosition, S.is, loading, textColor],
  );

  // --- Content
  const content = (
    <>
      {/* gradient backgrounds */}
      {(variant === "gradient" ||
        variant === "gradient-primary" ||
        variant === "gradient-secondary") && (
        <LinearGradient
          pointerEvents="none"
          colors={gradientColors || ["#ec4899", "#db2777"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      {variant === "holographic" && (
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(255,255,255,0.10)",
            "rgba(255,255,255,0.04)",
            "rgba(255,255,255,0.10)",
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      {variant === "glass" && (
        <BlurView
          pointerEvents="none"
          intensity={24}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Android glow overlay (since shadows are limited) */}
      {Platform.OS === "android" && wantsGlow && (
        <AnimatedView
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: glow.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2],
              }),
              backgroundColor: glowColor,
              borderRadius: 12,
            },
          ]}
        />
      )}

      <View style={styles.row}>
        {renderIcon("left")}
        {children ? (
          children
        ) : title ? (
          <Text
            style={[
              styles.title,
              { color: textColor, fontSize: S.fs },
              textStyle,
            ]}
          >
            {title}
          </Text>
        ) : null}
        {renderIcon("right")}
      </View>

      {/* Loading spinner */}
      {loading && (
        <AnimatedView
          style={[
            styles.loader,
            {
              transform: [
                {
                  rotate: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {/* iOS/universal ripple */}
      {isRippleEnabled && Platform.OS !== "android" && (
        <AnimatedView
          pointerEvents="none"
          style={[
            styles.ripple,
            {
              left: rippleX,
              top: rippleY,
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        />
      )}

      {/* shimmer */}
      {wantsShimmer && (
        <AnimatedView
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(255,255,255,0.25)",
              transform: [
                {
                  translateX: shimmer.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
                  }),
                },
              ],
            },
          ]}
        />
      )}
    </>
  );

  // Android native ripple (Pressable android_ripple)
  const androidRipple = useMemo(
    () =>
      isRippleEnabled && Platform.OS === "android"
        ? {
            color: "rgba(255,255,255,0.35)",
            borderless: false,
            foreground: true,
          }
        : undefined,
    [isRippleEnabled],
  );

  return (
    <AnimatedPressable
      ref={ref}
      testID={testID}
      onPress={handlePress}
      onLongPress={handleLong}
      onPressIn={pressIn}
      onPressOut={pressOut}
      android_ripple={androidRipple as any}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={
        accessibilityHint ||
        (disabled ? "Button is disabled" : "Activates the action")
      }
      accessibilityState={{ disabled: disabled || loading, busy: !!loading }}
      style={animatedContainer}
      {...rest}
    >
      {content}
    </AnimatedPressable>
  );
});

export const Button = memo(ButtonBase);

// Handy presets (unchanged API)
export const ButtonPresets = {
  premium: (p: ButtonProps) => (
    <Button {...p} glowEffect rippleEffect pressEffect />
  ),
  holographic: (p: ButtonProps) => (
    <Button
      {...p}
      variant="holographic"
      gradientEffect
      shimmerEffect
      glowEffect
      rippleEffect
      pressEffect
    />
  ),
  magnetic: (p: ButtonProps) => (
    <Button {...p} magneticEffect rippleEffect pressEffect glowEffect />
  ),
  glass: (p: ButtonProps) => (
    <Button {...p} variant="glass" glowEffect rippleEffect pressEffect />
  ),
  neon: (p: ButtonProps) => (
    <Button
      {...p}
      variant="neon"
      glowEffect
      glowIntensity={2}
      rippleEffect
      pressEffect
      shimmerEffect
      shimmerDuration={1000}
    />
  ),
  gradient: (p: ButtonProps) => (
    <Button {...p} variant="gradient" gradientEffect rippleEffect pressEffect />
  ),
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "600", textAlign: "center" },
  loader: {
    position: "absolute",
    right: 16,
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#fff",
    borderTopColor: "transparent",
    borderRadius: 10,
  },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  ripple: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
export default Button;
