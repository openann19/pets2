/**
 * Voice Note Recorder Component - Platform-Specific Wrapper
 * 
 * Uses the new Ultra stack with platform-specific implementations:
 * - Web: VoiceRecorderUltraWeb (client-side DSP + Web Speech API)
 * - Native: VoiceRecorderUltraNative (Expo AV recording)
 * 
 * Features:
 * - Press & hold to record
 * - Slide left to cancel
 * - Tap lock to keep recording hands-free
 * - Preview with waveform and playback
 * - Web: Auto-trim silence + normalize + transcription
 */

import React from "react";
import { Platform } from "react-native";
import { chatService } from "../../services/chatService";
import VoiceRecorderUltraWeb from "../voice/VoiceRecorderUltra.web";
import VoiceRecorderUltraNative from "../voice/VoiceRecorderUltra.native";

interface VoiceRecorderProps {
  matchId: string;
  onVoiceNoteSent?: () => void;
  disabled?: boolean;
  maxDurationSec?: number;
  minDurationSec?: number;
}

/**
 * Platform-adaptive wrapper that selects the appropriate Ultra implementation
 */
export function VoiceRecorder({
  matchId,
  onVoiceNoteSent,
  disabled = false,
  maxDurationSec = 120,
  minDurationSec = 1,
}: VoiceRecorderProps): React.JSX.Element {
  // Platform-specific rendering
  if (Platform.OS === "web") {
    return (
      <VoiceRecorderUltraWeb
        matchId={matchId}
        sendVoiceNote={chatService.sendVoiceNote}
        disabled={disabled}
        maxDurationSec={maxDurationSec}
        minDurationSec={minDurationSec}
        processing={{
          autoTrimSilence: true,
          trimThresholdDb: -45,
          trimPaddingMs: 120,
          normalizeToLufs: -16,
        }}
        transcription={{
          enabled: true,
          interim: true,
        }}
        onVoiceNoteSent={onVoiceNoteSent}
      />
    );
  }

  // Native (iOS/Android)
  return (
    <VoiceRecorderUltraNative
      matchId={matchId}
      sendVoiceNote={chatService.sendVoiceNote}
      disabled={disabled}
      maxDurationSec={maxDurationSec}
      minDurationSec={minDurationSec}
      onVoiceNoteSent={onVoiceNoteSent}
    />
  );
}
