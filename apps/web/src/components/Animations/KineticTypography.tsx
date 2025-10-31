'use client'

/**
 * Ultra-Premium Kinetic Typography (Refactored)
 * - Fixes hooks-in-conditionals (useTransform)
 * - Preserves spaces for char splitting (Unicode-safe)
 * - Unifies animation variants
 * - Element-scoped pointer gestures (no global listeners)
 * - A11y: aria-label on wrapper, aria-hidden on parts
 * - Optional CSS gradient text (no unused SVG defs)
 */

import React, { useMemo, useRef, useCallback } from 'react';
import { motion, useReducedMotion, useTransform, useMotionValue, type Variant } from 'framer-motion';

// ------------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------------

export interface KineticTextProps {
  children: string;
  variant?:
    | 'fade'
    | 'slide'
    | 'scale'
    | 'rotate'
    | 'morph'
    | 'split'
    | 'reveal'
    | 'glitch'
    | 'wave'
    | 'typewriter';
  stagger?: number;
  splitBy?: 'char' | 'word' | 'line';
  scrollTrigger?: boolean;
  scrollThreshold?: number; // 0..1 used when scrollTrigger=true
  gradient?: { from: string; to: string; stops?: Array<{ offset: number; color: string }>; };
  spring?: { stiffness?: number; damping?: number; mass?: number };
  duration?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  hover?: boolean;
  gesture?: 'none' | 'magnetic' | 'distort' | 'rotate';
}

export interface KineticTextSplitProps {
  text: string;
  splitBy?: 'char' | 'word' | 'line';
  className?: string;
  stagger?: number;
  variant?: KineticTextProps['variant'];
  spring?: KineticTextProps['spring'];
  gradient?: KineticTextProps['gradient'];
}

export interface KineticTextRevealProps {
  children: string;
  trigger?: 'scroll' | 'hover' | 'click' | 'mount';
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  delay?: number;
}

// ------------------------------------------------------------------------------------
// Utilities
// ------------------------------------------------------------------------------------

const EASE = [0.22, 0.68, 0, 1] as const;

const sizeClasses: Record<NonNullable<KineticTextProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
};

const weightClasses: Record<NonNullable<KineticTextProps['weight']>, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

function makeVariants(
  variant: NonNullable<KineticTextProps['variant']>,
  spring: NonNullable<KineticTextProps['spring']>,
  duration: number,
  reduce: boolean
) {
  if (reduce) return { hidden: { opacity: 0 }, visible: { opacity: 1 } } satisfies Record<string, Variant>;

  const base = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration, ease: EASE } },
  } satisfies Record<string, Variant>;

  const variants: Record<string, Record<string, Variant>> = {
    fade: base,
    slide: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', ...spring } },
    },
    rotate: {
      hidden: { opacity: 0, rotate: -180 },
      visible: { opacity: 1, rotate: 0, transition: { type: 'spring', ...spring } },
    },
    morph: {
      hidden: { opacity: 0, scale: 0.85, rotateX: 45 },
      visible: { opacity: 1, scale: 1, rotateX: 0, transition: { type: 'spring', ...spring } },
    },
    wave: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
    },
    glitch: {
      hidden: { opacity: 0 },
      // one-shot micro-jitter; keep readable
      visible: {
        opacity: 1,
        x: [0, -2, 2, -1, 0],
        skewX: [0, 2, -2, 1, 0],
        transition: { duration: Math.max(0.2, duration * 0.4) },
      },
    },
    typewriter: {
      // pair with stagger for stepped reveal
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: Math.max(0.001, duration * 0.3) } },
    },
    reveal: {
      hidden: { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
      visible: { opacity: 1, clipPath: 'inset(0 0% 0 0)', transition: { duration, ease: EASE } },
    },
    split: base,
  };

  return variants[variant] ?? base;
}

function useGestureTransforms(gesture: NonNullable<KineticTextProps['gesture']>) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Create transforms unconditionally (no hook order issues)
  const xMag = useTransform(mouseX, [-1, 1], [-10, 10]);
  const yMag = useTransform(mouseY, [-1, 1], [-10, 10]);
  const sX = useTransform(mouseX, [-1, 1], [0.95, 1.05]);
  const sY = useTransform(mouseY, [-1, 1], [0.95, 1.05]);
  const rotZ = useTransform(mouseX, [-1, 1], [-5, 5]);

  const style = useMemo(() => ({
    x: gesture === 'magnetic' ? xMag : undefined,
    y: gesture === 'magnetic' ? yMag : undefined,
    scaleX: gesture === 'distort' ? sX : undefined,
    scaleY: gesture === 'distort' ? sY : undefined,
    rotateZ: gesture === 'rotate' ? rotZ : undefined,
  }), [gesture, xMag, yMag, sX, sY, rotZ]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (gesture === 'none') return;

      const el = e.currentTarget as HTMLDivElement;
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = ((e.clientY - r.top) / r.height) * 2 - 1;
      mouseX.set(Math.max(-1, Math.min(1, x)));
      mouseY.set(Math.max(-1, Math.min(1, y)));
    },
    [gesture, mouseX, mouseY]
  );

  return { style, onPointerMove } as const;
}

// ------------------------------------------------------------------------------------
// Core Component
// ------------------------------------------------------------------------------------

export function KineticText({
  children,
  variant = 'fade',
  stagger = 0.02,
  splitBy = 'char',
  scrollTrigger = false,
  scrollThreshold = 0.5,
  gradient,
  spring = { stiffness: 300, damping: 30, mass: 1 },
  duration = 0.6,
  className = '',
  size = 'md',
  weight = 'normal',
  hover = false,
  gesture = 'none',
}: KineticTextProps) {
  const reduce = useReducedMotion();
  const variants = useMemo(() => makeVariants(variant, spring, duration, reduce ?? false), [variant, spring, duration, reduce]);
  const { style: gestureStyle, onPointerMove } = useGestureTransforms(gesture);
  const ref = useRef<HTMLDivElement>(null);

  // Split rendering path
  if (splitBy === 'char' || splitBy === 'word' || splitBy === 'line') {
    return (
      <KineticTextSplit
        text={children}
        splitBy={splitBy}
        className={`${sizeClasses[size]} ${weightClasses[weight]} ${className}`}
        stagger={stagger}
        variant={variant}
        spring={spring}
        gradient={gradient}
      />
    );
  }

  const viewportProps = scrollTrigger
    ? {
        whileInView: 'visible' as const,
        viewport: { amount: scrollThreshold, margin: '0px 0px -10% 0px' },
      }
    : { animate: 'visible' as const };

  return (
    <motion.div
      ref={ref}
      className={`${sizeClasses[size]} ${weightClasses[weight]} ${className}`}
      initial="hidden"
      {...viewportProps}
      variants={variants}
      onPointerMove={gesture !== 'none' ? onPointerMove : undefined}
      {...(hover ? { whileHover: { scale: 1.05 } } : {})}
      style={{
        ...(gestureStyle as Record<string, unknown>),
        ...(variant === 'morph' ? { perspective: 800 } : {}),
        ...(variant === 'reveal' ? { willChange: 'clip-path' } : {}),
        background: gradient ? `linear-gradient(90deg, ${gradient.from}, ${gradient.to})` : undefined,
        WebkitBackgroundClip: gradient ? 'text' : undefined,
        backgroundClip: gradient ? 'text' : undefined,
        WebkitTextFillColor: gradient ? 'transparent' : undefined,
      }}
      aria-label={children}
    >
      {children}
    </motion.div>
  );
}

// ------------------------------------------------------------------------------------
// Split Text Component
// ------------------------------------------------------------------------------------

export function KineticTextSplit({
  text,
  splitBy = 'char',
  className = '',
  stagger = 0.02,
  variant = 'fade',
  spring = { stiffness: 300, damping: 30, mass: 1 },
  gradient,
}: KineticTextSplitProps) {
  const reduce = useReducedMotion();
  const variants = useMemo(() => makeVariants(variant, spring, 0.3, reduce ?? false), [variant, spring, reduce]);

  const parts = useMemo(() => {
    if (splitBy === 'char') return Array.from(text);
    if (splitBy === 'word') return text.split(' ');
    // naive line split: respects explicit newlines
    if (splitBy === 'line') return text.split('\n');
    return [text];
  }, [text, splitBy]);

  return (
    <div className={`inline-block ${className}`} aria-label={text} style={variant === 'morph' ? { perspective: 800 } : undefined}>
      {parts.map((part, i) => (
        <motion.span
          key={`${part}-${i}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ amount: 0.2 }}
          variants={variants}
          transition={{ delay: i * stagger }}
          aria-hidden
          className="inline-block"
          style={{
            background: gradient ? `linear-gradient(90deg, ${gradient.from}, ${gradient.to})` : undefined,
            WebkitBackgroundClip: gradient ? 'text' : undefined,
            backgroundClip: gradient ? 'text' : undefined,
            WebkitTextFillColor: gradient ? 'transparent' : undefined,
          }}
        >
          {splitBy === 'char'
            ? part === ' ' 
              ? '\u00A0' 
              : part
            : part}
          {splitBy === 'word' && i < parts.length - 1 ? ' ' : ''}
          {splitBy === 'line' && i < parts.length - 1 ? '\n' : ''}
        </motion.span>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------------------------
// Scroll Reveal (kept simple, uses viewport instead of manual IO)
// ------------------------------------------------------------------------------------

export function KineticTextReveal({
  children,
  trigger = 'scroll',
  direction = 'up',
  className = '',
  delay = 0,
}: KineticTextRevealProps) {
  const offset = {
    up: { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } },
    down: { hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0 } },
    left: { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } },
    right: { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } },
  } as const;

  const variants = offset[direction] ?? offset.up;

  const baseProps = {
    initial: 'hidden' as const,
    variants,
    transition: { duration: 0.6, delay, ease: EASE },
    className,
    'aria-label': children,
  };

  if (trigger === 'mount') {
    return (
      <motion.div {...baseProps} animate="visible">
        {children}
      </motion.div>
    );
  }

  if (trigger === 'hover') {
    return (
      <motion.div {...baseProps} whileHover="visible">
        {children}
      </motion.div>
    );
  }

  if (trigger === 'click') {
    return (
      <motion.div {...baseProps} whileTap="visible">
        {children}
      </motion.div>
    );
  }

  // default: scroll
  return (
    <motion.div {...baseProps} whileInView="visible" viewport={{ amount: 0.5 }}>
      {children}
    </motion.div>
  );
}


