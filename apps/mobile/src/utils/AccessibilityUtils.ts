/**
 * Accessibility Enhancement Utilities
 * Comprehensive accessibility helpers for React Native components
 */

import React from "react";
import { Platform, AccessibilityInfo } from "react-native";
import { logger } from "@pawfectmatch/core";

// === ACCESSIBILITY CONFIGURATION ===

interface AccessibilityConfig {
  reduceMotionEnabled: boolean;
  screenReaderEnabled: boolean;
  highContrastEnabled: boolean;
  fontSizeScale: number;
}

class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig = {
    reduceMotionEnabled: false,
    screenReaderEnabled: false,
    highContrastEnabled: false,
    fontSizeScale: 1.0,
  };

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Check accessibility settings
      const [reduceMotion, screenReader, highContrast] = await Promise.all([
        AccessibilityInfo.isReduceMotionEnabled(),
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isHighTextContrastEnabled(),
      ]);

      this.config = {
        reduceMotionEnabled: reduceMotion,
        screenReaderEnabled: screenReader,
        highContrastEnabled: highContrast,
        fontSizeScale: 1.0, // Would need to get from system settings
      };

      logger.info("Accessibility settings initialized", this.config);
    } catch (error) {
      logger.error("Failed to initialize accessibility settings", { error });
    }
  }

  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  isReduceMotionEnabled(): boolean {
    return this.config.reduceMotionEnabled;
  }

  isScreenReaderEnabled(): boolean {
    return this.config.screenReaderEnabled;
  }

  isHighContrastEnabled(): boolean {
    return this.config.highContrastEnabled;
  }
}

export const accessibilityManager = AccessibilityManager.getInstance();

// === ACCESSIBILITY PROPS GENERATORS ===

interface AccessibilityProps {
  accessible?: boolean;
  accessibilityRole?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityActions?: Array<{ name: string; label: string }>;
  onAccessibilityAction?: (event: {
    nativeEvent: { actionName: string };
  }) => void;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: "auto" | "yes" | "no" | "no-hide-descendants";
}

/**
 * Generate accessibility props for buttons
 */
export function getButtonAccessibilityProps(
  label: string,
  hint?: string,
  disabled = false,
  selected = false,
  actions?: Array<{ name: string; label: string; handler: () => void }>,
): AccessibilityProps {
  const props: AccessibilityProps = {
    accessible: true,
    accessibilityRole: "button",
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: {
      disabled,
      selected,
    },
  };

  if (actions && actions.length > 0) {
    props.accessibilityActions = actions.map((action) => ({
      name: action.name,
      label: action.label,
    }));

    props.onAccessibilityAction = (event) => {
      const action = actions.find(
        (a) => a.name === event.nativeEvent.actionName,
      );
      if (action) {
        action.handler();
      }
    };
  }

  return props;
}

/**
 * Generate accessibility props for images
 */
export function getImageAccessibilityProps(
  alt: string,
  decorative = false,
): AccessibilityProps {
  return {
    accessible: !decorative,
    accessibilityRole: decorative ? undefined : "image",
    accessibilityLabel: decorative ? undefined : alt,
    accessibilityElementsHidden: decorative,
    importantForAccessibility: decorative ? "no" : "yes",
  };
}

/**
 * Generate accessibility props for text inputs
 */
export function getInputAccessibilityProps(
  label: string,
  hint?: string,
  required = false,
  error?: string,
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: "text",
    accessibilityLabel: `${label}${required ? " (required)" : ""}`,
    accessibilityHint: error ? `${hint || ""} Error: ${error}` : hint,
    accessibilityState: {
      invalid: !!error,
    },
  };
}

/**
 * Generate accessibility props for lists
 */
export function getListAccessibilityProps(
  itemCount: number,
  currentIndex?: number,
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: "list",
    accessibilityLabel: `List with ${itemCount} items`,
    accessibilityValue:
      currentIndex !== undefined
        ? {
            min: 0,
            max: itemCount - 1,
            now: currentIndex,
          }
        : undefined,
  };
}

/**
 * Generate accessibility props for cards
 */
export function getCardAccessibilityProps(
  title: string,
  subtitle?: string,
  actions?: Array<{ name: string; label: string; handler: () => void }>,
): AccessibilityProps {
  const props: AccessibilityProps = {
    accessible: true,
    accessibilityRole: "button",
    accessibilityLabel: subtitle ? `${title}, ${subtitle}` : title,
    accessibilityHint: "Double tap to view details",
  };

  if (actions && actions.length > 0) {
    props.accessibilityActions = actions.map((action) => ({
      name: action.name,
      label: action.label,
    }));

    props.onAccessibilityAction = (event) => {
      const action = actions.find(
        (a) => a.name === event.nativeEvent.actionName,
      );
      if (action) {
        action.handler();
      }
    };
  }

  return props;
}

// === ANIMATION ACCESSIBILITY ===

/**
 * Get animation configuration based on accessibility settings
 */
export function getAccessibleAnimationConfig(
  baseConfig: any,
  respectMotion = true,
): any {
  if (respectMotion && accessibilityManager.isReduceMotionEnabled()) {
    return {
      ...baseConfig,
      duration: 0,
      useNativeDriver: true,
    };
  }

  return baseConfig;
}

/**
 * Get haptic feedback configuration based on accessibility settings
 */
export function getAccessibleHapticConfig(
  baseIntensity: "light" | "medium" | "heavy" = "medium",
): "light" | "medium" | "heavy" | "none" {
  if (accessibilityManager.isReduceMotionEnabled()) {
    return "none";
  }

  return baseIntensity;
}

// === CONTRAST UTILITIES ===

/**
 * Get high contrast colors if needed
 */
export function getAccessibleColors(
  normalColors: { primary: string; secondary: string; background: string },
  highContrastColors?: {
    primary: string;
    secondary: string;
    background: string;
  },
): { primary: string; secondary: string; background: string } {
  if (accessibilityManager.isHighContrastEnabled() && highContrastColors) {
    return highContrastColors;
  }

  return normalColors;
}

// === FOCUS MANAGEMENT ===

/**
 * Focus management utilities
 */
export class FocusManager {
  private static instance: FocusManager;
  private focusOrder: string[] = [];
  private currentFocusIndex = 0;

  static getInstance(): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager();
    }
    return FocusManager.instance;
  }

  /**
   * Register a focusable element
   */
  registerElement(id: string, order: number): void {
    this.focusOrder[order] = id;
    this.focusOrder.sort((a, b) => {
      const aIndex = this.focusOrder.indexOf(a);
      const bIndex = this.focusOrder.indexOf(b);
      return aIndex - bIndex;
    });
  }

  /**
   * Move focus to next element
   */
  focusNext(): void {
    if (this.currentFocusIndex < this.focusOrder.length - 1) {
      this.currentFocusIndex++;
      this.focusElement(this.focusOrder[this.currentFocusIndex]);
    }
  }

  /**
   * Move focus to previous element
   */
  focusPrevious(): void {
    if (this.currentFocusIndex > 0) {
      this.currentFocusIndex--;
      this.focusElement(this.focusOrder[this.currentFocusIndex]);
    }
  }

  private focusElement(id: string): void {
    // This would integrate with React Native's focus system
    logger.debug("Focusing element", { id });
  }
}

export const focusManager = FocusManager.getInstance();

// === SCREEN READER UTILITIES ===

/**
 * Announce text to screen readers
 */
export function announceToScreenReader(text: string): void {
  if (accessibilityManager.isScreenReaderEnabled()) {
    AccessibilityInfo.announceForAccessibility(text);
  }
}

/**
 * Set accessibility focus
 */
export function setAccessibilityFocus(ref: React.RefObject<any>): void {
  if (ref.current && accessibilityManager.isScreenReaderEnabled()) {
    AccessibilityInfo.setAccessibilityFocus(ref.current);
  }
}

// === TESTING UTILITIES ===

/**
 * Get accessibility test helpers
 */
export function getAccessibilityTestHelpers() {
  return {
    isAccessible: (element: any) => {
      return element.props.accessible === true;
    },
    hasRole: (element: any, role: string) => {
      return element.props.accessibilityRole === role;
    },
    hasLabel: (element: any, label: string) => {
      return element.props.accessibilityLabel === label;
    },
    hasHint: (element: any, hint: string) => {
      return element.props.accessibilityHint === hint;
    },
    isDisabled: (element: any) => {
      return element.props.accessibilityState?.disabled === true;
    },
  };
}

// === COMPONENT WRAPPERS ===

/**
 * Higher-order component for accessibility
 */
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>,
  defaultAccessibilityProps: AccessibilityProps,
) {
  return React.forwardRef<
    any,
    P & { accessibilityProps?: Partial<AccessibilityProps> }
  >((props, ref) => {
    const { accessibilityProps, ...restProps } = props;
    const mergedAccessibilityProps = {
      ...defaultAccessibilityProps,
      ...accessibilityProps,
    };

    return React.createElement(Component, {
      ref,
      ...(restProps as P),
      ...mergedAccessibilityProps,
    });
  });
}

// === INITIALIZATION ===

// Initialize accessibility manager
accessibilityManager.initialize().catch((error) => {
  logger.error("Failed to initialize accessibility manager", { error });
});

// === EXPORTS ===

export { type AccessibilityProps, type AccessibilityConfig };
