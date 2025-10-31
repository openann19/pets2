/**
 * MatchMoment – particle burst.
 * Uses rAF (no setInterval), re-renders once per frame with minimal allocations.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Circle } from '@shopify/react-native-skia';
import { useReducedMotion } from '@/foundation/reduceMotion';
import { useCapabilities } from '@/foundation/useCapabilities';
import { useParticleBurst } from './useParticleBurst';

export function MatchMoment({ onDone, enabled = true }: { onDone?: () => void; enabled?: boolean }) {
  const reduced = useReducedMotion();
  const caps = useCapabilities(true);
  const { pool, trigger, tick } = useParticleBurst(220);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(Date.now());
  const [, bump] = useState(0); // tiny state to trigger repaint

  // one-shot spawn
  useEffect(() => {
    if (!enabled || reduced || !caps.skia) return;

    const cx = 160;
    const cy = 200;
    trigger(cx, cy, caps.highPerf ? 160 : 60);
  }, [enabled, reduced, caps, trigger]);

  // frame loop
  useEffect(() => {
    if (reduced || !caps.skia || !enabled) return;

    const frame = () => {
      const now = Date.now();
      const dt = now - lastRef.current;
      lastRef.current = now;
      tick(dt);
      bump(v => v ^ 1); // toggle 0/1, avoids drift and is cheap
      if (pool.alive === 0) {
        onDone?.();
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, reduced, caps, tick, pool, onDone]);

  if (reduced || !caps.skia) return null;

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      {pool.items.slice(0, pool.alive).map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={p.size} color={`hsla(${p.hue},85%,60%,${p.alpha})`} />
      ))}
    </Canvas>
  );
}

