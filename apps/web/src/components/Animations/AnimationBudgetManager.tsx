/**
 * 🔥 OPTIMIZED ANIMATION BUDGET MANAGER
 * Advanced performance monitoring and adaptive throttling
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAnimationBudgetV2 } from './AnimationBudget';
import { logger } from '@pawfectmatch/core';

interface AnimationBudgetManagerProps {
  children: React.ReactNode;
  maxAnimations?: number;
}

/**
 * Animation Budget Manager Component
 * Automatically optimizes animations based on device performance
 */
export function AnimationBudgetManager({ children, maxAnimations = 16 }: AnimationBudgetManagerProps) {
  const { budget, registerAnimation, unregisterAnimation } = useAnimationBudgetV2({
    maxAnimationsHigh: maxAnimations,
    maxAnimationsMid: Math.floor(maxAnimations * 0.6),
    maxAnimationsLow: Math.floor(maxAnimations * 0.4),
  });

  // Log performance metrics in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.info('[Animation Budget]', {
        level: budget.performanceLevel,
        active: budget.activeAnimations,
        max: budget.maxAnimations,
        throttle: `${(budget.throttlingFactor * 100).toFixed(0)}%`,
      });
    }
  }, [budget]);

  return <>{children}</>;
}

/**
 * Hook to check if animation should be enabled
 */
export function useShouldAnimate() {
  const { budget, registerAnimation, unregisterAnimation } = useAnimationBudgetV2();
  
  useEffect(() => {
    const success = registerAnimation();
    if (!success) {
      logger.warn('[Animation Budget] Animation rejected - budget exceeded');
    }
    return () => { unregisterAnimation(); };
  }, [registerAnimation, unregisterAnimation]);

  return {
    shouldAnimate: budget.activeAnimations < budget.maxAnimations,
    throttlingFactor: budget.throttlingFactor,
    performanceLevel: budget.performanceLevel,
  };
}

/**
 * Adaptive animation props based on performance
 */
export function useAdaptiveAnimationProps() {
  const { budget } = useAnimationBudgetV2();
  
  return {
    transition: {
      duration: budget.performanceLevel === 'low' ? 0.2 : 0.3,
      ease: budget.performanceLevel === 'low' ? 'easeOut' : [0.22, 0.68, 0, 1],
    },
    whileHover: budget.performanceLevel !== 'low' ? { scale: 1.05 } : undefined,
    whileTap: budget.performanceLevel !== 'low' ? { scale: 0.95 } : undefined,
  };
}
