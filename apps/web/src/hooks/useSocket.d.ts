/**
 * WebSocket Hook for Real-time Features
 * Provides socket connection management and event handling
 */
import { SocketEventHandlers, MessageAttachment } from '@/types';
interface UseSocketOptions {
    autoConnect?: boolean;
    reconnectOnAuth?: boolean;
}
export declare const useSocket: (options?: UseSocketOptions, eventHandlers?: SocketEventHandlers) => {
    isConnected: boolean;
    connectionError: string | null;
    socketId: string | undefined;
    connect: () => void;
    disconnect: () => void;
    joinMatch: (matchId: string) => void;
    leaveMatch: (matchId: string) => void;
    sendMessage: (matchId: string, content: string, attachments?: MessageAttachment[]) => void;
    startTyping: (matchId: string) => void;
    stopTyping: (matchId: string) => void;
    swipePet: (petId: string, action: "like" | "pass" | "superlike") => void;
    initiateCall: (matchId: string, type: "audio" | "video") => void;
    acceptCall: (callId: string) => void;
    rejectCall: (callId: string) => void;
    endCall: (callId: string) => void;
    updateStatus: (status: "online" | "offline" | "away") => void;
    socket: import("@/services/socket").default | null;
    on: ((event: string, handler: (data?: unknown) => void) => void) | undefined;
    off: ((event: string, handler?: (data?: unknown) => void) => void) | undefined;
};
export default useSocket;
//# sourceMappingURL=useSocket.d.ts.map