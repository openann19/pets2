/**
 * 🎯 FOUNDATION: PERFORMANCE BUDGETS
 * 
 * Defines performance budgets per scene/feature
 * Prevents performance degradation by enforcing limits
 * 
 * ⚠️ CRITICAL: All scenes MUST respect these budgets
 * CI/CD will fail builds if budgets are exceeded
 */

export interface PerformanceBudget {
  /** Maximum GPU draw calls per frame */
  maxDrawCalls: number;
  
  /** Maximum blur radius (px) */
  maxBlurRadius: number;
  
  /** Maximum particle count */
  maxParticles: number;
  
  /** Maximum texture dimensions (px) */
  maxTextureSize: number;
  
  /** Maximum concurrent animations */
  maxAnimations: number;
  
  /** Target frames per second */
  targetFPS: number;
  
  /** Maximum spring stiffness (for performance) */
  maxSpringStiffness: number;
  
  /** Maximum simultaneous gestures */
  maxGestures: number;
}

/**
 * Performance budgets per scene
 * 
 * Budgets are conservative to ensure 60fps on mid-range devices
 * Flagship devices can exceed these, but budgets act as safety net
 */
/**
 * Performance budgets per scene
 * Matches polish mandate spec exactly
 */
export const PERFORMANCE_BUDGETS: Record<string, PerformanceBudget> = {
  /**
   * Home/List screen
   * Budget: ≤ 1 blur (≤10), ≤ 150 particles, ≤ 2 shadows per item
   */
  home: {
    maxDrawCalls: 25,
    maxBlurRadius: 10,
    maxParticles: 150,
    maxTextureSize: 1024,
    maxAnimations: 3,
    targetFPS: 60,
    maxSpringStiffness: 400,
    maxGestures: 1,
  },
  
  /**
   * List screens (Matches, Pets, etc.)
   * Budget: ≤ 1 blur (≤10), ≤ 150 particles, ≤ 2 shadows per item
   */
  list: {
    maxDrawCalls: 25,
    maxBlurRadius: 10,
    maxParticles: 150,
    maxTextureSize: 1024,
    maxAnimations: 3,
    targetFPS: 60,
    maxSpringStiffness: 400,
    maxGestures: 1,
  },
  
  /**
   * Card Stack (Swipe screen)
   * Budget: ≤ 2 overlapping blurs, ≤ 60ms transition setup, 0 runOnJS in hot path
   */
  'card-stack': {
    maxDrawCalls: 30,
    maxBlurRadius: 20, // 2 overlapping blurs max
    maxParticles: 50,
    maxTextureSize: 1024,
    maxAnimations: 5,
    targetFPS: 60,
    maxSpringStiffness: 500,
    maxGestures: 1, // Single swipe gesture
  },
  
  /**
   * Details screen
   * Budget: textures ≤ 2048px on mid-tier Android
   */
  details: {
    maxDrawCalls: 20,
    maxBlurRadius: 10,
    maxParticles: 0,
    maxTextureSize: 2048, // ≤ 2048px per spec
    maxAnimations: 2,
    targetFPS: 60,
    maxSpringStiffness: 300,
    maxGestures: 1,
  },
  
  /**
   * Default/fallback budget
   * Use for unknown scenes
   */
  default: {
    maxDrawCalls: 15,
    maxBlurRadius: 10,
    maxParticles: 0,
    maxTextureSize: 512,
    maxAnimations: 2,
    targetFPS: 60,
    maxSpringStiffness: 300,
    maxGestures: 1,
  },
};

/**
 * Get budget for a scene
 */
export function getBudget(scene: string): PerformanceBudget {
  return PERFORMANCE_BUDGETS[scene] || PERFORMANCE_BUDGETS.default;
}

/**
 * Check if a value exceeds budget
 */
export function exceedsBudget(
  scene: string,
  metric: keyof PerformanceBudget,
  value: number,
): boolean {
  const budget = getBudget(scene);
  return value > budget[metric];
}

/**
 * Get adaptive budget based on device capabilities
 * Reduces budgets for low-end devices
 */
export function getAdaptiveBudget(
  scene: string,
  performanceMultiplier: number,
): PerformanceBudget {
  const baseBudget = getBudget(scene);
  
  return {
    maxDrawCalls: Math.floor(baseBudget.maxDrawCalls * performanceMultiplier),
    maxBlurRadius: Math.floor(baseBudget.maxBlurRadius * performanceMultiplier),
    maxParticles: Math.floor(baseBudget.maxParticles * performanceMultiplier),
    maxTextureSize: Math.floor(baseBudget.maxTextureSize * performanceMultiplier),
    maxAnimations: Math.floor(baseBudget.maxAnimations * performanceMultiplier),
    targetFPS: baseBudget.targetFPS, // Keep target FPS consistent
    maxSpringStiffness: Math.floor(baseBudget.maxSpringStiffness * performanceMultiplier),
    maxGestures: baseBudget.maxGestures, // Keep gestures consistent
  };
}

/**
 * Validate scene against budget
 * Returns violations if any
 */
export function validateBudget(
  scene: string,
  metrics: Partial<Record<keyof PerformanceBudget, number>>,
): Array<{ metric: keyof PerformanceBudget; budget: number; actual: number }> {
  const budget = getBudget(scene);
  const violations: Array<{ metric: keyof PerformanceBudget; budget: number; actual: number }> = [];
  
  for (const [metric, value] of Object.entries(metrics)) {
    const budgetValue = budget[metric as keyof PerformanceBudget];
    if (budgetValue !== undefined && value > budgetValue) {
      violations.push({
        metric: metric as keyof PerformanceBudget,
        budget: budgetValue,
        actual: value,
      });
    }
  }
  
  return violations;
}

export default {
  PERFORMANCE_BUDGETS,
  getBudget,
  exceedsBudget,
  getAdaptiveBudget,
  validateBudget,
};

