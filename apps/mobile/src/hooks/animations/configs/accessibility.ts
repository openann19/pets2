/**
 * Accessibility Configuration
 */

import { AccessibilityInfo } from "react-native";

export let prefersReducedMotion = false;

// Initialize reduced motion preference (safe for test environments)
if (typeof AccessibilityInfo !== 'undefined' && AccessibilityInfo.isReduceMotionEnabled) {
  AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
    prefersReducedMotion = isEnabled;
  });
}

export const getAccessibilityConfig = () => ({
  prefersReducedMotion,
});
