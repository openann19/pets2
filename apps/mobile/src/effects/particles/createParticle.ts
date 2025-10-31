/**
 * Particle creation utility
 */

import type { Particle } from './particleTypes';

export function createParticle(x: number, y: number, speed = 180): Particle {
  const angle = Math.random() * Math.PI * 2;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  return {
    x,
    y,
    vx,
    vy,
    life: 0,
    ttl: 1200,
    size: 6 + Math.random() * 4,
    hue: 330 + Math.random() * 40,
    alpha: 1,
  };
}

