/**
 * Hook for managing voice audio processing (trim, normalize, transcription)
 * Handles both web (local processing) and native (server-side processing)
 */

import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  canProcessOnWeb,
  processAudioWeb,
  type WebProcessingReport,
} from '../../utils/audio/web-processing.web';
import { generateWaveformFromAudio } from '../../components/chat/VoiceWaveform';

type RecBackend = 'native' | 'web';

export interface VoiceProcessingOptions {
  autoTrimSilence?: boolean;
  trimThresholdDb?: number;
  trimPaddingMs?: number;
  normalizeToLufs?: number;
}

export interface VoiceProcessingService {
  trimAndNormalize: (
    uri: string,
    opts: {
      trimThresholdDb: number;
      trimPaddingMs: number;
      targetLufs: number;
    },
  ) => Promise<{ uri: string; report: WebProcessingReport }>;
}

export interface TranscribeService {
  transcribe: (input: { blob?: unknown; uri?: string }) => Promise<string>;
}

export interface UseVoiceProcessingOptions {
  backend: RecBackend;
  previewUri: string | null;
  processedBlob: Blob | null; // web only
  processing?: VoiceProcessingOptions | undefined;
  voiceProcessingService?: VoiceProcessingService | null;
  transcribeService?: TranscribeService | null;
}

export interface UseVoiceProcessingReturn {
  processedUri: string | null;
  processingReport: WebProcessingReport | null;
  waveform: number[];
  transcript: string;
  isProcessingAudio: boolean;
  isTranscribing: boolean;
  reset: () => void;
}

export function useVoiceProcessing({
  backend,
  previewUri,
  processedBlob,
  processing,
  voiceProcessingService = null,
  transcribeService = null,
}: UseVoiceProcessingOptions): UseVoiceProcessingReturn {
  const [processedUri, setProcessedUri] = useState<string | null>(null);
  const [processingReport, setProcessingReport] = useState<WebProcessingReport | null>(null);
  const [waveform, setWaveform] = useState<number[]>(() =>
    generateWaveformFromAudio(new ArrayBuffer(0), 64),
  );
  const [transcript, setTranscript] = useState<string>('');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const reset = useCallback(() => {
    setProcessedUri(null);
    setProcessingReport(null);
    setTranscript('');
    setWaveform(generateWaveformFromAudio(new ArrayBuffer(0), 64));
  }, []);

  useEffect(() => {
    const opts = {
      autoTrimSilence: processing?.autoTrimSilence ?? true,
      trimThresholdDb: processing?.trimThresholdDb ?? -45,
      trimPaddingMs: processing?.trimPaddingMs ?? 120,
      normalizeToLufs: processing?.normalizeToLufs ?? -16,
    };

    (async () => {
      if (!previewUri) return;

      // Generate a pleasant pseudo-waveform regardless
      setWaveform(generateWaveformFromAudio(new ArrayBuffer(0), 64));

      // Web processing (local)
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
          setProcessedUri(nextUrl); // processed URL for playback
          setProcessingReport(report);
        } catch {
          // silent fail -> just keep original
        } finally {
          setIsProcessingAudio(false);
        }
      }

      // Native/server processing
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

      // Transcription (both platforms)
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

  return {
    processedUri,
    processingReport,
    waveform,
    transcript,
    isProcessingAudio,
    isTranscribing,
    reset,
  };
}
