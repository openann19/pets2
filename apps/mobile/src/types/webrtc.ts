/**
 * WebRTC Type Definitions
 * Extends MediaStreamTrack to support camera switching
 */

export interface MediaStreamTrackWithCamera extends MediaStreamTrack {
  _switchCamera?: () => void;
}
