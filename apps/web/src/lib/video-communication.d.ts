export interface VideoCallConfig {
    roomId: string;
    userId: string;
    video?: boolean;
    audio?: boolean;
}
declare class VideoCallService {
    initializeCall(config: VideoCallConfig): Promise<MediaStream>;
    endCall(): void;
    toggleVideo(enabled: boolean): void;
    toggleAudio(enabled: boolean): void;
    startScreenShare(): void;
    stopScreenShare(): void;
}
export declare const videoCallService: VideoCallService;
export {};
//# sourceMappingURL=video-communication.d.ts.map