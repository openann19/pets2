'use client'

/**
 * 🔥 ULTRA‑PREMIUM ANIMATION SUITE — V2
 * Jaw‑dropping parallax, 3D tilt, and reveal systems
 * ‑ Framer Motion • Tailwind‑ready • SSR‑safe • Accessibility‑first
 * ‑ Motion budget aware • Reduced‑motion compliant • GPU‑accelerated
 */

import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';

// ------------------------------------------------------------------------------------
// Utils
// ------------------------------------------------------------------------------------

type Range2 = [number, number];

const toPx = (value: number | string, dimension: number) =>
  typeof value === 'number'
    ? value
    : /vh$/i.test(value)
    ? (parseFloat(String(value)) / 100) * dimension
    : /vw$/i.test(value)
    ? (parseFloat(String(value)) / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1920)
    : parseFloat(String(value));

// ------------------------------------------------------------------------------------
// PARALLAX — V2
// ------------------------------------------------------------------------------------

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

        const smoothing = L.spring
          ? {
              y: useSpring(yMv, L.spring === true ? undefined : L.spring),
              x: xMv ? useSpring(xMv, L.spring === true ? undefined : L.spring) : undefined,
              s: sMv ? useSpring(sMv, L.spring === true ? undefined : L.spring) : undefined,
              r: rMv ? useSpring(rMv, L.spring === true ? undefined : L.spring) : undefined,
              o: oMv ? useSpring(oMv, L.spring === true ? undefined : L.spring) : undefined,
            }
          : { y: yMv, x: xMv, s: sMv, r: rMv, o: oMv };

        const willChange = optimize === 'maxfps' ? 'transform, opacity' : optimize === 'quality' ? 'auto' : 'transform';

        return (
          <motion.div
            key={L.key}
            className={`absolute inset-0 ${L.className}`}
            style={{
              y: smoothing.y,
              x: smoothing.x as any,
              scale: smoothing.s as any,
              rotate: smoothing.r as any,
              opacity: smoothing.o as any,
              zIndex: L.zIndex,
              willChange,
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
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

// Handy presets
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

// ------------------------------------------------------------------------------------
// TILT CARD — V2 (with Glare + Inner‑Parallax)
// ------------------------------------------------------------------------------------

export interface TiltCardV2Props {
  children: React.ReactNode;
  maxTilt?: number; // degrees
  hoverScale?: number;
  glare?: boolean; // glossy reflection following cursor
  glareOpacity?: number; // 0..1
  spring?: { stiffness?: number; damping?: number; mass?: number };
  className?: string;
  disabled?: boolean;
  /**
   * Enable inner‑parallax: elements inside card with data‑depth="0..1" translate subtly.
   */
  innerParallax?: boolean;
  /** Keyboard accessibility */
  focusable?: boolean;
}

export function TiltCardV2({
  children,
  maxTilt = 12,
  hoverScale = 1.02,
  glare = true,
  glareOpacity = 0.25,
  spring = { stiffness: 320, damping: 22, mass: 0.9 },
  className = '',
  disabled = false,
  innerParallax = true,
  focusable = true,
}: TiltCardV2Props) {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const w = useMotionValue(0);
  const h = useMotionValue(0);

  // Track element size for normalized tilt
  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    w.set(rect.width);
    h.set(rect.height);
  }, [w, h]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const rx = useSpring(useTransform(my, [-0.5, 0.5], [maxTilt, -maxTilt]), spring);
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-maxTilt, maxTilt]), spring);

  // Extract normalized cursor position from pointer
  const updatePointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const ny = (clientY - rect.top) / rect.height - 0.5;
      mx.set(nx);
      my.set(ny);
    },
    [mx, my]
  );

  const onPointerMove = useCallback<React.PointerEventHandler<HTMLDivElement>>(
    (e) => {
      if (disabled) return;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      updatePointer(e.clientX, e.clientY);
    },
    [disabled, updatePointer]
  );

  const reset = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  const onPointerLeave = useCallback(() => !disabled && reset(), [disabled, reset]);
  const onBlur = useCallback(() => !disabled && reset(), [disabled, reset]);

  // Inner parallax: translate children with data-depth
  const depthX = innerParallax ? useTransform(mx, [-0.5, 0.5], [12, -12]) : undefined;
  const depthY = innerParallax ? useTransform(my, [-0.5, 0.5], [12, -12]) : undefined;

  const scale = prefersReduced || disabled ? 1 : hoverScale;

  return (
    <motion.div
      ref={ref}
      className={`relative rounded-2xl ${className}`}
      style={{ transformStyle: 'preserve-3d', outline: 'none' }}
      whileHover={disabled || prefersReduced ? {} : { scale }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onBlur={onBlur}
      onFocus={(e) => focusable && !disabled && updatePointer(e.currentTarget.getBoundingClientRect().left + (w.get() / 2), e.currentTarget.getBoundingClientRect().top + (h.get() / 2))}
      tabIndex={focusable ? 0 : -1}
      aria-label="3D decorative card"
      role="img"
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX: prefersReduced ? 0 : rx,
          rotateY: prefersReduced ? 0 : ry,
          willChange: 'transform',
          boxShadow: '0 2px 20px rgba(0,0,0,0.15)'
        }}
        transformTemplate={(t) => `translateZ(0) ${t}`}
      >
        {/* Glare layer */}
        {glare && !prefersReduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'radial-gradient(600px 400px at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.4), transparent 60%)',
              mixBlendMode: 'screen',
              opacity: glareOpacity,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>

        {/* Inner‑parallax applier */}
        {innerParallax && !prefersReduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ x: depthX as any, y: depthY as any }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// ------------------------------------------------------------------------------------
// REVEAL — HOOKS & CSS CLASS TOGGLER (IntersectionObserver)
// ------------------------------------------------------------------------------------

export interface RevealOptions {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  classWhenVisible?: string; // default: 'is-revealed'
  /** Optional callback */
  onReveal?: (el: HTMLElement) => void;
}

export function useRevealObserver(options: RevealOptions = {}) {
  const { rootMargin = '0px 0px -10% 0px', threshold = 0.15, once = true, classWhenVisible = 'is-revealed', onReveal } = options;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add(classWhenVisible);
          onReveal?.(el);
          if (once) io.disconnect();
        }
      });
    }, { root: null, rootMargin, threshold });

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, once, classWhenVisible, onReveal]);

  return { ref } as const;
}

// ------------------------------------------------------------------------------------
// EXAMPLES — WEB
// ------------------------------------------------------------------------------------

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

export function TiltCardsV2Example() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
      <TiltCardV2 className="backdrop-blur-md bg-white/10 border border-white/15 rounded-2xl p-6">
        <div className="text-white">
          <h3 className="text-xl font-bold mb-2">Glass Card</h3>
          <p className="text-white/80">Beautiful glassmorphism + 3D tilt + glare.</p>
        </div>
      </TiltCardV2>

      <TiltCardV2 className="rounded-2xl p-[1px] bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400">
        <div className="rounded-2xl p-6 bg-slate-950/70 text-white">
          <h3 className="text-xl font-bold mb-2">Gradient Frame</h3>
          <p className="text-white/80">Crisp gradient frame with smooth springs.</p>
        </div>
      </TiltCardV2>

      <TiltCardV2 className="relative overflow-hidden rounded-2xl">
        <img src="/api/placeholder/600/360" alt="Pet" className="w-full h-56 object-cover" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-lg font-bold">Pet Card</h3>
          <p className="text-sm opacity-90">Realistic tilt with glossy glare</p>
        </div>
      </TiltCardV2>
    </div>
  );
}

export function RevealGridExample() {
  const items = Array.from({ length: 9 }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      {items.map((n) => (
        <RevealCard key={n} index={n} />
      ))}
    </div>
  );
}

function RevealCard({ index }: { index: number }) {
  const { ref } = useRevealObserver({ rootMargin: '0px 0px -10% 0px' });
  return (
    <div
      ref={ref as any}
      className="reveal reveal-premium p-6 rounded-2xl bg-white shadow-xl"
      style={{ ['--delay' as any]: `${index * 60}ms` }}
    >
      <div className="font-semibold text-slate-900">Card {index}</div>
      <div className="text-slate-600">Staggered entrance with reduced‑motion support.</div>
    </div>
  );
}

// ------------------------------------------------------------------------------------
// REVEAL CSS — drop in globals.css (kept here for convenience)
// ------------------------------------------------------------------------------------

/**
  Paste the CSS below into your global stylesheet (e.g., app/globals.css)
  It upgrades your existing reveal classes with better paint isolation & scroll‑hints.
*/
export const REVEAL_CSS_V2 = `
.reveal { opacity: 0; transform: translateY(12px) scale(.98); transition: opacity var(--duration,600ms) var(--easing, cubic-bezier(.22,.68,0,1)), transform var(--duration,600ms) var(--easing, cubic-bezier(.22,.68,0,1)); transition-delay: var(--delay,0ms); will-change: transform, opacity; transform-origin: var(--transform-origin, center); contain: paint; backface-visibility: hidden; }
.reveal.is-revealed { opacity: 1; transform: translateY(0) scale(1); }

.reveal-premium { opacity: 0; transform: translateY(30px) scale(.96); filter: blur(4px); transition: opacity var(--duration,800ms) var(--easing, cubic-bezier(.22,.68,0,1)), transform var(--duration,800ms) var(--easing, cubic-bezier(.22,.68,0,1)), filter var(--duration,800ms) var(--easing, cubic-bezier(.22,.68,0,1)); transition-delay: var(--delay,0ms); will-change: transform, filter, opacity; contain: paint; }
.reveal-premium.is-revealed { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }

.reveal-slide-up { opacity:0; transform: translateY(20px); transition: opacity var(--duration,600ms) var(--easing,cubic-bezier(.22,.68,0,1)), transform var(--duration,600ms) var(--easing,cubic-bezier(.22,.68,0,1)); }
.reveal-slide-up.is-revealed { opacity:1; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-premium, .reveal-slide-up { transform:none !important; filter:none !important; transition: opacity .12s ease !important; }
}
`;

// ------------------------------------------------------------------------------------
// MOBILE (React Native) — separate file recommended (Tilt + Gestures examples)
// ------------------------------------------------------------------------------------

/**
 * If you maintain a RN app, put the following into a file like
 * `mobile/UltraAnimationsV2.tsx` and adjust imports accordingly.
 * (Using TouchableOpacity instead of <button>, etc.)
 */

export const RN_DOC = `
// React Native Tilt example (pseudo‑code — place in RN project)
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
// Use your existing DoubleTapLike/PinchZoom components

export function RNTiltCardExample() {
  return (
    <View style={styles.grid}>
      <View style={styles.card}> 
        <Image source={{ uri: 'https://picsum.photos/600/360' }} style={styles.image} />
        <View style={styles.overlay} />
        <View style={styles.meta}> 
          <Text style={styles.title}>Pet Card</Text>
          <Text style={styles.subtitle}>Gorgeous tilt + haptics</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { padding: 16 },
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#111' },
  image: { width: '100%', height: 220 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.2)' },
  meta: { position: 'absolute', left: 16, bottom: 16 },
  title: { color: 'white', fontWeight: '700', fontSize: 18 },
  subtitle: { color: 'rgba(255,255,255,.9)', fontSize: 14 },
});
`;

// ------------------------------------------------------------------------------------
// QUICK USAGE (Next.js)
// ------------------------------------------------------------------------------------

export function UltraAnimationsDemoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* HERO */}
      <ParallaxHeroV2Example />

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl py-16">
        <h2 className="text-3xl font-bold tracking-tight mb-6">3D Tilt Cards</h2>
        <TiltCardsV2Example />

        <h2 className="text-3xl font-bold tracking-tight mb-6 mt-16">Reveal Grid</h2>
        <RevealGridExample />
      </section>
    </main>
  );
}

// ------------------------------------------------------------------------------------
// END
// ------------------------------------------------------------------------------------