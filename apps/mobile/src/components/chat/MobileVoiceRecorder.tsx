import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';

// Mock Audio for missing expo-av dependency
type RecordingInstance = {
  stopAndUnloadAsync: () => Promise<void>;
  getURI: () => string | null;
};

const Audio = {
  requestPermissionsAsync: async () => ({ granted: true }),
  setAudioModeAsync: async (_options?: {
    allowsRecordingIOS?: boolean;
    interruptionModeIOS?: number;
    playsInSilentModeIOS?: boolean;
    shouldDuckAndroid?: boolean;
    interruptionModeAndroid?: number;
    playThroughEarpieceAndroid?: boolean;
  }) => {},
  Recording: {
    createAsync: async (_options?: unknown) => ({
      recording: {
        stopAndUnloadAsync: async () => {},
        getURI: () => 'mock-audio-uri',
      } as RecordingInstance,
    }),
  },
  RecordingOptionsPresets: {
    HIGH_QUALITY: {},
  },
  INTERRUPTION_MODE_IOS_DO_NOT_MIX: 1,
  INTERRUPTION_MODE_ANDROID_DO_NOT_MIX: 1,
};

interface MobileVoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function MobileVoiceRecorder({
  onSend,
  onCancel,
}: MobileVoiceRecorderProps): React.JSX.Element {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recording, setRecording] = useState<RecordingInstance | null>(null);
  const timerRef = useRef<number | undefined>(undefined);

  const startRecording = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert('Permission to access microphone is required!');
        onCancel();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(recording);
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000) as unknown as number;
    } catch (error) {
      logger.error('Failed to start recording:', { error });
      alert('Failed to start recording. Please try again.');
      onCancel();
    }
  }, [onCancel]);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [startRecording, recording]);

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        // Convert to blob for compatibility
        const response = await fetch(uri);
        const blob = await response.blob();
        onSend(blob, duration);
      }
    } catch (error) {
      logger.error('Failed to stop recording:', { error });
      alert('Failed to save recording. Please try again.');
      onCancel();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {isRecording ? 'Recording...' : 'Voice Message'}
            </Text>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          {/* Recording Visualization */}
          <View style={styles.recordingContainer}>
            <View style={styles.waveformContainer}>
              {isRecording ? (
                Array.from({ length: 20 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        backgroundColor: theme.colors.primary,
                        height: `${Math.random() * 60 + 20}%`,
                      },
                    ]}
                  />
                ))
              ) : (
                <Ionicons
                  name="mic"
                  size={48}
                  color={theme.colors.onMuted}
                />
              )}
            </View>

            {/* Duration */}
            <Text style={[styles.duration, { color: theme.colors.onSurface }]}>
              {formatDuration(duration)}
            </Text>

            <Text style={[styles.hint, { color: theme.colors.onMuted }]}>
              {isRecording ? 'Tap stop when finished (max 60 seconds)' : 'Ready to send'}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {isRecording ? (
              <TouchableOpacity
                style={[styles.recordButton, { backgroundColor: theme.colors.danger }]}
                onPress={stopRecording}
              >
                <Ionicons
                  name="stop"
                  size={24}
                  color={theme.colors.onPrimary}
                />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                  onPress={onCancel}
                >
                  <Text style={[styles.cancelText, { color: theme.colors.onSurface }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    // This would normally send the recorded audio
                    onCancel();
                  }}
                >
                  <Ionicons
                    name="send"
                    size={20}
                    color={theme.colors.onPrimary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 20,
  },
  waveBar: {
    width: 4,
    marginHorizontal: 1,
    borderRadius: 2,
    opacity: 0.7,
  },
  duration: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 24,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
