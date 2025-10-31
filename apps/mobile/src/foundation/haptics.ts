/**
 * 🎯 FOUNDATION: HAPTICS HYGIENE
 * 
 * Map: tap=light, confirm=medium, super=heavy, error=error, success=success, selection=selection
 * 
 * Never fire haptics > 1 per 120ms window
 * Tie to state commit, not gesture start
 */

import * as Haptics from 'expo-haptics';

type HapticType = 'tap' | 'confirm' | 'super' | 'error' | 'success' | 'selection';

/**
 * Optional haptics - safe fallback if react-native-haptic-feedback is missing
 * No-op if library missing; safe in CI
 */
type SimpleMode = 'soft' | 'medium' | 'heavy';

let H: any;
try {
  H = require('react-native-haptic-feedback');
} catch {
  // Library not available - will use expo-haptics fallback
}

/**
 * Simple haptic feedback (react-native-haptic-feedback compatible)
 * Falls back to expo-haptics if react-native-haptic-feedback is not available
 */
export function hapticSimple(mode: SimpleMode = 'soft'): void {
  const map: Record<SimpleMode, string> = {
    soft: 'impactLight',
    medium: 'impactMedium',
    heavy: 'impactHeavy',
  };

  // Try react-native-haptic-feedback first
  if (H?.default?.trigger) {
    H.default.trigger(map[mode], {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    return;
  }

  // Fallback to expo-haptics
  switch (mode) {
    case 'soft':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      break;
  }
}

/**
 * Haptic debounce - prevents firing > 1 per 120ms window
 */
let lastHapticTime = 0;
const HAPTIC_DEBOUNCE_MS = 120;

/**
 * Internal haptic firing with debounce
 */
function fireHaptic(type: HapticType): void {
  const now = Date.now();
  if (now - lastHapticTime < HAPTIC_DEBOUNCE_MS) {
    return; // Skip if too soon
  }
  
  lastHapticTime = now;
  
  switch (type) {
    case 'tap':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      break;
    case 'confirm':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      break;
    case 'super':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      break;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      break;
    case 'selection':
      Haptics.selectionAsync().catch(() => {});
      break;
  }
}

/**
 * Haptic feedback utilities
 * Use these exclusively - no direct Haptics.* calls
 * All methods include error handling and debouncing
 * 
 * ⚠️ CRITICAL: Call on state commit, not gesture start
 * 
 * @example
 * ```tsx
 * const handleLike = () => {
 *   // Do state update first
 *   setLiked(true);
 *   // Then fire haptic on state commit
 *   haptic.confirm();
 * };
 * ```
 */
export const haptic = {
  // Light impact - for subtle interactions (tabs, buttons, minor selections)
  tap: () => fireHaptic('tap'),

  // Medium impact - for confirmations (like, send message)
  confirm: () => fireHaptic('confirm'),

  // Heavy impact - for super-actions (super-like, purchase)
  super: () => fireHaptic('super'),

  // Notification feedback for errors
  error: () => fireHaptic('error'),

  // Notification feedback for success
  success: () => fireHaptic('success'),

  // Selection feedback (pickers, toggles, wheel)
  selection: () => fireHaptic('selection'),
};

/**
 * Reset haptic debounce (for testing)
 */
export function resetHapticDebounce(): void {
  lastHapticTime = 0;
}

export default haptic;

// Export simple haptic separately (UltraCrisp Motion compatibility)
export { hapticSimple };

