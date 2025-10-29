// components/voice/VoiceRecorderUltra.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import { VoiceWaveform, generateWaveformFromAudio } from './VoiceWaveform';
import { toUploadPart } from '../../utils/audio/upload-helpers';
import {
  canProcessOnWeb,
  processAudioWeb,
  type WebProcessingReport,
} from '../../utils/audio/web-processing';
import { TranscriptionBadge } from './TranscriptionBadge';
import { logger } from '../../services/logger';

interface Props {
  matchId: string;
  onVoiceNoteSent?: () => void;
  disabled?: boolean;
  maxDurationSec?: number; // default 120
  minDurationSec?: number; // default 1
  chatService: {
    sendVoiceNote: (matchId: string, file: FormData | Blob) => Promise<void>;
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
    // Accepts Blob (web) or file URI (native) and returns transcript text
    transcribe: (input: { blob?: Blob; uri?: string }) => Promise<string>;
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

  // --- UI state
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const [durationMs, setDurationMs] = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null); // web processed
  const [processedUri, setProcessedUri] = useState<string | null>(null); // native/server processed
  const [processingReport, setProcessingReport] = useState<WebProcessingReport | null>(null);

  // playback preview
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(() =>
    generateWaveformFromAudio(new ArrayBuffer(0), 64),
  );

  // transcript
  const [transcript, setTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // --- native
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // --- web recorder bits
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationTimer = useRef<NodeJS.Timeout | null>(null);

  // ---- playback - moved earlier to avoid reference errors
  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current.setOnPlaybackStatusUpdate(null);
      soundRef.current = null;
    }
  }, []);

  // --- Pan (slide-to-cancel)
  const CANCEL_THRESHOLD = 80;
  const panState = useRef({ dx: 0 });

  // Handler for cancel action
  const handleCancelInternal = useCallback(() => {
    setIsCancelling(false);
    setPreviewUri(null);
    setProcessedBlob(null);
    setProcessedUri(null);
    setProcessingReport(null);
    setTranscript('');
    setDurationMs(0);
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          panState.current.dx = g.dx;
          setIsCancelling(g.dx < -CANCEL_THRESHOLD);
        },
        onPanResponderRelease: () => {
          const cancel = panState.current.dx < -CANCEL_THRESHOLD;
          panState.current.dx = 0;
          if (cancel) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            handleCancelInternal();
          } else if (!isLocked && isRecording) {
            // Stop recording will be called by the parent via refs
            setIsRecording(false);
          }
          setIsCancelling(false);
        },
      }),
    [isLocked, isRecording, handleCancelInternal],
  );

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (durationTimer.current) clearInterval(durationTimer.current);
      // Call cleanup functions directly
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => {
          t.stop();
        });
      }
      if (recordingRef.current) {
        void recordingRef.current.stopAndUnloadAsync();
      }
      void unloadSound();
    };
  }, [unloadSound]);

  // Helper to stop recording when max duration reached
  const stopRecordingOnMaxDuration = useCallback(async () => {
    setIsRecording(false);
    if (backend === 'native' && recordingRef.current) {
      try {
        const rec = recordingRef.current;
        await rec.stopAndUnloadAsync();
        const uri = rec.getURI();
        recordingRef.current = null;
        if (uri) setPreviewUri(uri);
      } catch {
        /* ignore */
      }
    } else if (backend === 'web' && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => {
        t.stop();
      });
      mediaRecorderRef.current = null;
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
        durationTimer.current = null;
      }
    }
  }, [backend]);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPreviewUri(null);
    setProcessedBlob(null);
    setProcessedUri(null);
    setProcessingReport(null);
    setTranscript('');
    setDurationMs(0);
    setProgress(0);

    if (backend === 'native') {
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Microphone access is required.');
          return;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const rec = new Audio.Recording();
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        rec.setOnRecordingStatusUpdate((s) => {
          if (s.isRecording) setDurationMs(s.durationMillis ?? 0);
          if ((s.durationMillis ?? 0) / 1000 >= maxDurationSec) {
            void stopRecordingOnMaxDuration();
          }
        });
        await rec.startAsync();

        recordingRef.current = rec;
        setIsRecording(true);
      } catch {
        Alert.alert('Error', 'Could not start recording.');
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        chunksRef.current = [];

        mr.ondataavailable = (evt) => {
          if (evt.data.size > 0) chunksRef.current.push(evt.data);
        };
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const uri = URL.createObjectURL(blob);
          setPreviewUri(uri);
          // keep raw blob for processing
          setProcessedBlob(blob); // initial is original
        };

        mr.start();
        setIsRecording(true);
        durationTimer.current = setInterval(() => {
          setDurationMs((p) => p + 1000);
        }, 1000);
      } catch {
        Alert.alert('Permission needed', 'Microphone access is required.');
      }
    }
  }, [backend, disabled, isRecording, maxDurationSec, stopRecordingOnMaxDuration]);

  const stopRecording = useCallback(
    async (silent = false) => {
      if (!isRecording) return;
      setIsRecording(false);

      if (backend === 'native') {
        try {
          const rec = recordingRef.current;
          if (!rec) return;
          await rec.stopAndUnloadAsync();
          const uri = rec.getURI();
          recordingRef.current = null;
          if (!uri) return;
          setPreviewUri(uri);
          if (!silent) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {
          /* ignore */
        }
      } else {
        const mr = mediaRecorderRef.current;
        if (mr?.state === 'recording') {
          mr.stop();
          mr.stream.getTracks().forEach((t) => {
            t.stop();
          });
        }
        mediaRecorderRef.current = null;
        if (durationTimer.current) {
          clearInterval(durationTimer.current);
          durationTimer.current = null;
        }
        if (!silent) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [backend, isRecording],
  );

  const handleCancel = useCallback(() => {
    setIsRecording(false);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => {
        t.stop();
      });
    }
    if (recordingRef.current) {
      void recordingRef.current.stopAndUnloadAsync();
    }
    setPreviewUri(null);
    setProcessedBlob(null);
    setProcessedUri(null);
    setProcessingReport(null);
    setTranscript('');
    setDurationMs(0);
  }, []);

  const toggleLock = useCallback(() => {
    if (!isRecording) return;
    setIsLocked((v) => !v);
    Haptics.selectionAsync();
  }, [isRecording]);

  const playPreview = useCallback(async () => {
    const uri = processedUri || previewUri;
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
  }, [durationMs, previewUri, processedUri]);

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

  // ---- WEB processing (auto-trim + normalize)
  useEffect(() => {
    const opts = {
      autoTrimSilence: processing?.autoTrimSilence ?? true,
      trimThresholdDb: processing?.trimThresholdDb ?? -45,
      trimPaddingMs: processing?.trimPaddingMs ?? 120,
      normalizeToLufs: processing?.normalizeToLufs ?? -16,
    };

    (async () => {
      // no preview? nothing to do
      if (!previewUri) return;

      // generate a pleasant pseudo-waveform regardless
      setWaveform(generateWaveformFromAudio(new ArrayBuffer(0), 64));

      // If Web and can process locally
      if (
        backend === 'web' &&
        canProcessOnWeb() &&
        (opts.autoTrimSilence || Number.isFinite(opts.normalizeToLufs))
      ) {
        try {
          setIsProcessingAudio(true);
          const blobToProcess = processedBlob;
          if (!blobToProcess) return;

          const { blob, report } = await processAudioWeb(blobToProcess, {
            trimThresholdDb: opts.trimThresholdDb,
            trimPaddingMs: opts.trimPaddingMs,
            normalizeToLufs: opts.normalizeToLufs,
          });

          const nextUrl = URL.createObjectURL(blob);
          setProcessedBlob(blob);
          setPreviewUri(nextUrl); // swap to processed URL for playback
          setProcessingReport(report);
        } catch {
          // silent fail -> just keep original
        } finally {
          setIsProcessingAudio(false);
        }
      }

      // If Native and you provided a processing service, use it
      if (
        backend === 'native' &&
        voiceProcessingService &&
        (opts.autoTrimSilence || Number.isFinite(opts.normalizeToLufs))
      ) {
        try {
          setIsProcessingAudio(true);
          const { uri, report } = await voiceProcessingService.trimAndNormalize(previewUri, {
            trimThresholdDb: opts.trimThresholdDb,
            trimPaddingMs: opts.trimPaddingMs,
            targetLufs: opts.normalizeToLufs,
          });
          setProcessedUri(uri);
          setProcessingReport(report);
        } catch {
          // ignore
        } finally {
          setIsProcessingAudio(false);
        }
      }

      // Transcription (both platforms) if service available
      if (transcribeService) {
        try {
          setIsTranscribing(true);
          if (backend === 'web' && processedBlob) {
            const text = await transcribeService.transcribe({ blob: processedBlob });
            setTranscript(text || '');
          } else if (backend === 'native') {
            const uri = processedUri || previewUri;
            if (uri) {
              const text = await transcribeService.transcribe({ uri });
              setTranscript(text || '');
            }
          }
        } catch {
          setTranscript('');
        } finally {
          setIsTranscribing(false);
        }
      }
    })();
  }, [
    previewUri,
    processing,
    backend,
    processedBlob,
    processedUri,
    transcribeService,
    voiceProcessingService,
  ]);

  // ---- send
  const send = useCallback(async () => {
    if (!previewUri || isSending) return;

    const seconds = Math.max(1, Math.round(durationMs / 1000));
    if (seconds < minDurationSec) {
      Alert.alert('Too short', `Record at least ${minDurationSec}s.`);
      return;
    }

    setIsSending(true);
    try {
      if (backend === 'web') {
        const body = processedBlob ?? (await (await fetch(previewUri)).blob());
        // Attach transcript if we have it
        if (transcript) {
          // Attach transcript metadata for server-side processing
          // Server can read this from multipart or query params
          logger.debug('Sending voice note with transcript', { transcript });
        }
        await chatService.sendVoiceNote(matchId, body);
      } else {
        // native: multipart form
        const fileUri = processedUri || previewUri;
        const part = await toUploadPart(fileUri, 'voice-note.m4a', 'audio/m4a');
        const form = new FormData();
        form.append('file', part as unknown as Blob);
        if (transcript) form.append('transcript', transcript);
        await chatService.sendVoiceNote(matchId, form);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPreviewUri(null);
      setProcessedBlob(null);
      setProcessedUri(null);
      setProcessingReport(null);
      setTranscript('');
      setDurationMs(0);
      setProgress(0);
      onVoiceNoteSent?.();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to send voice note. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [
    backend,
    chatService,
    durationMs,
    isSending,
    matchId,
    minDurationSec,
    onVoiceNoteSent,
    previewUri,
    processedBlob,
    processedUri,
    transcript,
  ]);

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
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={22}
              color={Theme.colors.neutral[0]}
            />
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
              <Ionicons
                name={isLocked ? 'lock-closed' : 'lock-open'}
                size={18}
                color={Theme.colors.neutral[0]}
              />
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
              color={Theme.colors.primary[500]}
              height={36}
              onSeek={async (p) => {
                if (Platform.OS !== 'web' && soundRef.current) {
                  try {
                    // Cast to access internal properties for seek functionality
                    const sound = soundRef.current as unknown as Audio.Sound & {
                      _durationMillis?: number;
                    };
                    const dur = sound._durationMillis ?? 0;
                    if (dur > 0) {
                      await soundRef.current.setPositionAsync(Math.round(p * dur));
                      setProgress(p);
                    }
                  } catch (err: unknown) {
                    const error = err instanceof Error ? err : new Error(String(err));
                    logger.error('Error seeking audio', { error });
                  }
                } else {
                  setProgress(p);
                }
              }}
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
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={18}
                color={Theme.colors.neutral[0]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              style={styles.actionBtn}
            >
              <Ionicons
                name="trash"
                size={18}
                color={Theme.colors.status.error}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={send}
              disabled={isSending || activeProcessing}
              style={styles.sendBtn}
            >
              <Ionicons
                name={isSending ? 'hourglass' : 'send'}
                size={18}
                color={
                  isSending || activeProcessing
                    ? Theme.colors.neutral[400]
                    : Theme.colors.status.success
                }
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

const styles = StyleSheet.create({
  container: { alignItems: 'stretch', padding: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  recordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Theme.colors.neutral[900],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  recordWrapActive: { backgroundColor: Theme.colors.neutral[800] },
  recordWrapCancel: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: Theme.colors.status.error,
  },
  recordButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lockButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { color: Theme.colors.neutral[300], fontWeight: '600' as const },
  hintActive: { color: Theme.colors.neutral[100] },
  hintCancel: { color: Theme.colors.status.error },
  previewCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
  },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dur: { color: Theme.colors.neutral[600], fontWeight: '600' as const },
  badges: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  actions: { marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.neutral[900],
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
  },
  transcript: {
    marginTop: 8,
    color: Theme.colors.neutral[700],
    fontSize: 12,
  },
  sending: { marginTop: 8, fontSize: 14, color: Theme.colors.neutral[500] },
});
