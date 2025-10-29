/**
 * Accessibility Service for PawfectMatch Mobile App
 * Provides WCAG 2.1 AA compliant accessibility features
 */
import { AccessibilityInfo, Platform } from 'react-native';
import type { AppTheme } from '@/theme';
import { createTheme } from '@/theme/rnTokens';
import type { NeutralStep } from '@/theme/contracts';

import { logger } from './logger';

interface AccessibilityConfig {
  isScreenReaderEnabled: boolean;
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  preferredContentSizeCategory: string;
}

export interface AccessibleColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
}

const FALLBACK_SCHEME: AccessibleColorScheme = {
  primary: '#2563EB',
  secondary: '#64748B',
  background: '#FFFFFF',
  surface: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#475569',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#D97706',
};

const MIN_CONTRAST_RATIO = 4.5;

class AccessibilityService {
  private static instance: AccessibilityService | undefined;
  private themeResolver: () => AppTheme;
  private config: AccessibilityConfig = {
    isScreenReaderEnabled: false,
    isBoldTextEnabled: false,
    isGrayscaleEnabled: false,
    isInvertColorsEnabled: false,
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    preferredContentSizeCategory: 'normal',
  };

  private constructor() {
    this.themeResolver = () => createTheme('light') as unknown as AppTheme;
    void this.initializeAccessibility();
  }

  static getInstance(): AccessibilityService {
    if (AccessibilityService.instance === undefined) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  setThemeResolver(resolver: () => AppTheme): void {
    this.themeResolver = resolver;
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
        preferredContentSizeCategory: 'normal', // Would need native implementation
      };

      // Set up change listeners
      this.setupAccessibilityListeners();
    } catch (error: unknown) {
      logger.warn('Failed to initialize accessibility', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Setup accessibility change listeners
   */
  private setupAccessibilityListeners(): void {
    AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      this.config.isScreenReaderEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener('boldTextChanged', (enabled) => {
      this.config.isBoldTextEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener('grayscaleChanged', (enabled) => {
      this.config.isGrayscaleEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener('invertColorsChanged', (enabled) => {
      this.config.isInvertColorsEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      this.config.isReduceMotionEnabled = enabled;
      this.notifyListeners();
    });

    AccessibilityInfo.addEventListener('reduceTransparencyChanged', (enabled) => {
      this.config.isReduceTransparencyEnabled = enabled;
      this.notifyListeners();
    });
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
      logger.warn('Failed to announce for accessibility', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  /**
   * Set accessibility focus
   */
  setAccessibilityFocus(ref: unknown): void {
    try {
      if (Platform.OS === 'ios') {
        // iOS specific focus
        // React Native AccessibilityInfo doesn't expose setAccessibilityFocus
        // This would require a native module implementation
        if (typeof ref === 'object' && ref !== null) {
          // Attempt to set focus if native module is available
          const accessibilityModule = AccessibilityInfo as AccessibilityInfo & {
            setAccessibilityFocus?: (ref: unknown) => void;
          };
          if (accessibilityModule.setAccessibilityFocus) {
            accessibilityModule.setAccessibilityFocus(ref);
          }
        }
      } else {
        // Android specific focus
        // Would need additional implementation
      }
    } catch (error: unknown) {
      logger.warn('Failed to set accessibility focus', {
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
   */
  meetsContrastRequirement(
    foregroundColor: string,
    backgroundColor: string,
    minimumRatio: number = MIN_CONTRAST_RATIO,
  ): boolean {
    const fg = AccessibilityService.parseColor(foregroundColor);
    const bg = AccessibilityService.parseColor(backgroundColor);

    if (!fg || !bg) {
      return true;
    }

    const ratio = AccessibilityService.contrastRatio(fg, bg);
    return ratio >= minimumRatio;
  }

  /**
   * Get accessibility-friendly color scheme
   */
  getAccessibleColorScheme(): AccessibleColorScheme {
    const theme = this.themeResolver();
    const colors = theme?.colors ?? {};
    const palette = theme?.palette as
      | {
          neutral?: Partial<Record<NeutralStep | number, string>>;
          brand?: Partial<Record<NeutralStep | number, string>>;
        }
      | undefined;

    const neutral: Partial<Record<NeutralStep | number, string>> = palette?.neutral ?? {};
    const brand: Partial<Record<NeutralStep | number, string>> = palette?.brand ?? {};

    const getNeutral = (step: NeutralStep | number, fallback: string): string => {
      const candidate = neutral?.[step];
      return typeof candidate === 'string' && candidate.length > 0 ? candidate : fallback;
    };

    const getBrand = (step: NeutralStep | number, fallback: string): string => {
      const candidate = brand?.[step];
      return typeof candidate === 'string' && candidate.length > 0 ? candidate : fallback;
    };

    if (this.isHighContrastEnabled()) {
      const highContrastBackground = getNeutral(900, '#000000');
      const highContrastSurface = getNeutral(950, highContrastBackground);
      const highContrastText = getNeutral(50, '#FFFFFF');
      const highContrastTextSecondary = getNeutral(200, '#E5E5E5');

      return {
        primary: colors.onPrimary ?? highContrastText,
        secondary: highContrastTextSecondary,
        background: highContrastBackground,
        surface: highContrastSurface,
        text: highContrastText,
        textSecondary: highContrastTextSecondary,
        error: colors.danger ?? FALLBACK_SCHEME.error,
        success: colors.success ?? FALLBACK_SCHEME.success,
        warning: colors.warning ?? FALLBACK_SCHEME.warning,
      };
    }

    return {
      primary: colors.primary ?? FALLBACK_SCHEME.primary,
      secondary: getBrand(500, getNeutral(500, FALLBACK_SCHEME.secondary)),
      background: colors.bg ?? FALLBACK_SCHEME.background,
      surface: colors.surface ?? colors.bg ?? FALLBACK_SCHEME.surface,
      text: colors.onBg ?? colors.onSurface ?? FALLBACK_SCHEME.text,
      textSecondary: colors.onSurface ?? colors.onMuted ?? FALLBACK_SCHEME.textSecondary,
      error: colors.danger ?? FALLBACK_SCHEME.error,
      success: colors.success ?? FALLBACK_SCHEME.success,
      warning: colors.warning ?? FALLBACK_SCHEME.warning,
    };
  }

  // Event listeners
  private listeners: ((config: AccessibilityConfig) => void)[] = [];

  /**
   * Add accessibility change listener
   */
  addChangeListener(listener: (config: AccessibilityConfig) => void): () => void {
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
        logger.warn('Error notifying accessibility listener', {
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    });
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();

// Helpers for contrast calculations
type RGB = [number, number, number];

namespace AccessibilityService {
  export function parseColor(value: string): RGB | null {
    const normalized = value.trim();

    if (normalized.startsWith('#')) {
      const hex = normalized.slice(1);
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : [r, g, b];
      }

      if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : [r, g, b];
      }
    }

    const rgbMatch = normalized.match(/rgba?\(([^)]+)\)/i);
    if (rgbMatch) {
      const parsed = rgbMatch[1]
        .split(',')
        .slice(0, 3)
        .map((part) => Number.parseFloat(part.trim()));

      if (parsed.length === 3 && parsed.every((part) => Number.isFinite(part))) {
        const [red, green, blue] = parsed as [number, number, number];
        return [red, green, blue];
      }
    }

    return null;
  }

  export function contrastRatio(foreground: RGB, background: RGB): number {
    const fgLuminance = relativeLuminance(foreground);
    const bgLuminance = relativeLuminance(background);
    const [lighter, darker] = fgLuminance > bgLuminance ? [fgLuminance, bgLuminance] : [bgLuminance, fgLuminance];
    return (lighter + 0.05) / (darker + 0.05);
  }

  function relativeLuminance([red, green, blue]: RGB): number {
    const [r, g, b] = ([red, green, blue] as const).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
}

// Export types
export type { AccessibilityConfig };
export default accessibilityService;
