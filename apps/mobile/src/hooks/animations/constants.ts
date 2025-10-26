/**
 * Premium Animation Constants
 * Centralized animation configurations
 */

// === PREMIUM ANIMATION CONSTANTS ===
export const PREMIUM_ANIMATIONS = {
  // Spring configurations
  spring: {
    gentle: {
      damping: 20,
      stiffness: 100,
      mass: 1.2,
    },
    bouncy: {
      damping: 8,
      stiffness: 200,
      mass: 0.8,
    },
    wobbly: {
      damping: 12,
      stiffness: 180,
      mass: 1,
    },
    stiff: {
      damping: 10,
      stiffness: 200,
      mass: 1,
    },
  },

  // Timing configurations
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 750,
  },

  // Easing curves
  easing: {
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },

  // Stagger delays
  stagger: {
    fast: 50,
    normal: 100,
    slow: 150,
  },
} as const;
