/**
 * Particle pool management - O(n_alive) per frame, no GC churn
 */

import type { Particle, Pool } from './particleTypes';

const G = 980; // px/s^2

function empty(): Particle {
  return { x: 0, y: 0, vx: 0, vy: 0, life: 0, ttl: 0, size: 0, hue: 0, alpha: 0 };
}

export function makePool(capacity: number): Pool {
  return { items: Array.from({ length: capacity }, empty), alive: 0 };
}

export function spawn(pool: Pool, x: number, y: number, n: number, make: (x: number, y: number) => Particle): void {
  const count = Math.min(n, pool.items.length - pool.alive);
  for (let i = 0; i < count; i++) pool.items[pool.alive + i] = make(x, y);
  pool.alive += count;
}

export function step(pool: Pool, dtMs: number): void {
  const t = dtMs / 1000;
  let w = 0;
  for (let i = 0; i < pool.alive; i++) {
    const p = pool.items[i];
    p.life += dtMs;
    if (p.life > p.ttl) continue;
    p.vy += G * 0.4 * t;
    p.x += p.vx * t;
    p.y += p.vy * t;
    p.alpha = Math.max(0, 1 - p.life / p.ttl);
    pool.items[w++] = p;
  }
  pool.alive = w;
}

