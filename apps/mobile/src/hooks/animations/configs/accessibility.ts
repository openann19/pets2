/**
 * Accessibility Configuration
 */

import { AccessibilityInfo } from "react-native";

let _prefersReducedMotion = false;

// Initialize reduced motion preference (safe for test environments)
if (typeof AccessibilityInfo !== 'undefined' && AccessibilityInfo.isReduceMotionEnabled) {
  AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
    _prefersReducedMotion = isEnabled;
  });
}

export const prefersReducedMotion = () => _prefersReducedMotion;

export const getAccessibilityConfig = () => ({
  prefersReducedMotion: _prefersReducedMotion,
});
