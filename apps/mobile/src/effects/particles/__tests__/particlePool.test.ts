/**
 * ParticlePool tests
 */

import { makePool, spawn, step } from '../ParticlePool';
import { createParticle } from '../createParticle';

describe('ParticlePool', () => {
  test('spawns without exceeding capacity', () => {
    const pool = makePool(10);
    spawn(pool, 0, 0, 20, createParticle);
    expect(pool.alive).toBe(10);
  });

  test('step reduces alive as ttl passes', () => {
    const pool = makePool(5);
    spawn(pool, 0, 0, 5, createParticle);
    step(pool, 1300); // > ttl
    expect(pool.alive).toBe(0);
  });

  test('motion integration: gravity increases y', () => {
    const pool = makePool(1);
    spawn(pool, 0, 0, 1, createParticle);
    const beforeY = pool.items[0].y;
    step(pool, 16);
    expect(pool.items[0].y).toBeGreaterThan(beforeY);
  });
});

