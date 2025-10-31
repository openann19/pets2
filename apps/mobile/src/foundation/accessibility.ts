/**
 * 🎯 FOUNDATION: ACCESSIBILITY HOOKS
 * 
 * Announce context changes (screen transitions, modal open/close)
 * Progress components: live region updates every ≥300ms (debounced)
 * High contrast mode variant for shimmer/placeholder
 */

import React, { useEffect, useState } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Announce context change to screen readers
 * Use for screen transitions, modal open/close, major state changes
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   announceContextChange('Screen opened: Pet Details');
 * }, []);
 * ```
 */
export function announceContextChange(message: string): void {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibility(message);
  } else {
    AccessibilityInfo.announceForAccessibility(message);
  }
}

/**
 * Hook to announce context changes
 * 
 * @example
 * ```tsx
 * useAnnounceContextChange('Pet Details Screen', [screenId]);
 * ```
 */
export function useAnnounceContextChange(
  message: string,
  deps: React.DependencyList = [],
): void {
  useEffect(() => {
    announceContextChange(message);
  }, deps);
}

/**
 * Debounced live region updates
 * Updates every ≥300ms (debounced)
 * Use for progress bars, loading states, etc.
 */
let liveRegionTimeout: NodeJS.Timeout | null = null;
const LIVE_REGION_DEBOUNCE_MS = 300;

/**
 * Announce live region update (debounced)
 * 
 * @example
 * ```tsx
 * const [progress, setProgress] = useState(0);
 * 
 * useEffect(() => {
 *   announceLiveRegion(`Loading: ${progress}%`);
 * }, [progress]);
 * ```
 */
export function announceLiveRegion(message: string): void {
  if (liveRegionTimeout) {
    clearTimeout(liveRegionTimeout);
  }
  
  liveRegionTimeout = setTimeout(() => {
    announceContextChange(message);
    liveRegionTimeout = null;
  }, LIVE_REGION_DEBOUNCE_MS);
}

/**
 * Hook for progress announcements
 * Automatically debounces updates
 * 
 * @example
 * ```tsx
 * const announceProgress = useProgressAnnouncement();
 * 
 * useEffect(() => {
 *   announceProgress(`Uploaded ${bytes}/${total} bytes`);
 * }, [bytes, total]);
 * ```
 */
export function useProgressAnnouncement() {
  return announceLiveRegion;
}

/**
 * Check if high contrast mode is enabled
 */
export async function isHighContrastEnabled(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      // iOS: Check for increase contrast or reduce transparency
      const isReduceTransparencyEnabled = await AccessibilityInfo.isReduceTransparencyEnabled();
      const isBoldTextEnabled = await AccessibilityInfo.isBoldTextEnabled();
      return isReduceTransparencyEnabled || isBoldTextEnabled;
    } else {
      // Android: Check for high contrast text
      const isHighContrastTextEnabled = await AccessibilityInfo.isHighTextContrastEnabled();
      return isHighContrastTextEnabled;
    }
  } catch (error) {
    // If AccessibilityInfo methods not available, return false
    logger.debug('AccessibilityInfo check failed:', { error });
    return false;
  }
}

/**
 * Hook to check high contrast mode
 */
export function useHighContrast(): boolean {
  const [highContrast, setHighContrast] = useState(false);
  
  useEffect(() => {
    isHighContrastEnabled().then(setHighContrast);
  }, []);
  
  return highContrast;
}

/**
 * Get high contrast variant for shimmer/placeholder
 * Returns opacity values that work better in high contrast mode
 */
export function getHighContrastShimmer(opacity: number, highContrast: boolean): number {
  if (!highContrast) return opacity;
  
  // In high contrast, use stronger opacity for better visibility
  return Math.min(opacity * 1.5, 0.4);
}

/**
 * Get high contrast colors
 * Returns higher contrast color variants
 */
export function getHighContrastColor(
  normalColor: string,
  highContrast: boolean,
): string {
  if (!highContrast) return normalColor;
  
  // In high contrast mode, enhance color saturation and contrast
  // Convert hex to RGB, adjust saturation and brightness, then convert back
  try {
    // Remove # if present
    const hex = normalColor.replace('#', '');
    
    // Parse RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Increase contrast: darken dark colors, brighten light colors
    const contrastFactor = luminance > 0.5 ? 1.2 : 0.7;
    const newR = Math.min(255, Math.max(0, Math.round(r * contrastFactor)));
    const newG = Math.min(255, Math.max(0, Math.round(g * contrastFactor)));
    const newB = Math.min(255, Math.max(0, Math.round(b * contrastFactor)));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  } catch (error) {
    // If color parsing fails, return original
    logger.debug('High contrast color transformation failed:', { error });
    return normalColor;
  }
}

export default {
  announceContextChange,
  useAnnounceContextChange,
  announceLiveRegion,
  useProgressAnnouncement,
  isHighContrastEnabled,
  useHighContrast,
  getHighContrastShimmer,
  getHighContrastColor,
};

