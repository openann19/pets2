// apps/mobile/src/components/ui/Card.tsx
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
  Pressable,
  type ViewStyle,
  type StyleProp,
  type GestureResponderEvent,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Animated } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type CardVariant =
  | "default"
  | "glass"
  | "gradient"
  | "premium"
  | "minimal"
  | "neon"
  | "holographic"
  | "floating"
  | "elevated"
  | "outlined"
  | "gradient-primary"
  | "gradient-secondary"
  | "gradient-premium"
  | "glass-primary"
  | "glass-secondary"
  | "neon-primary";

export type CardSize = "xs" | "sm" | "md" | "lg" | "xl";

export type InteractionType =
  | "press"
  | "longPress"
  | "swipe"
  | "tilt"
  | "glow"
  | "bounce"
  | "shimmer";

export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "notification";
export type AnimationType =
  | "fadeInUp"
  | "scaleIn"
  | "slideInLeft"
  | "slideInRight"
  | "fadeIn"
  | "none";

export type GradientType =
  | "primary"
  | "secondary"
  | "premium"
  | "sunset"
  | "ocean"
  | "holographic"
  | "neon"
  | "gold"
  | "rainbow"
  | "cyber"
  | "aurora";

export interface CardProps
  extends Omit<React.ComponentProps<typeof Pressable>, "onPress"> {
  children: React.ReactNode;

  variant?: CardVariant;
  size?: CardSize;

  interactions?: InteractionType[];
  glowEffect?: boolean;
  shimmerEffect?: boolean;
  pressEffect?: boolean;
  tiltEffect?: boolean;

  glowColor?: string;
  glowIntensity?: number;
  shimmerDuration?: number;
  gradientName?: GradientType;
  gradientColors?: string[];

  animated?: boolean;
  animationType?: AnimationType;
  animationDelay?: number;
  animationDuration?: number;

  onPress?: () => void | Promise<void>;
  onLongPress?: () => void | Promise<void>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  hapticFeedback?: boolean;
  hapticType?: HapticType;

  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;

  accessibilityLabel?: string;
  accessibilityHint?: string;

  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  enableSwipe?: boolean;
}

// ----- sizing -----
const SIZE = {
  xs: { pad: 8, rad: 8, h: 60 },
  sm: { pad: 12, rad: 10, h: 80 },
  md: { pad: 16, rad: 12, h: 100 },
  lg: { pad: 20, rad: 16, h: 120 },
  xl: { pad: 24, rad: 20, h: 140 },
} as const;

const GRADIENTS: Record<GradientType, string[]> = {
  primary: ["#ec4899", "#f472b6", "#f9a8d4"],
  secondary: ["#0ea5e9", "#38bdf8", "#7dd3fc"],
  premium: ["#a855f7", "#c084fc", "#d8b4fe"],
  sunset: ["#f59e0b", "#f97316", "#fb923c"],
  ocean: ["#0ea5e9", "#06b6d4", "#22d3ee"],
  holographic: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"],
  neon: ["#00f5ff", "#ff00ff", "#ffff00"],
  gold: ["#ffd700", "#ffed4e", "#f39c12"],
  rainbow: [
    "#ff0000",
    "#ff7f00",
    "#ffff00",
    "#00ff00",
    "#0000ff",
    "#4b0082",
    "#9400d3",
  ],
  cyber: ["#00f5ff", "#ff0080", "#8000ff"],
  aurora: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
};

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CardBase = forwardRef<View, CardProps>(function Card(
  {
    children,
    variant = "default",
    size = "md",
    interactions = ["press"],
    glowEffect = false,
    shimmerEffect = false,
    pressEffect = true,
    tiltEffect = false,

    glowColor = "#ec4899",
    glowIntensity = 1,
    shimmerDuration = 2000,
    gradientName,
    gradientColors,

    animated = false,
    animationType = "fadeInUp",
    animationDelay = 0,
    animationDuration = 420,

    onPress,
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    hapticFeedback = true,
    hapticType = "light",

    style,
    contentStyle,
    accessibilityLabel,
    accessibilityHint,

    swipeThreshold = 120,
    swipeVelocityThreshold = 0.3,
    enableSwipe = false,

    ...rest
  },
  ref,
) {
  const S = SIZE[size];

  // reduce motion + haptics
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

  // animated values
  const scale = useRef(new Animated.Value(1)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const tx = useRef(
    new Animated.Value(
      animated &&
      (animationType === "slideInLeft" || animationType === "slideInRight")
        ? animationType === "slideInLeft"
          ? -24
          : 24
        : 0,
    ),
  ).current;
  const ty = useRef(
    new Animated.Value(animated && animationType === "fadeInUp" ? 16 : 0),
  ).current;
  const opacity = useRef(
    new Animated.Value(animated && animationType !== "none" ? 0 : 1),
  ).current;

  // swipe accumulators
  const dragX = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const dragging = enableSwipe;

  // ripples (iOS)
  const rippleX = useRef(new Animated.Value(0)).current;
  const rippleY = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0.01)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const rippleRadius = 200;

  // helpers
  const wantsGlow = glowEffect || interactions.includes("glow");
  const wantsShimmer = shimmerEffect || interactions.includes("shimmer");

  const doHaptic = useCallback(
    async (type: HapticType = hapticType) => {
      if (!hapticFeedback || !hapticsAvailable) return;
      try {
        if (type === "selection") return Haptics.selectionAsync();
        if (type === "notification")
          return Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        const map = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        } as const;
        return Haptics.impactAsync(map[type] ?? map.light);
      } catch {}
    },
    [hapticFeedback, hapticsAvailable, hapticType],
  );

  // base style (non-animated parts)
  const baseStyle = useMemo<StyleProp<ViewStyle>>(() => {
    const common: ViewStyle = {
      borderRadius: S.rad,
      overflow: "hidden",
      backgroundColor: "#fff",
      padding: S.pad,
      minHeight: S.h,
    };
    switch (variant) {
      case "glass":
      case "glass-primary":
      case "glass-secondary":
        return [
          {
            ...common,
            backgroundColor: "rgba(255,255,255,0.10)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.18)",
          },
        ];
      case "gradient":
      case "gradient-primary":
      case "gradient-secondary":
      case "gradient-premium":
      case "holographic":
        return [{ ...common, backgroundColor: "transparent" }];
      case "neon":
      case "neon-primary":
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
      case "minimal":
        return [
          {
            ...common,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: "#e5e7eb",
          },
        ];
      case "floating":
        return [{ ...common }];
      case "elevated":
        return [{ ...common }];
      case "outlined":
        return [
          {
            ...common,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: "#d1d5db",
          },
        ];
      default:
        return [common];
    }
  }, [variant, S, glowColor]);

  // entrance animation
  useEffect(() => {
    if (!animated || animationType === "none") return;
    const anims: Animated.CompositeAnimation[] = [];
    anims.push(
      Animated.timing(opacity, {
        toValue: 1,
        duration: animationDuration,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    );
    if (animationType === "fadeInUp") {
      anims.push(
        Animated.timing(ty, {
          toValue: 0,
          duration: animationDuration,
          delay: animationDelay,
          useNativeDriver: true,
        }),
      );
    } else if (animationType === "scaleIn") {
      scale.setValue(0.96);
      anims.push(
        Animated.timing(scale, {
          toValue: 1,
          duration: animationDuration,
          delay: animationDelay,
          useNativeDriver: true,
        }),
      );
    } else if (
      animationType === "slideInLeft" ||
      animationType === "slideInRight"
    ) {
      anims.push(
        Animated.timing(tx, {
          toValue: 0,
          duration: animationDuration,
          delay: animationDelay,
          useNativeDriver: true,
        }),
      );
    }
    Animated.parallel(anims).start();
  }, [
    animated,
    animationType,
    animationDelay,
    animationDuration,
    opacity,
    tx,
    ty,
    scale,
  ]);

  // shimmer loop
  useEffect(() => {
    if (!wantsShimmer || reduceMotion.current) return;
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
  }, [wantsShimmer, shimmerDuration, shimmer]);

  // loader (if you add one later)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    );
    return () => {
      rotate.setValue(0);
      loop.stop();
    };
  }, [rotate]);

  // press in/out
  const onPressIn = useCallback(
    (e?: GestureResponderEvent) => {
      if (pressEffect && !reduceMotion.current) {
        Animated.spring(scale, {
          toValue: 0.985,
          friction: 8,
          tension: 240,
          useNativeDriver: true,
        }).start();
      }
      if (wantsGlow) {
        Animated.timing(glow, {
          toValue: 1,
          duration: 140,
          useNativeDriver: false,
        }).start();
      }
      // iOS ripple
      if (Platform.OS !== "android") {
        const { locationX = 0, locationY = 0 } = e?.nativeEvent ?? {};
        rippleX.setValue(locationX - rippleRadius);
        rippleY.setValue(locationY - rippleRadius);
        rippleScale.setValue(0.01);
        rippleOpacity.setValue(0.18);
        Animated.parallel([
          Animated.timing(rippleScale, {
            toValue: 1,
            duration: reduceMotion.current ? 100 : 360,
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity, {
            toValue: 0,
            duration: reduceMotion.current ? 160 : 460,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
    [
      pressEffect,
      wantsGlow,
      scale,
      glow,
      rippleX,
      rippleY,
      rippleScale,
      rippleOpacity,
    ],
  );

  const onPressOut = useCallback(() => {
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
        duration: 160,
        useNativeDriver: false,
      }).start();
    }
  }, [pressEffect, wantsGlow, scale, glow]);

  const handlePress = useCallback(async () => {
    if (!onPress) return;
    await doHaptic("medium");
    try {
      await onPress();
    } catch {
      await doHaptic("notification");
    }
  }, [onPress, doHaptic]);

  const handleLong = useCallback(async () => {
    if (!onLongPress) return;
    await doHaptic("heavy");
    await onLongPress();
  }, [onLongPress, doHaptic]);

  // swipe (unified with tilt; no double PanResponders)
  const onTouchMove = useCallback(
    (e: GestureResponderEvent) => {
      if (!enableSwipe && !tiltEffect && !interactions.includes("tilt")) return;
      const { pageX, pageY, locationX, locationY } = e.nativeEvent as any;
      // derive deltas from center-ish (simple)
      const cx = SCREEN_WIDTH / 2;
      const dx = pageX - cx;
      const dy = (pageY ?? 0) - 300; // approximate; for better results use gesture-handler
      if (enableSwipe) {
        dragX.setValue(dx * 0.2);
        dragY.setValue(dy * 0.2);
      }
      if (tiltEffect || interactions.includes("tilt")) {
        const max = 10;
        tiltX.setValue(Math.max(-max, Math.min(max, (dy / 100) * max)));
        tiltY.setValue(Math.max(-max, Math.min(max, -(dx / 100) * max)));
      }
    },
    [enableSwipe, tiltEffect, interactions, dragX, dragY, tiltX, tiltY],
  );

  const onTouchEnd = useCallback(() => {
    if (enableSwipe) {
      // evaluate swipe
      dragX.stopAnimation((x: number) => {
        dragY.stopAnimation((y: number) => {
          const vx = Math.abs(x);
          const vy = Math.abs(y);
          if (vx > swipeThreshold) {
            if (x > 0) onSwipeRight?.();
            else onSwipeLeft?.();
          } else if (vy > swipeThreshold) {
            if (y < 0) onSwipeUp?.();
            else onSwipeDown?.();
          }
          Animated.parallel([
            Animated.spring(dragX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(dragY, { toValue: 0, useNativeDriver: true }),
          ]).start();
        });
      });
    }
    if (tiltEffect || interactions.includes("tilt")) {
      Animated.parallel([
        Animated.spring(tiltX, { toValue: 0, useNativeDriver: true }),
        Animated.spring(tiltY, { toValue: 0, useNativeDriver: true }),
      ]).start();
    }
  }, [
    enableSwipe,
    swipeThreshold,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    dragX,
    dragY,
    tiltX,
    tiltY,
    interactions,
  ]);

  // gradient colors resolver
  const resolvedGradient = useMemo(() => {
    if (gradientColors?.length) return gradientColors;
    if (gradientName) return GRADIENTS[gradientName] ?? GRADIENTS.primary;
    if (variant.startsWith("gradient")) return GRADIENTS.primary;
    if (variant === "holographic") return GRADIENTS.holographic;
    if (variant === "neon" || variant === "neon-primary") return GRADIENTS.neon;
    return undefined;
  }, [gradientColors, gradientName, variant]);

  // container animated style
  const containerStyle: StyleProp<ViewStyle> = [
    baseStyle,
    {
      transform: [
        { scale },
        { translateX: Animated.add(tx, dragX) },
        { translateY: Animated.add(ty, dragY) },
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
      opacity,
      ...(Platform.OS === "ios" && {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: glow.interpolate({
          inputRange: [0, 1],
          outputRange: [0.08, 0.35],
        }) as unknown as number,
        shadowRadius: glow.interpolate({
          inputRange: [0, 1],
          outputRange: [4, 16 * (glowIntensity ?? 1)],
        }) as unknown as number,
      }),
      ...(Platform.OS === "android" && { elevation: 6 }),
    },
    style,
  ];

  return (
    <AnimatedView style={containerStyle}>
      {/* gradient / holographic / glass layers */}
      {resolvedGradient && (
        <LinearGradient
          pointerEvents="none"
          colors={resolvedGradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      {(variant === "glass" || variant.startsWith("glass-")) && (
        <BlurView
          pointerEvents="none"
          intensity={24}
          style={StyleSheet.absoluteFill}
        />
      )}
      {/* Android glow overlay */}
      {Platform.OS === "android" &&
        (glowEffect || interactions.includes("glow")) && (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: S.rad,
                backgroundColor: glowColor,
                opacity: glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.2],
                }),
              },
            ]}
          />
        )}

      {/* Pressable content layer */}
      <AnimatedPressable
        ref={ref as any}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}
        onLongPress={handleLong}
        onTouchMove={
          enableSwipe || tiltEffect || interactions.includes("tilt")
            ? onTouchMove
            : undefined
        }
        onTouchEnd={
          enableSwipe || tiltEffect || interactions.includes("tilt")
            ? onTouchEnd
            : undefined
        }
        android_ripple={
          Platform.OS === "android"
            ? {
                color: "rgba(255,255,255,0.28)",
                borderless: false,
                foreground: true,
              }
            : undefined
        }
        accessibilityRole={onPress ? "button" : "summary"}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: !!rest.disabled }}
        style={[styles.inner, contentStyle]}
        {...rest}
      >
        {children}
        {/* iOS ripple */}
        {Platform.OS !== "android" && (
          <Animated.View
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
          <Animated.View
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
      </AnimatedPressable>
    </AnimatedView>
  );
});

export const Card = memo(CardBase);

// Presets (same API)
export const CardPresets = {
  default: (p: CardProps) => <Card {...p} variant="default" />,
  glass: (p: CardProps) => <Card {...p} variant="glass" glowEffect />,
  holographic: (p: CardProps) => (
    <Card {...p} variant="holographic" shimmerEffect glowEffect tiltEffect />
  ),
  gradient: (p: CardProps) => (
    <Card {...p} variant="gradient" gradientName="primary" />
  ),
  neon: (p: CardProps) => (
    <Card {...p} variant="neon" glowEffect shimmerEffect glowIntensity={2} />
  ),
  premium: (p: CardProps) => (
    <Card
      {...p}
      variant="premium"
      glowEffect
      shimmerEffect
      tiltEffect
      pressEffect
    />
  ),
  floating: (p: CardProps) => <Card {...p} variant="floating" pressEffect />,
  minimal: (p: CardProps) => <Card {...p} variant="minimal" />,
};

const styles = StyleSheet.create({
  inner: { flex: 1, justifyContent: "center" },
  ripple: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
export default Card;
