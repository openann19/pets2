'use client'

/**
 * 🔥 ANIMATION UTILITIES — V2
 * Easings, spring presets, haptics, confetti
 */

import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ------------------------------------------------------------------------------------
// EASINGS & SPRING PRESETS
// ------------------------------------------------------------------------------------

export const EASING = {
  bounce: [0.34, 1.56, 0.64, 1],
  elastic: [0.2, 0.8, 0.2, 1],
  smooth: [0.25, 0.46, 0.45, 0.94],
  premium: [0.22, 0.68, 0, 1],
} as const;

export function springPreset(which: 'snappy' | 'buttery' | 'floaty' = 'buttery') {
  switch (which) {
    case 'snappy':
      return { stiffness: 420, damping: 24, mass: 0.6 } as const;
    case 'floaty':
      return { stiffness: 160, damping: 18, mass: 0.9 } as const;
    default:
      return { stiffness: 260, damping: 22, mass: 0.75 } as const;
  }
}

// ------------------------------------------------------------------------------------
// HAPTICS (Web Vibration API)
// ------------------------------------------------------------------------------------

export function useHaptics() {
  const supported = typeof window !== 'undefined' && 'vibrate' in navigator;
  
  return {
    tap: () => supported && navigator.vibrate?.(10),
    success: () => supported && navigator.vibrate?.([12, 20, 12]),
    error: () => supported && navigator.vibrate?.([40, 40, 20]),
  };
}

// ------------------------------------------------------------------------------------
// COMMAND PALETTE FRAME
// ------------------------------------------------------------------------------------

export interface CommandPaletteFrameProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function CommandPaletteFrame({
  open,
  onClose,
  children,
}: CommandPaletteFrameProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9998]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="relative mx-auto mt-20 max-w-2xl rounded-2xl bg-white shadow-2xl"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ------------------------------------------------------------------------------------
// CONFETTI BURST (CPU-friendly CSS particles)
// ------------------------------------------------------------------------------------

export interface ConfettiBurstProps {
  count?: number;
}

export function ConfettiBurst({ count = 80 }: ConfettiBurstProps) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {items.map((i) => (
        <span
          key={i}
          className="confetti"
          style={{ ['--i' as string]: i }}
        />
      ))}
    </div>
  );
}

export const CONFETTI_CSS = `
.confetti {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 12px;
  background: hsl(calc(var(--i) * 7), 85%, 60%);
  transform: translate(-50%, -50%);
  border-radius: 2px;
  animation: confetti 900ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes confetti {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + (var(--i) * 0.6px)), calc(-50% + 200px)) rotate(720deg);
    opacity: 0;
  }
}
`;
