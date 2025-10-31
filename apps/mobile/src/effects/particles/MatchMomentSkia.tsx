/**
 * MatchMomentSkia – Skia-draw particles (no state toggles, no React re-renders)
 * 
 * Uses Skia draw callback for maximum smoothness - zero React rerenders,
 * all rendering happens on the UI thread via Skia's draw system.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useDrawCallback, Skia } from '@shopify/react-native-skia';
import { useReducedMotion } from '@/foundation/reduceMotion';
import { useCapabilities } from '@/foundation/useCapabilities';
import { useVsyncRate } from '@/foundation/useVsyncRate';
import { hapticSimple } from '@/foundation/haptics';
import { makePool, spawn, step } from './ParticlePool';
import { createParticle } from './createParticle';

export function MatchMomentSkia({ onDone, enabled = true }: { onDone?: () => void; enabled?: boolean }) {
  const reduced = useReducedMotion();
  const caps = useCapabilities(true);
  const hz = useVsyncRate();
  const capacity = hz === 120 && caps.highPerf ? 260 : hz === 90 ? 200 : 160;

  // pre-alloc pool once
  const pool = useMemo(() => makePool(capacity), [capacity]);
  const lastTs = useRef<number | null>(null);

  // spawn once on mount when allowed
  useEffect(() => {
    if (!enabled || reduced || !caps.skia) return;

    spawn(pool, 160, 200, hz === 120 ? 180 : hz === 90 ? 140 : 100, createParticle);
    hapticSimple('soft');
  }, [enabled, reduced, caps.skia, pool, hz]);

  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setAntiAlias(true);
    return p;
  }, []);

  const onDraw = useDrawCallback(
    (canvas, info) => {
      if (reduced || !caps.skia || !enabled) return;

      const ts = info.timestamp; // ms
      const dt = lastTs.current == null ? 16 : ts - lastTs.current;
      lastTs.current = ts;

      step(pool, dt);

      // draw all alive particles
      for (let i = 0; i < pool.alive; i++) {
        const prt = pool.items[i];
        paint.setColor(Skia.Color(`hsla(${prt.hue},85%,60%,${prt.alpha})`));
        canvas.drawCircle(prt.x, prt.y, prt.size, paint);
      }

      if (pool.alive === 0) onDone?.();
    },
    [enabled, reduced, caps.skia, pool, paint, onDone],
  );

  if (reduced || !caps.skia) return null;

  return <Canvas style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }} onDraw={onDraw} />;
}

