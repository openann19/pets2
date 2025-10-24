/**
 * Haptic Feedback Utilities
 * Provides consistent haptic feedback across the app
 */

import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';
import { Platform } from 'react-native';

class HapticFeedback {
  private enabled = true;

  /**
   * Enable or disable haptic feedback globally
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Light impact - for subtle interactions
   * Use for: tab switches, button taps, minor selections
   */
  async light() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Medium impact - for standard interactions
   * Use for: likes, swipes, card flips
   */
  async medium() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Heavy impact - for significant interactions
   * Use for: matches, important confirmations
   */
  async heavy() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Success notification
   * Use for: successful actions, confirmations
   */
  async success() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Warning notification
   * Use for: warnings, cautions
   */
  async warning() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Error notification
   * Use for: errors, failures
   */
  async error() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Selection feedback
   * Use for: picker selections, scrolling through options
   */
  async selection() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Custom pattern - for unique interactions
   */
  async pattern(pattern: 'double' | 'triple' | 'heartbeat') {
    if (!this.enabled || Platform.OS === 'web') return;

    try {
      switch (pattern) {
        case 'double':
          await this.light();
          await new Promise((resolve) => setTimeout(resolve, 100));
          await this.light();
          break;

        case 'triple':
          await this.light();
          await new Promise((resolve) => setTimeout(resolve, 80));
          await this.light();
          await new Promise((resolve) => setTimeout(resolve, 80));
          await this.light();
          break;

        case 'heartbeat':
          await this.medium();
          await new Promise((resolve) => setTimeout(resolve, 150));
          await this.heavy();
          break;
      }
    } catch (error) {
      logger.warn('Haptic pattern failed:', { error });
    }
  }
}

// Export singleton instance
export const hapticFeedback = new HapticFeedback();

// Convenience exports
export const haptics = {
  light: () => hapticFeedback.light(),
  medium: () => hapticFeedback.medium(),
  heavy: () => hapticFeedback.heavy(),
  success: () => hapticFeedback.success(),
  warning: () => hapticFeedback.warning(),
  error: () => hapticFeedback.error(),
  selection: () => hapticFeedback.selection(),
  pattern: (pattern: 'double' | 'triple' | 'heartbeat') => hapticFeedback.pattern(pattern),
};

// Context-specific haptic patterns
export const hapticPatterns = {
  // Swipe actions
  swipeLeft: () => hapticFeedback.light(),
  swipeRight: () => hapticFeedback.light(),
  swipeUp: () => hapticFeedback.medium(),
  swipeDown: () => hapticFeedback.medium(),

  // Match actions
  like: () => hapticFeedback.medium(),
  superLike: () => hapticFeedback.pattern('heartbeat'),
  match: () => hapticFeedback.pattern('triple'),
  unmatch: () => hapticFeedback.warning(),

  // Navigation
  tabSwitch: () => hapticFeedback.selection(),
  openModal: () => hapticFeedback.light(),
  closeModal: () => hapticFeedback.light(),
  pullToRefresh: () => hapticFeedback.medium(),

  // Messages
  sendMessage: () => hapticFeedback.light(),
  receiveMessage: () => hapticFeedback.medium(),
  typing: () => hapticFeedback.selection(),

  // Premium
  subscriptionSuccess: () => hapticFeedback.success(),
  subscriptionFailed: () => hapticFeedback.error(),
};
