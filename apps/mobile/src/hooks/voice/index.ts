/**
 * Barrel export for voice recording hooks
 */

export { useVoiceRecording } from './useVoiceRecording';
export type { UseVoiceRecordingOptions, UseVoiceRecordingReturn } from './useVoiceRecording';

export { useVoicePlayback } from './useVoicePlayback';
export type { UseVoicePlaybackOptions, UseVoicePlaybackReturn } from './useVoicePlayback';

export { useVoiceProcessing } from './useVoiceProcessing';
export type {
  UseVoiceProcessingOptions,
  UseVoiceProcessingReturn,
  VoiceProcessingOptions,
  VoiceProcessingService,
  TranscribeService,
} from './useVoiceProcessing';

export { useSlideToCancel } from './useSlideToCancel';
export type { UseSlideToCancelOptions, UseSlideToCancelReturn } from './useSlideToCancel';

export { useVoiceSend } from './useVoiceSend';
export type { VoiceSendOptions, UseVoiceSendReturn } from './useVoiceSend';
