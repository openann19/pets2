import { clamp } from '../math';

describe('clamp', () => {
  it('clamps within range', () => {
    expect(clamp(10, 0, 100)).toBe(10);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
  });
});
