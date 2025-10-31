/**
 * Cross-platform audio recorder adapter
 * Provides unified interface for web and native recording
 */

export interface RecorderOptions {
  sampleRate?: number;
  bitRate?: number;
  channels?: number;
}

export interface RecordingResult {
  uri?: string;
  blob?: Blob;
  duration: number;
  size: number;
}

export interface Recorder {
  start(options?: RecorderOptions): Promise<void>;
  stop(): Promise<RecordingResult>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  isRecording(): boolean;
  isSupported(): boolean;
  getDuration(): number;
}

// Platform-specific implementations will be imported based on file extension
export { createRecorder } from './Recorder.native.js';
