/**
 * Accessibility Helpers
 * VoiceOver hints, high contrast support, Reduce Motion
 */

import { AccessibilityInfo } from 'react-native';
import { useState, useEffect } from 'react';

type ColorScheme = 'light' | 'dark' | null;

export interface AccessibilityFeatures {
  /** High contrast mode enabled */
  highContrast: boolean;
  /** Reduce motion enabled */
  reduceMotion: boolean;
  /** Screen reader enabled */
  screenReader: boolean;
  /** Color scheme (light/dark) */
  colorScheme: ColorScheme;
}

/**
 * Get current accessibility features
 */
export async function getAccessibilityFeatures(): Promise<AccessibilityFeatures> {
  const [reduceMotion, screenReader, colorScheme] = await Promise.all([
    AccessibilityInfo.isReduceMotionEnabled(),
    AccessibilityInfo.isScreenReaderEnabled(),
    Promise.resolve('light' as ColorScheme), // Would need native module for actual scheme
  ]);

  return {
    highContrast: false, // Would need native module
    reduceMotion,
    screenReader,
    colorScheme,
  };
}

/**
 * Check if screen reader is active
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  return AccessibilityInfo.isScreenReaderEnabled();
}

/**
 * Check if reduce motion is enabled
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  return AccessibilityInfo.isReduceMotionEnabled();
}

/**
 * Get appropriate animation duration based on reduce motion preference
 * @param normalDuration - Normal animation duration in ms
 * @returns Appropriate duration (0 if reduce motion is on)
 */
export async function getAdaptiveDuration(normalDuration: number): Promise<number> {
  const reduceMotion = await isReduceMotionEnabled();
  return reduceMotion ? 0 : normalDuration;
}

/**
 * Get appropriate haptic intensity based on user preferences
 * @param defaultIntensity - Default haptic intensity
 * @returns Appropriate intensity (may be reduced for accessibility)
 */
export async function getAdaptiveHapticIntensity(
  defaultIntensity: 'light' | 'medium' | 'heavy',
): Promise<'light' | 'medium' | 'heavy'> {
  const reduceMotion = await isReduceMotionEnabled();

  // Reduce haptics for users who want less stimulation
  if (reduceMotion) {
    return 'light';
  }

  return defaultIntensity;
}

/**
 * Generate VoiceOver labels for photo editor controls
 */
export function getVoiceOverLabels() {
  return {
    brightness: 'Brightness slider. Adjust image lightness.',
    contrast: 'Contrast slider. Adjust image difference.',
    saturation: 'Saturation slider. Adjust color intensity.',
    warmth: 'Warmth slider. Adjust color temperature.',
    blur: 'Blur slider. Add background blur effect.',
    sharpen: 'Clarity slider. Enhance image sharpness.',
    autoCrop: 'Auto crop button. Automatically crop image using face detection.',
    ratioOneOne: 'One to one ratio button. Square image.',
    ratioFourFive: 'Four to five ratio button. Portrait image.',
    ratioNineSixteen: 'Nine to sixteen ratio button. Vertical story.',
    tightCrop: 'Tight crop option. Close framing.',
    mediumCrop: 'Medium crop option. Balanced framing.',
    looseCrop: 'Loose crop option. Environmental framing.',
    save: 'Save button. Save edited photo.',
    cancel: 'Cancel button. Discard changes and exit.',
    undo: 'Undo button. Revert last change.',
    redo: 'Redo button. Restore reverted change.',
    compareOriginal: 'Compare button. Hold to view original photo.',
    gridGuides: 'Grid button. Toggle composition guides.',
  };
}

/**
 * Get high contrast color palette
 * Note: These should be replaced with theme colors in actual usage
 */
export function getHighContrastColors() {
  return {
    background: '#000000', // theme.colors.bg
    surface: '#1a1a1a', // theme.colors.surface
    text: '#ffffff', // theme.colors.onSurface
    textSecondary: '#cccccc', // theme.colors.onMuted
    primary: '#ffffff', // theme.colors.primary
    border: '#ffffff', // theme.colors.border
    error: '#ff0000', // theme.colors.danger
    success: '#00ff00', // theme.colors.success
    warning: '#ffff00', // theme.colors.warning
  };
}

/**
 * Get safe touch targets (minimum 44x44 points for accessibility)
 */
export function getSafeTouchTarget(size: number): number {
  return Math.max(size, 44);
}

/**
 * Format percentage value for VoiceOver
 */
export function formatPercentage(value: number, min: number, max: number): string {
  const percent = Math.round(((value - min) / (max - min)) * 100);
  return `${percent}%`;
}

/**
 * Hook to check if reduce motion is enabled
 */
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (event) => {
      if (mounted) {
        setReduceMotion(event);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

/**
 * Hook to check if screen reader is enabled
 */
export function useScreenReader(): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      if (mounted) {
        setIsEnabled(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (event) => {
      if (mounted) {
        setIsEnabled(event);
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return isEnabled;
}

/**
 * Get adaptive animation duration
 */
export function useAdaptiveDuration(normalDuration: number): number {
  const reduceMotion = useReducedMotion();
  return reduceMotion ? 0 : normalDuration;
}

/**
 * Generate accessibility props for interactive components
 */
export interface A11yProps {
  label?: string;
  hint?: string;
  role?: 'button' | 'link' | 'text' | 'header' | 'searchbox' | 'image' | 'none';
  state?: string;
  value?: string;
  testID?: string;
}

export function useA11yProps(props: A11yProps) {
  const { label, hint, role, state, value, testID } = props;

  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
    accessibilityState: state ? { [state]: true } : undefined,
    accessibilityValue: value ? { text: value } : undefined,
    testID,
  };
}
