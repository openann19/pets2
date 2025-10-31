/**
 * 🎯 FOUNDATION: REDUCE MOTION
 * 
 * UltraCrisp Motion – robust, RN 0.7x+ compatible reduced-motion hook
 */

import { AccessibilityInfo, Platform } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Robust, RN 0.7x+ compatible reduced-motion hook
 * 
 * @example
 * ```tsx
 * const reduced = useReducedMotion();
 * const duration = reduced ? 120 : 240;
 * ```
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => mounted && setReduced(!!v));

    // RN changed API shape across versions; normalize safely:
    const sub: any = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v: boolean) => {
      setReduced(!!v);
    });

    return () => {
      mounted = false;
      // Both shapes supported:
      // - event.remove()
      // - AccessibilityInfo.removeEventListener('reduceMotionChanged', handler)
      if (sub?.remove) sub.remove();
      else if (Platform.OS !== 'web') {
        try { (AccessibilityInfo as any).removeEventListener?.('reduceMotionChanged'); } catch {}
      }
    };
  }, []);

  return reduced;
}

/**
 * Reduced motion helper: return fallback when reduced, normal otherwise
 * 
 * @example
 * ```tsx
 * const duration = rm(240, 120, reduced);
 * ```
 */
export function rm<T>(normal: T, fallback: T, reduced: boolean): T {
  return reduced ? fallback : normal;
}

