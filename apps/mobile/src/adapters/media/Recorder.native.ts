/**
 * Native audio recorder implementation using Expo AV
 */

import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

interface RecorderOptions {
  sampleRate?: number;
  bitRate?: number;
  channels?: number;
}

interface RecordingResult {
  uri: string | null;
  blob?: Blob;
  duration: number;
  size: number;
}

interface Recorder {
  start(options?: RecorderOptions): Promise<void>;
  stop(): Promise<RecordingResult>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  isRecording(): boolean;
  isSupported(): boolean;
  getDuration(): Promise<number>;
}

export const createRecorder = (): Recorder => {
  let recording: Audio.Recording | null = null;
  let startTime = 0;
  let pausedTime = 0;

  return {
    async start(options?: RecorderOptions): Promise<void> {
      if (recording) {
        throw new Error('Recording already in progress');
      }

      // Request permissions
      // Audio.requestPermissionsAsync returns { status: 'granted' | 'undetermined' | 'denied', ... }
      // Type is complex from expo-av - using eslint-disable with runtime validation
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const permissionResult = await Audio.requestPermissionsAsync();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!permissionResult || permissionResult.status !== 'granted') {
        throw new Error('Audio recording permission denied');
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });

      // Create recording with options
      // Use HIGH_QUALITY preset as base and override with custom options if provided
      const basePreset = Audio.RecordingOptionsPresets['HIGH_QUALITY'];
      if (!basePreset) {
        throw new Error('HIGH_QUALITY recording preset not available');
      }
      const recordingOptions: Audio.RecordingOptions = {
        ...basePreset,
        android: {
          ...basePreset.android,
          ...(options?.sampleRate !== undefined && { sampleRate: options.sampleRate }),
          ...(options?.channels !== undefined && { numberOfChannels: options.channels }),
          ...(options?.bitRate !== undefined && { bitRate: options.bitRate }),
        },
        ios: {
          ...basePreset.ios,
          ...(options?.sampleRate !== undefined && { sampleRate: options.sampleRate }),
          ...(options?.channels !== undefined && { numberOfChannels: options.channels }),
          ...(options?.bitRate !== undefined && { bitRate: options.bitRate }),
        },
      };

      recording = new Audio.Recording();
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      startTime = Date.now();
    },

    async stop(): Promise<RecordingResult> {
      if (!recording) {
        throw new Error('No recording in progress');
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      const duration = status.durationMillis ?? (Date.now() - startTime - pausedTime);
      // Note: RecordingStatus doesn't have a size property in Expo AV
      // We'll use 0 as default since size isn't available in the status
      const size = 0;

      const result: RecordingResult = {
        uri: uri ?? null,
        duration: duration / 1000, // Convert to seconds
        size,
      };

      recording = null;
      startTime = 0;
      pausedTime = 0;

      return result;
    },

    async pause(): Promise<void> {
      if (!recording) {
        throw new Error('No recording in progress');
      }

      await recording.pauseAsync();
      pausedTime += Date.now() - startTime;
    },

    async resume(): Promise<void> {
      if (!recording) {
        throw new Error('No recording in progress');
      }

      await recording.startAsync();
      startTime = Date.now();
    },

    isRecording(): boolean {
      return recording !== null && recording._isDoneRecording === false;
    },

    isSupported(): boolean {
      return true; // Expo AV is supported on mobile platforms
    },

    async getDuration(): Promise<number> {
      if (!recording) return 0;
      const status = await recording.getStatusAsync();
      return (status.durationMillis ?? 0) / 1000;
    },
  };
};