'use client';

/**
 * 🔥 ULTRA PAGE TRANSITIONS — Complete System
 * Global page transitions + shared elements + micro flourishes
 */

import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

// Page Transition Presets
export const PAGE_TRANSITIONS = {
  // Instant (for fast navigation)
  instant: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
    transition: { duration: 0 },
  },

  // Fade (default, smooth)
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },

  // Slide from right (forward navigation)
  slideRight: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
    transition: { duration: 0.4, ease: 'easeInOut' },
  },

  // Slide from left (back navigation)
  slideLeft: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 },
    transition: { duration: 0.4, ease: 'easeInOut' },
  },

  // Scale (modal-like)
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Slide up (bottom navigation)
  slideUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
    transition: { duration: 0.4, ease: 'easeInOut' },
  },

  // Rotate in
  rotate: {
    initial: { rotate: -10, opacity: 0, scale: 0.95 },
    animate: { rotate: 0, opacity: 1, scale: 1 },
    exit: { rotate: 10, opacity: 0, scale: 0.95 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // Elastic bounce
  bounce: {
    initial: { scale: 0.3, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
        opacity: { duration: 0.3 }
      }
    },
    exit: { scale: 0.3, opacity: 0 },
  },
} as const;

export type PageTransitionPreset = keyof typeof PAGE_TRANSITIONS;

// Route-based transition mapping
const ROUTE_TRANSITIONS: Record<string, PageTransitionPreset> = {
  // Marketing pages - smooth fade
  '/': 'fade',
  '/about': 'fade',
  '/pricing': 'fade',
  '/contact': 'fade',

  // Auth pages - slide transitions
  '/login': 'slideRight',
  '/register': 'slideRight',
  '/forgot-password': 'slideRight',

  // Dashboard - instant (fast navigation)
  '/dashboard': 'instant',
  '/profile': 'slideLeft',
  '/settings': 'slideLeft',

  // Pet pages - bounce effect
  '/pets': 'bounce',
  '/pets/create': 'slideUp',
  '/pets/[id]': 'scale',

  // Chat - slide transitions
  '/chat': 'slideRight',
  '/matches': 'slideRight',

  // Premium - special effects
  '/premium': 'rotate',
  '/premium/success': 'bounce',
};

// Get transition for current route
export function getRouteTransition(pathname: string): PageTransitionPreset {
  // Exact matches first
  if (ROUTE_TRANSITIONS[pathname]) {
    return ROUTE_TRANSITIONS[pathname];
  }

  // Pattern matching for dynamic routes
  for (const [pattern, preset] of Object.entries(ROUTE_TRANSITIONS)) {
    if (pattern.includes('[id]') || pattern.includes('[slug]')) {
      const regex = new RegExp(pattern.replace(/\[.*?\]/g, '[^/]+'));
      if (regex.test(pathname)) {
        return preset;
      }
    }
  }

  // Default fallback
  return 'fade';
}

// Main PageTransition component
interface PageTransitionProps {
  children: React.ReactNode;
  preset?: PageTransitionPreset;
  className?: string;
}

export function PageTransition({
  children,
  preset = 'fade',
  className = '',
}: PageTransitionProps) {
  const variants = PAGE_TRANSITIONS[preset];

  return (
    <motion.div
      key={usePathname()} // Re-animate on route change
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      style={{
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {children}
    </motion.div>
  );
}

// Shared Layout for consistent structure
interface SharedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SharedLayout({ children, className = '' }: SharedLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {children}
    </div>
  );
}

// PageShell component for Next.js App Router
interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageShell({ children, className }: PageShellProps) {
  const pathname = usePathname();
  const preset = getRouteTransition(pathname);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition key={pathname} preset={preset} className={className}>
        <SharedLayout>{children}</SharedLayout>
      </PageTransition>
    </AnimatePresence>
  );
}
