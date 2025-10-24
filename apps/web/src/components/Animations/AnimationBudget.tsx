'use client'

/**
 * 🔥 ANIMATION BUDGET V2 — Predictive FPS Throttling
 * Monitors FPS and throttles animations when performance drops
 * ‑ No ML, pure FPS sampling and adaptive limits
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface BudgetV2 {
  performanceLevel: 'low' | 'mid' | 'high';
  activeAnimations: number;
  maxAnimations: number;
  throttlingFactor: number; // 0..1
}

export interface UseAnimationBudgetV2Options {
  sample?: number; // ms to sample FPS
  maxAnimationsHigh?: number;
  maxAnimationsMid?: number;
  maxAnimationsLow?: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function useAnimationBudgetV2({
  sample = 800,
  maxAnimationsHigh = 24,
  maxAnimationsMid = 14,
  maxAnimationsLow = 8,
}: UseAnimationBudgetV2Options = {}) {
  const [budget, setBudget] = useState<BudgetV2>({
    performanceLevel: 'high',
    activeAnimations: 0,
    maxAnimations: maxAnimationsHigh,
    throttlingFactor: 1,
  });
  
  const perf = useRef({ frames: 0, t0: 0 });

  useEffect(() => {
    let raf: number;
    const step = (t: number) => {
      if (!perf.current.t0) perf.current.t0 = t;
      perf.current.frames++;
      
      if (t - perf.current.t0 >= sample) {
        const fps = (perf.current.frames * 1000) / (t - perf.current.t0);
        const level: BudgetV2['performanceLevel'] =
          fps >= 55 ? 'high' : fps >= 40 ? 'mid' : 'low';
        const max =
          level === 'high'
            ? maxAnimationsHigh
            : level === 'mid'
            ? maxAnimationsMid
            : maxAnimationsLow;
        const throttlingFactor = clamp(fps / 60, 0.6, 1);
        
        setBudget((b) => ({
          ...b,
          performanceLevel: level,
          maxAnimations: max,
          throttlingFactor,
        }));
        
        perf.current.frames = 0;
        perf.current.t0 = t;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [sample, maxAnimationsHigh, maxAnimationsMid, maxAnimationsLow]);

  const registerAnimation = useCallback(() => {
    let ok = false;
    setBudget((b) => {
      ok = b.activeAnimations + 1 <= b.maxAnimations;
      return {
        ...b,
        activeAnimations: ok ? b.activeAnimations + 1 : b.activeAnimations,
      };
    });
    return ok;
  }, []);

  const unregisterAnimation = useCallback(() => {
    setBudget((b) => ({
      ...b,
      activeAnimations: Math.max(0, b.activeAnimations - 1),
    }));
  }, []);

  return { budget, registerAnimation, unregisterAnimation } as const;
}

/**
 * Example: Animation Budget Display (debug component)
 */
export function AnimationBudgetDisplay() {
  const { budget } = useAnimationBudgetV2();
  
  return (
    <div className="fixed bottom-4 right-4 z-[9999] p-3 rounded-lg bg-black/80 text-white text-xs font-mono">
      <div>Level: {budget.performanceLevel}</div>
      <div>Active: {budget.activeAnimations}/{budget.maxAnimations}</div>
      <div>Throttle: {(budget.throttlingFactor * 100).toFixed(0)}%</div>
    </div>
  );
}
