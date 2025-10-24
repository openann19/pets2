/**
 * WebRTC Mock for testing
 */
export declare class MockMediaStream {
    private videoTracks;
    private audioTracks;
    constructor(tracks?: MockMediaStreamTrack[]);
    getVideoTracks(): MockMediaStreamTrack[];
    getAudioTracks(): MockMediaStreamTrack[];
    getTracks(): MockMediaStreamTrack[];
    addTrack(track: MockMediaStreamTrack): void;
    removeTrack(track: MockMediaStreamTrack): void;
}
export declare class MockMediaStreamTrack {
    kind: 'audio' | 'video';
    id: string;
    enabled: boolean;
    muted: boolean;
    readyState: 'live' | 'ended';
    onended: () => void;
    onmute: () => void;
    onunmute: () => void;
    constructor(kind: 'audio' | 'video');
    stop(): void;
    clone(): MockMediaStreamTrack;
}
export declare class MockRTCPeerConnection {
    localDescription: unknown;
    remoteDescription: unknown;
    signalingState: string;
    iceConnectionState: string;
    iceGatheringState: string;
    connectionState: string;
    onicecandidate: ((event: Event) => void) | null;
    ontrack: ((event: Event) => void) | null;
    oniceconnectionstatechange: (() => void) | null;
    onsignalingstatechange: (() => void) | null;
    onconnectionstatechange: (() => void) | null;
    onicegatheringstatechange: (() => void) | null;
    onicecandidateerror: ((event: Event) => void) | null;
    onnegotiationneeded: (() => void) | null;
    ondatachannel: ((event: Event) => void) | null;
    constructor(_configuration?: RTCConfiguration);
    createOffer(_options?: RTCOfferOptions): Promise<{
        type: string;
        sdp: string;
    }>;
    createAnswer(_options?: RTCAnswerOptions): Promise<{
        type: string;
        sdp: string;
    }>;
    setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
    setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
    addIceCandidate(_candidate: RTCIceCandidateInit): Promise<void>;
    addTrack(track: MediaStreamTrack, stream: MediaStream): {
        track: MediaStreamTrack;
        streams: MediaStream[];
        sender: {
            track: MediaStreamTrack;
            replaceTrack: (_newTrack: MediaStreamTrack | null) => Promise<void>;
        };
    };
    getStats(): Promise<{}>;
    close(): void;
    createDataChannel(label: string, _options?: RTCDataChannelInit): {
        label: string;
        send: jest.Mock<any, any, any>;
        close: jest.Mock<any, any, any>;
        onopen: null;
        onclose: null;
        onmessage: null;
        onerror: null;
        readyState: string;
    };
}
export declare class MockRTCSessionDescription {
    type: string;
    sdp: string;
    constructor(init: unknown);
}
export declare class MockRTCIceCandidate {
    candidate: string;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
    constructor(init: unknown);
}
export declare const _mockMediaDevices: {
    getUserMedia: jest.Mock<any, any, any>;
    getDisplayMedia: jest.Mock<any, any, any>;
    enumerateDevices: jest.Mock<any, any, any>;
};
//# sourceMappingURL=webrtc.d.ts.map