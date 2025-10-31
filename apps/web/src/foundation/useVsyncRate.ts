/**
 * 🎯 FOUNDATION: VSYNC RATE DETECTION (Web)
 * 
 * True refresh-rate gating with testable classifier
 * Classifies via median rAF interval. Boundaries between 60/90/120Hz: 13.9ms, 9.7ms.
 */

import { useEffect, useRef, useState } from 'react';
import { isBrowser, getSafeWindow, safeRequestAnimationFrame, safeCancelAnimationFrame } from '@pawfectmatch/core/utils/env';

/**
 * Classify refresh rate via median rAF interval
 * Boundaries: <= 9.7ms = 120Hz, <= 13.9ms = 90Hz, > 13.9ms = 60Hz
 */
export function classifyRefreshRate(intervalsMs: number[]): 60 | 90 | 120 {
  if (!intervalsMs.length) return 60;

  const sorted = [...intervalsMs].sort((a, b) => a - b);
  const m = sorted[Math.floor(sorted.length / 2)];

  if (m <= 9.7) return 120;
  if (m <= 13.9) return 90;
  return 60;
}

/**
 * Hook to detect device refresh rate via requestAnimationFrame sampling
 * 
 * @param sampleMs - Duration to sample (default 600ms)
 * @returns Detected refresh rate: 60, 90, or 120 Hz
 * 
 * @example
 * ```tsx
 * const hz = useVsyncRate();
 * const particleCount = hz === 120 ? 260 : hz === 90 ? 200 : 160;
 * ```
 */
export function useVsyncRate(sampleMs = 600): 60 | 90 | 120 {
  const [hz, setHz] = useState<60 | 90 | 120>(60);

  const t0 = useRef(0);
  const prev = useRef(0);
  const samples = useRef<number[]>([]);

  useEffect(() => {
    if (!isBrowser()) return;

    const win = getSafeWindow();
    if (!win?.performance) return;

    let raf: number | undefined = undefined;
    let stop = false;

    t0.current = win.performance.now();
    prev.current = t0.current;
    samples.current = [];

    const loop = () => {
      const now = win.performance.now();
      samples.current.push(now - prev.current);
      prev.current = now;

      if (!stop && now - t0.current < sampleMs) {
        raf = safeRequestAnimationFrame(loop);
      } else {
        setHz(classifyRefreshRate(samples.current));
      }
    };

    raf = safeRequestAnimationFrame(loop);

    return () => {
      stop = true;
      if (raf !== undefined) {
        safeCancelAnimationFrame(raf);
      }
    };
  }, [sampleMs]);

  return hz;
}

