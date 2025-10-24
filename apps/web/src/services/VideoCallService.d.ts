/**
 * Video Call Service
 * Handles WebRTC connections and video call functionality
 */
declare class VideoCallService {
    private peerConnection;
    private localStream;
    /**
     * Initialize peer connection
     */
    initializePeerConnection(): RTCPeerConnection;
    /**
     * Get user media stream
     */
    getUserMedia(): Promise<MediaStream>;
    /**
     * Get screen share stream
     */
    getScreenShareStream(): Promise<MediaStream>;
    /**
     * Toggle video track
     */
    toggleVideoTrack(stream: MediaStream): void;
    /**
     * Toggle audio track
     */
    toggleAudioTrack(stream: MediaStream): void;
    /**
     * Send offer to signaling server
     */
    sendOffer(callId: string, offer: RTCSessionDescriptionInit): Promise<unknown>;
    /**
     * Get answer from signaling server
     */
    getAnswer(callId: string): Promise<unknown>;
    /**
     * Send ICE candidate
     */
    sendIceCandidate(callId: string, candidate: unknown): Promise<unknown>;
    /**
     * Create video call
     */
    createCall(receiverId: string): Promise<unknown>;
    /**
     * Join video call
     */
    joinCall(callId: string): Promise<unknown>;
    /**
     * End video call
     */
    endCall(callId: string): Promise<unknown>;
    /**
     * Create offer
     */
    createOffer(): Promise<RTCSessionDescriptionInit>;
    /**
     * Start recording
     */
    startRecording(callId: string): Promise<unknown>;
    /**
     * Stop recording
     */
    stopRecording(callId: string): Promise<unknown>;
}
export declare const videoCallService: VideoCallService;
export default videoCallService;
//# sourceMappingURL=VideoCallService.d.ts.map