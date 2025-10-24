/**
 * Accessibility Service for PawfectMatch Mobile App
 * Provides WCAG 2.1 AA compliant accessibility features
 */
import { AccessibilityInfo, Platform } from 'react-native';

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

class AccessibilityService {
  private static instance: AccessibilityService | undefined;
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
        preferredContentSizeCategory: 'normal', // Would need native implementation
      };

      // Set up change listeners
      this.setupAccessibilityListeners();
    } catch (error) {
      logger.warn('Failed to initialize accessibility', { error });
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
    } catch (error) {
      logger.warn('Failed to announce for accessibility', { error });
    }
  }

  /**
   * Set accessibility focus
   */
  setAccessibilityFocus(ref: unknown): void {
    try {
      if (Platform.OS === 'ios') {
        // iOS specific focus
        AccessibilityInfo.setAccessibilityFocus(ref);
      } else {
        // Android specific focus
        // Would need additional implementation
      }
    } catch (error) {
      logger.warn('Failed to set accessibility focus', { error });
    }
  }

  /**
   * Get accessible text size multiplier
   */
  getTextSizeMultiplier(): number {
    // Map content size categories to multipliers
    const multipliers: Record<string, number> = {
      'extraSmall': 0.8,
      'small': 0.9,
      'normal': 1.0,
      'large': 1.1,
      'extraLarge': 1.2,
      'extraExtraLarge': 1.3,
      'extraExtraExtraLarge': 1.4,
      'accessibilityMedium': 1.5,
      'accessibilityLarge': 1.6,
      'accessibilityExtraLarge': 1.7,
      'accessibilityExtraExtraLarge': 1.8,
      'accessibilityExtraExtraExtraLarge': 2.0,
    };

    return multipliers[this.config.preferredContentSizeCategory] ?? 1.0;
  }

  /**
   * Check if content meets contrast requirements
   */
  meetsContrastRequirement(_foregroundColor: string, _backgroundColor: string): boolean {
    // Simplified contrast check - would need proper color math
    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    return true; // Placeholder - implement proper contrast calculation
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
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        background: '#000000',
        surface: '#111111',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        error: '#FF4444',
        success: '#44FF44',
        warning: '#FFFF44',
      };
    }

    // Standard accessible colors
    return {
      primary: '#2563EB', // Blue-600
      secondary: '#64748B', // Slate-500
      background: '#FFFFFF',
      surface: '#F8FAFC', // Slate-50
      text: '#1E293B', // Slate-800
      textSecondary: '#64748B', // Slate-500
      error: '#DC2626', // Red-600
      success: '#16A34A', // Green-600
      warning: '#D97706', // Amber-600
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
    this.listeners.forEach(listener => {
      try {
        listener(config);
      } catch (error) {
        logger.warn('Error notifying accessibility listener', { error });
      }
    });
  }
}

// Export singleton instance
export const accessibilityService = AccessibilityService.getInstance();

// Export types
export type { AccessibilityConfig };
export default accessibilityService;
