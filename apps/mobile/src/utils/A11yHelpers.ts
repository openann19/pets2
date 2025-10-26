/**
 * Accessibility Helpers
 * VoiceOver hints, high contrast support, Reduce Motion
 */

import { AccessibilityInfo, useColorScheme } from "react-native";

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
    Promise.resolve("light" as ColorScheme), // Would need native module for actual scheme
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
export async function getAdaptiveHapticIntensity(defaultIntensity: "light" | "medium" | "heavy"): Promise<"light" | "medium" | "heavy"> {
  const reduceMotion = await isReduceMotionEnabled();
  
  // Reduce haptics for users who want less stimulation
  if (reduceMotion) {
    return "light";
  }
  
  return defaultIntensity;
}

/**
 * Generate VoiceOver labels for photo editor controls
 */
export function getVoiceOverLabels() {
  return {
    brightness: "Brightness slider. Adjust image lightness.",
    contrast: "Contrast slider. Adjust image difference.",
    saturation: "Saturation slider. Adjust color intensity.",
    warmth: "Warmth slider. Adjust color temperature.",
    blur: "Blur slider. Add background blur effect.",
    sharpen: "Clarity slider. Enhance image sharpness.",
    autoCrop: "Auto crop button. Automatically crop image using face detection.",
    ratioOneOne: "One to one ratio button. Square image.",
    ratioFourFive: "Four to five ratio button. Portrait image.",
    ratioNineSixteen: "Nine to sixteen ratio button. Vertical story.",
    tightCrop: "Tight crop option. Close framing.",
    mediumCrop: "Medium crop option. Balanced framing.",
    looseCrop: "Loose crop option. Environmental framing.",
    save: "Save button. Save edited photo.",
    cancel: "Cancel button. Discard changes and exit.",
    undo: "Undo button. Revert last change.",
    redo: "Redo button. Restore reverted change.",
    compareOriginal: "Compare button. Hold to view original photo.",
    gridGuides: "Grid button. Toggle composition guides.",
  };
}

/**
 * Get high contrast color palette
 */
export function getHighContrastColors() {
  return {
    background: "#000000",
    surface: "#1a1a1a",
    text: "#ffffff",
    textSecondary: "#cccccc",
    primary: "#ffffff",
    border: "#ffffff",
    error: "#ff0000",
    success: "#00ff00",
    warning: "#ffff00",
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

