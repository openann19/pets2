/**
 * 🔌 ENHANCED SOCKET HOOK
 * Advanced real-time communication with performance optimization and reliability
 */
import { Socket } from 'socket.io-client';
interface SocketState {
    isConnected: boolean;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
    latency: number;
    reconnectAttempts: number;
}
interface TypingUser {
    userId: string;
    userName: string;
    matchId: string;
    timestamp: number;
}
interface EnhancedSocketHook {
    socket: Socket | null;
    state: SocketState;
    typingUsers: TypingUser[];
    connect: () => void;
    disconnect: () => void;
    sendMessage: (matchId: string, message: unknown) => void;
    joinMatch: (matchId: string) => void;
    leaveMatch: (matchId: string) => void;
    startTyping: (matchId: string) => void;
    stopTyping: (matchId: string) => void;
    updatePresence: (status: 'online' | 'away' | 'offline') => void;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    off: (event: string, callback: (...args: unknown[]) => void) => void;
    emit: (event: string, data?: unknown) => void;
}
export declare const useEnhancedSocket: () => EnhancedSocketHook;
export {};
//# sourceMappingURL=useEnhancedSocket.d.ts.map