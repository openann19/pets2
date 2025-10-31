/**
 * useSoundEffect Hook
 * Sound effect utilities for micro-interactions
 * Uses expo-av for audio playback
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { logger } from '@pawfectmatch/core';

export interface SoundEffectOptions {
  /** Volume level (0.0 to 1.0) */
  volume?: number;
  /** Whether sound is enabled */
  enabled?: boolean;
  /** Sound file URI (local asset or remote URL) */
  uri?: string;
}

export interface UseSoundEffectReturn {
  /** Play the sound effect */
  play: () => Promise<void>;
  /** Whether sound is enabled */
  enabled: boolean;
  /** Set enabled state */
  setEnabled: (enabled: boolean) => void;
}

/**
 * Hook for playing sound effects in micro-interactions
 * 
 * @param options - Sound effect configuration
 * @returns Sound effect controls
 * 
 * @example
 * ```tsx
 * const { play } = useSoundEffect({
 *   uri: require('@/assets/sounds/click.mp3'),
 *   volume: 0.5,
 *   enabled: true,
 * });
 * 
 * <Pressable onPress={() => play()}>
 *   <Text>Click me</Text>
 * </Pressable>
 * ```
 */
export function useSoundEffect(
  options: SoundEffectOptions = {}
): UseSoundEffectReturn {
  const { volume = 0.5, enabled: initialEnabled = true, uri } = options;
  const [enabled, setEnabled] = useState(initialEnabled);
  const soundRef = useRef<Audio.Sound | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize audio mode
  useEffect(() => {
    if (!uri || Platform.OS === 'web') return;

    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: true,
          staysActiveInBackground: false,
        });
      } catch (error) {
        // Silently fail if audio mode setup fails
        logger.debug('Audio mode setup failed:', error);
      }
    };

    void initAudio();
  }, [uri]);

  // Load sound on mount or when URI changes
  useEffect(() => {
    if (!uri || Platform.OS === 'web' || isInitializedRef.current) return;

    let isMounted = true;

    const loadSound = async () => {
      try {
        // Unload previous sound if exists
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        // Load new sound
        const { sound } = await Audio.Sound.createAsync(
          typeof uri === 'string' ? { uri } : uri,
          {
            volume,
            shouldPlay: false,
          }
        );

        if (isMounted) {
          soundRef.current = sound;
          isInitializedRef.current = true;

          // Auto-unload when finished playing
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              sound.unloadAsync().catch(() => {});
              if (isMounted) {
                soundRef.current = null;
                isInitializedRef.current = false;
              }
            }
          });
        } else {
          await sound.unloadAsync();
        }
      } catch (error) {
        // Silently fail if sound loading fails
        logger.debug('Sound loading failed:', error);
        if (isMounted) {
          soundRef.current = null;
          isInitializedRef.current = false;
        }
      }
    };

    void loadSound();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [uri, volume]);

  // Update volume when it changes
  useEffect(() => {
    if (!soundRef.current || Platform.OS === 'web') return;

    soundRef.current.setVolumeAsync(volume).catch(() => {
      // Silently fail if volume update fails
    });
  }, [volume]);

  const play = useCallback(async () => {
    if (!enabled) return;

    // Web fallback - no sound effects on web
    if (Platform.OS === 'web') {
      return;
    }

    if (!soundRef.current) {
      // Try to reload sound if it was unloaded
      if (uri) {
        isInitializedRef.current = false;
        // Trigger reload by updating dependency
        return;
      }
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        // Reset to beginning and play
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      // Silently fail if playback fails
      logger.debug('Sound playback failed:', error);
    }
  }, [enabled, uri]);

  return {
    play,
    enabled,
    setEnabled,
  };
}

export default useSoundEffect;

