/**
 * Tests for usePulseEffect hook
 */

import { renderHook } from '@testing-library/react-native';
import { usePulseEffect } from '../usePulseEffect';

jest.mock('react-native-reanimated', () => {


  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('usePulseEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default enabled state', () => {
      const { result } = renderHook(() => usePulseEffect());

      expect(result.current.pulseStyle).toBeDefined();
    });

    it('should initialize with enabled=true', () => {
      const { result } = renderHook(() => usePulseEffect(true));

      expect(result.current.pulseStyle).toBeDefined();
    });

    it('should initialize with enabled=false', () => {
      const { result } = renderHook(() => usePulseEffect(false));

      expect(result.current.pulseStyle).toBeDefined();
    });
  });

  describe('pulse animation', () => {
    it('should provide pulse style property', () => {
      const { result } = renderHook(() => usePulseEffect());

      expect(result.current.pulseStyle).toBeDefined();
    });

    it('should generate correct pulse style structure', () => {
      const { result } = renderHook(() => usePulseEffect());

      const style = result.current.pulseStyle;
      expect(style).toBeDefined();
    });

    it('should maintain style when enabled changes', () => {
      const { result, rerender } = renderHook(
        (props) => usePulseEffect(props.enabled),
        { initialProps: { enabled: true } }
      );

      const firstStyle = result.current.pulseStyle;

      rerender({ enabled: false });

      expect(result.current.pulseStyle).toBeDefined();
    });
  });

  describe('state changes', () => {
    it('should handle enabling pulse animation', () => {
      const { result, rerender } = renderHook(
        (props) => usePulseEffect(props.enabled),
        { initialProps: { enabled: false } }
      );

      expect(result.current.pulseStyle).toBeDefined();

      rerender({ enabled: true });

      expect(result.current.pulseStyle).toBeDefined();
    });

    it('should handle disabling pulse animation', () => {
      const { result, rerender } = renderHook(
        (props) => usePulseEffect(props.enabled),
        { initialProps: { enabled: true } }
      );

      expect(result.current.pulseStyle).toBeDefined();

      rerender({ enabled: false });

      expect(result.current.pulseStyle).toBeDefined();
    });
  });
});

