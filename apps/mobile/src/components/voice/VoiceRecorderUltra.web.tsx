import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { VoiceWaveform, generateWaveformFromAudio } from "../chat/VoiceWaveform";
import { useTheme } from "@/theme";
import { canProcessOnWeb, processAudioWeb } from "../../utils/audio/web-processing";
import type { WebProcessingReport } from "../../utils/audio/web-processing";
import { TranscriptionBadge } from "../chat/TranscriptionBadge";

type SendFn =
  | ((matchId: string, file: Blob, extras?: { transcript?: string }) => Promise<void>)
  | ((matchId: string, data: FormData) => Promise<void>);

interface Props {
  matchId: string;
  sendVoiceNote: SendFn; // your real sender (no placeholders)
  disabled?: boolean;
  maxDurationSec?: number;
  minDurationSec?: number;
  processing?: {
    autoTrimSilence?: boolean;    // default true
    trimThresholdDb?: number;     // default -45
    trimPaddingMs?: number;       // default 120
    normalizeToLufs?: number;     // default -16 (approx via dBFS)
  };
  transcription?: {
    enabled?: boolean;            // default true
    interim?: boolean;            // default true
    language?: string;            // default browser default
  };
  onVoiceNoteSent?: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export default function VoiceRecorderUltraWeb({
  matchId,
  sendVoiceNote,
  disabled = false,
  maxDurationSec = 120,
  minDurationSec = 1,
  processing,
  transcription,
  onVoiceNoteSent,
}: Props): React.JSX.Element {
  const theme = useTheme();
  // UI + state
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const [durationMs, setDurationMs] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlayingSim, setIsPlayingSim] = useState(false);

  const [rawBlob, setRawBlob] = useState<Blob | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingReport, setProcessingReport] = useState<WebProcessingReport | null>(null);

  const [waveform, setWaveform] = useState<number[]>(() => generateWaveformFromAudio(new ArrayBuffer(0), 64));
  const [transcript, setTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durTimerRef = useRef<NodeJS.Timeout | null>(null);

  // SpeechRecognition - Web-only API, properly fenced for mobile
  const SpeechRecognition =
    typeof window !== "undefined"
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : undefined;
  const recogRef = useRef<any>(null);
  const recogEnabled = (transcription?.enabled ?? true) && !!SpeechRecognition;

  // slide-to-cancel
  const CANCEL_THRESHOLD = 80;
  const panState = useRef({ dx: 0 });
  const handleCancelRef = useRef<() => void>();
  const stopRecordingRef = useRef<(_?: boolean) => void>();
  
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
            handleCancelRef.current?.();
          } else if (!isLocked) {
            if (isRecording) stopRecordingRef.current?.();
          }
          setIsCancelling(false);
        },
      }),
    [isLocked, isRecording],
  );

  useEffect(() => {
    return () => {
      if (durTimerRef.current) clearInterval(durTimerRef.current);
      stopRecordingRef.current?.(true);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fmt = (ms: number) => {
    const s = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // --- Recording handlers
  const stopRecording = useCallback((silent = false) => {
    if (!isRecording) return;
    setIsRecording(false);

    const mr = mediaRecorderRef.current;
    if (mr?.state === "recording") {
      mr.stop();
      mr.stream.getTracks().forEach((t) => { t.stop(); });
    }
    mediaRecorderRef.current = null;
    if (durTimerRef.current) {
      clearInterval(durTimerRef.current);
      durTimerRef.current = null;
    }
    if (!silent) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isRecording]);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      setTranscript("");
      setProcessingReport(null);
      setDurationMs(0);
      setProgress(0);

      mr.ondataavailable = (evt) => {
        if (evt.data.size > 0) chunksRef.current.push(evt.data);
      };

      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const url = URL.createObjectURL(blob);
        setRawBlob(blob);
        setProcessedBlob(null);
        setPreviewUrl(url);

        // baseline waveform (mock pleasant)
        setWaveform(generateWaveformFromAudio(await blob.arrayBuffer(), 64));

        // post-processing (trim + normalize)
        const opts = {
          autoTrimSilence: processing?.autoTrimSilence ?? true,
          trimThresholdDb: processing?.trimThresholdDb ?? -45,
          trimPaddingMs: processing?.trimPaddingMs ?? 120,
          normalizeToLufs: processing?.normalizeToLufs ?? -16,
        };

        if (canProcessOnWeb() && (opts.autoTrimSilence || Number.isFinite(opts.normalizeToLufs))) {
          try {
            setIsProcessingAudio(true);
            const { blob: out, report } = await processAudioWeb(blob, {
              trimThresholdDb: opts.trimThresholdDb,
              trimPaddingMs: opts.trimPaddingMs,
              normalizeToLufs: opts.normalizeToLufs,
            });
            setProcessedBlob(out);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(out));
            setProcessingReport(report);
          } catch {
            // keep original if processing fails
            setProcessedBlob(null);
          } finally {
            setIsProcessingAudio(false);
          }
        }

        // stop speech recognition
        if (recogEnabled && recogRef.current) {
          try {
            recogRef.current.stop();
          } catch {/* ignore */}
        }
      };

      // kick timers
      durTimerRef.current = setInterval(() => {
        setDurationMs((p) => {
          const next = p + 1000;
          if (next / 1000 >= maxDurationSec) {
            stopRecording();
          }
          return next;
        });
      }, 1000);

      mr.start();
      setIsRecording(true);

      // start speech recognition (parallel)
      if (recogEnabled) {
        try {
          const recog = new SpeechRecognition();
          recogRef.current = recog;
          recog.lang = transcription?.language || undefined;
          recog.interimResults = transcription?.interim ?? true;
          recog.continuous = true;

          let finalText = "";
          recog.onresult = (e: any) => {
            let interim = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
              const res = e.results[i];
              if (res.isFinal) finalText += res[0].transcript;
              else interim += res[0].transcript;
            }
            setTranscript((finalText + " " + interim).trim());
          };
          recog.onerror = () => {};
          recog.onend = () => {};
          recog.start();
        } catch {
          // If browser blocks mic for SR, we still have audio.
        }
      }
    } catch {
      Alert.alert("Permission needed", "Microphone access is required.");
    }
  }, [disabled, isRecording, maxDurationSec, recogEnabled, transcription?.language, transcription?.interim, processing, stopRecording]);

  const handleCancel = useCallback(() => {
    stopRecording(true);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setRawBlob(null);
    setProcessedBlob(null);
    setProcessingReport(null);
    setTranscript("");
    setDurationMs(0);
    setProgress(0);
  }, [stopRecording, previewUrl]);

  useEffect(() => {
    handleCancelRef.current = handleCancel;
  }, [handleCancel]);

  const toggleLock = useCallback(() => {
    if (!isRecording) return;
    Haptics.selectionAsync();
    setIsLocked((v) => !v);
  }, [isRecording]);

  // simple simulated playback progress (we don't reimplement an <audio> UI)
  const playPause = () => {
    if (!previewUrl) return;
    if (isPlayingSim) {
      setIsPlayingSim(false);
      setProgress(0);
      return;
    }
    setIsPlayingSim(true);
    const total = Math.max(1000, durationMs);
    const start = Date.now();
    const tick = () => {
      if (!isPlayingSim) return;
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / total);
      setProgress(p);
      if (p >= 1) {
        setIsPlayingSim(false);
        setProgress(0);
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  const send = useCallback(async () => {
    if (!previewUrl || isSending) return;

    const secs = Math.max(1, Math.round(durationMs / 1000));
    if (secs < minDurationSec) {
      Alert.alert("Too short", `Record at least ${minDurationSec}s.`);
      return;
    }
    setIsSending(true);
    try {
      const blob = processedBlob ?? rawBlob!;
      // Two common variants supported:
      if (sendVoiceNote.length === 3) {
        // (matchId, blob, { transcript })
        await (sendVoiceNote as any)(matchId, blob, { transcript: transcript || undefined });
      } else {
        // (matchId, formData)
        const form = new FormData();
        form.append("file", blob, "voice-note.wav"); // processed is WAV
        if (transcript) form.append("transcript", transcript);
        await (sendVoiceNote as any)(matchId, form);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleCancel();
      onVoiceNoteSent?.();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to send voice note. Please try again.");
    } finally {
      setIsSending(false);
    }
  }, [previewUrl, isSending, durationMs, minDurationSec, processedBlob, rawBlob, transcript, sendVoiceNote, matchId, onVoiceNoteSent]);

  const activeProcessing = isProcessingAudio || isTranscribing;

  return (
    <View style={styles.wrap}>
      {/* Record row */}
      <View style={styles.row}>
        <View
          {...panResponder.panHandlers}
          style={[
            styles.recWrap,
            isRecording && styles.recWrapActive,
            isCancelling && styles.recWrapCancel,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => (!disabled && !isRecording ? startRecording() : null)}
            onPressOut={() => (isRecording && !isLocked ? stopRecording() : null)}
            disabled={disabled}
            style={styles.recBtn}
          >
            <Ionicons name={isRecording ? "stop" : "mic"} size={22} color={theme.colors.onPrimary} />
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
                ? "Release to cancel"
                : isLocked
                  ? `Tap lock to unlock • ${fmt(durationMs)}`
                  : `Slide ← to cancel • ${fmt(durationMs)}`
              : "Hold to record"}
          </Text>

          {isRecording && (
            <TouchableOpacity onPress={toggleLock} style={styles.lockBtn}>
              <Ionicons name={isLocked ? "lock-closed" : "lock-open"} size={18} color={theme.colors.onPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Preview card */}
      {previewUrl && !isRecording && (
        <View style={styles.card}>
          <View style={styles.waveRow}>
            <VoiceWaveform
              waveform={waveform}
              isPlaying={isPlayingSim}
              progress={progress}
              duration={Math.max(1, Math.round(durationMs / 1000))}
              color={theme.colors.primary}
            height={36}
            />
            <Text style={styles.dur}>{fmt(durationMs)}</Text>
          </View>

          {/* badges */}
          <View style={styles.badges}>
            {processingReport?.trim?.didTrim && (
              <TranscriptionBadge icon="cut" label={`Trimmed ${Math.round(processingReport.trim.msRemoved)}ms`} />
            )}
            {processingReport?.normalize && (
              <TranscriptionBadge
                icon="analytics"
                label={`Normalized → ${processingReport.normalize.targetLufs} LUFS`}
              />
            )}
            {activeProcessing && <TranscriptionBadge icon="sparkles" label="Enhancing…" />}
            {!!transcript && <TranscriptionBadge icon="text" label="Transcript ready" />}
          </View>

          {/* controls */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={playPause} style={styles.actionBtn}>
              <Ionicons name={isPlayingSim ? "pause" : "play"} size={18} color={theme.colors.onPrimary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCancel} style={styles.actionBtn}>
              <Ionicons name="trash" size={18} color={theme.colors.danger} />
            </TouchableOpacity>

            <TouchableOpacity onPress={send} disabled={isSending || activeProcessing} style={styles.sendBtn}>
              <Ionicons
                name={isSending ? "hourglass" : "send"}
                size={18}
                color={isSending || activeProcessing ? theme.palette.neutral[400] : theme.colors.success}
              />
            </TouchableOpacity>
          </View>

          {/* 1-line transcript */}
          {!!transcript && (
            <Text numberOfLines={1} style={styles.transcript}>
              {transcript}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "stretch", padding: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  recWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Theme.colors.neutral[900],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  recWrapActive: { backgroundColor: Theme.colors.neutral[800] },
  recWrapCancel: { backgroundColor: "rgba(239, 68, 68, 0.15)", borderWidth: 1, borderColor: theme.colors.danger },
  recBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: theme.colors.danger,
    alignItems: "center", justifyContent: "center",
    shadowColor: Theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  lockBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  hint: { color: Theme.colors.neutral[300], fontWeight: "600" as const },
  hintActive: { color: Theme.colors.neutral[100] },
  hintCancel: { color: theme.colors.danger },
  card: { marginTop: 12, padding: 12, backgroundColor: "rgba(0,0,0,0.08)", borderRadius: 12 },
  waveRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dur: { color: Theme.colors.neutral[600], fontWeight: "600" as const },
  badges: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  actions: { marginTop: 10, flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  actionBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: Theme.colors.neutral[900],
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#D1FAE5",
  },
  transcript: { marginTop: 8, color: Theme.colors.neutral[700], fontSize: 12 },
});

