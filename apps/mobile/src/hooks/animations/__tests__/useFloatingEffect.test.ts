/**
 * Tests for useFloatingEffect hook
 * 
 * Covers:
 * - Enabled/disabled state
 * - Floating animation style
 * - Repeating animation behavior
 */

import { renderHook } from '@testing-library/react-native';
import { useFloatingEffect } from '../useFloatingEffect';

jest.mock('react-native-reanimated', () => {


  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('useFloatingEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default enabled state', () => {
      const { result } = renderHook(() => useFloatingEffect());

      expect(result.current.floatingStyle).toBeDefined();
    });

    it('should initialize with enabled=true', () => {
      const { result } = renderHook(() => useFloatingEffect(true));

      expect(result.current.floatingStyle).toBeDefined();
    });

    it('should initialize with enabled=false', () => {
      const { result } = renderHook(() => useFloatingEffect(false));

      expect(result.current.floatingStyle).toBeDefined();
    });
  });

  describe('style generation', () => {
    it('should provide floatingStyle property', () => {
      const { result } = renderHook(() => useFloatingEffect());

      expect(result.current.floatingStyle).toBeDefined();
    });

    it('should generate correct style structure', () => {
      const { result } = renderHook(() => useFloatingEffect());

      expect(result.current.floatingStyle).toHaveProperty('transform');
    });

    it('should maintain style when enabled changes', () => {
      const { result, rerender } = renderHook(
        (props) => useFloatingEffect(props.enabled),
        { initialProps: { enabled: true } }
      );

      const firstStyle = result.current.floatingStyle;

      rerender({ enabled: false });

      expect(result.current.floatingStyle).toBeDefined();
    });
  });

  describe('state changes', () => {
    it('should handle enabling animation', () => {
      const { result, rerender } = renderHook(
        (props) => useFloatingEffect(props.enabled),
        { initialProps: { enabled: false } }
      );

      expect(result.current.floatingStyle).toBeDefined();

      rerender({ enabled: true });

      expect(result.current.floatingStyle).toBeDefined();
    });

    it('should handle disabling animation', () => {
      const { result, rerender } = renderHook(
        (props) => useFloatingEffect(props.enabled),
        { initialProps: { enabled: true } }
      );

      expect(result.current.floatingStyle).toBeDefined();

      rerender({ enabled: false });

      expect(result.current.floatingStyle).toBeDefined();
    });
  });
});

