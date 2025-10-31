/**
 * AuroraSheen – animated gradient sweep driven by Skia Values.
 */

import React from 'react';
import { useWindowDimensions } from 'react-native';
import { Canvas, Rect, LinearGradient, vec, useValue, useComputedValue } from '@shopify/react-native-skia';
import { useReducedMotion } from '@/foundation/reduceMotion';
import { useCapabilities } from '@/foundation/useCapabilities';

export function AuroraSheen({ height = 60, opacity = 0.6 }: { height?: number; opacity?: number }) {
  const { width } = useWindowDimensions();
  const reduced = useReducedMotion();
  const caps = useCapabilities(true);
  const t = useValue(0); // 0..1

  // Compute values must be called unconditionally (hooks rules)
  const startV = useComputedValue(() => {
    if (reduced || !caps.skia) {
      return vec(-width * 0.4, 0);
    }
    const sx = -width * 0.4 + width * 1.2 * t.current;
    return vec(sx, 0);
  }, [t, width, reduced, caps.skia]);

  const endV = useComputedValue(() => {
    if (reduced || !caps.skia) {
      return vec(0, height);
    }
    return vec(startV.current.x + width * 0.6, height);
  }, [startV, width, height, reduced, caps.skia]);

  // drive t using rAF without React rerenders
  React.useEffect(() => {
    if (reduced || !caps.skia) return;

    let raf = 0;
    const start = Date.now();
    const loop = () => {
      const elapsed = (Date.now() - start) % 5000;
      t.current = elapsed / 5000;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced, caps.skia, t]);

  if (reduced || !caps.skia) return null;

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, height, pointerEvents: 'none', opacity }}>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={startV}
          end={endV}
          colors={['rgba(236,72,153,0.0)', 'rgba(168,85,247,0.5)', 'rgba(245,87,108,0.35)', 'rgba(236,72,153,0.0)']}
        />
      </Rect>
    </Canvas>
  );
}

