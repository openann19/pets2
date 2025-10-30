/**
 * Hook for managing voice note sending/uploading
 * Handles upload to backend and sending via chat service
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export interface VoiceSendOptions {
  previewUri: string | null;
  processedUri: string | null;
  processedBlob: Blob | null;
  durationMs: number;
  minDurationSec?: number;
  backend: 'native' | 'web';
  matchId: string;
  chatService: {
    sendVoiceNote: (matchId: string, audioUri: string, duration?: number) => Promise<void>;
  };
  onSuccess?: () => void;
}

export interface UseVoiceSendReturn {
  isSending: boolean;
  send: () => Promise<void>;
}

export function useVoiceSend({
  previewUri,
  processedUri,
  processedBlob,
  durationMs,
  minDurationSec = 1,
  backend,
  matchId,
  chatService,
  onSuccess,
}: VoiceSendOptions): UseVoiceSendReturn {
  const [isSending, setIsSending] = useState(false);

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
        const { uploadAdapter } = await import('../../services/upload/index');
        const blobToUpload = processedBlob ?? (await (await fetch(previewUri)).blob());
        const tempUri = processedBlob ? previewUri : URL.createObjectURL(blobToUpload);

        const uploadResult = await uploadAdapter.uploadVideo({
          uri: tempUri,
          name: 'voice-note.webm',
          contentType: 'audio/webm',
        });

        await chatService.sendVoiceNote(matchId, uploadResult.url, seconds);
      } else {
        const { uploadAdapter } = await import('../../services/upload/index');
        const fileUri = processedUri || previewUri;

        const uploadResult = await uploadAdapter.uploadVideo({
          uri: fileUri,
          name: 'voice-note.m4a',
          contentType: 'audio/m4a',
        });

        await chatService.sendVoiceNote(matchId, uploadResult.url, seconds);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess?.();
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
    onSuccess,
    previewUri,
    processedBlob,
    processedUri,
  ]);

  return {
    isSending,
    send,
  };
}

