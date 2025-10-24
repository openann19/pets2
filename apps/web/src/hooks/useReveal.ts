/**
 * 🎬 ULTRA PREMIUM SCROLL REVEAL SYSTEM
 * Professional-grade intersection observer with staggered animations
 * Performance optimized with GPU transforms and reduced motion support
 */

import { useEffect, useRef, useCallback, useState } from "react";

export interface RevealOptions extends IntersectionObserverInit {
  /** Delay between staggered items in milliseconds */
  staggerDelay?: number;
  /** Custom easing function */
  easing?: string;
  /** Whether to respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
  /** Custom transform origin */
  transformOrigin?: string;
  /** Animation duration in milliseconds */
  duration?: number;
}

export interface RevealRef<T extends HTMLElement> {
  ref: React.RefObject<T>;
  isRevealed: boolean;
  reveal: () => void;
  reset: () => void;
}

const DEFAULT_OPTIONS: Required<RevealOptions> = {
  rootMargin: "0px 0px -10% 0px",
  threshold: 0.2,
  staggerDelay: 60,
  easing: "cubic-bezier(0.22, 0.68, 0, 1)",
  respectReducedMotion: true,
  transformOrigin: "center",
  duration: 600,
};

/**
 * Hook for scroll-triggered reveal animations with staggered timing
 * @param options Configuration options for the reveal animation
 * @returns Object with ref, reveal state, and control functions
 */
export function useReveal<T extends HTMLElement>(
  options: RevealOptions = {}
): RevealRef<T> {
  const ref = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Check for reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    if (!config.respectReducedMotion) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, [config.respectReducedMotion]);

  const reveal = useCallback(() => {
    if (ref.current && !isRevealed) {
      if (prefersReducedMotion()) {
        // Instant reveal for reduced motion
        ref.current.classList.add("is-revealed");
        setIsRevealed(true);
      } else {
        // Animated reveal
        ref.current.classList.add("is-revealed");
        setIsRevealed(true);
      }
    }
  }, [isRevealed, prefersReducedMotion]);

  const reset = useCallback(() => {
    if (ref.current) {
      ref.current.classList.remove("is-revealed");
      setIsRevealed(false);
    }
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isRevealed) {
            reveal();
          }
        });
      },
      {
        rootMargin: config.rootMargin,
        threshold: config.threshold,
      }
    );

    observerRef.current.observe(node);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [config.rootMargin, config.threshold, isRevealed, reveal]);

  return {
    ref,
    isRevealed,
    reveal,
    reset,
  };
}

/**
 * Hook for staggered reveal animations in lists/grids
 * @param items Array of items to animate
 * @param options Configuration options
 * @returns Array of reveal refs with staggered delays
 */
export function useStaggeredReveal<T extends HTMLElement>(
  items: unknown[],
  options: RevealOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  return items.map((_, index) => {
    const { ref, isRevealed, reveal, reset } = useReveal<T>({
      ...config,
      staggerDelay: config.staggerDelay * index,
    });

    return {
      ref,
      isRevealed,
      reveal,
      reset,
      delay: config.staggerDelay * index,
      style: {
        "--delay": `${config.staggerDelay * index}ms`,
        "--duration": `${config.duration}ms`,
        "--easing": config.easing,
        "--transform-origin": config.transformOrigin,
      } as React.CSSProperties,
    };
  });
}

/**
 * Hook for container-based reveal animations
 * @param options Configuration options
 * @returns Object with container ref and reveal controls
 */
export function useRevealContainer<T extends HTMLElement>(
  options: RevealOptions = {}
) {
  const containerRef = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const config = { ...DEFAULT_OPTIONS, ...options };

  const revealAll = useCallback(() => {
    if (containerRef.current) {
      const children = containerRef.current.querySelectorAll('.reveal-item');
      children.forEach((child, index) => {
        const delay = config.staggerDelay * index;
        setTimeout(() => {
          child.classList.add('is-revealed');
        }, delay);
      });
      setIsRevealed(true);
    }
  }, [config.staggerDelay]);

  const resetAll = useCallback(() => {
    if (containerRef.current) {
      const children = containerRef.current.querySelectorAll('.reveal-item');
      children.forEach(child => {
        child.classList.remove('is-revealed');
      });
      setIsRevealed(false);
    }
  }, []);

  return {
    containerRef,
    isRevealed,
    revealAll,
    resetAll,
  };
}
