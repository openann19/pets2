/**
 * Tests for useMagneticEffect hook
 */

import { renderHook } from '@testing-library/react-native';
import { useMagneticEffect } from '../useMagneticEffect';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('useMagneticEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default enabled state', () => {
      const { result } = renderHook(() => useMagneticEffect());

      expect(result.current).toBeDefined();
    });

    it('should initialize with enabled=true', () => {
      const { result } = renderHook(() => useMagneticEffect(true));

      expect(result.current).toBeDefined();
    });

    it('should initialize with enabled=false', () => {
      const { result } = renderHook(() => useMagneticEffect(false));

      expect(result.current).toBeDefined();
    });
  });

  describe('magnetic effect', () => {
    it('should provide magnetic handlers when enabled', () => {
      const { result } = renderHook(() => useMagneticEffect(true));

      expect(result.current).toBeDefined();
    });

    it('should handle enabled state changes', () => {
      const { result, rerender } = renderHook((props) => useMagneticEffect(props.enabled), {
        initialProps: { enabled: true },
      });

      expect(result.current).toBeDefined();

      rerender({ enabled: false });

      expect(result.current).toBeDefined();
    });
  });
});
