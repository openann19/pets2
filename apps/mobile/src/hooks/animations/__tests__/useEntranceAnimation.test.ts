/**
 * Tests for useEntranceAnimation hook
 *
 * Covers:
 * - Different entrance animation types (fadeIn, slideIn, scaleIn, bounceIn)
 * - Delay handling
 * - Animation style generation
 * - Start/restart functionality
 */

import { renderHook } from '@testing-library/react-native';
import { useEntranceAnimation } from '../useEntranceAnimation';

describe('useEntranceAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with fadeIn type', () => {
    const { result } = renderHook(() => useEntranceAnimation('fadeIn'));
    expect(result.current.entranceStyle).toBeDefined();
    expect(result.current.start).toBeDefined();
  });

  it('should initialize with slideIn type', () => {
    const { result } = renderHook(() => useEntranceAnimation('slideIn'));
    expect(result.current.entranceStyle).toBeDefined();
  });

  it('should initialize with scaleIn type', () => {
    const { result } = renderHook(() => useEntranceAnimation('scaleIn'));
    expect(result.current.entranceStyle).toBeDefined();
  });

  it('should initialize with bounceIn type', () => {
    const { result } = renderHook(() => useEntranceAnimation('bounceIn'));
    expect(result.current.entranceStyle).toBeDefined();
  });

  it('should handle delay parameter', () => {
    const { result } = renderHook(() => useEntranceAnimation('fadeIn', 300));
    expect(result.current.entranceStyle).toBeDefined();
  });

  it('should provide start function', () => {
    const { result } = renderHook(() => useEntranceAnimation('fadeIn'));
    expect(typeof result.current.start).toBe('function');
    result.current.start();
  });

  it('should provide both entranceStyle and animatedStyle', () => {
    const { result } = renderHook(() => useEntranceAnimation('fadeIn'));
    expect(result.current.entranceStyle).toBe(result.current.animatedStyle);
  });
});
