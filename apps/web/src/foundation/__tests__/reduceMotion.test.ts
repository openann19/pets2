/**
 * 🎯 FOUNDATION: REDUCE MOTION TESTS
 * 
 * Tests for web-compatible reduced motion detection
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useReducedMotion, rm } from '../reduceMotion';

describe('useReducedMotion', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      } as MediaQueryList;
    });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    jest.clearAllMocks();
  });

  it('should return false by default when reduced motion is not enabled', async () => {
    const { result } = renderHook(() => useReducedMotion());
    
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return true when prefers-reduced-motion is enabled', async () => {
    window.matchMedia = jest.fn().mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return {
          matches: true,
          media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        } as MediaQueryList;
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      } as MediaQueryList;
    });

    const { result } = renderHook(() => useReducedMotion());
    
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should handle media query changes', async () => {
    let matches = false;
    let onChangeCallback: ((e: MediaQueryListEvent) => void) | null = null;

    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        get matches() {
          return matches;
        },
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((event: string, callback: (e: MediaQueryListEvent) => void) => {
          onChangeCallback = callback;
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      } as MediaQueryList;
    });

    const { result, rerender } = renderHook(() => useReducedMotion());

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    matches = true;
    if (onChangeCallback) {
      onChangeCallback({ matches: true } as MediaQueryListEvent);
    }

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });
});

describe('rm helper', () => {
  it('should return fallback when reduced is true', () => {
    expect(rm(240, 120, true)).toBe(120);
    expect(rm('normal', 'minimal', true)).toBe('minimal');
    expect(rm(100, 50, true)).toBe(50);
  });

  it('should return normal when reduced is false', () => {
    expect(rm(240, 120, false)).toBe(240);
    expect(rm('normal', 'minimal', false)).toBe('normal');
    expect(rm(100, 50, false)).toBe(100);
  });
});

