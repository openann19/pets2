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

import React, { useCallback } from 'react';
import { Platform } from 'react-native';
import { chatService } from '../../services/chatService';
import VoiceRecorderUltraWeb from '../voice/VoiceRecorderUltra.web';
import VoiceRecorderUltraNative from '../voice/VoiceRecorderUltra.native';

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
  // Web-specific wrapper that adapts chatService.sendVoiceNote to SendFn signature
  const webSendVoiceNote = useCallback(
    async (matchIdParam: string, fileOrForm: Blob | FormData, extras?: { transcript?: string }) => {
      // Convert Blob or FormData to a temporary URI for chatService
      // This is a shim - in production, chatService should accept Blob/FormData directly
      if (fileOrForm instanceof Blob) {
        // For web, we need to create a temporary object URL
        const objectUrl = URL.createObjectURL(fileOrForm);
        try {
          // Get duration from extras if available, or estimate
          const duration = extras?.transcript ? 0 : 0; // Placeholder - would need actual duration
          await chatService.sendVoiceNote(matchIdParam, objectUrl, duration);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      } else if (fileOrForm instanceof FormData) {
        // For FormData, extract the file and create object URL
        const file = fileOrForm.get('file') as File | null;
        if (file) {
          const objectUrl = URL.createObjectURL(file);
          try {
            await chatService.sendVoiceNote(matchIdParam, objectUrl);
          } finally {
            URL.revokeObjectURL(objectUrl);
          }
        }
      }
    },
    []
  );

  // Platform-specific rendering
  if (Platform.OS === 'web') {
    return (
      <VoiceRecorderUltraWeb
        matchId={matchId}
        sendVoiceNote={webSendVoiceNote}
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
        {...(onVoiceNoteSent !== undefined ? { onVoiceNoteSent } : {})}
      />
    );
  }

  // Native (iOS/Android) - chatService.sendVoiceNote already accepts FormData
  const nativeSendVoiceNote = useCallback(
    async (matchIdParam: string, formData: FormData) => {
      // Extract audioUri from FormData for chatService
      const file = formData.get('file') as File | null;
      if (file) {
        // For native, we need to convert File to URI
        // This is a limitation - chatService should accept FormData directly
        // For now, create a temporary object URL
        const objectUrl = URL.createObjectURL(file);
        try {
          await chatService.sendVoiceNote(matchIdParam, objectUrl);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      }
    },
    []
  );

  return (
    <VoiceRecorderUltraNative
      matchId={matchId}
      sendVoiceNote={nativeSendVoiceNote}
      disabled={disabled}
      maxDurationSec={maxDurationSec}
      minDurationSec={minDurationSec}
      {...(onVoiceNoteSent !== undefined ? { onVoiceNoteSent } : {})}
    />
  );
}
