/**
 * Tests for useHapticFeedback hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useHapticFeedback } from '../useHapticFeedback';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  notificationAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

describe('useHapticFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return haptic feedback functions', () => {
    const { result } = renderHook(() => useHapticFeedback());

    expect(result.current).toBeDefined();
    expect(typeof result.current.triggerImpact).toBe('function');
    expect(typeof result.current.triggerNotification).toBe('function');
    expect(typeof result.current.triggerSelection).toBe('function');
  });

  it('should trigger light impact', () => {
    const { result } = renderHook(() => useHapticFeedback());

    const { impactAsync } = require('expo-haptics');

    act(() => {
      result.current.triggerImpact('Light');
    });

    expect(impactAsync).toHaveBeenCalledWith('Light');
  });

  it('should trigger medium impact', () => {
    const { result } = renderHook(() => useHapticFeedback());

    const { impactAsync } = require('expo-haptics');

    act(() => {
      result.current.triggerImpact('Medium');
    });

    expect(impactAsync).toHaveBeenCalledWith('Medium');
  });

  it('should trigger heavy impact', () => {
    const { result } = renderHook(() => useHapticFeedback());

    const { impactAsync } = require('expo-haptics');

    act(() => {
      result.current.triggerImpact('Heavy');
    });

    expect(impactAsync).toHaveBeenCalledWith('Heavy');
  });

  it('should handle notification feedback', () => {
    const { result } = renderHook(() => useHapticFeedback());

    const { notificationAsync } = require('expo-haptics');

    act(() => {
      result.current.triggerNotification('Success');
    });

    expect(notificationAsync).toHaveBeenCalledWith('Success');
  });

  it('should handle selection feedback', () => {
    const { result } = renderHook(() => useHapticFeedback());

    const { selectionAsync } = require('expo-haptics');

    act(() => {
      result.current.triggerSelection();
    });

    expect(selectionAsync).toHaveBeenCalled();
  });

  it('should handle errors gracefully', () => {
    const { result } = renderHook(() => useHapticFeedback());

    const { impactAsync } = require('expo-haptics');
    impactAsync.mockRejectedValueOnce(new Error('Haptic not available'));

    act(() => {
      expect(() => {
        result.current.triggerImpact('Light');
      }).not.toThrow();
    });
  });
});

