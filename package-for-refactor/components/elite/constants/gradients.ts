/**
 * Premium Gradient Colors
 * Centralized gradient color definitions for elite components
 */

export const PREMIUM_GRADIENTS = {
  primary: ["#ec4899", "#f472b6", "#f9a8d4"],
  secondary: ["#0ea5e9", "#38bdf8", "#7dd3fc"],
  premium: ["#a855f7", "#c084fc", "#d8b4fe"],
  sunset: ["#f59e0b", "#f97316", "#fb923c"],
  ocean: ["#0ea5e9", "#06b6d4", "#22d3ee"],
  holographic: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"],
  neon: ["#00f5ff", "#ff00ff", "#ffff00"],
  glass: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"],
} as const;

export type PremiumGradientKey = keyof typeof PREMIUM_GRADIENTS;
