/**
 * Poof – Skia-reactive, 300ms self-destruct
 */

import React from 'react';
import { Canvas, Circle, useValue } from '@shopify/react-native-skia';

export function Poof({ x, y, onEnd }: { x: number; y: number; onEnd?: () => void }) {
  const p = useValue(0); // 0..1
  React.useEffect(() => {
    let raf = 0;
    const start = Date.now();
    const loop = () => {
      const t = (Date.now() - start) / 300;
      p.current = t >= 1 ? 1 : t;
      if (t >= 1) {
        onEnd?.();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [p, onEnd]);

  const radii = [6, 10, 14, 18, 22, 26];
  return (
    <Canvas style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      {radii.map((r, i) => (
        <Circle key={i} cx={x} cy={y} r={r * (0.6 + p.current)} color={`rgba(236,72,153,${1 - p.current})`} />
      ))}
    </Canvas>
  );
}

