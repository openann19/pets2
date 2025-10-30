/**
 * Runtime exports for React Native WebRTC types
 * Re-exports from the .d.ts file for Jest compatibility
 */

import type { MediaStreamTrack } from 'react-native-webrtc';

/**
 * Extended MediaStreamTrack with React Native specific methods
 * Using intersection type instead of extends to avoid type conflicts
 */
export type MediaStreamTrackWithNativeMethods = MediaStreamTrack & {
  /**
   * Switch camera (front/back) on mobile devices
   * React Native WebRTC specific method
   */
  _switchCamera?: () => void;
};

/**
 * Extended RTCSessionDescription for React Native WebRTC compatibility
 */
export interface RTCSessionDescriptionNative extends RTCSessionDescriptionInit {
  type: RTCSdpType;
  sdp: string;
}

/**
 * Type guard to check if a MediaStreamTrack has native methods
 */
export function hasNativeCameraSwitch(
  track: MediaStreamTrack,
): track is MediaStreamTrackWithNativeMethods {
  return (
    track !== null &&
    '_switchCamera' in track &&
    typeof (track as MediaStreamTrackWithNativeMethods)._switchCamera === 'function'
  );
}
