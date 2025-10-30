/**
 * Accessibility Utilities for PawfectMatch Mobile
 * Provides consistent accessibility props and utilities
 */

import { AccessibilityInfo } from 'react-native';
import { useState, useEffect } from 'react';

/**
 * Check if reduced motion is enabled
 */
export const checkReducedMotion = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    return false;
  }
};

/**
 * Get animation duration based on motion preference
 */
export const getAnimationDuration = (preference: boolean, defaultDuration: number): number => {
  return preference ? 0 : defaultDuration;
};

/**
 * Get animation config based on motion preference
 */
export const getAnimationConfig = (
  preference: boolean,
  defaultConfig: { duration: number; damping?: number; stiffness?: number },
) => {
  if (preference) {
    return {
      ...defaultConfig,
      duration: 0,
      damping: 1000, // Max damping for instant
      stiffness: 1000, // Max stiffness for instant
    };
  }
  return defaultConfig;
};

/**
 * Get testID string from component name
 */
export const getTestId = (screenName: string, componentName: string): string => {
  return `${screenName}.${componentName}`;
};

/**
 * Get accessibility label from text content
 */
export const getAccessibilityLabel = (text: string, role?: string): string => {
  return role ? `${text} ${role}` : text;
};

/**
 * Standard accessibility props for interactive elements
 */
export const getAccessibilityProps = (
  label: string,
  role: 'button' | 'link' | 'text' | 'none' | 'header',
  testID?: string,
) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityRole: role,
  testID,
});

/**
 * Standard accessibility props for images
 */
export const getImageAccessibilityProps = (
  description: string,
  decorative: boolean = false,
  testID?: string,
) => ({
  accessible: !decorative,
  accessibilityLabel: decorative ? undefined : description,
  accessibilityRole: 'image' as const,
  testID,
});
