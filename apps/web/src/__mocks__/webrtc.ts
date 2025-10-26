/**
 * WebRTC Mock for testing
 */

import { jest } from '@jest/globals';

// Mock MediaStream class
export class MockMediaStream {
  videoTracks: MockMediaStreamTrack[];
  audioTracks: MockMediaStreamTrack[];

  constructor(tracks?: MockMediaStreamTrack[]) {
    this.videoTracks = [];
    this.audioTracks = [];

    if (tracks) {
      tracks.forEach((track: MockMediaStreamTrack) => {
        if (track.kind === 'video') {
          this.videoTracks.push(track);
        } else if (track.kind === 'audio') {
          this.audioTracks.push(track);
        }
      });
    }
  }

  getVideoTracks(): MockMediaStreamTrack[] {
    return this.videoTracks;
  }

  getAudioTracks(): MockMediaStreamTrack[] {
    return this.audioTracks;
  }

  getTracks(): MockMediaStreamTrack[] {
    return [...this.videoTracks, ...this.audioTracks];
  }

  addTrack(track: MockMediaStreamTrack): void {
    if (track.kind === 'video') {
      this.videoTracks.push(track);
    } else if (track.kind === 'audio') {
      this.audioTracks.push(track);
    }
  }

  removeTrack(track: MockMediaStreamTrack): void {
    if (track.kind === 'video') {
      this.videoTracks = this.videoTracks.filter((t) => t !== track);
    } else if (track.kind === 'audio') {
      this.audioTracks = this.audioTracks.filter((t) => t !== track);
    }
  }
}

// Mock MediaStreamTrack class
export class MockMediaStreamTrack {
  kind: string;
  id: string;
  enabled: boolean;
  muted: boolean;
  readyState: string;
  onended: (() => void) | null;
  onmute: (() => void) | null;
  onunmute: (() => void) | null;

  constructor(kind: string) {
    this.kind = kind;
    this.id = Math.random().toString(36).substring(2, 15);
    this.enabled = true;
    this.muted = false;
    this.readyState = 'live';
    this.onended = null;
    this.onmute = null;
    this.onunmute = null;
  }

  stop(): void {
    this.readyState = 'ended';
    if (this.onended) {
      this.onended();
    }
  }

  clone(): MockMediaStreamTrack {
    const clone = new MockMediaStreamTrack(this.kind);
    clone.enabled = this.enabled;
    clone.muted = this.muted;
    clone.readyState = this.readyState;
    return clone;
  }
}

interface RTCRtpSender {
  track: MockMediaStreamTrack | null;
  replaceTrack: (track: MockMediaStreamTrack | null) => Promise<void>;
}

interface RTCRtpReceiver {
  track: MockMediaStreamTrack;
}

interface RTCRtpTransceiver {
  track: MockMediaStreamTrack | null;
  receiver: RTCRtpReceiver;
  sender: RTCRtpSender;
}

interface RTCTrackEvent {
  track: MockMediaStreamTrack;
  streams: MockMediaStream[];
}

// Mock RTCPeerConnection class
export class MockRTCPeerConnection {
  localDescription: RTCSessionDescriptionInit | null;
  remoteDescription: RTCSessionDescriptionInit | null;
  signalingState: string;
  iceConnectionState: string;
  iceGatheringState: string;
  connectionState: string;
  onicecandidate: ((event: RTCPeerConnectionIceEvent) => void) | null;
  ontrack: ((event: RTCTrackEvent) => void) | null;
  oniceconnectionstatechange: (() => void) | null;
  onsignalingstatechange: (() => void) | null;
  onconnectionstatechange: (() => void) | null;
  onicegatheringstatechange: (() => void) | null;
  onicecandidateerror: ((event: Event) => void) | null;
  onnegotiationneeded: (() => void) | null;
  ondatachannel: ((event: RTCDataChannelEvent) => void) | null;

  constructor(_configuration?: RTCConfiguration) {
    this.localDescription = null;
    this.remoteDescription = null;
    this.signalingState = 'stable';
    this.iceConnectionState = 'new';
    this.iceGatheringState = 'new';
    this.connectionState = 'new';
    this.onicecandidate = null;
    this.ontrack = null;
    this.oniceconnectionstatechange = null;
    this.onsignalingstatechange = null;
    this.onconnectionstatechange = null;
    this.onicegatheringstatechange = null;
    this.onicecandidateerror = null;
    this.onnegotiationneeded = null;
    this.ondatachannel = null;
  }

  async createOffer(_options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    return {
      type: 'offer',
      sdp: 'mock-sdp-offer',
    };
  }

  async createAnswer(_options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit> {
    return {
      type: 'answer',
      sdp: 'mock-sdp-answer',
    };
  }

  async setLocalDescription(description?: RTCSessionDescriptionInit): Promise<void> {
    this.localDescription = description || null;
    this.signalingState = description?.type === 'offer' ? 'have-local-offer' : 'stable';
    if (this.onsignalingstatechange) {
      this.onsignalingstatechange();
    }
  }

  async setRemoteDescription(description?: RTCSessionDescriptionInit): Promise<void> {
    this.remoteDescription = description || null;
    this.signalingState = description?.type === 'offer' ? 'have-remote-offer' : 'stable';
    if (this.onsignalingstatechange) {
      this.onsignalingstatechange();
    }
  }

  async addIceCandidate(_candidate?: RTCIceCandidateInit): Promise<void> {
    // Simulate adding ICE candidate
    return Promise.resolve();
  }

  addTrack(track: MockMediaStreamTrack, stream: MockMediaStream): RTCRtpSender {
    // Simulate adding a track
    return {
      track,
      replaceTrack: (_newTrack: MockMediaStreamTrack | null) => Promise.resolve(),
    };
  }

  getStats(): Promise<RTCStatsReport> {
    return Promise.resolve({} as RTCStatsReport);
  }

  close(): void {
    this.signalingState = 'closed';
    this.iceConnectionState = 'closed';
    this.connectionState = 'closed';
    if (this.onsignalingstatechange) {
      this.onsignalingstatechange();
    }
    if (this.oniceconnectionstatechange) {
      this.oniceconnectionstatechange();
    }
    if (this.onconnectionstatechange) {
      this.onconnectionstatechange();
    }
  }

  createDataChannel(label: string, _options?: RTCDataChannelInit): RTCDataChannel {
    return {
      label,
      send: jest.fn(),
      close: jest.fn(),
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      readyState: 'connecting',
    } as unknown as RTCDataChannel;
  }
}

// Mock RTCSessionDescription class
export class MockRTCSessionDescription {
  type: string;
  sdp: string;

  constructor(init: { type: string; sdp: string }) {
    this.type = init.type;
    this.sdp = init.sdp;
  }
}

// Mock RTCIceCandidate class
export class MockRTCIceCandidate {
  candidate?: string;
  sdpMid?: string;
  sdpMLineIndex?: number;

  constructor(init: { candidate?: string; sdpMid?: string; sdpMLineIndex?: number }) {
    this.candidate = init.candidate;
    this.sdpMid = init.sdpMid;
    this.sdpMLineIndex = init.sdpMLineIndex;
  }
}

interface MediaDeviceInfo {
  deviceId: string;
  kind: MediaDeviceKind;
  label: string;
  groupId: string;
}

// Set up navigator.mediaDevices mocks
export const _mockMediaDevices = {
  getUserMedia: jest.fn().mockImplementation((constraints?: MediaStreamConstraints) => {
    const videoTrack = constraints?.video ? new MockMediaStreamTrack('video') : undefined;
    const audioTrack = constraints?.audio ? new MockMediaStreamTrack('audio') : undefined;
    const tracks: MockMediaStreamTrack[] = [];
    if (videoTrack) tracks.push(videoTrack);
    if (audioTrack) tracks.push(audioTrack);
    return Promise.resolve(new MockMediaStream(tracks));
  }),
  getDisplayMedia: jest.fn().mockImplementation((constraints?: MediaStreamConstraints) => {
    const videoTrack = constraints?.video ? new MockMediaStreamTrack('video') : undefined;
    const audioTrack = constraints?.audio ? new MockMediaStreamTrack('audio') : undefined;
    const tracks: MockMediaStreamTrack[] = [];
    if (videoTrack) tracks.push(videoTrack);
    if (audioTrack) tracks.push(audioTrack);
    return Promise.resolve(new MockMediaStream(tracks));
  }),
  enumerateDevices: jest.fn().mockResolvedValue([
    {
      deviceId: 'camera-1',
      kind: 'videoinput' as MediaDeviceKind,
      label: 'Mock Camera',
      groupId: 'group-1',
    },
    {
      deviceId: 'microphone-1',
      kind: 'audioinput' as MediaDeviceKind,
      label: 'Mock Microphone',
      groupId: 'group-2',
    },
    {
      deviceId: 'speaker-1',
      kind: 'audiooutput' as MediaDeviceKind,
      label: 'Mock Speaker',
      groupId: 'group-2',
    },
  ] as MediaDeviceInfo[]),
};
