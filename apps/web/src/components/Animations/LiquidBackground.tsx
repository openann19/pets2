'use client'

/**
 * 🔥 LIQUID BACKGROUND — V2
 * SVG morph + mesh gradient fallback
 * ‑ No ML, no WebGL • Pure CSS + Framer Motion
 */

import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export interface LiquidBackgroundProps {
  className?: string;
  paths?: string[]; // topology compatible SVG paths
  duration?: number; // seconds per morph leg
  opacity?: number;
}

export function LiquidBackground({
  className = '',
  paths = [
    'M44.5,-58.8C57.1,-51.1,66.7,-38.3,71,-24.1C75.3,-10,74.2,5.6,68.2,18.3C62.2,31,51.2,40.8,39.2,49.3C27.2,57.8,13.6,65.1,-1.2,66.8C-16,68.5,-32.1,64.6,-44.1,55.2C-56.1,45.7,-64.1,30.7,-67.3,14.7C-70.5,-1.2,-68.9,-18.2,-61.3,-31C-53.7,-43.8,-40.2,-52.4,-26.2,-59.5C-12.3,-66.5,1.9,-72,16.6,-71.4C31.3,-70.9,46.5,-64.3,44.5,-58.8Z',
    'M39.1,-53.5C51.9,-44.9,64.1,-35.6,68.3,-23.5C72.5,-11.4,68.7,3.5,62.8,17.9C56.8,32.2,48.7,45.9,36.9,55.4C25,65,9.5,70.4,-5.1,74.6C-19.7,78.8,-39.5,81.7,-53.4,74.2C-67.2,66.8,-75.1,48.9,-76.1,32C-77.2,15.2,-71.5,-0.6,-64.2,-12.5C-56.8,-24.4,-47.9,-32.3,-37.9,-42.4C-27.9,-52.5,-16.8,-64.8,-3.6,-63.1C9.6,-61.5,19.2,-45.2,39.1,-53.5Z',
  ],
  duration = 8,
  opacity = 0.35,
}: LiquidBackgroundProps) {
  const idx = useMotionValue(0);

  useEffect(() => {
    let i = 0;
    let raf: number;
    const tick = () => {
      i = (i + 1) % paths.length;
      idx.set(i);
      raf = window.setTimeout(tick, duration * 1000);
    };
    raf = window.setTimeout(tick, duration * 1000);
    return () => { window.clearTimeout(raf); };
  }, [paths.length, duration, idx]);

  const current = useTransform(
    idx,
    paths.map((_, i) => i),
    paths
  );

  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden>
      <svg
        className="w-full h-full"
        viewBox="-100 -100 200 200"
        preserveAspectRatio="xMidYMid slice"
      >
        <motion.path
          d={current as unknown as string}
          fill="url(#lg)"
          initial={false}
          transition={{ duration, ease: 'easeInOut' }}
          style={{ opacity }}
        />
        <defs>
          <radialGradient id="lg" cx="0" cy="0" r="1">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </radialGradient>
        </defs>
      </svg>
      {/* Mesh gradient fallback layer */}
      <div className="pointer-events-none absolute inset-0 opacity-[.35] mesh-gradient" />
    </div>
  );
}

/**
 * CSS for mesh-gradient (add to globals.css)
 */
export const MESH_GRADIENT_CSS = `
.mesh-gradient {
  background: radial-gradient(40% 35% at 20% 30%, #7c3aed55, transparent),
    radial-gradient(35% 40% at 80% 20%, #06b6d455, transparent),
    radial-gradient(40% 35% at 30% 75%, #22d3ee55, transparent),
    radial-gradient(35% 40% at 70% 80%, #0ea5e955, transparent);
  filter: blur(20px);
  animation: mesh-move 12s ease-in-out infinite alternate;
}

@keyframes mesh-move {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    transform: translate3d(0, -2%, 0) scale(1.04);
  }
}
`;
