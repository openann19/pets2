/**
 * 🎨 Scroll Reveal Component (Web)
 * Consumes visualEnhancements2025 config for scroll-triggered reveals
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useVisualEnhancements } from '@/hooks/useVisualEnhancements';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  offset?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  direction: customDirection,
  offset: customOffset,
  className = '',
}: ScrollRevealProps) {
  const { canUseTypography, typographyConfig } = useVisualEnhancements();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const direction = customDirection ?? typographyConfig?.scrollReveal?.direction ?? 'up';
  const offset = customOffset ?? typographyConfig?.scrollReveal?.offset ?? 100;

  if (!canUseTypography || !typographyConfig?.scrollReveal?.enabled) {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    up: { initial: { y: offset, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    down: { initial: { y: -offset, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    left: { initial: { x: offset, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    right: { initial: { x: -offset, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  }[direction];

  return (
    <motion.div
      ref={ref}
      initial={variants.initial}
      animate={isInView ? variants.animate : variants.initial}
      transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

