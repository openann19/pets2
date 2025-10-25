/**
 * Accessibility Service for PawfectMatch Mobile App
 * Provides WCAG 2.1 AA compliant accessibility features
 */
import { AccessibilityInfo, Platform } from "react-native";

import { logger } from "./logger";

interface AccessibilityConfig {
  isScreenReaderEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  preferredContentSizeCategory: string;
}

class AccessibilityService {
  private static instance: AccessibilityService | undefined;
  private config: AccessibilityConfig = {
    isScreenReaderEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    preferredContentSizeCategory: "normal",
  };

  private constructor() {
    void this.initializeAccessibility();
  }

  static getInstance(): AccessibilityService {
    if (AccessibilityService.instance === undefined) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Initialize accessibility monitoring
   */
  private async initializeAccessibility(): Promise<void> {
    try {
      // Get initial accessibility settings
      const [
        screenReaderEnabled,
        boldTextEnabled,
        grayscaleEnabled,
        invertColorsEnabled,
        reduceMotionEnabled,
        reduceTransparencyEnabled,
      ] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isBoldTextEnabled(),
        AccessibilityInfo.isGrayscaleEnabled(),
        AccessibilityInfo.isInvertColorsEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
        AccessibilityInfo.isReduceTransparencyEnabled(),
      ]);

      this.config = {
        isScreenReaderEnabled: screenReaderEnabled,
        isBoldTextEnabled: boldTextEnabled,
        isGrayscaleEnabled: grayscaleEnabled,
        isInvertColorsEnabled: invertColorsEnabled,
        isReduceMotionEnabled: reduceMotionEnabled,
        isReduceTransparencyEnabled: reduceTransparencyEnabled,
        preferredContentSizeCategory: "normal", // Would need native implementation
      };

      // Set up change listeners
      this.setupAccessibilityListeners();
    } catch (error: unknown) {
      logger.warn("Failed to initialize accessibility", {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Setup accessibility change listeners
   */
  private setupAccessibilityListeners(): void {
    AccessibilityInfo.addEventListener("screenReaderChanged", (enabled) => {
      this.config.isScreenReaderEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener("boldTextChanged", (enabled) => {
      this.config.isBoldTextEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener("grayscaleChanged", (enabled) => {
      this.config.isGrayscaleEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener("invertColorsChanged", (enabled) => {
      this.config.isInvertColorsEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled) => {
      this.config.isReduceMotionEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      (enabled) => {
        this.config.isReduceTransparencyEnabled = enabled;
        this.notifyListeners();
      },
    );
  }

  /**
   * Get current accessibility configuration
   */
  getAccessibilityConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * Check if screen reader is enabled
   */
  isScreenReaderEnabled(): boolean {
    return this.config.isScreenReaderEnabled;
  }

  /**
   * Check if bold text is enabled
   */
  isBoldTextEnabled(): boolean {
    return this.config.isBoldTextEnabled;
  }

  /**
   * Check if reduce motion is enabled
   */
  isReduceMotionEnabled(): boolean {
    return this.config.isReduceMotionEnabled;
  }

  /**
   * Check if high contrast is enabled
   */
  isHighContrastEnabled(): boolean {
    return this.config.isGrayscaleEnabled || this.config.isInvertColorsEnabled;
  }

  /**
   * Get minimum touch target size (WCAG requirement: 44x44 points)
   */
  getMinimumTouchTargetSize(): { width: number; height: number } {
    return { width: 44, height: 44 };
  }

  /**
   * Announce content to screen readers
   */
  announceForAccessibility(message: string): void {
    try {
      AccessibilityInfo.announceForAccessibility(message);
    } catch (error: unknown) {
      logger.warn("Failed to announce for accessibility", {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Set accessibility focus
   */
  setAccessibilityFocus(ref: unknown): void {
    try {
      if (Platform.OS === "ios") {
        // iOS specific focus
        AccessibilityInfo.setAccessibilityFocus(ref);
      } else {
        // Android specific focus
        // Would need additional implementation
      }
    } catch (error: unknown) {
      logger.warn("Failed to set accessibility focus", {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Get accessible text size multiplier
   */
  getTextSizeMultiplier(): number {
    // Map content size categories to multipliers
    const multipliers: Record<string, number> = {
      extraSmall: 0.8,
      small: 0.9,
      normal: 1.0,
      large: 1.1,
      extraLarge: 1.2,
      extraExtraLarge: 1.3,
      extraExtraExtraLarge: 1.4,
      accessibilityMedium: 1.5,
      accessibilityLarge: 1.6,
      accessibilityExtraLarge: 1.7,
      accessibilityExtraExtraLarge: 1.8,
      accessibilityExtraExtraExtraLarge: 2.0,
    };

    return multipliers[this.config.preferredContentSizeCategory] ?? 1.0;
  }

  /**
   * Check if content meets contrast requirements
   * Implements WCAG AA contrast ratio calculation
   */
  meetsContrastRequirement(
    foregroundColor: string,
    backgroundColor: string,
  ): boolean {
    try {
      const contrastRatio = this.calculateContrastRatio(
        foregroundColor,
        backgroundColor,
      );

      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      // We'll use 4.5:1 as the standard requirement
      const meetsRequirement = contrastRatio >= 4.5;

      logger.debug("Contrast check", {
        foreground: foregroundColor,
        background: backgroundColor,
        ratio: contrastRatio,
        meetsRequirement,
      });

      return meetsRequirement;
    } catch (error) {
      logger.error("Contrast calculation failed", { error });
      // Fallback to true to avoid breaking the UI
      return true;
    }
  }

  /**
   * Calculate contrast ratio between two colors
   * Returns ratio between 1 and 21
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.getRelativeLuminance(color1);
    const luminance2 = this.getRelativeLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Calculate relative luminance of a color
   * Returns value between 0 and 1
   */
  private getRelativeLuminance(color: string): number {
    const rgb = this.parseColor(color);
    if (!rgb) return 0;

    const { r, g, b } = rgb;

    // Convert to relative luminance
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear =
      rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear =
      gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear =
      bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  /**
   * Parse color string to RGB values
   * Supports hex (#RRGGBB), rgb(r,g,b), and named colors
   */
  private parseColor(
    color: string,
  ): { r: number; g: number; b: number } | null {
    // Remove whitespace and convert to lowercase
    const cleanColor = color.trim().toLowerCase();

    // Handle hex colors
    if (cleanColor.startsWith("#")) {
      const hex = cleanColor.slice(1);
      if (hex.length === 3) {
        // Short hex format (#RGB)
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return { r, g, b };
      } else if (hex.length === 6) {
        // Full hex format (#RRGGBB)
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b };
      }
    }

    // Handle rgb() format
    const rgbMatch = cleanColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10);
      const g = parseInt(rgbMatch[2], 10);
      const b = parseInt(rgbMatch[3], 10);
      return { r, g, b };
    }

    // Handle common named colors
    const namedColors: Record<string, { r: number; g: number; b: number }> = {
      black: { r: 0, g: 0, b: 0 },
      white: { r: 255, g: 255, b: 255 },
      red: { r: 255, g: 0, b: 0 },
      green: { r: 0, g: 128, b: 0 },
      blue: { r: 0, g: 0, b: 255 },
      yellow: { r: 255, g: 255, b: 0 },
      cyan: { r: 0, g: 255, b: 255 },
      magenta: { r: 255, g: 0, b: 255 },
      gray: { r: 128, g: 128, b: 128 },
      grey: { r: 128, g: 128, b: 128 },
    };

    return namedColors[cleanColor] || null;
  }

  /**
   * Get accessibility-friendly color scheme
   */
  getAccessibleColorScheme(): {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
  } {
    // High contrast color scheme for accessibility
    if (this.isHighContrastEnabled()) {
      return {
        primary: "#FFFFFF",
        secondary: "#CCCCCC",
        background: "#000000",
        surface: "#111111",
        text: "#FFFFFF",
        textSecondary: "#CCCCCC",
        error: "#FF4444",
        success: "#44FF44",
        warning: "#FFFF44",
      };
    }

    // Standard accessible colors
    return {
      primary: "#2563EB", // Blue-600
      secondary: "#64748B", // Slate-500
      background: "#FFFFFF",
      surface: "#F8FAFC", // Slate-50
      text: "#1E293B", // Slate-800
      textSecondary: "#64748B", // Slate-500
      error: "#DC2626", // Red-600
      success: "#16A34A", // Green-600
      warning: "#D97706", // Amber-600
    };
  }

  // Event listeners
  private listeners: ((config: AccessibilityConfig) => void)[] = [];

  /**
   * Add accessibility change listener
   */
  addChangeListener(
    listener: (config: AccessibilityConfig) => void,
  ): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of accessibility changes
   */
  private notifyListeners(): void {
    const config = this.getAccessibilityConfig();
    this.listeners.forEach((listener) => {
      try {
        listener(config);
      } catch (error: unknown) {
        logger.warn("Error notifying accessibility listener", {
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();

// Export types
export type { AccessibilityConfig };
export default accessibilityService;
