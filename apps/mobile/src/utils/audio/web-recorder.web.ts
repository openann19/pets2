/**
 * Web-only MediaRecorder utilities
 * Only imported on web platform via module suffix resolution
 */

export interface WebRecordingState {
  mediaRecorder: MediaRecorder;
  chunks: Blob[];
}

/**
 * Start recording audio using Web MediaRecorder API
 */
export async function startWebRecording(): Promise<WebRecordingState> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (evt) => {
    if (evt.data.size > 0) {
      chunks.push(evt.data);
    }
  };

  mediaRecorder.start();

  return { mediaRecorder, chunks };
}

/**
 * Stop recording and create Blob
 */
export function stopWebRecording(
  state: WebRecordingState,
): Promise<{ blob: Blob; uri: string }> {
  return new Promise((resolve) => {
    state.mediaRecorder.onstop = () => {
      const blob = new Blob(state.chunks, { type: 'audio/webm' });
      const uri = URL.createObjectURL(blob);
      // Stop all tracks
      state.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
      resolve({ blob, uri });
    };
    state.mediaRecorder.stop();
  });
}

/**
 * Stop recording immediately (cleanup)
 */
export function cleanupWebRecording(state: WebRecordingState): void {
  if (state.mediaRecorder.state === 'recording') {
    state.mediaRecorder.stop();
  }
  state.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
}

