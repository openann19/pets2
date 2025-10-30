import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';
import { Platform } from 'react-native';

// Declare global __DEV__ variable
declare const __DEV__: boolean;

/**
 * Enhanced Haptic Feedback System
 * Implements U-05: Haptic feedback fine-tuned: heavy → superlike, light → like
 * Features:
 * - Fine-tuned haptic patterns for different actions
 * - Platform-specific optimizations
 * - Accessibility considerations
 * - Performance optimized
 */

export enum HapticFeedbackType {
  // Swipe actions
  LIKE = 'like',
  SUPER_LIKE = 'super_like',
  PASS = 'pass',

  // UI interactions
  BUTTON_PRESS = 'button_press',
  TAB_SWITCH = 'tab_switch',
  TOGGLE = 'toggle',

  // Notifications
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',

  // Navigation
  NAVIGATION = 'navigation',
  MODAL_OPEN = 'modal_open',
  MODAL_CLOSE = 'modal_close',

  // Photo interactions
  PHOTO_SWIPE = 'photo_swipe',
  PHOTO_ZOOM = 'photo_zoom',

  // Match events
  NEW_MATCH = 'new_match',
  NEW_MESSAGE = 'new_message',
}

/**
 * Haptic feedback configuration for different interaction types
 */
const HAPTIC_CONFIG = {
  [HapticFeedbackType.LIKE]: {
    type: Haptics.ImpactFeedbackStyle.Light,
    duration: 50,
    description: 'Light tap for like action',
  },
  [HapticFeedbackType.SUPER_LIKE]: {
    type: Haptics.ImpactFeedbackStyle.Heavy,
    duration: 100,
    description: 'Strong vibration for super like',
  },
  [HapticFeedbackType.PASS]: {
    type: Haptics.ImpactFeedbackStyle.Medium,
    duration: 30,
    description: 'Medium tap for pass action',
  },
  [HapticFeedbackType.BUTTON_PRESS]: {
    type: Haptics.ImpactFeedbackStyle.Light,
    duration: 25,
    description: 'Light tap for button press',
  },
  [HapticFeedbackType.TAB_SWITCH]: {
    type: Haptics.ImpactFeedbackStyle.Light,
    duration: 20,
    description: 'Subtle tap for tab navigation',
  },
  [HapticFeedbackType.TOGGLE]: {
    type: Haptics.ImpactFeedbackStyle.Medium,
    duration: 40,
    description: 'Medium tap for toggle switches',
  },
  [HapticFeedbackType.SUCCESS]: {
    type: Haptics.NotificationFeedbackType.Success,
    duration: 60,
    description: 'Success notification pattern',
  },
  [HapticFeedbackType.ERROR]: {
    type: Haptics.NotificationFeedbackType.Error,
    duration: 80,
    description: 'Error notification pattern',
  },
  [HapticFeedbackType.WARNING]: {
    type: Haptics.NotificationFeedbackType.Warning,
    duration: 70,
    description: 'Warning notification pattern',
  },
  [HapticFeedbackType.NAVIGATION]: {
    type: Haptics.ImpactFeedbackStyle.Light,
    duration: 15,
    description: 'Light tap for navigation',
  },
  [HapticFeedbackType.MODAL_OPEN]: {
    type: Haptics.ImpactFeedbackStyle.Medium,
    duration: 45,
    description: 'Medium tap for modal opening',
  },
  [HapticFeedbackType.MODAL_CLOSE]: {
    type: Haptics.ImpactFeedbackStyle.Light,
    duration: 30,
    description: 'Light tap for modal closing',
  },
  [HapticFeedbackType.PHOTO_SWIPE]: {
    type: Haptics.ImpactFeedbackStyle.Light,
    duration: 20,
    description: 'Subtle tap for photo navigation',
  },
  [HapticFeedbackType.PHOTO_ZOOM]: {
    type: Haptics.ImpactFeedbackStyle.Medium,
    duration: 35,
    description: 'Medium tap for photo zoom',
  },
  [HapticFeedbackType.NEW_MATCH]: {
    type: Haptics.NotificationFeedbackType.Success,
    duration: 100,
    description: 'Celebratory pattern for new match',
  },
  [HapticFeedbackType.NEW_MESSAGE]: {
    type: Haptics.ImpactFeedbackStyle.Medium,
    duration: 40,
    description: 'Medium tap for new message',
  },
};

/**
 * Enhanced haptic feedback manager
 */
class HapticFeedbackManager {
  private isEnabled: boolean = true;
  private isReduceMotionEnabled: boolean = false;

  constructor() {
    this.checkAccessibilitySettings();
  }

  /**
   * Check accessibility settings to respect user preferences
   */
  private checkAccessibilitySettings(): void {
    try {
      // Note: In a real implementation, you'd check AccessibilityInfo.isReduceMotionEnabled()
      // For now, we'll assume it's available
      this.isReduceMotionEnabled = false;
    } catch (_error) {
      logger.warn('Could not check accessibility settings:', { _error });
    }
  }

  /**
   * Enable or disable haptic feedback
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if haptic feedback is available on the current platform
   */
  public isAvailable(): boolean {
    try {
      // Haptics are primarily available on iOS and some Android devices
      return Platform.OS === 'ios' || Platform.OS === 'android';
    } catch (_error) {
      return false;
    }
  }

  /**
   * Trigger haptic feedback for a specific interaction type
   */
  public async trigger(type: HapticFeedbackType): Promise<void> {
    if (!this.isEnabled || this.isReduceMotionEnabled) {
      return;
    }

    try {
      const config = HAPTIC_CONFIG[type];

      // Use appropriate haptic method based on feedback type
      if (
        type === HapticFeedbackType.SUCCESS ||
        type === HapticFeedbackType.ERROR ||
        type === HapticFeedbackType.WARNING ||
        type === HapticFeedbackType.NEW_MATCH
      ) {
        await Haptics.notificationAsync(config.type as Haptics.NotificationFeedbackType);
      } else {
        await Haptics.impactAsync(config.type as Haptics.ImpactFeedbackStyle);
      }

      // Log for debugging in development
      if (__DEV__) {
        logger.warn(`Haptic feedback triggered: ${type} (${config.description})`);
      }
    } catch (error) {
      logger.warn('Haptic feedback failed:', { error });
    }
  }

  /**
   * Trigger a custom haptic pattern
   */
  public async triggerCustomPattern(pattern: Haptics.ImpactFeedbackStyle[]): Promise<void> {
    if (!this.isEnabled || this.isReduceMotionEnabled) {
      return;
    }

    try {
      for (const [index, style] of pattern.entries()) {
        await Haptics.impactAsync(style);

        // Add small delay between patterns
        if (index < pattern.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      logger.warn('Custom haptic pattern failed:', { error });
    }
  }

  /**
   * Trigger selection feedback (for pickers, sliders, etc.)
   */
  public async triggerSelection(): Promise<void> {
    if (!this.isEnabled || this.isReduceMotionEnabled) {
      return;
    }

    try {
      await Haptics.selectionAsync();
    } catch (error) {
      logger.warn('Selection haptic feedback failed:', { error });
    }
  }

  /**
   * Get haptic configuration for a specific type (for debugging/testing)
   */
  public getConfig(type: HapticFeedbackType) {
    return HAPTIC_CONFIG[type];
  }

  /**
   * Get all available haptic types
   */
  public getAvailableTypes(): HapticFeedbackType[] {
    return Object.values(HapticFeedbackType);
  }
}

// Export singleton instance
export const hapticFeedback = new HapticFeedbackManager();

// Export convenience functions for common actions
export const hapticFeedbackActions = {
  like: () => hapticFeedback.trigger(HapticFeedbackType.LIKE),
  superLike: () => hapticFeedback.trigger(HapticFeedbackType.SUPER_LIKE),
  pass: () => hapticFeedback.trigger(HapticFeedbackType.PASS),
  buttonPress: () => hapticFeedback.trigger(HapticFeedbackType.BUTTON_PRESS),
  success: () => hapticFeedback.trigger(HapticFeedbackType.SUCCESS),
  error: () => hapticFeedback.trigger(HapticFeedbackType.ERROR),
  newMatch: () => hapticFeedback.trigger(HapticFeedbackType.NEW_MATCH),
  newMessage: () => hapticFeedback.trigger(HapticFeedbackType.NEW_MESSAGE),
};

export default hapticFeedback;
