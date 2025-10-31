/**
 * LiquidIndicator – Skia pixel-accurate indicator
 */

import React from 'react';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';

export function LiquidIndicator({ width, height = 34 }: { width: number; height?: number }) {
  // Canvas width is controlled by parent; we draw a full rounded pill within.
  return (
    <Canvas style={{ width, height }}>
      <RoundedRect x={0} y={0} width={width} height={height} r={height / 2} color="#ec489955" />
    </Canvas>
  );
}

