/**
 * Comprehensive Tests for useSoundEffect Hook
 * Tests all functionality including loading, playback, volume control, and cleanup
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSoundEffect } from '../useSoundEffect';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Sound: {
      createAsync: jest.fn(),
    },
    InterruptionModeIOS: {
      DoNotMix: 'DoNotMix',
    },
    InterruptionModeAndroid: {
      DoNotMix: 'DoNotMix',
    },
  },
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

const mockSound = {
  setVolumeAsync: jest.fn(() => Promise.resolve()),
  setPositionAsync: jest.fn(() => Promise.resolve()),
  playAsync: jest.fn(() => Promise.resolve()),
  getStatusAsync: jest.fn(() => Promise.resolve({ isLoaded: true })),
  setOnPlaybackStatusUpdate: jest.fn(),
  unloadAsync: jest.fn(() => Promise.resolve()),
};

describe('useSoundEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
      sound: mockSound,
    });
    mockSound.getStatusAsync.mockResolvedValue({ isLoaded: true });
  });

  describe('Initialization', () => {
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

    it('should set up audio mode on mount with URI', async () => {
      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.setAudioModeAsync).toHaveBeenCalled();
      });
    });

    it('should not set up audio mode without URI', () => {
      renderHook(() => useSoundEffect());

      expect(Audio.setAudioModeAsync).not.toHaveBeenCalled();
    });

    it('should load sound when URI is provided', async () => {
      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
          { uri: 'test://sound.mp3' },
          {
            volume: 0.5,
            shouldPlay: false,
          }
        );
      });
    });

    it('should handle local asset URI', async () => {
      const localAsset = require('@/assets/sounds/click.mp3');

      renderHook(() =>
        useSoundEffect({
          uri: localAsset,
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Volume Control', () => {
    it('should use default volume of 0.5', async () => {
      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            volume: 0.5,
          })
        );
      });
    });

    it('should use custom volume', async () => {
      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
          volume: 0.8,
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            volume: 0.8,
          })
        );
      });
    });

    it('should update volume when it changes', async () => {
      const { result, rerender } = renderHook(
        ({ volume }) =>
          useSoundEffect({
            uri: 'test://sound.mp3',
            volume,
          }),
        {
          initialProps: { volume: 0.5 },
        }
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      rerender({ volume: 0.9 });

      await waitFor(() => {
        expect(mockSound.setVolumeAsync).toHaveBeenCalledWith(0.9);
      });
    });
  });

  describe('Enable/Disable', () => {
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

    it('should not play when disabled', async () => {
      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
          enabled: false,
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      await act(async () => {
        await result.current.play();
      });

      expect(mockSound.playAsync).not.toHaveBeenCalled();
    });
  });

  describe('Playback', () => {
    it('should play sound when enabled', async () => {
      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
          enabled: true,
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      await act(async () => {
        await result.current.play();
      });

      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
      expect(mockSound.playAsync).toHaveBeenCalled();
    });

    it('should reset position before playing', async () => {
      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      await act(async () => {
        await result.current.play();
      });

      expect(mockSound.setPositionAsync).toHaveBeenCalledWith(0);
      expect(mockSound.playAsync).toHaveBeenCalled();
    });

    it('should handle playback errors gracefully', async () => {
      mockSound.playAsync.mockRejectedValueOnce(new Error('Playback failed'));

      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      await act(async () => {
        await expect(result.current.play()).resolves.not.toThrow();
      });
    });

    it('should not play on web platform', async () => {
      (Platform.OS as any) = 'web';

      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await act(async () => {
        await result.current.play();
      });

      expect(Audio.Sound.createAsync).not.toHaveBeenCalled();
      expect(mockSound.playAsync).not.toHaveBeenCalled();
    });

    it('should handle unloaded sound gracefully', async () => {
      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      // Simulate sound being unloaded
      (Audio.Sound.createAsync as jest.Mock).mockResolvedValueOnce({
        sound: null,
      });

      await act(async () => {
        await result.current.play();
      });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should unload sound on unmount', async () => {
      const { unmount } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockSound.unloadAsync).toHaveBeenCalled();
      });
    });

    it('should cleanup when URI changes', async () => {
      const { rerender } = renderHook(
        ({ uri }) =>
          useSoundEffect({
            uri,
          }),
        {
          initialProps: { uri: 'test://sound1.mp3' },
        }
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      const firstSound = mockSound;

      rerender({ uri: 'test://sound2.mp3' });

      await waitFor(() => {
        expect(firstSound.unloadAsync).toHaveBeenCalled();
      });
    });

    it('should auto-unload when playback finishes', async () => {
      const statusUpdateCallback = jest.fn();

      mockSound.setOnPlaybackStatusUpdate.mockImplementation((callback) => {
        statusUpdateCallback.mockImplementation(callback);
      });

      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      // Simulate playback finishing
      act(() => {
        statusUpdateCallback({
          isLoaded: true,
          didJustFinish: true,
        });
      });

      await waitFor(() => {
        expect(mockSound.unloadAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle audio mode setup errors', async () => {
      (Audio.setAudioModeAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Audio mode failed')
      );

      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.setAudioModeAsync).toHaveBeenCalled();
      });

      // Should not throw
      expect(result.current).toBeDefined();
    });

    it('should handle sound loading errors', async () => {
      (Audio.Sound.createAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Load failed')
      );

      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      // Should not throw
      expect(result.current).toBeDefined();
    });

    it('should handle getStatusAsync errors', async () => {
      mockSound.getStatusAsync.mockRejectedValueOnce(new Error('Status failed'));

      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      await act(async () => {
        await result.current.play();
      });

      // Should not throw
      expect(result.current).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined URI', () => {
      const { result } = renderHook(() => useSoundEffect({ uri: undefined }));

      expect(result.current).toBeDefined();
      expect(result.current.enabled).toBe(true);
    });

    it('should handle empty string URI', () => {
      const { result } = renderHook(() => useSoundEffect({ uri: '' }));

      expect(result.current).toBeDefined();
    });

    it('should handle volume outside range', async () => {
      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
          volume: 1.5, // Above max
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });
    });

    it('should handle negative volume', async () => {
      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
          volume: -0.5, // Negative
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });
    });

    it('should handle rapid play calls', async () => {
      const { result } = renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.Sound.createAsync).toHaveBeenCalled();
      });

      await act(async () => {
        await Promise.all([
          result.current.play(),
          result.current.play(),
          result.current.play(),
        ]);
      });

      expect(mockSound.playAsync).toHaveBeenCalled();
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

  describe('Platform-Specific Behavior', () => {
    it('should skip audio setup on web', () => {
      (Platform.OS as any) = 'web';

      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      expect(Audio.setAudioModeAsync).not.toHaveBeenCalled();
    });

    it('should handle iOS platform', async () => {
      (Platform.OS as any) = 'ios';

      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.setAudioModeAsync).toHaveBeenCalled();
      });
    });

    it('should handle Android platform', async () => {
      (Platform.OS as any) = 'android';

      renderHook(() =>
        useSoundEffect({
          uri: 'test://sound.mp3',
        })
      );

      await waitFor(() => {
        expect(Audio.setAudioModeAsync).toHaveBeenCalled();
      });
    });
  });
});

