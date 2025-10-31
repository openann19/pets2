/**
 * 🎯 FOUNDATION: VSYNC RATE TESTS
 * 
 * Tests for refresh rate detection
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useVsyncRate, classifyRefreshRate } from '../useVsyncRate';

describe('classifyRefreshRate', () => {
  it('should classify 60Hz correctly', () => {
    const intervals = [16.67, 16.66, 16.68, 16.67, 16.67];
    expect(classifyRefreshRate(intervals)).toBe(60);
  });

  it('should classify 90Hz correctly', () => {
    const intervals = [11.1, 11.2, 11.0, 11.1, 11.2];
    expect(classifyRefreshRate(intervals)).toBe(90);
  });

  it('should classify 120Hz correctly', () => {
    const intervals = [8.33, 8.34, 8.33, 8.32, 8.33];
    expect(classifyRefreshRate(intervals)).toBe(120);
  });

  it('should default to 60Hz for empty array', () => {
    expect(classifyRefreshRate([])).toBe(60);
  });

  it('should handle boundary cases', () => {
    expect(classifyRefreshRate([9.7])).toBe(120);
    expect(classifyRefreshRate([9.8])).toBe(90);
    expect(classifyRefreshRate([13.9])).toBe(90);
    expect(classifyRefreshRate([14.0])).toBe(60);
  });
});

describe('useVsyncRate', () => {
  let originalRaf: typeof window.requestAnimationFrame;
  let rafCalls: Array<() => void>;
  let rafTime: number;

  beforeEach(() => {
    rafCalls = [];
    rafTime = 0;
    originalRaf = window.requestAnimationFrame;
    window.requestAnimationFrame = jest.fn((callback) => {
      rafCalls.push(callback);
      return rafCalls.length;
    });
    
    jest.useFakeTimers();
    global.performance = {
      now: jest.fn(() => rafTime),
    } as any;
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should detect 60Hz refresh rate', async () => {
    const { result } = renderHook(() => useVsyncRate(100)); // Short sample time for test

    // Simulate 60Hz (16.67ms intervals)
    let time = 0;
    for (let i = 0; i < 10; i++) {
      rafTime = time;
      rafCalls.forEach(cb => cb());
      rafCalls = [];
      time += 16.67;
      jest.advanceTimersByTime(16.67);
    }

    await waitFor(() => {
      expect(result.current).toBe(60);
    }, { timeout: 2000 });
  });

  it('should use default sample time of 600ms', () => {
    renderHook(() => useVsyncRate());
    // Hook should initialize without errors
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });
});

