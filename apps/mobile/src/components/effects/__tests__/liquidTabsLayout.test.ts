/**
 * 🎯 LIQUID TABS LAYOUT TESTS
 */

import { describe, it, expect } from '@jest/globals';
import { calcLeft } from '../LiquidTabs';

describe('LiquidTabs layout', () => {
  it('computes left % correctly', () => {
    expect(calcLeft(2, 5)).toBe(40);
  });

  it('clamps to 0..100', () => {
    const pct = calcLeft(7, 5);
    expect(pct).toBe(100);
  });

  it('handles zero index', () => {
    expect(calcLeft(0, 5)).toBe(0);
  });

  it('handles last index', () => {
    expect(calcLeft(4, 5)).toBe(80);
  });
});

