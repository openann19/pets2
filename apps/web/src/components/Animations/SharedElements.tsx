'use client';

/**
 * 🔥 SHARED ELEMENT TRANSITIONS — Hero & Card Animations
 * Seamless transitions between shared elements across routes
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

// Shared Element Context
interface SharedElementData {
  id: string;
  element: HTMLElement | null;
  initialRect: DOMRect | null;
  finalRect: DOMRect | null;
  isAnimating: boolean;
}

interface SharedElementContextType {
  registerElement: (id: string, element: HTMLElement) => void;
  unregisterElement: (id: string) => void;
  getElementData: (id: string) => SharedElementData | undefined;
  triggerTransition: (id: string, fromRect: DOMRect, toRect: DOMRect) => Promise<void>;
}

const SharedElementContext = createContext<SharedElementContextType | null>(null);

// Shared Element Provider
export function SharedElementProvider({ children }: { children: React.ReactNode }) {
  const [elements, setElements] = useState<Map<string, SharedElementData>>(new Map());

  const registerElement = (id: string, element: HTMLElement) => {
    setElements(prev => {
      const newMap = new Map(prev);
      newMap.set(id, {
        id,
        element,
        initialRect: element.getBoundingClientRect(),
        finalRect: null,
        isAnimating: false,
      });
      return newMap;
    });
  };

  const unregisterElement = (id: string) => {
    setElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  };

  const getElementData = (id: string) => elements.get(id);

  const triggerTransition = async (id: string, fromRect: DOMRect, toRect: DOMRect): Promise<void> => {
    return new Promise((resolve) => {
      setElements(prev => {
        const newMap = new Map(prev);
        const element = newMap.get(id);
        if (element) {
          newMap.set(id, {
            ...element,
            initialRect: fromRect,
            finalRect: toRect,
            isAnimating: true,
          });
        }
        return newMap;
      });

      // Resolve after animation completes
      setTimeout(() => {
        setElements(prev => {
          const newMap = new Map(prev);
          const element = newMap.get(id);
          if (element) {
            newMap.set(id, {
              ...element,
              isAnimating: false,
            });
          }
          return newMap;
        });
        resolve();
      }, 600); // Animation duration
    });
  };

  return (
    <SharedElementContext.Provider
      value={{
        registerElement,
        unregisterElement,
        getElementData,
        triggerTransition,
      }}
    >
      {children}
    </SharedElementContext.Provider>
  );
}

// Hook to use shared element context
export function useSharedElement() {
  const context = useContext(SharedElementContext);
  if (!context) {
    throw new Error('useSharedElement must be used within SharedElementProvider');
  }
  return context;
}

// Basic Shared Element Component
interface SharedElementProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SharedElement({ id, children, className, style }: SharedElementProps) {
  const { registerElement, unregisterElement, getElementData } = useSharedElement();
  const ref = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      registerElement(id, element);
    }

    return () => {
      unregisterElement(id);
    };
  }, [id, registerElement, unregisterElement]);

  const elementData = getElementData(id);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      animate={isAnimating ? { scale: 1.05, opacity: 0.8 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Hero Shared Element (for larger images/cards)
interface HeroSharedElementProps {
  id: string;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function HeroSharedElement({
  id,
  src,
  alt,
  title,
  subtitle,
  className = ''
}: HeroSharedElementProps) {
  const { registerElement, unregisterElement } = useSharedElement();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      registerElement(id, element);
    }

    return () => {
      unregisterElement(id);
    };
  }, [id, registerElement, unregisterElement]);

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl shadow-2xl ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-64 object-cover"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      {(title || subtitle) && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {title && (
            <motion.h2
              className="text-white text-2xl font-bold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              className="text-white/90 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Shared Element Grid (for collections)
interface SharedElementGridProps {
  children: React.ReactNode;
  className?: string;
}

export function SharedElementGrid({ children, className = '' }: SharedElementGridProps) {
  return (
    <motion.div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.1,
            ease: 'easeOut'
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
