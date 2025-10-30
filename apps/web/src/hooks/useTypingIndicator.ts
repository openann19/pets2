/**
 * Real-Time Typing Indicator Hook
 * Leverages existing WebSocket infrastructure for typing events
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useEnhancedSocket } from './useEnhancedSocket';
import { useAuthStore } from '@/lib/auth-store';
export function useTypingIndicator(options = {}) {
    const { chatId, roomId, throttleMs = 1000, timeoutMs = 3000 } = options;
    const { user } = useAuthStore();
    const { socket, isConnected } = useEnhancedSocket();
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const lastTypingEventRef = useRef(0);
    const typingUsersRef = useRef(new Map());
    // Clean up typing users that haven't typed recently
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            const activeUsers = Array.from(typingUsersRef.current.values())
                .filter(user => now - user.timestamp < timeoutMs);
            if (activeUsers.length !== typingUsersRef.current.size) {
                typingUsersRef.current.clear();
                activeUsers.forEach(user => typingUsersRef.current.set(user.userId, user));
                setTypingUsers(activeUsers);
            }
        }, 1000);
        return () => { clearInterval(cleanupInterval); };
    }, [timeoutMs]);
    // Set up socket event listeners
    useEffect(() => {
        if (!socket || !isConnected)
            return;
        const room = chatId ? `chat:${chatId}` : roomId ? `room:${roomId}` : null;
        if (!room)
            return;
        // Join typing room
        socket.emit('join_typing_room', { room });
        // Listen for typing events
        const handleUserTyping = (data) => {
            if (data.room !== room || data.userId === user?.id)
                return;
            const typingUser = {
                userId: data.userId,
                userName: data.userName,
                avatar: data.avatar,
                timestamp: Date.now()
            };
            typingUsersRef.current.set(data.userId, typingUser);
            setTypingUsers(Array.from(typingUsersRef.current.values()));
        };
        const handleUserStoppedTyping = (data) => {
            if (data.room !== room || data.userId === user?.id)
                return;
            typingUsersRef.current.delete(data.userId);
            setTypingUsers(Array.from(typingUsersRef.current.values()));
        };
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stopped_typing', handleUserStoppedTyping);
        return () => {
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stopped_typing', handleUserStoppedTyping);
            socket.emit('leave_typing_room', { room });
        };
    }, [socket, isConnected, chatId, roomId, user?.id]);
    // Send typing event
    const sendTypingEvent = useCallback(() => {
        if (!socket || !isConnected || !user || !chatId && !roomId)
            return;
        const now = Date.now();
        if (now - lastTypingEventRef.current < throttleMs)
            return;
        lastTypingEventRef.current = now;
        const room = chatId ? `chat:${chatId}` : `room:${roomId}`;
        socket.emit('typing', {
            room,
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            avatar: user.profilePicture
        });
        setIsUserTyping(true);
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        // Set timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            sendStopTypingEvent();
        }, timeoutMs);
    }, [socket, isConnected, user, chatId, roomId, throttleMs, timeoutMs]);
    // Send stop typing event
    const sendStopTypingEvent = useCallback(() => {
        if (!socket || !isConnected || !user || !chatId && !roomId)
            return;
        const room = chatId ? `chat:${chatId}` : `room:${roomId}`;
        socket.emit('stop_typing', {
            room,
            userId: user.id
        });
        setIsUserTyping(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    }, [socket, isConnected, user, chatId, roomId]);
    // Handle input change (throttled)
    const handleInputChange = useCallback((value) => {
        if (!value.trim()) {
            sendStopTypingEvent();
            return;
        }
        sendTypingEvent();
    }, [sendTypingEvent, sendStopTypingEvent]);
    // Handle input focus
    const handleInputFocus = useCallback(() => {
        setIsTyping(true);
    }, []);
    // Handle input blur
    const handleInputBlur = useCallback(() => {
        setIsTyping(false);
        sendStopTypingEvent();
    }, [sendStopTypingEvent]);
    // Get typing display text
    const getTypingText = useCallback(() => {
        if (typingUsers.length === 0)
            return null;
        if (typingUsers.length === 1) {
            return `${typingUsers[0].userName} is typing...`;
        }
        else if (typingUsers.length === 2) {
            return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
        }
        else {
            return `${typingUsers.length} people are typing...`;
        }
    }, [typingUsers]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);
    return {
        typingUsers,
        isTyping,
        isUserTyping,
        typingText: getTypingText(),
        handleInputChange,
        handleInputFocus,
        handleInputBlur,
        sendTypingEvent,
        sendStopTypingEvent
    };
}
// Hook for online status
export function useOnlineStatus(userIds) {
    const { socket, isConnected } = useEnhancedSocket();
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    useEffect(() => {
        if (!socket || !isConnected)
            return;
        // Request online status for users
        socket.emit('get_online_status', { userIds });
        const handleOnlineStatus = (data) => {
            setOnlineUsers(new Set(data.userIds));
        };
        const handleUserOnline = (data) => {
            setOnlineUsers(prev => new Set([...prev, data.userId]));
        };
        const handleUserOffline = (data) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        };
        socket.on('online_status', handleOnlineStatus);
        socket.on('user_online', handleUserOnline);
        socket.on('user_offline', handleUserOffline);
        return () => {
            socket.off('online_status', handleOnlineStatus);
            socket.off('user_online', handleUserOnline);
            socket.off('user_offline', handleUserOffline);
        };
    }, [socket, isConnected, userIds.join(',')]);
    return {
        onlineUsers,
        isUserOnline: (userId) => onlineUsers.has(userId),
        onlineCount: onlineUsers.size
    };
}
//# sourceMappingURL=useTypingIndicator.js.map