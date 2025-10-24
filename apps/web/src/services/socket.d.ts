/**
 * WebSocket Service for Real-time Features
 * Handles chat, notifications, and live updates
 */
import { MessageAttachment } from '@/types';
interface SocketServiceConfig {
    url: string;
    token?: string | undefined;
    autoConnect?: boolean | undefined;
}
type EventHandler = (data?: unknown) => void;
declare class SocketService {
    private socket;
    private config;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    private isConnected;
    private eventHandlers;
    constructor(config: SocketServiceConfig);
    connect(): void;
    disconnect(): void;
    private setupEventListeners;
    private handleReconnect;
    on(event: string, handler: EventHandler): void;
    off(event: string, handler?: EventHandler): void;
    private emit;
    joinMatch(matchId: string): void;
    leaveMatch(matchId: string): void;
    sendMessage(matchId: string, content: string, attachments?: MessageAttachment[]): void;
    startTyping(matchId: string): void;
    stopTyping(matchId: string): void;
    swipePet(petId: string, action: 'like' | 'pass' | 'superlike'): void;
    initiateCall(matchId: string, type: 'audio' | 'video'): void;
    acceptCall(callId: string): void;
    rejectCall(callId: string): void;
    endCall(callId: string): void;
    updateStatus(status: 'online' | 'offline' | 'away'): void;
    isSocketConnected(): boolean;
    getSocketId(): string | undefined;
    updateToken(token: string): void;
    destroy(): void;
}
export declare const createSocketService: (config: SocketServiceConfig) => SocketService;
export declare const getSocketService: () => SocketService | null;
export default SocketService;
//# sourceMappingURL=socket.d.ts.map