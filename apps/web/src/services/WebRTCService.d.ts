/**
 * WebRTC Service
 * Handles WebRTC connections, signaling, and media streams
 */
export declare class WebRTCService {
    private peerConnection;
    private localStream;
    private remoteStream;
    private screenShareStream;
    private socket;
    private roomId;
    private userId;
    onLocalStream: (stream: MediaStream) => void;
    onRemoteStream: (stream: MediaStream) => void;
    onConnectionStateChange: (state: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed') => void;
    onError: (error: Error) => void;
    constructor(roomId: string, userId: string);
    private initializeSignaling;
    connect(): Promise<void>;
    private setupPeerConnectionEvents;
    startScreenSharing(): Promise<void>;
    stopScreenSharing(): void;
    disconnect(): void;
}
//# sourceMappingURL=WebRTCService.d.ts.map