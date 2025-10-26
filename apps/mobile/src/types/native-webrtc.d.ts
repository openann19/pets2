/**
 * Type definitions for React Native WebRTC
 * Extends native WebRTC types with RN-specific methods
 */

import type { MediaStreamTrack } from "react-native-webrtc";

/**
 * Extended MediaStreamTrack with React Native specific methods
 */
export interface MediaStreamTrackWithNativeMethods extends MediaStreamTrack {
  /**
   * Switch camera (front/back) on mobile devices
   * React Native WebRTC specific method
   */
  _switchCamera?: () => void;
}

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
export function hasNativeCameraSwitch(track: MediaStreamTrack): track is MediaStreamTrackWithNativeMethods {
  return '_switchCamera' in track && typeof (track as MediaStreamTrackWithNativeMethods)._switchCamera === 'function';
}

