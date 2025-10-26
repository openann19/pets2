/**
 * useStaggeredAnimation Hook
 * Staggered animation delays
 */

import { PREMIUM_ANIMATIONS } from "./constants";

export const useStaggeredAnimation = (
  count: number,
  delay = PREMIUM_ANIMATIONS.stagger.normal,
) => {
  const getStaggeredDelay = (index: number) => index * delay;

  return {
    getStaggeredDelay,
  };
};

export default useStaggeredAnimation;

