import React, { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Hook to check if user prefers reduced motion
 * Returns true if the system preference is enabled
 */
export function useReduceMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled()
      .then((isEnabled) => {
        if (isMounted) {
          setReducedMotion(isEnabled);
        }
      })
      .catch(() => {
        // Fallback if not supported
        if (isMounted) {
          setReducedMotion(false);
        }
      });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        if (isMounted) {
          setReducedMotion(isEnabled);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reducedMotion;
}

/**
 * Hook to get motion configuration with reduce-motion support
 */
export function useMotionConfig() {
  const reduceMotion = useReduceMotion();

  return {
    reduceMotion,
    animationConfig: reduceMotion
      ? { duration: 0, type: 'timing' as const }
      : {
          type: 'spring' as const,
          damping: 20,
          stiffness: 300,
        },
  };
}