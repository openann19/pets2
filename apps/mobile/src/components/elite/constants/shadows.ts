/**
 * Premium Shadow Styles
 * Centralized shadow definitions for elite components with glow effects
 */

export const PREMIUM_SHADOWS = {
  primaryGlow: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  secondaryGlow: {
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  holographicGlow: {
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 20,
  },
  neonGlow: {
    shadowColor: "#00f5ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 25,
  },
} as const;

export type PremiumShadowKey = keyof typeof PREMIUM_SHADOWS;
