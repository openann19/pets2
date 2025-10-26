/**
 * 🎬 UNIFIED ANIMATION API
 * Single source of truth for all animation constants and utilities
 * 
 * Also provides backward-compatible re-exports for design tokens
 */

import { Easing } from "react-native";
import { SPACING, RADIUS } from "@pawfectmatch/design-tokens";

// Animation constants
export const DUR = { fast: 150, normal: 250, slow: 400 } as const;

export const EASE = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  out: Easing.bezier(0, 0, 0.2, 1),
  in: Easing.bezier(0.4, 0, 1, 1),
} as const;

export const SPRING = {
  stiff: { stiffness: 300, damping: 30, mass: 0.9 },
  soft: { stiffness: 180, damping: 22, mass: 1.0 },
} as const;

// Backward compatibility - re-export design tokens
// TODO: Components should import these from @pawfectmatch/design-tokens directly
export const Spacing = SPACING;
export const BorderRadius = RADIUS;

