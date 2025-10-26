/**
 * Voice Note Recorder Component (ULTRA)
 * Advanced voice recording with native (expo-av) and web (MediaRecorder) support
 * 
 * Features:
 * - Press & hold to record
 * - Slide left to cancel
 * - Tap lock to keep recording hands-free
 * - Preview with waveform and playback
 * - Tap waveform to seek
 */

import React from "react";
import { chatService } from "../../services/chatService";
import { VoiceRecorderUltra } from "./VoiceRecorderUltra";

interface VoiceRecorderProps {
  matchId: string;
  onVoiceNoteSent?: () => void;
  disabled?: boolean;
  maxDurationSec?: number;
  minDurationSec?: number;
}

/**
 * Wrapper component that adapts VoiceRecorderUltra API to the existing interface
 */
export function VoiceRecorder({
  matchId,
  onVoiceNoteSent,
  disabled = false,
  maxDurationSec = 120,
  minDurationSec = 1,
}: VoiceRecorderProps): React.JSX.Element {
  return (
    <VoiceRecorderUltra
      matchId={matchId}
      onVoiceNoteSent={onVoiceNoteSent}
      disabled={disabled}
      maxDurationSec={maxDurationSec}
      minDurationSec={minDurationSec}
      chatService={chatService}
    />
  );
}
