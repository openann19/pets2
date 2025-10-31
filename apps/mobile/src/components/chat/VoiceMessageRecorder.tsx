import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native';
import { durations } from '@/foundation/motion';
import { Text } from '../ui/v2/Text';
import { Button } from '../ui/v2/Button';

interface VoiceMessageRecorderProps {
  visible: boolean;
  onClose: () => void;
  onSend: (audioUri: string) => void;
  matchId: string;
}

export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  visible,
  onClose,
  onSend,
  matchId,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout>();

  const startRecording = () => {
    setIsRecording(true);
    setDuration(0);

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: durations.md,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: durations.md,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start duration counter
    durationInterval.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    pulseAnim.setValue(1);
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
  };

  const handleSend = () => {
    if (duration > 0) {
      // Mock audio URI - in real app this would be the actual recorded file
      const mockAudioUri = `audio_${Date.now()}.m4a`;
      onSend(mockAudioUri);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text
              variant="h4"
              tone="text"
              style={{ color: theme.colors.onSurface }}
            >
              {t('voice_message') || 'Voice Message'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Recording Interface */}
          <View style={[styles.recordingArea, { padding: theme.spacing.xl }]}>
            <Animated.View
              style={[
                styles.recordButtonContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  {
                    backgroundColor: isRecording ? theme.colors.danger : theme.colors.primary,
                    width: theme.spacing['4xl'],
                    height: theme.spacing['4xl'],
                    borderRadius: theme.radii.full,
                  },
                ]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isRecording ? "stop" : "mic"}
                  size={32}
                  color={theme.colors.onPrimary}
                />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.statusContainer}>
              <Text
                variant="body"
                tone="text"
                style={{ textAlign: 'center' }}
              >
                {isRecording
                  ? `${t('recording') || 'Recording'}... ${formatDuration(duration)}`
                  : t('tap_to_record') || 'Tap and hold to record'
                }
              </Text>
            </View>

            {isRecording && (
              <View style={[styles.waveformContainer, { height: theme.spacing.xl }]}>
                {/* Simple waveform visualization */}
                {[1, 2, 3, 4, 5].map((i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.waveformBar,
                      {
                        backgroundColor: theme.colors.primary,
                        height: Math.random() * 30 + 10, // Random height for demo
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Instructions */}
          <View style={[styles.instructions, { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.xl }]}>
            <Text
              variant="body"
              tone="textMuted"
              style={{ textAlign: 'center', lineHeight: theme.spacing.lg }}
            >
              {t('voice_instructions') || 'Tap and hold the microphone to record your message. Release to stop recording.'}
            </Text>
          </View>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.border }]}
              onPress={onClose}
            >
              <Text
                variant="button"
                tone="text"
              >
                {t('cancel') || 'Cancel'}
              </Text>
            </TouchableOpacity>

            <Button
              title={t('send') || 'Send'}
              onPress={handleSend}
              variant="primary"
              size="md"
              disabled={duration === 0}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    margin: 20,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  recordingArea: {
    alignItems: 'center',
  },
  recordButtonContainer: {
    marginBottom: 24,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    opacity: 0.7,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
  },
});
