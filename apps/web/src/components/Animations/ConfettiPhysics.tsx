'use client'

/**
 * 🔥 CONFETTI WITH PHYSICS — P2
 * Advanced confetti with gravity, wind, and rotation
 * ‑ CPU-friendly • Configurable physics • Multiple shapes
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface ConfettiPhysicsProps {
  count?: number;
  duration?: number; // seconds
  gravity?: number; // 0-1
  wind?: number; // -1 to 1
  shapes?: ('circle' | 'square' | 'triangle')[];
  colors?: string[];
}

interface Particle {
  id: number;
  x: number; // start X position (%)
  y: number; // start Y position (%)
  rotation: number; // initial rotation
  rotationSpeed: number; // degrees per second
  velocityX: number; // horizontal velocity
  velocityY: number; // vertical velocity
  shape: 'circle' | 'square' | 'triangle';
  color: string;
  size: number;
}

export function ConfettiPhysics({
  count = 100,
  duration = 3,
  gravity = 0.5,
  wind = 0.1,
  shapes = ['circle', 'square', 'triangle'],
  colors = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899', '#10B981'],
}: ConfettiPhysicsProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20, // center spread
      y: 50,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 720, // -360 to 360 deg/s
      velocityX: (Math.random() - 0.5) * 100 + wind * 50,
      velocityY: -Math.random() * 150 - 100, // upward burst
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 6, // 6-14px
    }));
  }, [count, wind, shapes, colors]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          initial={{
            x: 0,
            y: 0,
            rotate: p.rotation,
            opacity: 1,
          }}
          animate={{
            x: p.velocityX,
            y: p.velocityY + gravity * 500, // gravity effect
            rotate: p.rotation + p.rotationSpeed * duration,
            opacity: 0,
          }}
          transition={{
            duration,
            ease: [0.25, 0.46, 0.45, 0.94], // smooth deceleration
          }}
        >
          {p.shape === 'circle' && (
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: p.color }}
            />
          )}
          {p.shape === 'square' && (
            <div
              className="w-full h-full"
              style={{ backgroundColor: p.color }}
            />
          )}
          {p.shape === 'triangle' && (
            <div
              className="w-0 h-0"
              style={{
                borderLeft: `${p.size / 2}px solid transparent`,
                borderRight: `${p.size / 2}px solid transparent`,
                borderBottom: `${p.size}px solid ${p.color}`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Preset confetti effects
 */
export const CONFETTI_PRESETS = {
  celebration: {
    count: 100,
    duration: 3,
    gravity: 0.5,
    wind: 0.1,
    shapes: ['circle', 'square', 'triangle'] as const,
  },
  explosion: {
    count: 150,
    duration: 2,
    gravity: 0.7,
    wind: 0,
    shapes: ['circle', 'square'] as const,
  },
  gentle: {
    count: 50,
    duration: 4,
    gravity: 0.3,
    wind: 0.2,
    shapes: ['circle'] as const,
  },
} as const;
