/**
 * Particle system types
 */

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  ttl: number;
  size: number;
  hue: number;
  alpha: number;
};

export type Pool = { items: Particle[]; alive: number };

