export declare const useSocket: () => {
    socket: null;
    isConnected: boolean;
    joinMatch: () => void;
    leaveMatch: () => void;
    sendMessage: () => void;
    sendTyping: () => void;
    markMessageRead: () => void;
    onlineUsers: Set<unknown>;
    typingUsers: Map<any, any>;
    connectionQuality: string;
};
/**
 * Production-ready WebSocket provider with automatic reconnection,
 * connection quality monitoring, and comprehensive error handling
 */
export declare const SocketProvider: ({ children }: {
    children: any;
}) => JSX.Element;
//# sourceMappingURL=SocketProvider.d.ts.map