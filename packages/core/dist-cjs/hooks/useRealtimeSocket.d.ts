/**
 * Real-time WebSocket Hook
 * Provides real-time updates via Socket.io
 */
interface Socket {
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    off: (event: string, callback?: (...args: unknown[]) => void) => void;
    emit: (event: string, ...args: unknown[]) => void;
    disconnect: () => void;
    connected: boolean;
}
export interface TypingIndicator {
    matchId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
}
export interface OnlineStatus {
    userId: string;
    isOnline: boolean;
    lastSeen?: Date;
}
export interface RealtimeMessage {
    matchId: string;
    message: {
        _id: string;
        sender: string;
        content: string;
        sentAt: string;
    };
}
interface UseRealtimeSocketOptions {
    url?: string;
    autoConnect?: boolean;
}
interface UseRealtimeSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    error: string | null;
    connect: () => void;
    disconnect: () => void;
    emitTyping: (matchId: string, isTyping: boolean) => void;
    onTyping: (callback: (data: TypingIndicator) => void) => () => void;
    onMessage: (callback: (data: RealtimeMessage) => void) => () => void;
    onOnlineStatus: (callback: (data: OnlineStatus) => void) => () => void;
}
/**
 * Hook for real-time WebSocket communication
 */
export declare function useRealtimeSocket(options?: UseRealtimeSocketOptions): UseRealtimeSocketReturn;
export {};
