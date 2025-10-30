// components/voice/VoiceRecorderUltra.tsx
import React, { useCallback, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

import { VoiceWaveform } from './VoiceWaveform';
import { TranscriptionBadge } from './TranscriptionBadge';
import type { WebProcessingReport } from '../../utils/audio/web-processing.web';
import {
  useVoiceRecording,
  useVoicePlayback,
  useVoiceProcessing,
  useSlideToCancel,
  useVoiceSend,
} from '../../hooks/voice';

interface Props {
  matchId: string;
  onVoiceNoteSent?: () => void;
  disabled?: boolean;
  maxDurationSec?: number; // default 120
  minDurationSec?: number; // default 1
  chatService: {
    sendVoiceNote: (matchId: string, audioUri: string, duration?: number) => Promise<void>;
  };

  /** NEW: processing options */
  processing?: {
    autoTrimSilence?: boolean; // default true
    trimThresholdDb?: number; // default -45 dBFS
    trimPaddingMs?: number; // default 120ms
    normalizeToLufs?: number; // default -16
  };

  /** NEW: optional services for native/server-side processing + transcription */
  voiceProcessingService?: {
    // Native/server processing: returns new file URI and report
    trimAndNormalize: (
      uri: string,
      opts: {
        trimThresholdDb: number;
        trimPaddingMs: number;
        targetLufs: number;
      },
    ) => Promise<{ uri: string; report: WebProcessingReport }>;
  } | null;

  transcribeService?: {
    // Accepts blob (web) or file URI (native) and returns transcript text
    transcribe: (input: { blob?: unknown; uri?: string }) => Promise<string>;
  } | null;
}

type RecBackend = 'native' | 'web';

export function VoiceRecorderUltra({
  matchId,
  onVoiceNoteSent,
  disabled = false,
  maxDurationSec = 120,
  minDurationSec = 1,
  chatService,
  processing,
  voiceProcessingService = null,
  transcribeService = null,
}: Props): React.JSX.Element {
  const backend: RecBackend = Platform.OS === 'web' ? 'web' : 'native';
  const theme = useTheme();
  const styles = makeStyles(theme);

  // Lock state for recording
  const [isLocked, setIsLocked] = useState(false);

  // Voice recording hook
  const {
    isRecording,
    durationMs,
    previewUri,
    processedBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    reset: resetRecording,
  } = useVoiceRecording({
    backend,
    disabled,
    maxDurationSec,
  });

  // Voice processing hook
  const {
    processedUri,
    processingReport,
    waveform,
    transcript,
    isProcessingAudio,
    isTranscribing,
    reset: resetProcessing,
  } = useVoiceProcessing({
    backend,
    previewUri,
    processedBlob,
    processing: processing,
    voiceProcessingService,
    transcribeService,
  });

  // Voice playback hook
  const playbackUri = processedUri || previewUri;
  const { isPlaying, progress, playPreview, stopPreview, seek } = useVoicePlayback({
    uri: playbackUri,
    durationMs,
  });

  // Slide-to-cancel hook
  const handleCancelInternal = useCallback(() => {
    cancelRecording();
    resetProcessing();
    resetRecording();
  }, [cancelRecording, resetProcessing, resetRecording]);

  const { panResponder, isCancelling } = useSlideToCancel({
    enabled: isRecording && !isLocked,
    cancelThreshold: 80,
    onCancel: handleCancelInternal,
    onRelease: (willCancel) => {
      if (!willCancel && !isLocked && isRecording) {
        void stopRecording();
          }
    },
  });

  // Voice send hook
  const { isSending, send } = useVoiceSend({
    previewUri,
    processedUri,
    processedBlob,
    durationMs,
    minDurationSec,
    backend,
    matchId,
    chatService,
    onSuccess: () => {
      resetRecording();
      resetProcessing();
      onVoiceNoteSent?.();
    },
  });

  const toggleLock = useCallback(() => {
    if (!isRecording) return;
    setIsLocked((v) => !v);
    Haptics.selectionAsync();
  }, [isRecording]);

  const handleCancel = useCallback(() => {
    handleCancelInternal();
  }, [handleCancelInternal]);

  const fmt = (s: number) => {
    const total = Math.round(s / 1000);
    const m = Math.floor(total / 60);
    const sec = total % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const activeProcessing = isProcessingAudio || isTranscribing;

  return (
    <View style={styles.container}>
      {/* record row */}
      <View style={styles.row}>
        <View
          {...panResponder.panHandlers}
          style={[
            styles.recordWrap,
            isRecording && styles.recordWrapActive,
            isCancelling && styles.recordWrapCancel,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => (!disabled && !isRecording ? startRecording() : null)}
            onPressOut={() => (isRecording && !isLocked ? stopRecording() : null)}
            disabled={disabled}
            style={styles.recordButton}
          >
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={22} color={theme.colors.onPrimary} />
          </TouchableOpacity>

          <Text
            style={[
              styles.hint,
              isRecording ? styles.hintActive : null,
              isCancelling ? styles.hintCancel : null,
            ]}
          >
            {isRecording
              ? isCancelling
                ? 'Release to cancel'
                : isLocked
                  ? 'Tap lock to unlock • ' + fmt(durationMs)
                  : 'Slide ← to cancel • ' + fmt(durationMs)
              : 'Hold to record'}
          </Text>

          {isRecording && (
            <TouchableOpacity
              onPress={toggleLock}
              style={styles.lockButton}
            >
              <Ionicons name={isLocked ? 'lock-closed' : 'lock-open'} size={18} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* preview */}
      {(previewUri || processedUri) && !isRecording && (
        <View style={styles.previewCard}>
          <View style={styles.waveRow}>
            <VoiceWaveform
              waveform={waveform}
              isPlaying={isPlaying}
              progress={progress}
              duration={Math.max(1, Math.round(durationMs / 1000))}
              color={theme.colors.primary}
              height={36}
              onSeek={seek}
            />
            <Text style={styles.dur}>{fmt(durationMs)}</Text>
          </View>

          {/* badges */}
          <View style={styles.badges}>
            {processingReport?.trim?.didTrim && (
              <TranscriptionBadge
                icon="cut"
                label={`Trimmed ${Math.round(processingReport.trim.msRemoved)}ms`}
              />
            )}
            {processingReport?.normalize && (
              <TranscriptionBadge
                icon="analytics"
                label={`Normalized → ${processingReport.normalize.targetLufs} LUFS`}
              />
            )}
            {activeProcessing && (
              <TranscriptionBadge
                icon="sparkles"
                label="Enhancing…"
              />
            )}
            {!!transcript && (
              <TranscriptionBadge
                icon="text"
                label="Transcript ready"
              />
            )}
          </View>

          {/* controls */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => (isPlaying ? stopPreview() : playPreview())}
              style={styles.actionBtn}
            >
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={theme.colors.onPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              style={styles.actionBtn}
            >
              <Ionicons name="trash" size={18} color={theme.colors.danger} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={send}
              disabled={isSending || activeProcessing}
              style={styles.sendBtn}
            >
              <Ionicons
                name={isSending ? 'hourglass' : 'send'}
                size={18}
                color={isSending || activeProcessing ? theme.colors.onMuted : theme.colors.onPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* transcript preview (1 line) */}
          {!!transcript && (
            <Text
              numberOfLines={1}
              style={styles.transcript}
            >
              {transcript}
            </Text>
          )}
        </View>
      )}

      {isSending && <Text style={styles.sending}>Sending…</Text>}
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: { alignItems: 'stretch', padding: theme.spacing.xs },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    recordWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
    },
    recordWrapActive: { backgroundColor: theme.colors.surface },
    recordWrapCancel: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.danger,
    },
    recordButton: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.palette.neutral[900],
      shadowOffset: { width: 0, height: theme.spacing.xs },
      shadowOpacity: 0.3,
      shadowRadius: theme.spacing.sm,
      elevation: 8,
    },
    lockButton: {
      width: 28,
      height: 28,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hint: { color: theme.colors.onMuted, fontWeight: '600' as const },
    hintActive: { color: theme.colors.onSurface },
    hintCancel: { color: theme.colors.danger },
    previewCard: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
    },
    waveRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    dur: { color: theme.colors.onMuted, fontWeight: '600' as const },
    badges: { flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.xs, flexWrap: 'wrap' },
    actions: { marginTop: theme.spacing.md, flexDirection: 'row', gap: theme.spacing.md, justifyContent: 'flex-end' },
    actionBtn: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.success,
    },
    transcript: {
      marginTop: theme.spacing.xs,
      color: theme.colors.onMuted,
      fontSize: 12,
    },
    sending: { marginTop: theme.spacing.xs, fontSize: 14, color: theme.colors.onMuted },
  });
}
