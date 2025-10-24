/**
 * 💬 OPTIMIZED CHAT HOOK
 * Enhanced real-time chat patterns based on Tinder clone optimizations
 * Provides smooth messaging with haptic feedback and optimized performance
 */
interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
    type: 'text' | 'image' | 'emoji' | 'gift';
    metadata?: unknown;
}
interface ChatConfig {
    hapticEnabled?: boolean;
    soundEnabled?: boolean;
    typingTimeout?: number;
    maxRetries?: number;
    retryDelay?: number;
}
interface ChatCallbacks {
    onMessageReceived?: (message: Message) => void;
    onMessageSent?: (message: Message) => void;
    onTypingStart?: (userId: string) => void;
    onTypingStop?: (userId: string) => void;
    onConnectionChange?: (connected: boolean) => void;
}
export declare const useOptimizedChat: (matchId: string, userId: string, config?: ChatConfig, callbacks?: ChatCallbacks) => {
    messages: Message[];
    isTyping: boolean;
    isConnected: boolean;
    retryCount: number;
    sendMessage: (content: string, type?: "text" | "image" | "emoji", metadata?: unknown) => Promise<void>;
    handleTypingInput: () => void;
    uploadPhoto: (file: File) => Promise<string | null>;
    showNotification: (message: Message, petName: string) => void;
    triggerHaptic: (type?: "light" | "medium" | "heavy") => void;
    triggerSound: (type: "message" | "typing" | "connection") => void;
};
export {};
//# sourceMappingURL=useOptimizedChat.d.ts.map