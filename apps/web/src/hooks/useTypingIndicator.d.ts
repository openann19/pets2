/**
 * Real-Time Typing Indicator Hook
 * Leverages existing WebSocket infrastructure for typing events
 */
interface TypingUser {
    userId: string;
    userName: string;
    avatar?: string;
    timestamp: number;
}
interface UseTypingIndicatorOptions {
    chatId?: string;
    roomId?: string;
    throttleMs?: number;
    timeoutMs?: number;
}
export declare function useTypingIndicator(options?: UseTypingIndicatorOptions): {
    typingUsers: TypingUser[];
    isTyping: boolean;
    isUserTyping: boolean;
    typingText: string | null;
    handleInputChange: (value: string) => void;
    handleInputFocus: () => void;
    handleInputBlur: () => void;
    sendTypingEvent: () => void;
    sendStopTypingEvent: () => void;
};
export declare function useOnlineStatus(userIds: string[]): {
    onlineUsers: Set<string>;
    isUserOnline: (userId: string) => boolean;
    onlineCount: number;
};
export {};
//# sourceMappingURL=useTypingIndicator.d.ts.map