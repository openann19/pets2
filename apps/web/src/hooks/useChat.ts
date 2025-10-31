import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { matchesAPI } from '../services/api';
import type { Message, Match, User } from '../types';
import { logger } from '../services/logger';

interface Pet {
    id: string;
    name: string;
    breed: string;
    photos: string[];
}

interface UseChatReturn {
  match: Match | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isTyping: Record<string, boolean>;
  sendMessage: (content: string, messageType?: string) => Promise<void>;
  markAsRead: () => void;
  setTyping: (typing: boolean) => void;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
  otherUser: User | null;
  otherPet: Pet | null;
  currentUserPet: Pet | null;
  typingUsers: string[];
}

export const useChat = (matchId: string | undefined, currentUser: User): UseChatReturn => {
    const { socket, isConnected } = useSocket();
    const [match, setMatch] = useState<Match | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [page, setPage] = useState(1);
    const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
    // Load match data and messages
    const loadMatch = useCallback(async () => {
        if (!matchId)
            return;
        try {
            setIsLoading(true);
            setError(null);
            const matchResponse = await matchesAPI.getMatch(matchId);
            const matchData = matchResponse.data;
            setMatch(matchData);
            setMessages(matchData.messages || []);
            // Join the match room for real-time updates
            if (socket && isConnected) {
                socket.emit('join_match', { matchId });
            }
        }
        catch (err) {
            logger.error('Failed to load match', err instanceof Error ? err : new Error('Unknown error'), { matchId });
            setError('Failed to load chat. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    }, [matchId, socket, isConnected]);
    // Load more messages (pagination)
    const loadMoreMessages = useCallback(async () => {
        if (!matchId || isLoading || !hasMoreMessages)
            return;
        try {
            setIsLoading(true);
            // This would be implemented in the backend to support pagination
            // const response = await matchesAPI.getMessages(matchId, { page: page + 1, limit: 20 });
            // For now, we'll just set hasMoreMessages to false
            setHasMoreMessages(false);
            setPage(prev => prev + 1);
        }
        catch (err) {
            logger.error('Failed to load more messages', err instanceof Error ? err : new Error('Unknown error'), { matchId, page });
        }
        finally {
            setIsLoading(false);
        }
    }, [matchId, page, isLoading, hasMoreMessages]);
    // Send message
    const sendMessage = useCallback(async (content: string, messageType = 'text') => {
        if (!matchId || !content.trim())
            return;
        try {
            const messageData = {
                content: content.trim(),
                messageType,
                attachments: messageType === 'image' ? [] : undefined, // Would handle file uploads here
            };
            const response = await matchesAPI.sendMessage(matchId, messageData);
            const newMessage = response.data;
            // Optimistically add message to local state
            setMessages(prev => [...prev, newMessage]);
            // Emit message via socket for real-time delivery
            if (socket && isConnected) {
                socket.emit('send_message', {
                    matchId,
                    message: newMessage,
                });
            }
        }
        catch (err) {
            logger.error('Failed to send message', err instanceof Error ? err : new Error('Unknown error'), { matchId, messageType, contentLength: content.length });
            // Could show error notification here
        }
    }, [matchId, socket, isConnected]);
    // Set typing status
    const setTyping = useCallback((typing: boolean) => {
        if (!socket || !isConnected || !matchId)
            return;
        socket.emit('typing', {
            matchId,
            userId: currentUser._id,
            isTyping: typing,
        });
    }, [socket, isConnected, matchId, currentUser._id]);
    // Mark messages as read
    const markAsRead = useCallback(() => {
        if (!socket || !isConnected || !matchId)
            return;
        socket.emit('mark_read', {
            matchId,
            userId: currentUser._id,
        });
    }, [socket, isConnected, matchId, currentUser._id]);
    // Socket event listeners with proper cleanup
    useEffect(() => {
        if (!socket || !isConnected)
            return;
        // Listen for new messages
        const handleNewMessage = (data: { matchId: string; message: Message }) => {
            if (data.matchId === matchId) {
                setMessages(prev => {
                    // Avoid duplicates
                    const exists = prev.some(msg => msg._id === data.message._id);
                    if (exists)
                        return prev;
                    return [...prev, data.message];
                });
            }
        };
        // Listen for typing indicators
        const handleTyping = (data: { matchId: string; userId: string; isTyping: boolean }) => {
            if (data.matchId === matchId && data.userId !== currentUser._id) {
                setIsTyping(prev => {
                    const newState = { ...prev };
                    if (data.isTyping) {
                        newState[data.userId] = true;
                        // Clear existing timeout
                        if (typingTimeoutRef.current[data.userId]) {
                            clearTimeout(typingTimeoutRef.current[data.userId]);
                        }
                        // Set new timeout to stop typing indicator
                        typingTimeoutRef.current[data.userId] = setTimeout(() => {
                            setIsTyping(current => {
                                const updated = { ...current };
                                delete updated[data.userId];
                                return updated;
                            });
                        }, 3000);
                    }
                    else {
                        delete newState[data.userId];
                        if (typingTimeoutRef.current[data.userId]) {
                            clearTimeout(typingTimeoutRef.current[data.userId]);
                            delete typingTimeoutRef.current[data.userId];
                        }
                    }
                    return newState;
                });
            }
        };
        // Listen for message read receipts
        const handleMessageRead = (data: { matchId: string; messageIds: string[]; userId: string }) => {
            if (data.matchId === matchId) {
                setMessages(prev => prev.map(msg => {
                    if (data.messageIds.includes(msg._id || '')) {
                        return {
                            ...msg,
                            readBy: [...(msg.readBy || []), { user: data.userId, readAt: new Date().toISOString() }]
                        };
                    }
                    return msg;
                }));
            }
        };
        // Add event listeners
        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleTyping);
        socket.on('message_read', handleMessageRead);
        // Cleanup function
        return () => {
            // Remove event listeners
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
            socket.off('message_read', handleMessageRead);
            // Clear all typing timeouts
            Object.values(typingTimeoutRef.current).forEach(timeout => {
                if (timeout)
                    clearTimeout(timeout);
            });
            typingTimeoutRef.current = {};
        };
    }, [socket, isConnected, matchId, currentUser._id]);
    // Initial load
    useEffect(() => {
        loadMatch();
    }, [loadMatch]);
    // Mark messages as read when chat is viewed
    useEffect(() => {
        if (messages.length > 0 && match) {
            markAsRead();
        }
    }, [messages.length, match, markAsRead]);
    // Compute derived values
    const otherUser = match ? (match.user1._id === currentUser._id ? match.user2 : match.user1) : null;
    const otherPet = match ? (match.pet1.owner === currentUser._id ? match.pet2 : match.pet1) : null;
    const currentUserPet = match ? (match.pet1.owner === currentUser._id ? match.pet1 : match.pet2) : null;
    // Get typing users
    const typingUsers = Object.keys(isTyping)
        .filter(userId => isTyping[userId] && userId !== currentUser._id)
        .map(userId => {
        if (userId === otherUser?._id) {
            return otherUser.firstName;
        }
        return 'Someone';
    });
    return {
        match,
        messages,
        isLoading,
        error,
        isTyping,
        sendMessage,
        markAsRead,
        setTyping,
        loadMoreMessages,
        hasMoreMessages,
        // Derived/computed values
        otherUser,
        otherPet,
        currentUserPet,
        typingUsers,
    };
};
//# sourceMappingURL=useChat.js.map