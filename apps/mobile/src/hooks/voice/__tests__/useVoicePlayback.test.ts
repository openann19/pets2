/**
 * Tests for useVoicePlayback hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useVoicePlayback } from '../useVoicePlayback';

const mockSound = {
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  setPositionAsync: jest.fn().mockResolvedValue(undefined),
  setOnPlaybackStatusUpdate: jest.fn(),
};

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  Alert: { alert: jest.fn() },
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: mockSound,
      }),
    },
  },
}));

describe('useVoicePlayback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() =>
      useVoicePlayback({
        uri: null,
        durationMs: 0,
      }),
    );

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('should not play if uri is null', async () => {
    const { result } = renderHook(() =>
      useVoicePlayback({
        uri: null,
        durationMs: 0,
      }),
    );

    await act(async () => {
      await result.current.playPreview();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('should stop preview playback', async () => {
    const { result } = renderHook(() =>
      useVoicePlayback({
        uri: 'file://test.m4a',
        durationMs: 5000,
      }),
    );

    await act(async () => {
      await result.current.playPreview();
    });

    await act(async () => {
      await result.current.stopPreview();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.progress).toBe(0);
  });
});

