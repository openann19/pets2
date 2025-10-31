/**
 * 🎯 PARTICLE POOL TESTS
 */

import { makePool, spawn, step, reset } from '../ParticlePool';
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
    step(pool, 1300); // < ttl (2000ms)
    expect(pool.alive).toBeGreaterThan(0);
    
    step(pool, 1000); // Total > ttl
    expect(pool.alive).toBe(0);
  });

  test('reset clears all particles', () => {
    const pool = makePool(5);
    spawn(pool, 0, 0, 5, createParticle);
    expect(pool.alive).toBe(5);
    
    reset(pool);
    expect(pool.alive).toBe(0);
  });

  test('particles update position with physics', () => {
    const pool = makePool(1);
    spawn(pool, 0, 0, 1, createParticle);
    
    const particle = pool.particles[0];
    const initialX = particle.x;
    const initialY = particle.y;
    
    step(pool, 16); // One frame
    
    expect(particle.x).not.toBe(initialX);
    expect(particle.y).not.toBe(initialY);
  });
});

