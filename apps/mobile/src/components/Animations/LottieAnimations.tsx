/**
 * 🎬 ULTRA PREMIUM LOTTIE ANIMATIONS
 * Professional-grade Lottie animations for mobile success/loading states
 * Performance optimized with proper lifecycle management
 * 
 * This file re-exports from the modular Lottie components for backward compatibility
 */

import { useState } from 'react';

// Re-export base component and types
export { LottieAnimation } from './Lottie/LottieAnimation';
export type { LottieAnimationProps } from './Lottie/LottieAnimation';

// Re-export specific animations with backward-compatible names
export { SuccessAnimation as SuccessLottie } from './Lottie/SuccessAnimation';
export { LoadingAnimation as LoadingLottie } from './Lottie/LoadingAnimation';
export { ErrorAnimation as ErrorLottie } from './Lottie/ErrorAnimation';

// Also export new names for forward compatibility
export { SuccessAnimation } from './Lottie/SuccessAnimation';
export { LoadingAnimation } from './Lottie/LoadingAnimation';
export { ErrorAnimation } from './Lottie/ErrorAnimation';

/**
 * Hook for managing Lottie animations
 */
export function useLottieAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const play = () => {
    setIsPlaying(true);
    setIsFinished(false);
  };

  const stop = () => {
    setIsPlaying(false);
  };

  const reset = () => {
    setIsPlaying(false);
    setIsFinished(false);
  };

  const onFinish = () => {
    setIsPlaying(false);
    setIsFinished(true);
  };

  return {
    isPlaying,
    isFinished,
    play,
    stop,
    reset,
    onFinish,
  };
}

// Note: EmptyLottie and CelebrationLottie were removed as they were not used
// Add them back as needed in separate files following the pattern of SuccessAnimation, etc.