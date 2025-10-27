/**
 * 🎯 HAPTIC FEEDBACK SYSTEM
 * Single source of truth for all haptic feedback
 * Maps to Material Design haptic patterns
 */

import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities
 * Use these exclusively - no direct Haptics.* calls
 * All methods include error handling to prevent crashes
 */
export const haptic = {
  // Light impact - for subtle interactions (tabs, buttons, minor selections)
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  
  // Medium impact - for confirmations (like, send message)
  confirm: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  
  // Heavy impact - for super-actions (super-like, purchase)
  super: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}),
  
  // Notification feedback for errors
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
  
  // Notification feedback for success
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  
  // Selection feedback (pickers, toggles, wheel)
  selection: () => Haptics.selectionAsync().catch(() => {}),
};

/**
 * Haptic usage map
 * 
 * tap: Tab switches, button taps, minor selections
 * confirm: Like, send, confirm actions
 * super: Super-like, purchase, premium actions
 * error: Error states, failed actions
 * success: Success states, completed actions
 * selection: Picker changes, toggle switches, wheel scrolling
 */

