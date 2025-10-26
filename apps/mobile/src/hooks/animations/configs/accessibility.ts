/**
 * Accessibility Configuration
 */

import { AccessibilityInfo } from "react-native";

export let prefersReducedMotion = false;

// Initialize reduced motion preference
AccessibilityInfo.isReduceMotionEnabled().then((isEnabled) => {
  prefersReducedMotion = isEnabled;
});

export const getAccessibilityConfig = () => ({
  prefersReducedMotion,
});

