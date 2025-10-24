import type { Socket } from 'socket.io-client';
interface UseWebSocketOptions {
    autoConnect?: boolean;
    enableLogging?: boolean;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onReconnect?: () => void;
    onError?: (error: unknown) => void;
}
interface UseWebSocketReturn {
    connected: boolean;
    connecting: boolean;
    error: Error | null;
    socket: Socket | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    emit: (event: string, data: unknown) => void;
    on: (event: string, callback: Function) => (() => void) | undefined;
    once: (event: string, callback: Function) => void;
    getStatus: () => {
        connected: boolean;
        connecting: boolean;
        reconnectAttempts: number;
        userId: string | null;
        socketId: string | null;
        queuedMessages: number;
    };
}
export declare function useWebSocket(options?: UseWebSocketOptions): UseWebSocketReturn;
export declare function useChatWebSocket(): UseWebSocketReturn & {
    sendMessage: (matchId: string, message: string, attachments?: unknown[]) => void;
    sendTypingIndicator: (matchId: string, isTyping: boolean) => void;
    markMessageAsRead: (messageId: string) => void;
    joinChatRoom: (matchId: string) => void;
    leaveChatRoom: (matchId: string) => void;
};
export declare function useVideoWebSocket(): UseWebSocketReturn & {
    initiateCall: (targetUserId: string, petId?: string) => void;
    answerCall: (callId: string, accept: boolean) => void;
    sendSignal: (callId: string, targetUserId: string, signal: unknown) => void;
    endCall: (callId: string) => void;
};
export declare function useNotificationWebSocket(): UseWebSocketReturn & {
    notifications: any[];
    markAsRead: (notificationId: string) => void;
    clearAll: () => void;
    unreadCount: number;
};
export {};
//# sourceMappingURL=useWebSocket.d.ts.map