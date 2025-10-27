import React, { useMemo, useRef, useState } from "react";
import { Alert, PanResponder, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "../../theme/unified-theme";
import { VoiceWaveform, generateWaveformFromAudio } from "../chat/VoiceWaveform";

type SendFn = (matchId: string, form: FormData) => Promise<void>;

interface Props {
  matchId: string;
  sendVoiceNote: SendFn;  // real sender, no placeholders
  disabled?: boolean;
  maxDurationSec?: number;
  minDurationSec?: number;
  onVoiceNoteSent?: () => void;
}

export default function VoiceRecorderUltraNative({
  matchId,
  sendVoiceNote,
  disabled = false,
  maxDurationSec = 120,
  minDurationSec = 1,
  onVoiceNoteSent,
}: Props): React.JSX.Element {
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [waveform] = useState<number[]>(() => generateWaveformFromAudio(new ArrayBuffer(0), 64));

  const recRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const CANCEL_THRESHOLD = 80;
  const panState = useRef({ dx: 0 });
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
            handleCancel();
          } else if (!isLocked) {
            if (isRecording) stopRecording();
          }
          setIsCancelling(false);
        },
      }),
    [isLocked, isRecording],
  );

  const fmt = (ms: number) => {
    const s = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const startRecording = async () => {
    if (disabled || isRecording) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission needed", "Microphone access is required.");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      rec.setOnRecordingStatusUpdate((s) => {
        if (s.isRecording) setDurationMs(s.durationMillis ?? 0);
        if ((s.durationMillis ?? 0) / 1000 >= maxDurationSec) stopRecording();
      });
      await rec.startAsync();
      recRef.current = rec;

      setPreviewUri(null);
      setIsRecording(true);
    } catch {
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    try {
      const rec = recRef.current;
      if (!rec) return;
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recRef.current = null;
      if (uri) setPreviewUri(uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {/* ignore */}
    setIsRecording(false);
  };

  const handleCancel = () => {
    if (recRef.current) {
      try { recRef.current.stopAndUnloadAsync(); } catch {/* ignore */}
      recRef.current = null;
    }
    setPreviewUri(null);
    setDurationMs(0);
    setProgress(0);
    setIsRecording(false);
  };

  const toggleLock = () => {
    if (!isRecording) return;
    Haptics.selectionAsync();
    setIsLocked((v) => !v);
  };

  const unloadSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current.setOnPlaybackStatusUpdate(null);
      soundRef.current = null;
    }
  };

  const playPause = async () => {
    if (!previewUri) return;
    if (isPlaying) {
      if (soundRef.current) await soundRef.current.stopAsync();
      setIsPlaying(false);
      setProgress(0);
      return;
    }
    try {
      await unloadSound();
      const { sound } = await Audio.Sound.createAsync(
        { uri: previewUri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          const dur = status.durationMillis ?? 1;
          const pos = status.positionMillis ?? 0;
          setProgress(Math.min(1, pos / dur));
          setIsPlaying(status.isPlaying ?? false);
          if (status.didJustFinish) {
            setIsPlaying(false);
            setProgress(0);
          }
        }
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch {
      Alert.alert("Playback error", "Could not play the recording.");
    }
  };

  const send = async () => {
    if (!previewUri || isSending) return;
    const secs = Math.max(1, Math.round(durationMs / 1000));
    if (secs < minDurationSec) {
      Alert.alert("Too short", `Record at least ${minDurationSec}s.`);
      return;
    }
    setIsSending(true);
    try {
      const form = new FormData();
      // RN/Expo needs file-like object with uri/name/type
      form.append("file", {
        uri: previewUri,
        name: "voice-note.m4a",
        type: Platform.select({ ios: "audio/m4a", android: "audio/m4a", default: "audio/m4a" }),
      } as any);
      await sendVoiceNote(matchId, form);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleCancel();
      onVoiceNoteSent?.();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to send voice note. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.wrap}>
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
            <Ionicons name={isRecording ? "stop" : "mic"} size={22} color={Theme.colors.neutral[0}]}} />
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
              <Ionicons name={isLocked ? "lock-closed" : "lock-open"} size={18} color={Theme.colors.neutral[0}]}} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {previewUri && !isRecording && (
        <View style={styles.card}>
          <View style={styles.waveRow}>
            <VoiceWaveform
              waveform={waveform}
              isPlaying={isPlaying}
              progress={progress}
              duration={Math.max(1, Math.round(durationMs / 1000))}
              color={Theme.colors.primary[500}]}
              height={36}
            />
            <Text style={styles.dur}>{fmt(durationMs)}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={playPause} style={styles.actionBtn}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={18} color={Theme.colors.neutral[0}]}} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCancel} style={styles.actionBtn}>
              <Ionicons name="trash" size={18} color={Theme.colors.status.erro}r}} />
            </TouchableOpacity>

            <TouchableOpacity onPress={send} disabled={isSending} style={styles.sendBtn}>
              <Ionicons
                name={isSending ? "hourglass" : "send"}
                size={18}
                color={isSending ? Theme.colors.neutral[400] : Theme.colors.status.success}
              />
            </TouchableOpacity>
          </View>
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
  recWrapCancel: { backgroundColor: "rgba(239, 68, 68, 0.15)", borderWidth: 1, borderColor: Theme.colors.status.error },
  recBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Theme.colors.status.error,
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
  hintCancel: { color: Theme.colors.status.error },
  card: { marginTop: 12, padding: 12, backgroundColor: "rgba(0,0,0,0.08)", borderRadius: 12 },
  waveRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dur: { color: Theme.colors.neutral[600], fontWeight: "600" as const },
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
});

