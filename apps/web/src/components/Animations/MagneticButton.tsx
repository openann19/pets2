'use client'

/**
 * 🔥 MAGNETIC BUTTON — V2
 * Cursor magnetism with spring physics
 * ‑ Buttons/CTAs snap toward cursor with springs
 */

import React, { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export interface UseCursorMagnetOptions {
  strength?: number; // 0-100, how much to pull
  radius?: number; // px, activation radius
}

export function useCursorMagnet(strength = 30, radius = 140) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const tx = useSpring(x, { stiffness: 260, damping: 24 });
  const ty = useSpring(y, { stiffness: 260, damping: 24 });

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy);
      if (d < radius) {
        x.set((dx / d) * (radius - d) * (strength / 100));
        y.set((dy / d) * (radius - d) * (strength / 100));
      } else {
        x.set(0);
        y.set(0);
      }
    },
    [radius, strength, x, y]
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    ref,
    style: { x: tx, y: ty },
    onMouseMove,
    onMouseLeave: onLeave,
  } as const;
}

export interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}

export function MagneticButton({
  children,
  className = '',
  strength = 40,
  radius = 120,
  ...rest
}: MagneticButtonProps) {
  const mag = useCursorMagnet(strength, radius);
  
  return (
    <motion.button
      {...rest}
      ref={mag.ref as React.RefObject<HTMLButtonElement>}
      onMouseMove={mag.onMouseMove}
      onMouseLeave={mag.onMouseLeave}
      className={`relative inline-flex items-center justify-center rounded-2xl px-6 py-3 font-semibold ${className}`}
      style={{ x: mag.style.x, y: mag.style.y }}
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      {children}
    </motion.button>
  );
}
