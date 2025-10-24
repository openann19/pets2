/**
 * 🎬 ULTRA PREMIUM LOTTIE ANIMATIONS
 * Professional-grade Lottie animations for mobile success/loading states
 * Performance optimized with proper lifecycle management
 */

import React, { useRef, useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import { View, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface LottieAnimationProps {
  /** Animation source (JSON file or URL) */
  source: any;
  /** Animation width */
  width?: number;
  /** Animation height */
  height?: number;
  /** Whether to auto-play */
  autoPlay?: boolean;
  /** Whether to loop */
  loop?: boolean;
  /** Animation speed multiplier */
  speed?: number;
  /** Callback when animation finishes */
  onAnimationFinish?: () => void;
  /** Additional styles */
  style?: any;
  /** Whether animation is visible */
  visible?: boolean;
  /** Color filters for theming */
  colorFilters?: Array<{
    keypath: string;
    color: string;
  }>;
}

/**
 * Base Lottie Animation Component
 */
export function LottieAnimation({
  source,
  width = 200,
  height = 200,
  autoPlay = true,
  loop = false,
  speed = 1,
  onAnimationFinish,
  style,
  visible = true,
  colorFilters,
}: LottieAnimationProps) {
  const animationRef = useRef<LottieView>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (animationRef.current && isLoaded) {
      if (autoPlay) {
        animationRef.current.play();
      }
    }
  }, [autoPlay, isLoaded]);

  const handleAnimationFinish = () => {
    onAnimationFinish?.();
  };

  if (!visible) return null;

  return (
    <View style={[styles.container, style]}>
      <LottieView
        ref={animationRef}
        source={source}
        style={{ width, height }}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        onAnimationFinish={handleAnimationFinish}
        colorFilters={colorFilters}
        onLoad={() => setIsLoaded(true)}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * Success Animation Component
 */
export function SuccessLottie({
  size = 140,
  onFinish,
  style,
}: {
  size?: number;
  onFinish?: () => void;
  style?: any;
}) {
  // In a real app, you would load this from assets
  const successAnimation = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 120,
    w: 512,
    h: 512,
    nm: "Success",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Checkmark",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [256, 256, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [100, 100] },
                p: { a: 0, k: [0, 0] },
                nm: "Ellipse Path 1",
                mn: "ADBE Vector Shape - Ellipse",
                hd: false,
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2, 0.8, 0.4, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 1,
                ml: 4,
                bm: 0,
                d: [{ n: "d", nm: "dash", v: 0 }],
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false,
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                or: { a: 0, k: [0, 0] },
                os: { a: 0, k: [0, 0] },
                ir: { a: 0, k: [0, 0] },
                is: { a: 0, k: [0, 0] },
                sy: 1,
              },
            ],
            nm: "Ellipse 1",
            np: 2,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
            hd: false,
          },
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0,
      },
    ],
    markers: [],
  };

  return (
    <LottieAnimation
      source={successAnimation}
      width={size}
      height={size}
      autoPlay={true}
      loop={false}
      speed={1.2}
      onAnimationFinish={onFinish}
      style={style}
    />
  );
}

/**
 * Loading Animation Component
 */
export function LoadingLottie({
  size = 120,
  style,
}: {
  size?: number;
  style?: any;
}) {
  const loadingAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: "Loading",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              {
                i: { x: [0.833], y: [0.833] },
                o: { x: [0.167], y: [0.167] },
                t: 0,
                s: [0],
              },
              { t: 90, s: [360] },
            ],
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [80, 80] },
                p: { a: 0, k: [0, 0] },
                nm: "Ellipse Path 1",
                mn: "ADBE Vector Shape - Ellipse",
                hd: false,
              },
              {
                ty: "st",
                c: { a: 0, k: [0.3, 0.6, 1, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 6 },
                lc: 2,
                lj: 1,
                ml: 4,
                bm: 0,
                d: [{ n: "d", nm: "dash", v: 0 }],
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false,
              },
            ],
            nm: "Circle",
            np: 2,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
            hd: false,
          },
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0,
      },
    ],
    markers: [],
  };

  return (
    <LottieAnimation
      source={loadingAnimation}
      width={size}
      height={size}
      autoPlay={true}
      loop={true}
      speed={1}
      style={style}
    />
  );
}

/**
 * Empty State Animation Component
 */
export function EmptyLottie({
  size = 160,
  style,
}: {
  size?: number;
  style?: any;
}) {
  const emptyAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 120,
    w: 300,
    h: 300,
    nm: "Empty",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Heart",
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              {
                i: { x: [0.833], y: [0.833] },
                o: { x: [0.167], y: [0.167] },
                t: 0,
                s: [0],
              },
              {
                i: { x: [0.833], y: [0.833] },
                o: { x: [0.167], y: [0.167] },
                t: 30,
                s: [100],
              },
              {
                i: { x: [0.833], y: [0.833] },
                o: { x: [0.167], y: [0.167] },
                t: 90,
                s: [100],
              },
              { t: 120, s: [0] },
            ],
          },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [150, 150, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              {
                i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] },
                o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] },
                t: 0,
                s: [0, 0, 100],
              },
              {
                i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] },
                o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] },
                t: 30,
                s: [100, 100, 100],
              },
              { t: 90, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "rc",
                s: { a: 0, k: [60, 60] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 30 },
                nm: "Rectangle Path 1",
                mn: "ADBE Vector Shape - Rect",
                hd: false,
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.4, 0.4, 1] },
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: "Fill 1",
                mn: "ADBE Vector Graphic - Fill",
                hd: false,
              },
            ],
            nm: "Heart",
            np: 2,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
            hd: false,
          },
        ],
        ip: 0,
        op: 120,
        st: 0,
        bm: 0,
      },
    ],
    markers: [],
  };

  return (
    <LottieAnimation
      source={emptyAnimation}
      width={size}
      height={size}
      autoPlay={true}
      loop={true}
      speed={0.8}
      style={style}
    />
  );
}

/**
 * Error Animation Component
 */
export function ErrorLottie({
  size = 140,
  onFinish,
  style,
}: {
  size?: number;
  onFinish?: () => void;
  style?: any;
}) {
  const errorAnimation = {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 90,
    w: 200,
    h: 200,
    nm: "Error",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "X",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              {
                i: { x: [0.833], y: [0.833] },
                o: { x: [0.167], y: [0.167] },
                t: 0,
                s: [0],
              },
              { t: 90, s: [360] },
            ],
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              {
                i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] },
                o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] },
                t: 0,
                s: [0, 0, 100],
              },
              {
                i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] },
                o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] },
                t: 30,
                s: [100, 100, 100],
              },
              { t: 90, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [80, 80] },
                p: { a: 0, k: [0, 0] },
                nm: "Ellipse Path 1",
                mn: "ADBE Vector Shape - Ellipse",
                hd: false,
              },
              {
                ty: "st",
                c: { a: 0, k: [1, 0.2, 0.2, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 8 },
                lc: 2,
                lj: 1,
                ml: 4,
                bm: 0,
                d: [{ n: "d", nm: "dash", v: 0 }],
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false,
              },
            ],
            nm: "Circle",
            np: 2,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
            hd: false,
          },
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0,
      },
    ],
    markers: [],
  };

  return (
    <LottieAnimation
      source={errorAnimation}
      width={size}
      height={size}
      autoPlay={true}
      loop={false}
      speed={1.5}
      onAnimationFinish={onFinish}
      style={style}
    />
  );
}

/**
 * Celebration Animation Component
 */
export function CelebrationLottie({
  size = 200,
  onFinish,
  style,
}: {
  size?: number;
  onFinish?: () => void;
  style?: any;
}) {
  const celebrationAnimation = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 150,
    w: 400,
    h: 400,
    nm: "Celebration",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Confetti",
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              {
                i: { x: [0.833], y: [0.833] },
                o: { x: [0.167], y: [0.167] },
                t: 0,
                s: [0],
              },
              {
                i: { x: [0.833], y: [0.833] },
                o: { x: [0.167], y: [0.167] },
                t: 30,
                s: [100],
              },
              { t: 120, s: [100] },
              { t: 150, s: [0] },
            ],
          },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [200, 200, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              {
                i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] },
                o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] },
                t: 0,
                s: [0, 0, 100],
              },
              {
                i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] },
                o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] },
                t: 30,
                s: [100, 100, 100],
              },
              { t: 120, s: [100, 100, 100] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "rc",
                s: { a: 0, k: [20, 20] },
                p: { a: 0, k: [0, 0] },
                r: { a: 0, k: 10 },
                nm: "Rectangle Path 1",
                mn: "ADBE Vector Shape - Rect",
                hd: false,
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.8, 0, 1] },
                o: { a: 0, k: 100 },
                r: 1,
                bm: 0,
                nm: "Fill 1",
                mn: "ADBE Vector Graphic - Fill",
                hd: false,
              },
            ],
            nm: "Confetti",
            np: 2,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
            hd: false,
          },
        ],
        ip: 0,
        op: 150,
        st: 0,
        bm: 0,
      },
    ],
    markers: [],
  };

  return (
    <LottieAnimation
      source={celebrationAnimation}
      width={size}
      height={size}
      autoPlay={true}
      loop={false}
      speed={1}
      onAnimationFinish={onFinish}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});

/**
 * Hook for managing Lottie animations
 */
export function useLottieAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const play = () => {
    setIsPlaying(true);
    setIsFinished(false);
  };

  const stop = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setIsPlaying(false);
    setIsFinished(false);
  };

  const onFinish = () => {
    setIsPlaying(false);
    setIsFinished(true);
  };

  return {
    isPlaying,
    isFinished,
    play,
    stop,
    reset,
    onFinish,
  };
}
