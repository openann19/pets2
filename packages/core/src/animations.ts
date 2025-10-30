/**
 * Premium Animation Constants
 * Following Phase 2 Rule: "stiffness: 300-400, damping: 25-30"
 * Rules specify: stiffness: 300, damping: 30 for spring physics
 */

// Standard spring configuration per Rule II.5
export const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 300, // Rules-compliant value (was 400)
  damping: 30, // Rules-compliant value (was 17)
};

// Staggered animation configuration per Rule II.5
export const STAGGER_CONFIG = {
  staggerChildren: 0.07, // Rules specify 0.07 (was incorrectly 0.1)
};

// Shared layout animation configuration
export const _LAYOUT_TRANSITION = {
  ...SPRING_CONFIG,
  // Additional layout-specific configs can go here
};

// Hover/tap animation variants
export const _INTERACTION_VARIANTS = {
  hover: {
    scale: 1.02,
    rotateY: 1,
    transition: SPRING_CONFIG,
  },
  tap: {
    scale: 0.98,
    rotateY: -1,
    transition: SPRING_CONFIG,
  },
};

// List entrance animation
export const _LIST_VARIANTS = {
  visible: {
    opacity: 1,
    transition: {
      ...SPRING_CONFIG,
      ...STAGGER_CONFIG,
    },
  },
  hidden: {
    opacity: 0,
  },
};

// Page transition variants
export const _PAGE_VARIANTS = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: SPRING_CONFIG,
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: SPRING_CONFIG,
  },
};
