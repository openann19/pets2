/**
 * 🎯 FOUNDATION: REDUCE MOTION (Web)
 * 
 * Web-compatible reduced-motion detection hook
 */

import { useEffect, useState } from 'react';
import { isBrowser, safeMatchMedia } from '@pawfectmatch/core/utils/env';

/**
 * Web-compatible reduced-motion hook using CSS media query
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
    if (!isBrowser()) return;

    const mediaQuery = safeMatchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery) return;
    
    // Set initial value
    setReduced(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
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

