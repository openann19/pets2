/**
 * Enhanced Voice Note Recorder for Chat
 * Integrates with chat service and offline queue
 */
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { chatService } from '../../services/chatService';
import { logger } from '../../services/logger';
import NetInfo from '@react-native-community/netinfo';
import { offlineMessageQueue } from '../../services/OfflineMessageQueue';

interface VoiceNoteRecorderProps {
  visible: boolean;
  matchId: string;
  onClose: () => void;
  onSent: () => void;
  maxDuration?: number; // in seconds
}

export function VoiceNoteRecorder({
  visible,
  matchId,
  onClose,
  onSent,
  maxDuration = 60,
}: VoiceNoteRecorderProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible && !isRecording) {
      startRecording();
    }
    return () => {
      stopTimer();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [visible]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setDuration((prev) => {
        if (prev >= maxDuration) {
          stopRecording();
          return maxDuration;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission Needed', 'Microphone access is required to record voice notes.');
        onClose();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets['HIGH_QUALITY_VOICE']);
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setDuration(0);
      startTimer();

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      logger.error('Failed to start recording', { 
        error: error instanceof Error ? error : new Error(String(error))
      });
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      onClose();
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current || !isRecording) return;

    stopTimer();
    setIsRecording(false);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Minimum duration check (1 second)
      if (duration < 1) {
        Alert.alert('Too Short', 'Voice note must be at least 1 second long.');
        recordingRef.current = null;
        setDuration(0);
        return;
      }

      // Send voice note
      await sendVoiceNote(uri, duration);
    } catch (error) {
      logger.error('Failed to stop recording', { 
        error: error instanceof Error ? error : new Error(String(error))
      });
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    } finally {
      recordingRef.current = null;
      setDuration(0);
    }
  };

  const cancelRecording = async () => {
    stopTimer();
    setIsRecording(false);

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (error) {
        logger.error('Error canceling recording', { 
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
      recordingRef.current = null;
    }

    setDuration(0);
    onClose();
  };

  const sendVoiceNote = async (uri: string, durationSeconds: number) => {
    setIsSending(true);

    try {
      // Check network status
      const netInfo = await NetInfo.fetch();
      const isOnline = netInfo.isConnected ?? false;

      if (isOnline) {
        await chatService.sendVoiceNote(matchId, uri, durationSeconds);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSent();
        onClose();
      } else {
        // Queue voice note for offline send
        const voiceNoteData = {
          uri,
          duration: durationSeconds,
          matchId,
        };
        
        await offlineMessageQueue.enqueue({
          matchId,
          content: '[Voice Note]',
          messageType: 'voice',
          attachments: [voiceNoteData],
        });
        
        Alert.alert(
          'Offline',
          'Voice note will be sent when you reconnect to the internet.',
        );
        
        // Register handler for voice note sending
        offlineMessageQueue.setSendHandler(async (queuedMessage) => {
          if (queuedMessage.messageType === 'voice' && queuedMessage.attachments?.[0]) {
            const voiceData = queuedMessage.attachments[0] as { uri: string; duration: number; matchId: string };
            await chatService.sendVoiceNote(voiceData.matchId, voiceData.uri, voiceData.duration);
          }
        });
        
        onClose();
      }
    } catch (error) {
      logger.error('Failed to send voice note', { 
        error: error instanceof Error ? error : new Error(String(error))
      });
      Alert.alert('Error', 'Failed to send voice note. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return <></>;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={cancelRecording}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              Voice Message
            </Text>
            <TouchableOpacity onPress={cancelRecording} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
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
              {formatDuration(duration)} / {formatDuration(maxDuration)}
            </Text>

            <Text style={[styles.hint, { color: theme.colors.onMuted }]}>
              {isRecording
                ? 'Tap stop when finished'
                : isSending
                  ? 'Sending...'
                  : 'Recording stopped'}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {isRecording ? (
              <TouchableOpacity
                style={[styles.stopButton, { backgroundColor: theme.colors.danger }]}
                onPress={stopRecording}
                disabled={duration < 1}
              >
                <Ionicons name="stop" size={24} color={theme.colors.surface} />
              </TouchableOpacity>
            ) : isSending ? (
              <View style={styles.sendingContainer}>
                <Text style={[styles.sendingText, { color: theme.colors.onSurface }]}>
                  Sending...
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                  onPress={cancelRecording}
                >
                  <Text style={[styles.cancelText, { color: theme.colors.onSurface }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                {duration >= 1 && (
                  <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {
                      if (recordingRef.current) {
                        stopRecording();
                      }
                    }}
                  >
                    <Ionicons name="send" size={20} color={theme.colors.surface} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(_theme: AppTheme) {
  return StyleSheet.create({
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
    stopButton: {
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
    sendingContainer: {
      padding: 16,
    },
    sendingText: {
      fontSize: 16,
    },
  });
}

