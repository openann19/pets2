/**
 * Hook for managing voice note playback
 * Handles both native (Expo AV Sound) and web playback
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';

export interface UseVoicePlaybackOptions {
  uri: string | null;
  durationMs: number;
}

export interface UseVoicePlaybackReturn {
  isPlaying: boolean;
  progress: number;
  playPreview: () => Promise<void>;
  stopPreview: () => Promise<void>;
  seek: (position: number) => Promise<void>;
}

export function useVoicePlayback({
  uri,
  durationMs,
}: UseVoicePlaybackOptions): UseVoicePlaybackReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current.setOnPlaybackStatusUpdate(null);
      soundRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      void unloadSound();
    };
  }, [unloadSound]);

  const playPreview = useCallback(async () => {
    if (!uri) return;

    if (Platform.OS === 'web') {
      setIsPlaying(true);
      const d = durationMs || 1000;
      setTimeout(() => {
        setIsPlaying(false);
        setProgress(0);
      }, d);
      return;
    }

    try {
      await unloadSound();
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true }, (status) => {
        if (!status.isLoaded) return;
        const dur = status.durationMillis ?? 1;
        const pos = status.positionMillis ?? 0;
        setProgress(Math.min(1, pos / dur));
        setIsPlaying(status.isPlaying ?? false);
        if (status.didJustFinish) {
          setIsPlaying(false);
          setProgress(0);
        }
      });
      soundRef.current = sound;
      await sound.playAsync();
    } catch {
      Alert.alert('Playback error', 'Could not play the recording.');
    }
  }, [uri, durationMs, unloadSound]);

  const stopPreview = useCallback(async () => {
    if (Platform.OS === 'web') {
      setIsPlaying(false);
      setProgress(0);
      return;
    }
    if (!soundRef.current) return;
    await soundRef.current.stopAsync();
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const seek = useCallback(
    async (position: number) => {
      if (Platform.OS !== 'web' && soundRef.current) {
        try {
          const sound = soundRef.current as unknown as Audio.Sound & {
            _durationMillis?: number;
          };
          const dur = sound._durationMillis ?? 0;
          if (dur > 0) {
            await soundRef.current.setPositionAsync(Math.round(position * dur));
            setProgress(position);
          }
        } catch {
          /* ignore */
        }
      } else {
        setProgress(position);
      }
    },
    [],
  );

  return {
    isPlaying,
    progress,
    playPreview,
    stopPreview,
    seek,
  };
}

