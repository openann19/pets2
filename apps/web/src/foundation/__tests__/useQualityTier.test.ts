/**
 * 🎯 FOUNDATION: QUALITY TIER TESTS
 * 
 * Tests for quality tier detection
 */

import { renderHook } from '@testing-library/react';
import { useQualityTier } from '../quality/useQualityTier';

describe('useQualityTier', () => {
  let originalNavigator: typeof navigator;
  let originalURLSearchParams: typeof URLSearchParams;

  beforeEach(() => {
    originalNavigator = global.navigator;
    originalURLSearchParams = global.URLSearchParams;
    
    // Mock navigator
    global.navigator = {
      ...originalNavigator,
      deviceMemory: undefined,
      hardwareConcurrency: undefined,
    } as any;
    
    // Mock window.location
    delete (window as any).location;
    window.location = {
      ...window.location,
      search: '',
    } as Location;
  });

  afterEach(() => {
    global.navigator = originalNavigator;
    global.URLSearchParams = originalURLSearchParams;
    jest.clearAllMocks();
  });

  it('should detect high tier for high-end devices', () => {
    global.navigator = {
      deviceMemory: 8,
      hardwareConcurrency: 8,
    } as any;

    const { result } = renderHook(() => useQualityTier());
    
    expect(result.current.tier).toBe('high');
    expect(result.current.particleMultiplier).toBe(1.0);
    expect(result.current.animationScale).toBe(1.0);
    expect(result.current.dprCap).toBe(2);
  });

  it('should detect mid tier for mid-range devices', () => {
    global.navigator = {
      deviceMemory: 4,
      hardwareConcurrency: 4,
    } as any;

    const { result } = renderHook(() => useQualityTier());
    
    expect(result.current.tier).toBe('mid');
    expect(result.current.particleMultiplier).toBe(0.75);
    expect(result.current.animationScale).toBe(0.85);
    expect(result.current.dprCap).toBe(2);
  });

  it('should detect low tier for low-end devices', () => {
    global.navigator = {
      deviceMemory: 2,
      hardwareConcurrency: 2,
    } as any;

    const { result } = renderHook(() => useQualityTier());
    
    expect(result.current.tier).toBe('low');
    expect(result.current.particleMultiplier).toBe(0.5);
    expect(result.current.animationScale).toBe(0.7);
    expect(result.current.dprCap).toBe(1.5);
  });

  it('should respect forced quality via query parameter', () => {
    window.location = {
      ...window.location,
      search: '?quality=high',
    } as Location;

    const { result } = renderHook(() => useQualityTier());
    
    expect(result.current.tier).toBe('high');
    expect(result.current.particleMultiplier).toBe(1.0);
  });

  it('should handle missing deviceMemory and hardwareConcurrency', () => {
    global.navigator = {} as any;

    const { result } = renderHook(() => useQualityTier());
    
    // Should default to low tier
    expect(result.current.tier).toBe('low');
  });
});

