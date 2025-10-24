/**
 * Video Call Hook
 * React hook for managing WebRTC video calling functionality
 */
export declare const useVideoCall: (roomId: string, userId: string) => {
    startCall: () => Promise<void>;
    endCall: () => void;
    toggleVideo: () => void;
    toggleAudio: () => void;
    startScreenShare: () => Promise<void>;
    stopScreenShare: () => void;
    isConnected: boolean;
    isLoading: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isMuted: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
    connectionQuality: "excellent" | "good" | "poor" | "disconnected";
    error: Error | null;
};
//# sourceMappingURL=useVideoCall.d.ts.map