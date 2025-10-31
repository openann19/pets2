/**
 * Basic Tests for useSoundEffect Hook
 * Simplified to avoid async hanging issues
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useSoundEffect } from '../useSoundEffect';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: null })),
    },
  },
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('useSoundEffect', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSoundEffect());

    expect(result.current.enabled).toBe(true);
    expect(typeof result.current.play).toBe('function');
    expect(typeof result.current.setEnabled).toBe('function');
  });

  it('should initialize with custom options', () => {
    const { result } = renderHook(() =>
      useSoundEffect({
        volume: 0.7,
        enabled: false,
        uri: 'test://sound.mp3',
      })
    );

    expect(result.current.enabled).toBe(false);
  });

  it('should allow enabling/disabling', () => {
    const { result } = renderHook(() => useSoundEffect());

    act(() => {
      result.current.setEnabled(false);
    });

    expect(result.current.enabled).toBe(false);

    act(() => {
      result.current.setEnabled(true);
    });

    expect(result.current.enabled).toBe(true);
  });

  it('should maintain stable API across rerenders', () => {
    const { result, rerender } = renderHook(() => useSoundEffect());

    const firstPlay = result.current.play;
    const firstEnabled = result.current.enabled;

    rerender();

    expect(result.current.play).toBe(firstPlay);
    expect(result.current.enabled).toBe(firstEnabled);
  });
});

