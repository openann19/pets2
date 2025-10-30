/**
 * Native-only recording utilities
 * Stub implementation for native platform
 */

export interface WebRecordingState {
  mediaRecorder: never;
  chunks: never[];
}

/**
 * Stub - should not be called on native
 */
export async function startWebRecording(): Promise<WebRecordingState> {
  throw new Error('startWebRecording is web-only');
}

/**
 * Stub - should not be called on native
 */
export function stopWebRecording(_state: WebRecordingState): Promise<{ blob: never; uri: never }> {
  throw new Error('stopWebRecording is web-only');
}

/**
 * Stub - should not be called on native
 */
export function cleanupWebRecording(_state: WebRecordingState): void {
  // No-op on native
}

