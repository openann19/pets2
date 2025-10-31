/**
 * 🎯 FOUNDATION: DEVICE CAPABILITIES
 * 
 * Heuristic capability detection for gating heavy effects
 */

import { useMemo } from 'react';
import { Platform, PixelRatio } from 'react-native';

export type Caps = { highPerf: boolean; skia: boolean; hdr: boolean };

/**
 * Heuristic only (no native deps):
 * - iOS 15+ considered highPerf
 * - Android SDK >= 31 and devicePixelRatio >= 2.625 considered highPerf
 * You can override skia via param; default assume true if Canvas exists.
 * 
 * @example
 * ```tsx
 * const caps = useCapabilities();
 * if (caps.skia && caps.highPerf) {
 *   // Use advanced Skia effects
 * }
 * ```
 */
export function useCapabilities(hasSkia?: boolean): Caps {
  return useMemo(() => {
    const ios = Platform.OS === 'ios';
    const ver = Number(Platform.Version) || 0;
    const dpr = PixelRatio.get();
    const highPerf = ios ? ver >= 15 : ver >= 31 && dpr >= 2.625;
    
    // Check if Skia is available
    let skia = hasSkia ?? false;
    if (hasSkia === undefined) {
      try {
        // Try to require Skia - if it exists, assume it's available
        require('@shopify/react-native-skia');
        skia = true;
      } catch {
        skia = false;
      }
    }
    
    return { highPerf, skia, hdr: false };
  }, [hasSkia]);
}

