'use client'

/**
 * 🔥 SHARED ELEMENT TRANSITIONS — V2
 * Route-level shared element transitions for Next.js App Router
 * ‑ Uses Framer Motion layoutId across pages via overlay portal
 */

import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SharedOverlayContextValue {
  mount?: (n: React.ReactNode) => void;
  clear?: () => void;
}

const SharedOverlayCtx = createContext<SharedOverlayContextValue>({});

export function SharedOverlayProvider({ children }: { children: React.ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [node, setNode] = useState<React.ReactNode>(null);
  
  const mount = useCallback((n: React.ReactNode) => { setNode(n); }, []);
  const clear = useCallback(() => { setNode(null); }, []);
  
  return (
    <SharedOverlayCtx.Provider value={{ mount, clear }}>
      {children}
      <div
        ref={hostRef}
        className="pointer-events-none fixed inset-0 z-[9999]"
        aria-hidden
      >
        <AnimatePresence>{node}</AnimatePresence>
      </div>
    </SharedOverlayCtx.Provider>
  );
}

export function useSharedOverlay() {
  return useContext(SharedOverlayCtx);
}

export interface SharedImageProps {
  id: string;
  src: string;
  alt: string;
  className?: string;
}

export function SharedImage({ id, src, alt, className = '' }: SharedImageProps) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      layoutId={id}
    />
  );
}

/**
 * Example: Card thumbnail that animates to detail view
 */
export interface CardThumbnailProps {
  id: string;
  src: string;
  alt: string;
  onClick?: () => void;
}

export function CardThumbnail({ id, src, alt, onClick }: CardThumbnailProps) {
  const { mount } = useSharedOverlay();
  
  return (
    <button
      className="block"
      onClick={() => {
        // Mount overlay with same layoutId to animate across route navigation
        mount?.(
          <motion.div
            className="fixed inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.img
              src={src}
              alt={alt}
              className="absolute inset-0 m-auto max-w-[80vw] max-h-[80vh] rounded-xl"
              layoutId={id}
            />
          </motion.div>
        );
        onClick?.();
      }}
    >
      <SharedImage
        id={id}
        src={src}
        alt={alt}
        className="w-40 h-40 object-cover rounded-xl"
      />
    </button>
  );
}
