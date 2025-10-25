/**
 * Haptic Feedback Service
 * Provides centralized haptic feedback with accessibility support
 */

import { Platform, AccessibilityInfo } from "react-native";
import * as Haptics from "expo-haptics";
import { logger } from "@pawfectmatch/core";

interface HapticOptions {
  respectAccessibility?: boolean;
  force?: boolean;
}

class HapticFeedbackService {
  private static instance: HapticFeedbackService;
  private isReduceMotionEnabled = false;
  private isInitialized = false;

  static getInstance(): HapticFeedbackService {
    if (!HapticFeedbackService.instance) {
      HapticFeedbackService.instance = new HapticFeedbackService();
    }
    return HapticFeedbackService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check accessibility settings
      this.isReduceMotionEnabled =
        await AccessibilityInfo.isReduceMotionEnabled();
      this.isInitialized = true;
      logger.info("Haptic feedback service initialized", {
        reduceMotionEnabled: this.isReduceMotionEnabled,
        platform: Platform.OS,
      });
    } catch (error) {
      logger.error("Failed to initialize haptic feedback service", { error });
    }
  }

  private shouldTriggerHaptic(options: HapticOptions = {}): boolean {
    const { respectAccessibility = true, force = false } = options;

    // Force overrides accessibility settings
    if (force) return true;

    // Respect accessibility if enabled
    if (respectAccessibility && this.isReduceMotionEnabled) {
      return false;
    }

    // Only enable on supported platforms
    return Platform.OS === "ios" || Platform.OS === "android";
  }

  /**
   * Light impact feedback (like a tap)
   */
  async triggerLight(options: HapticOptions = {}): Promise<void> {
    if (!this.shouldTriggerHaptic(options)) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      logger.warn("Failed to trigger light haptic feedback", { error });
    }
  }

  /**
   * Medium impact feedback (like a moderate press)
   */
  async triggerMedium(options: HapticOptions = {}): Promise<void> {
    if (!this.shouldTriggerHaptic(options)) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      logger.warn("Failed to trigger medium haptic feedback", { error });
    }
  }

  /**
   * Heavy impact feedback (like a strong press)
   */
  async triggerHeavy(options: HapticOptions = {}): Promise<void> {
    if (!this.shouldTriggerHaptic(options)) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      logger.warn("Failed to trigger heavy haptic feedback", { error });
    }
  }

  /**
   * Success feedback (like completing an action)
   */
  async triggerSuccess(options: HapticOptions = {}): Promise<void> {
    if (!this.shouldTriggerHaptic(options)) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.warn("Failed to trigger success haptic feedback", { error });
    }
  }

  /**
   * Error feedback (like failing an action)
   */
  async triggerError(options: HapticOptions = {}): Promise<void> {
    if (!this.shouldTriggerHaptic(options)) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      logger.warn("Failed to trigger error haptic feedback", { error });
    }
  }

  /**
   * Warning feedback (like a caution)
   */
  async triggerWarning(options: HapticOptions = {}): Promise<void> {
    if (!this.shouldTriggerHaptic(options)) return;

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      logger.warn("Failed to trigger warning haptic feedback", { error });
    }
  }

  /**
   * Custom pattern for ring/vibration (like incoming calls)
   */
  async triggerCustomPattern(
    pattern: number[] = [0, 1000, 500, 1000, 500],
    options: HapticOptions = {},
  ): Promise<void> {
    if (!this.shouldTriggerHaptic(options)) return;

    try {
      // Use Vibration API for custom patterns (not supported by expo-haptics)
      const { Vibration } = require("react-native");
      Vibration.vibrate(pattern, false);
    } catch (error) {
      logger.warn("Failed to trigger custom haptic pattern", { error });
    }
  }

  /**
   * Selection feedback (like choosing an option)
   */
  async triggerSelection(options: HapticOptions = {}): Promise<void> {
    if (!this.shouldTriggerHaptic(options)) return;

    try {
      await Haptics.selectionAsync();
    } catch (error) {
      logger.warn("Failed to trigger selection haptic feedback", { error });
    }
  }

  /**
   * Stop any ongoing haptic feedback
   */
  async stop(): Promise<void> {
    try {
      const { Vibration } = require("react-native");
      Vibration.cancel();
    } catch (error) {
      logger.warn("Failed to stop haptic feedback", { error });
    }
  }

  /**
   * Check if haptic feedback is available on this device
   */
  isAvailable(): boolean {
    return Platform.OS === "ios" || Platform.OS === "android";
  }

  /**
   * Get current accessibility settings
   */
  getAccessibilitySettings(): { reduceMotionEnabled: boolean } {
    return {
      reduceMotionEnabled: this.isReduceMotionEnabled,
    };
  }
}

// Pre-configured haptic patterns
export const HapticPatterns = {
  // Incoming call pattern
  RING: [0, 1000, 500, 1000, 500],
  // Quick double tap
  DOUBLE_TAP: [0, 100, 50, 100],
  // Success sequence
  SUCCESS_SEQUENCE: [0, 200, 100, 200],
  // Error buzz
  ERROR_BUZZ: [0, 500],
} as const;

// Export singleton instance
export const hapticFeedback = HapticFeedbackService.getInstance();

// Export types
export type { HapticOptions };

// Initialize on module load
hapticFeedback.initialize().catch((error) => {
  logger.error("Failed to initialize haptic feedback on module load", {
    error,
  });
});

export default hapticFeedback;
