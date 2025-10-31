/**
 * Voice Note Player Component
 * Plays voice notes with waveform visualization
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { logger } from '../../services/logger';

interface VoiceNotePlayerProps {
  url: string;
  duration: number;
  waveform?: number[];
}

export function VoiceNotePlayer({
  url,
  duration,
  waveform = [],
}: VoiceNotePlayerProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying && soundRef.current) {
        // Pause
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        // Play
        if (!soundRef.current) {
          setIsLoading(true);
          const { sound } = await Audio.Sound.createAsync(
            { uri: url },
            { shouldPlay: true },
          );
          soundRef.current = sound;

          // Update position as sound plays
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded) {
              setPosition(status.positionMillis / 1000);
              if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                sound.unloadAsync().then(() => {
                  soundRef.current = null;
                }).catch(() => {});
              }
            }
          });
        } else {
          await soundRef.current.playAsync();
        }
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      logger.error('Failed to toggle voice playback', { 
        error: error instanceof Error ? error : new Error(String(error))
      });
      setIsLoading(false);
      setIsPlaying(false);
    }
  };


  // Generate waveform bars if not provided
  const displayWaveform = waveform.length > 0
    ? waveform
    : Array.from({ length: 20 }, () => Math.random() * 0.8 + 0.2);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {/* Play/Pause Button */}
      <TouchableOpacity
        onPress={togglePlayback}
        disabled={isLoading}
        style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
      >
        {isLoading ? (
          <View style={styles.loadingSpinner}>
            <Text style={[styles.loadingText, { color: theme.colors.surface }]}>...</Text>
          </View>
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color={theme.colors.surface}
          />
        )}
      </TouchableOpacity>

      {/* Waveform */}
      <View style={styles.waveformContainer}>
        {displayWaveform.map((amplitude, index) => {
          const isActive = isPlaying && (index / displayWaveform.length) * duration <= position;
          return (
            <View
              key={index}
              style={[
                styles.waveBar,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.border,
                  height: `${amplitude * 100}%`,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Duration */}
      <Text style={[styles.durationText, { color: theme.colors.onSurface }]}>
        {formatTime(position || duration)}
      </Text>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      maxWidth: 280,
      gap: 12,
    },
    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingSpinner: {
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 12,
    },
    waveformContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      gap: 2,
    },
    waveBar: {
      flex: 1,
      borderRadius: 1,
      minHeight: 4,
      maxHeight: '100%',
    },
    durationText: {
      fontSize: 12,
      fontWeight: '500',
      minWidth: 40,
      textAlign: 'right',
    },
  });
}

