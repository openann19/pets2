import { Message, Match, User } from '../types';
interface UseChatReturn {
    match: Match | null;
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    isTyping: {
        [userId: string]: boolean;
    };
    sendMessage: (content: string, messageType?: 'text' | 'image' | 'location') => Promise<void>;
    markAsRead: () => void;
    setTyping: (isTyping: boolean) => void;
    loadMoreMessages: () => Promise<void>;
    hasMoreMessages: boolean;
    otherUser: User | null;
    otherPet: unknown | null;
    currentUserPet: unknown | null;
    typingUsers: string[];
}
export declare const useChat: (matchId: string, currentUser: User) => UseChatReturn;
export {};
//# sourceMappingURL=useChat.d.ts.map