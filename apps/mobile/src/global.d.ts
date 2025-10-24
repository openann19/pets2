/**
 * Global TypeScript Declarations for Mobile App
 * Provides type definitions for global variables and Jest testing environment
 */

declare global {
  // Development environment flag
  const __DEV__: boolean;

  // Node.js globals
  const process: {
    env: Record<string, string | undefined>;
  };

  // Jest globals
  const jest: {
    mock: (moduleName: string, factory?: () => unknown) => void;
    fn: (implementation?: (...args: unknown[]) => unknown) => jest.Mock;
    Mock: {
      new (): jest.Mock;
    };
  };

  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveStyle(css: string | Record<string, unknown>): R;
    }
  }

  // WebRTC types
  interface RTCSessionDescriptionInit {
    type: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp?: string;
  }

  interface RTCIceCandidateInit {
    candidate?: string;
    sdpMLineIndex?: number | null;
    sdpMid?: string | null;
    usernameFragment?: string | null;
  }

  interface RTCPeerConnectionIceEvent {
    candidate: RTCIceCandidateInit | null;
  }

  interface RTCTrackEvent {
    streams: MediaStream[];
    track: MediaStreamTrack;
    transceiver: RTCRtpTransceiver;
  }

  interface MediaStream {
    id: string;
    active: boolean;
    addTrack(track: MediaStreamTrack): void;
    removeTrack(track: MediaStreamTrack): void;
    getTracks(): MediaStreamTrack[];
    getAudioTracks(): MediaStreamTrack[];
    getVideoTracks(): MediaStreamTrack[];
  }

  interface MediaStreamTrack {
    id: string;
    kind: 'audio' | 'video';
    enabled: boolean;
    muted: boolean;
    readyState: 'live' | 'ended';
    stop(): void;
  }

  interface RTCPeerConnection {
    localDescription: RTCSessionDescriptionInit | null;
    remoteDescription: RTCSessionDescriptionInit | null;
    connectionState: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
    iceConnectionState: 'new' | 'checking' | 'connected' | 'completed' | 'failed' | 'disconnected' | 'closed';
    addTrack(track: MediaStreamTrack, stream: MediaStream): RTCRtpSender;
    removeTrack(sender: RTCRtpSender): void;
    createOffer(): Promise<RTCSessionDescriptionInit>;
    createAnswer(): Promise<RTCSessionDescriptionInit>;
    setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
    close(): void;
    onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null;
    ontrack: ((event: RTCTrackEvent) => void) | null;
    onconnectionstatechange: (() => void) | null;
  }

  interface RTCRtpSender {
    track: MediaStreamTrack | null;
  }

  interface RTCRtpTransceiver {
    direction: 'sendrecv' | 'sendonly' | 'recvonly' | 'inactive';
    currentDirection: 'sendrecv' | 'sendonly' | 'recvonly' | 'inactive' | null;
  }

  // React Native globals
  namespace NodeJS {
    interface Global {
      __DEV__: boolean;
    }
  }

  // Expo globals
  namespace Expo {
    interface Constants {
      expoVersion: string;
      nativeAppVersion: string | null;
      nativeBuildVersion: string | null;
      deviceName: string | null;
      deviceYearClass: number | null;
      isDevice: boolean;
      osName: string;
      osVersion: string;
      platform: {
        ios?: {
          buildNumber: string;
          platform: string;
          model: string;
          userInterfaceIdiom: string;
        };
        android?: {
          versionCode: number;
        };
      };
    }
  }
}

export {};
