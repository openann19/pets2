/**
 * LiquidIndicatorGel – Skia gel indicator with gradient + blur
 * Subpixel-safe width rounding to avoid blur artifacts
 */

import React from 'react';
import { Canvas, RoundedRect, LinearGradient, vec, BlurMask } from '@shopify/react-native-skia';

export function LiquidIndicatorGel({ width, height = 34 }: { width: number; height?: number }) {
  const w = Math.max(1, Math.round(width)); // subpixel rounding avoids blur
  return (
    <Canvas style={{ width: w, height }}>
      <RoundedRect x={0} y={0} width={w} height={height} r={height / 2}>
        <LinearGradient start={vec(0, 0)} end={vec(w, height)} colors={['#ec489980', '#a855f780', '#ec489960']} />
        <BlurMask blur={4} style="normal" />
      </RoundedRect>
    </Canvas>
  );
}

