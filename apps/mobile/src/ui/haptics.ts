/**
 * 🎯 HAPTIC FEEDBACK SYSTEM
 * Single source of truth for all haptic feedback
 * Maps to Material Design haptic patterns
 */

import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utilities
 * Use these exclusively - no direct Haptics.* calls
 */
export const haptic = {
  // Light impact - for subtle interactions (tabs, buttons, minor selections)
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  
  // Medium impact - for confirmations (like, send message)
  confirm: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  
  // Heavy impact - for super-actions (super-like, purchase)
  super: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  
  // Notification feedback for errors
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  
  // Notification feedback for success
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  
  // Selection feedback (pickers, toggles, wheel)
  selection: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
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

