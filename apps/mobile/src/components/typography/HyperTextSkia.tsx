// apps/mobile/src/components/typography/HyperTextSkia.tsx
import React, { memo, useEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  AccessibilityInfo,
  type FlexAlignType,
} from "react-native";
import {
  Canvas,
  Mask,
  Group,
  Text as SText,
  Rect,
  RoundedRect,
  LinearGradient,
  BlurMask,
  vec,
  useFont,
  useValue,
  runTiming,
  Easing,
  type SkiaValue,
} from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing as REasing,
} from "react-native-reanimated";

export type Variant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "title"
  | "subtitle"
  | "body"
  | "bodyLarge"
  | "bodySmall"
  | "caption"
  | "overline"
  | "button"
  | "label";

type Weight = "300" | "400" | "500" | "600" | "700" | "800" | "900";

type AnimationType =
  | "none"
  | "fadeInUp"
  | "scaleIn"
  | "slideInLeft"
  | "slideInRight"
  | "reveal";
type Effect =
  | "gradient"
  | "neon" // bright glow
  | "aberration" // RGB split fringe
  | "glass" // top sheen
  | "shimmer" // specular sweep
  | "shadow"; // soft drop

export interface HyperTextSkiaProps {
  children: string; // Skia edition works with string text
  variant?: Variant;
  weight?: Weight;
  color?: string; // used when not gradient
  align?: "auto" | "left" | "right" | "center" | "justify";

  animated?: boolean;
  animationType?: AnimationType;
  animationDelay?: number;
  animationDuration?: number;

  effects?: Effect[];
  gradientColors?: string[];
  glowColor?: string;
  glassOpacity?: number;
  shimmerIntensity?: number; // 0..1
  split?: boolean; // per-char reveal

  maxSplit?: number; // perf guard (default 140)
  fontSrc?: number; // require(".../Inter-SemiBold.ttf")
  letterSpacing?: number; // optional letter spacing
}

/** Token-like metrics (swap with your theme) */
const METRICS: Record<Variant, { size: number; line: number; weight: Weight }> =
  {
    display: { size: 48, line: 56, weight: "900" },
    h1: { size: 32, line: 40, weight: "700" },
    h2: { size: 28, line: 36, weight: "700" },
    h3: { size: 24, line: 32, weight: "700" },
    h4: { size: 20, line: 28, weight: "600" },
    h5: { size: 18, line: 24, weight: "600" },
    h6: { size: 16, line: 22, weight: "600" },
    title: { size: 22, line: 30, weight: "700" },
    subtitle: { size: 16, line: 24, weight: "500" },
    body: { size: 16, line: 24, weight: "400" },
    bodyLarge: { size: 18, line: 28, weight: "400" },
    bodySmall: { size: 14, line: 20, weight: "400" },
    caption: { size: 12, line: 16, weight: "400" },
    overline: { size: 10, line: 14, weight: "500" },
    button: { size: 16, line: 20, weight: "600" },
    label: { size: 14, line: 18, weight: "500" },
  };

const has = (fx: Effect[] | undefined, k: Effect) => !!fx && fx.includes(k);

const AView = Animated.createAnimatedComponent(View);

export const HyperTextSkia = memo((props: HyperTextSkiaProps) => {
  const {
    children,
    variant = "body",
    weight,
    color = "#111827",
    align = "auto",
    animated = true,
    animationType = "fadeInUp",
    animationDelay = 0,
    animationDuration = 520,

    effects = ["gradient"],
    gradientColors = ["#00E1FF", "#7C4DFF", "#FF00E5"],
    glowColor = "#B388FF",
    glassOpacity = 0.16,
    shimmerIntensity = 0.28,
    split = false,
    maxSplit = 140,
    fontSrc, // required for Skia to render
    letterSpacing = 0,
  } = props;

  // Reduce motion gate
  const reduceMotion = useSharedValue(0);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(
      (v) => (reduceMotion.value = v ? 1 : 0),
    );
  }, []);

  // Font loading (Skia needs an explicit font)
  const m = METRICS[variant];
  const font = useFont(fontSrc ?? 0, m.size);
  const loaded = !!font && !!children;

  // Early fallback if font not ready or non-string content
  if (!loaded || typeof children !== "string") {
    return null; // let wrapper fall back to your MaskedView version
  }

  // Measure text & per-char widths for split mode
  const letters = useMemo(() => children.split(""), [children]);
  const useSplit = split && letters.length <= maxSplit;

  // simple measure loop
  const positions = useMemo(() => {
    let x = 0;
    const pos: number[] = [];
    for (let i = 0; i < letters.length; i++) {
      pos.push(x);
      x += font!.getTextWidth(letters[i]) + letterSpacing;
    }
    return {
      total:
        pos[pos.length - 1] + font!.getTextWidth(letters[letters.length - 1]) ||
        0,
      pos,
    };
  }, [letters, font, letterSpacing]);

  // Canvas size (pad a little for blur/glow)
  const PAD = 12;
  const width = Math.ceil(positions.total) + PAD * 2;
  const height = Math.ceil(m.line) + PAD * 2;

  // Reanimated container (entrance)
  const opacity = useSharedValue(animated && animationType !== "none" ? 0 : 1);
  const tx = useSharedValue(
    animated &&
      (animationType === "slideInLeft" || animationType === "slideInRight")
      ? animationType === "slideInLeft"
        ? -24
        : 24
      : 0,
  );
  const ty = useSharedValue(animated && animationType === "fadeInUp" ? 14 : 0);
  const scale = useSharedValue(
    animated && animationType === "scaleIn" ? 0.96 : 1,
  );

  useEffect(() => {
    if (!animated || animationType === "none") return;
    const d = animationDuration;
    const delay = animationDelay;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: d, easing: REasing.out(REasing.cubic) }),
    );
    if (animationType === "fadeInUp") {
      ty.value = withDelay(
        delay,
        withTiming(0, { duration: d, easing: REasing.out(REasing.cubic) }),
      );
    } else if (animationType === "scaleIn") {
      scale.value = withDelay(
        delay,
        withTiming(1, { duration: d, easing: REasing.out(REasing.back(1.1)) }),
      );
    } else if (
      animationType === "slideInLeft" ||
      animationType === "slideInRight"
    ) {
      tx.value = withDelay(
        delay,
        withTiming(0, { duration: d, easing: REasing.out(REasing.cubic) }),
      );
    }
  }, [animated, animationType, animationDelay, animationDuration]);

  const alignSelfValue: FlexAlignType =
    align === "center"
      ? "center"
      : align === "right"
        ? "flex-end"
        : align === "justify"
          ? "stretch"
          : "flex-start";

  const containerAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
    alignSelf: alignSelfValue,
  }));

  // Skia shimmer sweep (UI thread)
  const sweepX = useValue(-150);
  useEffect(() => {
    if (!has(effects, "shimmer")) return;
    sweepX.current = -150;
    runTiming(sweepX, 150, {
      duration: 1600,
      easing: Easing.inOut(Easing.cubic),
      loop: true,
      yoyo: false,
    });
  }, [effects]);

  // Per-char reveal (UI thread)
  const charOpacity = useRef<SkiaValue<number>[]>(
    letters.map(() => useValue(0)),
  ).current;
  const charY = useRef<SkiaValue<number>[]>(
    letters.map(() => useValue(8)),
  ).current;

  useEffect(() => {
    if (!useSplit || reduceMotion.value === 1) return;
    const baseDelay = animationDelay ?? 0;
    for (let i = 0; i < letters.length; i++) {
      const del =
        baseDelay + i * Math.min(22, Math.max(8, animationDuration / 24));
      runTiming(charOpacity[i], 1, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
        delay: del,
      });
      runTiming(charY[i], 0, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
        delay: del,
      });
    }
  }, [useSplit, letters.length, animationDelay, animationDuration]);

  // Alignment offset
  const alignOffsetX = useMemo(() => {
    if (align === "center") return -width / 2;
    if (align === "right") return -width;
    return -PAD;
  }, [align, width]);

  const originX =
    PAD +
    Math.max(0, align === "center" ? width / 2 : align === "right" ? width : 0);

  // --- RENDER LAYERS ---
  const textY = PAD + m.size; // baseline-ish

  const SolidText = ({
    c = color,
    x = 0,
    y = textY,
  }: {
    c?: string;
    x?: number;
    y?: number;
  }) => <SText text={children} x={x} y={y} font={font!} color={c} />;

  const GradientFill = () => (
    <Mask
      mask={
        <Group>
          {/* mask is the text filled with solid white */}
          <SText text={children} x={PAD} y={textY} font={font!} color="white" />
        </Group>
      }
    >
      {/* gradient rect under the mask */}
      <Rect x={PAD} y={PAD} width={width - PAD * 2} height={height - PAD * 2}>
        <LinearGradient
          start={vec(PAD, PAD)}
          end={vec(width - PAD, PAD)}
          colors={gradientColors}
        />
      </Rect>
      {has(effects, "shimmer") && (
        <Rect
          x={sweepX}
          y={PAD}
          width={56}
          height={height - PAD * 2}
          color="rgba(255,255,255,0.35)"
        />
      )}
    </Mask>
  );

  const Aberration = () => (
    <Group>
      <SText
        text={children}
        x={PAD + 0.6}
        y={textY}
        font={font!}
        color="rgba(255,0,72,0.85)"
      />
      <SText
        text={children}
        x={PAD - 0.6}
        y={textY + 0.4}
        font={font!}
        color="rgba(0,255,244,0.85)"
      />
      <SText
        text={children}
        x={PAD}
        y={textY - 0.6}
        font={font!}
        color="rgba(0,72,255,0.85)"
      />
    </Group>
  );

  const Glow = () => (
    <Group>
      <SText text={children} x={PAD} y={textY} font={font!} color={glowColor}>
        <BlurMask blur={16} style="outer" />
      </SText>
    </Group>
  );

  const Glass = () => (
    <Group>
      <RoundedRect
        x={PAD}
        y={PAD}
        width={width - PAD * 2}
        height={(height - PAD * 2) * 0.55}
        r={6}
      >
        <LinearGradient
          start={vec(PAD, PAD)}
          end={vec(width - PAD, PAD)}
          colors={[
            "rgba(255,255,255,0.50)",
            "rgba(255,255,255,0.06)",
            "transparent",
          ]}
        />
      </RoundedRect>
    </Group>
  );

  // Per-char rendering (with gradient + fringe + glow) for hero text
  const SplitText = () => (
    <Group>
      {letters.map((ch, i) => {
        const x = PAD + (positions.pos[i] ?? 0);
        const yVal = charY[i];
        const oVal = charOpacity[i];
        if (yVal === undefined || oVal === undefined) {
          return null;
        }
        // Skia values aren’t props, so we “snapshot” via derived Group transforms:
        return (
          <Group
            key={`g${i}`}
            opacity={oVal}
            transform={[{ translateX: x }, { translateY: yVal }]}
          >
            {has(effects, "aberration") && (
              <Group>
                <SText
                  text={ch}
                  x={0.6}
                  y={textY}
                  font={font!}
                  color="rgba(255,0,72,0.85)"
                />
                <SText
                  text={ch}
                  x={-0.6}
                  y={textY + 0.4}
                  font={font!}
                  color="rgba(0,255,244,0.85)"
                />
                <SText
                  text={ch}
                  x={0}
                  y={textY - 0.6}
                  font={font!}
                  color="rgba(0,72,255,0.85)"
                />
              </Group>
            )}
            {has(effects, "neon") && (
              <SText text={ch} x={0} y={textY} font={font!} color={glowColor}>
                <BlurMask blur={14} style="outer" />
              </SText>
            )}
            {has(effects, "gradient") ? (
              <Mask
                mask={
                  <SText text={ch} x={0} y={textY} font={font!} color="white" />
                }
              >
                <Rect
                  x={0}
                  y={PAD}
                  width={font!.getTextWidth(ch)}
                  height={height - PAD * 2}
                >
                  <LinearGradient
                    start={vec(0, PAD)}
                    end={vec(font!.getTextWidth(ch), PAD)}
                    colors={gradientColors}
                  />
                </Rect>
              </Mask>
            ) : (
              <SText text={ch} x={0} y={textY} font={font!} color={color} />
            )}
          </Group>
        );
      })}
      {has(effects, "shimmer") && (
        <Rect
          x={sweepX}
          y={PAD}
          width={56}
          height={height - PAD * 2}
          color={`rgba(255,255,255,${shimmerIntensity})`}
        />
      )}
    </Group>
  );

  return (
    <AView
      style={[
        { width, height, transform: [{ translateX: alignOffsetX }] },
        containerAnim,
      ]}
      pointerEvents="none"
    >
      <Canvas style={{ width, height }}>
        {/* back glow / shadow */}
        {has(effects, "shadow") && (
          <SText
            text={children}
            x={PAD}
            y={textY}
            font={font!}
            color="rgba(0,0,0,0.35)"
          >
            <BlurMask blur={6} style="outer" />
          </SText>
        )}
        {has(effects, "neon") && <Glow />}
        {has(effects, "aberration") && !useSplit && <Aberration />}

        {/* main fill (gradient or solid, split or not) */}
        {useSplit ? (
          <SplitText />
        ) : has(effects, "gradient") ? (
          <GradientFill />
        ) : (
          <SolidText x={PAD} />
        )}

        {/* glass sheen */}
        {has(effects, "glass") && <Glass />}
      </Canvas>
    </AView>
  );
});

export default HyperTextSkia;
