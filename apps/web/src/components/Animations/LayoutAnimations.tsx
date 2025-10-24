'use client'

/**
 * 🔥 LAYOUT ANIMATIONS — P2
 * Reusable layout animation patterns
 * ‑ Stagger children • Fade in • Slide in • Scale in
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';

// ------------------------------------------------------------------------------------
// ANIMATION VARIANTS
// ------------------------------------------------------------------------------------

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

// ------------------------------------------------------------------------------------
// COMPONENTS
// ------------------------------------------------------------------------------------

export interface AnimatedContainerProps {
  children: React.ReactNode;
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn';
  stagger?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}

const variantMap = {
  fadeIn: fadeInVariants,
  slideUp: slideUpVariants,
  slideDown: slideDownVariants,
  slideLeft: slideLeftVariants,
  slideRight: slideRightVariants,
  scaleIn: scaleInVariants,
};

export function AnimatedContainer({
  children,
  variant = 'fadeIn',
  stagger = false,
  delay = 0,
  duration = 0.6,
  className = '',
}: AnimatedContainerProps) {
  const variants = stagger ? staggerContainerVariants : variantMap[variant];

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={variants}
      transition={{ duration, delay, ease: [0.22, 0.68, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}

export interface AnimatedItemProps {
  children: React.ReactNode;
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn';
  className?: string;
}

export function AnimatedItem({ children, variant = 'slideUp', className = '' }: AnimatedItemProps) {
  return (
    <motion.div className={className} variants={variantMap[variant]}>
      {children}
    </motion.div>
  );
}

// ------------------------------------------------------------------------------------
// GRID ANIMATIONS
// ------------------------------------------------------------------------------------

export interface AnimatedGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: number;
  staggerDelay?: number;
  className?: string;
}

export function AnimatedGrid({
  children,
  columns = 3,
  gap = 6,
  staggerDelay = 0.1,
  className = '',
}: AnimatedGridProps) {
  return (
    <motion.div
      className={`grid gap-${gap} ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ------------------------------------------------------------------------------------
// LIST ANIMATIONS
// ------------------------------------------------------------------------------------

export interface AnimatedListProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function AnimatedList({ children, staggerDelay = 0.08, className = '' }: AnimatedListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ------------------------------------------------------------------------------------
// EXAMPLES
// ------------------------------------------------------------------------------------

export function LayoutAnimationsExample() {
  return (
    <div className="space-y-16 p-8">
      {/* Stagger Container */}
      <AnimatedContainer stagger>
        <h2 className="text-3xl font-bold mb-4">Staggered Children</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <AnimatedItem key={n}>
              <div className="p-6 bg-white rounded-xl shadow-lg">Card {n}</div>
            </AnimatedItem>
          ))}
        </div>
      </AnimatedContainer>

      {/* Slide Up */}
      <AnimatedContainer variant="slideUp">
        <h2 className="text-3xl font-bold">Slide Up Animation</h2>
        <p className="text-gray-600">This entire section slides up on scroll</p>
      </AnimatedContainer>

      {/* Animated Grid */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Animated Grid</h2>
        <AnimatedGrid columns={4} gap={4}>
          {Array.from({ length: 8 }, (_, i) => (
            <AnimatedItem key={i}>
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl" />
            </AnimatedItem>
          ))}
        </AnimatedGrid>
      </div>

      {/* Animated List */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Animated List</h2>
        <AnimatedList>
          {['First item', 'Second item', 'Third item', 'Fourth item'].map((text, i) => (
            <AnimatedItem key={i} variant="slideLeft">
              <div className="p-4 bg-white rounded-lg shadow mb-2">{text}</div>
            </AnimatedItem>
          ))}
        </AnimatedList>
      </div>
    </div>
  );
}
