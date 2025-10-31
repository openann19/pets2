/**
 * Hook for particle burst management
 */

import { useRef, useCallback } from 'react';
import { makePool, spawn, step } from './ParticlePool';
import { createParticle } from './createParticle';
import type { Pool } from './particleTypes';

export function useParticleBurst(capacity = 200) {
  const poolRef = useRef<Pool>(makePool(capacity));

  const trigger = useCallback((x: number, y: number, count = 120) => {
    spawn(poolRef.current, x, y, count, createParticle);
  }, []);

  const tick = useCallback((dt: number) => {
    step(poolRef.current, dt);
  }, []);

  return { pool: poolRef.current, trigger, tick };
}

