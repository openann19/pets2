'use client'

/**
 * 🔥 ULTRA‑PREMIUM PARALLAX DEPTH SYSTEM — V2
 * Jaw‑dropping parallax with true 3D depth and sticky scrollytelling
 * ‑ Framer Motion • Tailwind‑ready • SSR‑safe • Accessibility‑first
 * ‑ Motion budget aware • Reduced‑motion compliant • GPU‑accelerated
 */

import React, { useMemo, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'framer-motion';

type Range2 = [number, number];

export interface ParallaxLayerV2 {
  children: React.ReactNode;
  /** Scroll range in PX relative to the page (e.g. [0, 800]) */
  scrollRange: Range2;
  /** Y transform range in PX (e.g. [0, -120]) */
  yRange?: Range2;
  /** Optional transforms */
  xRange?: Range2;
  scaleRange?: Range2;
  rotateRange?: Range2; // degrees
  opacityRange?: Range2;
  /** z depth in px for real 3D layering (requires perspective on container) */
  z?: number; // positive values appear closer
  /** CSS class name */
  className?: string;
  /** Stacking order if you also want to control z-index explicitly */
  zIndex?: number;
  /** Enable/disable spring smoothing per layer */
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  } | false;
}

// Legacy type alias for backwards compatibility
export type ParallaxLayer = ParallaxLayerV2;

export interface ParallaxHeroV2Props {
  layers: ParallaxLayerV2[];
  /** Height of the scrollytelling segment */
  height?: number | string; // e.g. 1400, '120vh'
  /** If true, pins the hero (sticky) so content scrolls through it */
  pin?: boolean;
  /** Perspective in px for 3D layering */
  perspective?: number; // default 1200
  /** Optional scroll container (for custom scroll areas) */
  containerRef?: React.RefObject<HTMLElement>;
  /** Optimize transform composition & paint */
  optimize?: 'auto' | 'quality' | 'maxfps';
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
  /** Debug overlay (depth outlines, rulers) */
  debug?: boolean;
  className?: string;
}

// Legacy type alias
export type ParallaxHeroProps = ParallaxHeroV2Props;

/**
 * Ultra Premium Parallax Hero Component V2
 * Creates stunning depth effects with true 3D layering and sticky scrollytelling
 */
export function ParallaxHeroV2({
  layers,
  height = '120vh',
  pin = false,
  perspective = 1200,
  containerRef,
  optimize = 'auto',
  respectReducedMotion = true,
  debug = false,
  className = '',
}: ParallaxHeroV2Props) {
  const prefersReduced = useReducedMotion();
  const hostRef = useRef<HTMLDivElement>(null);

  // Use window scroll by default or custom container when provided
  const { scrollY } = useScroll(containerRef ? { container: containerRef } : {});

  const computedLayers = useMemo(() => {
    return [...layers]
      .map((L, idx) => ({
        key: idx,
        z: L.z ?? 0,
        zIndex: L.zIndex ?? idx,
        className: L.className ?? '',
        spring: L.spring === false ? false : { stiffness: 160, damping: 26, mass: 0.9, ...L.spring },
        ranges: {
          y: L.yRange ?? ([0, 0] as Range2),
          x: L.xRange,
          s: L.scaleRange,
          r: L.rotateRange,
          o: L.opacityRange,
        },
        children: L.children,
        scrollRange: L.scrollRange,
      }))
      .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  }, [layers]);

  return (
    <div
      ref={hostRef}
      className={`relative overflow-hidden ${pin ? 'sticky top-0' : ''} ${className}`}
      style={{
        height,
        perspective,
        transformStyle: 'preserve-3d',
        contain: 'content',
      }}
      aria-label="Decorative parallax section"
      role="img"
    >
      {computedLayers.map((L) => {
        // Reduced motion: flatten transforms into a subtle crossfade
        if (respectReducedMotion && prefersReduced) {
          return (
            <motion.div
              key={L.key}
              className={`absolute inset-0 ${L.className}`}
              style={{ zIndex: L.zIndex, willChange: 'opacity' }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 0.68, 0, 1] }}
            >
              {L.children}
            </motion.div>
          );
        }

        const yMv = useTransform(scrollY, L.scrollRange, L.ranges.y);
        const xMv = L.ranges.x ? useTransform(scrollY, L.scrollRange, L.ranges.x) : undefined;
        const sMv = L.ranges.s ? useTransform(scrollY, L.scrollRange, L.ranges.s) : undefined;
        const rMv = L.ranges.r ? useTransform(scrollY, L.scrollRange, L.ranges.r) : undefined;
        const oMv = L.ranges.o ? useTransform(scrollY, L.scrollRange, L.ranges.o) : undefined;

        const smoothing = L.spring && typeof L.spring === 'object'
          ? {
              y: useSpring(yMv, L.spring),
              x: xMv ? useSpring(xMv, L.spring) : undefined,
              s: sMv ? useSpring(sMv, L.spring) : undefined,
              r: rMv ? useSpring(rMv, L.spring) : undefined,
              o: oMv ? useSpring(oMv, L.spring) : undefined,
            }
          : { y: yMv, x: xMv, s: sMv, r: rMv, o: oMv };

        const willChange = optimize === 'maxfps' ? 'transform, opacity' : optimize === 'quality' ? 'auto' : 'transform';

        const styleProps: Record<string, unknown> = {
          y: smoothing.y,
          zIndex: L.zIndex,
          willChange,
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        };
        
        if (smoothing.x) styleProps['x'] = smoothing.x;
        if (smoothing.s) styleProps['scale'] = smoothing.s;
        if (smoothing.r) styleProps['rotate'] = smoothing.r;
        if (smoothing.o) styleProps['opacity'] = smoothing.o;

        return (
          <motion.div
            key={L.key}
            className={`absolute inset-0 ${L.className}`}
            style={styleProps}
            /** Inject translateZ at the start of the transform chain */
            transformTemplate={(t) => `translateZ(${L.z ?? 0}px) ${t}`}
          >
            {debug && (
              <div className="absolute top-2 right-2 z-[9999] text-[10px] select-none px-1.5 py-0.5 rounded bg-black/50 text-white font-mono">
                z:{L.z ?? 0}
              </div>
            )}
            {L.children}
          </motion.div>
        );
      })}
    </div>
  );
}

// Legacy export
export const ParallaxHero = ParallaxHeroV2;

/**
 * Predefined parallax layer configurations V2
 */
export const PARALLAX_PRESETS_V2 = {
  heroClassic: [
    {
      children: <div className="bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#06B6D4]" />,
      scrollRange: [0, 800] as Range2,
      yRange: [0, -140] as Range2,
      opacityRange: [1, 1] as Range2,
      z: -200,
      zIndex: 1,
      className: 'layer-bg',
    },
    {
      children: <div className="bg-white/10 backdrop-blur-md" />,
      scrollRange: [0, 800] as Range2,
      yRange: [0, -70] as Range2,
      xRange: [0, 40] as Range2,
      opacityRange: [0.7, 0.95] as Range2,
      z: -80,
      zIndex: 2,
      className: 'layer-mid',
    },
    {
      children: (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-white drop-shadow-2xl text-5xl md:text-7xl font-extrabold tracking-tight">
            Parallax Magic
          </h1>
        </div>
      ),
      scrollRange: [0, 500] as Range2,
      yRange: [0, -30] as Range2,
      scaleRange: [0.9, 1] as Range2,
      opacityRange: [0, 1] as Range2,
      z: 0,
      zIndex: 10,
      className: 'layer-fg',
      spring: { stiffness: 180, damping: 24, mass: 0.8 },
    },
  ] satisfies ParallaxLayerV2[],
};

// Legacy preset alias
export const PARALLAX_PRESETS = PARALLAX_PRESETS_V2;

/**
 * Hook for custom parallax effects
 */
export function useParallax(
  scrollRange: [number, number],
  transformRange: [number, number],
  options: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    optimizePerformance?: boolean;
  } = {}
) {
  const { scrollY } = useScroll();
  const { stiffness = 200, damping = 20, mass = 1, optimizePerformance = true } = options;

  const rawTransform = useTransform(scrollY, scrollRange, transformRange);
  
  const springTransform = useSpring(rawTransform, {
    stiffness: optimizePerformance ? stiffness * 0.5 : stiffness,
    damping: optimizePerformance ? damping * 1.5 : damping,
    mass: optimizePerformance ? mass * 0.8 : mass,
  });

  return springTransform;
}

/**
 * Performance-optimized parallax container
 */
export function ParallaxContainer({
  children,
  className = "",
  height = "100vh",
}: {
  children: React.ReactNode;
  className?: string;
  height?: string;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ 
        height,
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Example usage component
 */
export function ParallaxHeroV2Example() {
  return (
    <ParallaxHeroV2
      height="130vh"
      pin
      perspective={1400}
      optimize="maxfps"
      layers={PARALLAX_PRESETS_V2.heroClassic}
      className="rounded-none"
    />
  );
}
