/**
 * Hook for managing voice recording state and operations
 * Handles both native (Expo AV) and web (MediaRecorder) recording backends
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import {
  startWebRecording,
  stopWebRecording,
  cleanupWebRecording,
  type WebRecordingState,
} from '../../utils/audio/web-recorder';

type RecBackend = 'native' | 'web';

export interface UseVoiceRecordingOptions {
  backend: RecBackend;
  disabled?: boolean;
  maxDurationSec?: number;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export interface UseVoiceRecordingReturn {
  isRecording: boolean;
  durationMs: number;
  previewUri: string | null;
  processedBlob: Blob | null; // web only
  startRecording: () => Promise<void>;
  stopRecording: (silent?: boolean) => Promise<void>;
  cancelRecording: () => void;
  reset: () => void;
}

export function useVoiceRecording({
  backend,
  disabled = false,
  maxDurationSec = 120,
  onRecordingStateChange,
}: UseVoiceRecordingOptions): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  // Native recording ref
  const recordingRef = useRef<Audio.Recording | null>(null);
  // Web recording ref
  const webRecordingStateRef = useRef<WebRecordingState | null>(null);
  const durationTimer = useRef<NodeJS.Timeout | null>(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
        durationTimer.current = null;
      }
      if (webRecordingStateRef.current) {
        cleanupWebRecording(webRecordingStateRef.current);
        webRecordingStateRef.current = null;
      }
      if (recordingRef.current) {
        void recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  // Notify parent of recording state changes
  useEffect(() => {
    onRecordingStateChange?.(isRecording);
  }, [isRecording, onRecordingStateChange]);

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
    } else if (backend === 'web' && webRecordingStateRef.current) {
      try {
        const { blob, uri } = await stopWebRecording(webRecordingStateRef.current);
        setPreviewUri(uri);
        setProcessedBlob(blob);
        webRecordingStateRef.current = null;
        if (durationTimer.current) {
          clearInterval(durationTimer.current);
          durationTimer.current = null;
        }
      } catch {
        /* ignore */
      }
    }
  }, [backend]);

  const startRecording = useCallback(async () => {
    if (disabled || isRecording) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPreviewUri(null);
    setProcessedBlob(null);
    setDurationMs(0);

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
        await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets['HIGH_QUALITY']);
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
        const state = await startWebRecording();
        webRecordingStateRef.current = state;
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
        const state = webRecordingStateRef.current;
        if (state) {
          const { blob, uri } = await stopWebRecording(state);
          setPreviewUri(uri);
          setProcessedBlob(blob);
          webRecordingStateRef.current = null;
        }
        if (durationTimer.current) {
          clearInterval(durationTimer.current);
          durationTimer.current = null;
        }
        if (!silent) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [backend, isRecording],
  );

  const cancelRecording = useCallback(() => {
    setIsRecording(false);
    if (webRecordingStateRef.current) {
      cleanupWebRecording(webRecordingStateRef.current);
      webRecordingStateRef.current = null;
    }
    if (recordingRef.current) {
      void recordingRef.current.stopAndUnloadAsync();
    }
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
    setPreviewUri(null);
    setProcessedBlob(null);
    setDurationMs(0);
  }, []);

  const reset = useCallback(() => {
    setPreviewUri(null);
    setProcessedBlob(null);
    setDurationMs(0);
  }, []);

  return {
    isRecording,
    durationMs,
    previewUri,
    processedBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}
