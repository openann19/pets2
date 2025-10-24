'use client'

/**
 * 🔥 ULTRA‑PREMIUM REVEAL SYSTEM — V2
 * IntersectionObserver-based scroll reveals with CSS class toggling
 * ‑ Lightweight • SSR‑safe • Accessibility‑first • Reduced‑motion compliant
 */

import React, { useEffect, useRef } from 'react';

export interface RevealOptions {
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  classWhenVisible?: string; // default: 'is-revealed'
  /** Optional callback */
  onReveal?: (el: HTMLElement) => void;
}

/**
 * Hook for reveal animations using IntersectionObserver
 * Adds a CSS class when element enters viewport
 */
export function useRevealObserver(options: RevealOptions = {}) {
  const { rootMargin = '0px 0px -10% 0px', threshold = 0.15, once = true, classWhenVisible = 'is-revealed', onReveal } = options;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add(classWhenVisible);
          onReveal?.(el);
          if (once) io.disconnect();
        }
      });
    }, { root: null, rootMargin, threshold });

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, once, classWhenVisible, onReveal]);

  return { ref } as const;
}

/**
 * Example reveal grid component
 */
export function RevealGridExample() {
  const items = Array.from({ length: 9 }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      {items.map((n) => (
        <RevealCard key={n} index={n} />
      ))}
    </div>
  );
}

function RevealCard({ index }: { index: number }) {
  const { ref } = useRevealObserver({ rootMargin: '0px 0px -10% 0px' });
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="reveal reveal-premium p-6 rounded-2xl bg-white shadow-xl"
      style={{ ['--delay' as string]: `${index * 60}ms` }}
    >
      <div className="font-semibold text-slate-900">Card {index}</div>
      <div className="text-slate-600">Staggered entrance with reduced‑motion support.</div>
    </div>
  );
}

/**
 * CSS string to paste into globals.css
 * Exported as constant for documentation
 */
export const REVEAL_CSS_V2 = `
.reveal { opacity: 0; transform: translateY(12px) scale(.98); transition: opacity var(--duration,600ms) var(--easing, cubic-bezier(.22,.68,0,1)), transform var(--duration,600ms) var(--easing, cubic-bezier(.22,.68,0,1)); transition-delay: var(--delay,0ms); will-change: transform, opacity; transform-origin: var(--transform-origin, center); contain: paint; backface-visibility: hidden; }
.reveal.is-revealed { opacity: 1; transform: translateY(0) scale(1); }

.reveal-premium { opacity: 0; transform: translateY(30px) scale(.96); filter: blur(4px); transition: opacity var(--duration,800ms) var(--easing, cubic-bezier(.22,.68,0,1)), transform var(--duration,800ms) var(--easing, cubic-bezier(.22,.68,0,1)), filter var(--duration,800ms) var(--easing, cubic-bezier(.22,.68,0,1)); transition-delay: var(--delay,0ms); will-change: transform, filter, opacity; contain: paint; }
.reveal-premium.is-revealed { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }

.reveal-slide-up { opacity:0; transform: translateY(20px); transition: opacity var(--duration,600ms) var(--easing,cubic-bezier(.22,.68,0,1)), transform var(--duration,600ms) var(--easing,cubic-bezier(.22,.68,0,1)); }
.reveal-slide-up.is-revealed { opacity:1; transform: translateY(0); }

@media (prefers-reduced-motion: reduce) {
  .reveal, .reveal-premium, .reveal-slide-up { transform:none !important; filter:none !important; transition: opacity .12s ease !important; }
}
`;
