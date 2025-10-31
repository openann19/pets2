/**
 * VSync rate classification tests
 */

import { classifyRefreshRate } from '@/foundation/useVsyncRate';

describe('classifyRefreshRate', () => {
  test('classifies ~60Hz', () => {
    const arr = Array(120).fill(16.7);
    expect(classifyRefreshRate(arr)).toBe(60);
  });

  test('classifies ~90Hz', () => {
    const arr = Array(180).fill(11.1);
    expect(classifyRefreshRate(arr)).toBe(90);
  });

  test('classifies ~120Hz', () => {
    const arr = Array(240).fill(8.3);
    expect(classifyRefreshRate(arr)).toBe(120);
  });

  test('handles empty array', () => {
    expect(classifyRefreshRate([])).toBe(60);
  });

  test('handles mixed intervals (should use median)', () => {
    const arr = [16.7, 16.6, 16.8, 11.1, 8.3, 16.9, 16.5]; // median ~16.7
    expect(classifyRefreshRate(arr)).toBe(60);
  });

  test('boundary test: exactly 9.7ms (should be 120Hz)', () => {
    const arr = Array(100).fill(9.7);
    expect(classifyRefreshRate(arr)).toBe(120);
  });

  test('boundary test: exactly 13.9ms (should be 90Hz)', () => {
    const arr = Array(100).fill(13.9);
    expect(classifyRefreshRate(arr)).toBe(90);
  });

  test('boundary test: just above 13.9ms (should be 60Hz)', () => {
    const arr = Array(100).fill(14.0);
    expect(classifyRefreshRate(arr)).toBe(60);
  });
});

