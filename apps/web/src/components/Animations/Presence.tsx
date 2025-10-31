'use client';

/**
 * 🔥 PRESENCE ANIMATIONS — Modal & Conditional UI
 * Smooth enter/exit animations for dynamic content
 */

import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// Presence Presets
export const PRESENCE_PRESETS = {
  // Modal overlays
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  // Slide from bottom
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Slide from top
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Slide from left
  slideLeft: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Slide from right
  slideRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Scale in/out
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },

  // Bounce in
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 300,
      },
    },
    exit: { opacity: 0, scale: 0.3 },
  },

  // Rotate in
  rotate: {
    initial: { opacity: 0, rotate: -180, scale: 0.5 },
    animate: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 200,
      },
    },
    exit: { opacity: 0, rotate: 180, scale: 0.5 },
  },

  // Flip
  flip: {
    initial: { opacity: 0, rotateY: -90 },
    animate: {
      opacity: 1,
      rotateY: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    exit: { opacity: 0, rotateY: 90 },
  },

  // Elastic
  elastic: {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 8,
        stiffness: 200,
        mass: 0.8,
      },
    },
    exit: { opacity: 0, scale: 0 },
  },
} as const;

export type PresencePreset = keyof typeof PRESENCE_PRESETS;

// Main Presence Component
interface PresenceProps {
  show: boolean;
  children: React.ReactNode;
  preset?: PresencePreset;
  className?: string;
  style?: React.CSSProperties;
  onAnimationComplete?: () => void;
}

export function Presence({
  show,
  children,
  preset = 'fade',
  className = '',
  style,
  onAnimationComplete,
}: PresenceProps) {
  const variants = PRESENCE_PRESETS[preset];

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {show && (
        <motion.div
          className={className}
          style={style}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hover Card with micro-interactions
interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  scale?: number;
  glow?: boolean;
}

export function HoverCard({
  children,
  className = '',
  scale = 1.02,
  glow = false,
}: HoverCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale,
        boxShadow: glow
          ? '0 20px 40px rgba(0,0,0,0.1)'
          : '0 10px 20px rgba(0,0,0,0.1)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
    >
      {children}
    </motion.div>
  );
}

// Bounce animation for highlights
interface BounceProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function Bounce({
  children,
  delay = 0,
  className = '',
}: BounceProps) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0 }}
      animate={{
        scale: [0, 1.3, 1],
        transition: {
          delay,
          duration: 0.6,
          times: [0, 0.6, 1],
          ease: 'easeOut',
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for status indicators
interface PulseProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Pulse({
  children,
  color = '#3b82f6',
  className = '',
}: PulseProps) {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}40`,
          `0 0 0 10px ${color}00`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Toast notification with presence
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <Presence
      show={visible}
      preset="slideLeft"
      className="fixed top-4 right-4 z-50"
    >
      <motion.div
        className={`px-4 py-2 rounded-lg text-white shadow-lg ${colors[type]}`}
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
      >
        {message}
      </motion.div>
    </Presence>
  );
}

// Drawer/Sidebar with presence
interface DrawerProps {
  isOpen: boolean;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  onClose?: () => void;
}

export function Drawer({
  isOpen,
  children,
  position = 'left',
  onClose,
}: DrawerProps) {
  const getVariants = () => {
    switch (position) {
      case 'left':
        return {
          initial: { x: '-100%' },
          animate: { x: 0 },
          exit: { x: '-100%' },
        };
      case 'right':
        return {
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' },
        };
      case 'top':
        return {
          initial: { y: '-100%' },
          animate: { y: 0 },
          exit: { y: '-100%' },
        };
      case 'bottom':
        return {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
        };
      default:
        return {
          initial: { x: '-100%' },
          animate: { x: 0 },
          exit: { x: '-100%' },
        };
    }
  };

  return (
    <>
      {/* Backdrop */}
      <Presence show={isOpen} preset="fade">
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      </Presence>

      {/* Drawer */}
      <Presence show={isOpen} preset="slideUp">
        <motion.div
          className={`fixed z-50 bg-white shadow-xl ${
            position === 'left' || position === 'right'
              ? 'top-0 bottom-0 w-80'
              : 'left-0 right-0 h-80'
          } ${
            position === 'left' ? 'left-0' :
            position === 'right' ? 'right-0' :
            position === 'top' ? 'top-0' : 'bottom-0'
          }`}
          variants={getVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </Presence>
    </>
  );
}
