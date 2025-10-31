'use client';

/**
 * 🔥 SCROLL REVEALS & STAGGERS — Animation on Scroll
 * Progressive disclosure and staggered animations
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// Scroll Reveal Options
export interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  duration?: number;
}

// Scroll Reveal Hook
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0,
    duration = 0.6,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    threshold,
    rootMargin,
    once: triggerOnce,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: 'easeOut',
        },
      });
    }
  }, [isInView, controls, duration, delay]);

  return { ref, controls, isInView };
}

// Scroll Reveal Component
interface ScrollRevealProps {
  children: React.ReactNode;
  options?: ScrollRevealOptions;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export function ScrollReveal({
  children,
  options = {},
  className = '',
  direction = 'up',
  distance = 50,
}: ScrollRevealProps) {
  const { ref, controls } = useScrollReveal(options);

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      default:
        return { y: distance };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}

// Stagger Container
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  childClassName?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = '',
  childClassName = '',
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          className={childClassName}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.6,
                ease: 'easeOut',
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Stagger Item (for manual control)
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}

export function StaggerItem({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 30,
}: StaggerItemProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      default:
        return { y: distance };
    }
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...getInitialPosition() }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.6,
          delay,
          ease: 'easeOut',
        },
      }}
      viewport={{ once: true, margin: '-50px' }}
    >
      {children}
    </motion.div>
  );
}

// Progressive Reveal (for text or content)
interface ProgressiveRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
}

export function ProgressiveReveal({
  text,
  className = '',
  delay = 0,
  duration = 0.05,
  stagger = 0.02,
}: ProgressiveRevealProps) {
  const words = text.split(' ');

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-1"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration,
                ease: 'easeOut',
              },
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}

// Parallax Reveal (scroll-based parallax)
interface ParallaxRevealProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxReveal({
  children,
  className = '',
  speed = 0.5,
}: ParallaxRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        setOffsetY(scrollY * speed);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        transform: `translateY(${offsetY}px)`,
      }}
    >
      {children}
    </motion.div>
  );
}
