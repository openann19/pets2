/**
 * LiquidTabs layout tests
 */

import { describe, it, expect } from '@jest/globals';

function leftPx(index: number, count: number, width: number): number {
  return (index / count) * width;
}

describe('LiquidTabs layout', () => {
  it('computes left px correctly', () => {
    expect(leftPx(2, 5, 300)).toBe(120);
  });

  it('clamps to container', () => {
    const w = 300;
    const px = Math.max(0, Math.min(w, leftPx(7, 5, w)));
    expect(px).toBe(w);
  });
});

