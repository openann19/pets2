/**
 * 💬 OPTIMIZED CHAT HOOK
 * Enhanced real-time chat patterns based on Tinder clone optimizations
 * Provides smooth messaging with haptic feedback and optimized performance
 */
import { useCallback, useRef, useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { useSocket } from './useSocket';
export const useOptimizedChat = (matchId, userId, config = {}, callbacks = {}) => {
    const { hapticEnabled = true, soundEnabled = true, typingTimeout = 1500, // Reduced from 2000ms for more responsive typing
    maxRetries = 3, retryDelay = 1000, } = config;
    const { onMessageReceived, onMessageSent, onTypingStart, onTypingStop, onConnectionChange, } = callbacks;
    const socket = useSocket();
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const typingTimeoutRef = useRef();
    const retryTimeoutRef = useRef();
    const messageQueueRef = useRef([]);
    // Enhanced haptic feedback
    const triggerHaptic = useCallback((type = 'medium') => {
        if (!hapticEnabled || !('vibrate' in navigator))
            return;
        const patterns = {
            light: [10],
            medium: [20],
            heavy: [30, 10, 30]
        };
        navigator.vibrate(patterns[type]);
    }, [hapticEnabled]);
    // Enhanced sound feedback
    const triggerSound = useCallback((type) => {
        if (!soundEnabled)
            return;
        try {
            const sounds = {
                message: '/sounds/message.mp3',
                typing: '/sounds/typing.mp3',
                connection: '/sounds/connection.mp3'
            };
            const audio = new Audio(sounds[type]);
            audio.volume = 0.2;
            audio.play().catch(() => {
                // Fallback to haptic feedback
                triggerHaptic('light');
            });
        }
        catch (error) {
            triggerHaptic('light');
        }
    }, [soundEnabled, triggerHaptic]);
    // Optimized message handling
    const handleNewMessage = useCallback((message) => {
        setMessages(prev => [...prev, message]);
        // Enhanced feedback for received messages
        if (message.senderId !== userId) {
            triggerHaptic('medium');
            triggerSound('message');
            onMessageReceived?.(message);
        }
        else {
            onMessageSent?.(message);
        }
    }, [userId, triggerHaptic, triggerSound, onMessageReceived, onMessageSent]);
    // Optimized typing indicator
    const handleTyping = useCallback(({ userId: typingUserId, isTyping: typing }) => {
        if (typingUserId !== userId) {
            if (typing) {
                triggerHaptic('light');
                triggerSound('typing');
                onTypingStart?.(typingUserId);
            }
            else {
                onTypingStop?.(typingUserId);
            }
        }
    }, [userId, triggerHaptic, triggerSound, onTypingStart, onTypingStop]);
    // Enhanced connection handling
    const handleConnectionChange = useCallback((connected) => {
        setIsConnected(connected);
        if (connected) {
            triggerHaptic('light');
            triggerSound('connection');
            setRetryCount(0);
            // Process queued messages
            if (messageQueueRef.current.length > 0) {
                messageQueueRef.current.forEach(message => {
                    socket?.emit('send_message', { matchId, message });
                });
                messageQueueRef.current = [];
            }
        }
        else {
            // Start retry logic
            if (retryCount < maxRetries) {
                retryTimeoutRef.current = setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    // Trigger reconnection
                    socket?.connect();
                }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
            }
        }
        onConnectionChange?.(connected);
    }, [socket, matchId, retryCount, maxRetries, retryDelay, triggerHaptic, triggerSound, onConnectionChange]);
    // Optimized message sending
    const sendMessage = useCallback(async (content, type = 'text', metadata) => {
        if (!content.trim() || !socket)
            return;
        const newMessage = {
            id: Date.now().toString(),
            senderId: userId,
            content,
            timestamp: new Date().toISOString(),
            read: false,
            type,
            metadata,
        };
        // Optimistic update
        setMessages(prev => [...prev, newMessage]);
        triggerHaptic('light');
        // Send via socket with retry logic
        try {
            if (isConnected) {
                socket.emit('send_message', { matchId, message: newMessage });
            }
            else {
                // Queue message for when connection is restored
                messageQueueRef.current.push(newMessage);
            }
        }
        catch (error) {
            logger.error('Failed to send message:', { error });
            // Remove optimistic update on error
            setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        }
    }, [socket, userId, matchId, isConnected, triggerHaptic]);
    // Enhanced typing detection
    const handleTypingInput = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true);
            if (socket && isConnected) {
                socket.emit('typing', { matchId, userId, isTyping: true });
            }
        }
        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        // Set new timeout with optimized debouncing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            if (socket && isConnected) {
                socket.emit('typing', { matchId, userId, isTyping: false });
            }
        }, typingTimeout);
    }, [socket, matchId, userId, isTyping, isConnected, typingTimeout]);
    // Enhanced photo upload
    const uploadPhoto = useCallback(async (file) => {
        if (!file.type.startsWith('image/')) {
            throw new Error('Please select an image file');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Image size must be less than 5MB');
        }
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
                },
                body: formData,
            });
            if (!response.ok)
                throw new Error('Upload failed');
            const { url } = await response.json();
            return url;
        }
        catch (error) {
            logger.error('Upload failed:', { error });
            throw error;
        }
    }, []);
    // Enhanced notification handling
    const showNotification = useCallback((message, petName) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${petName}`, {
                body: message.content,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag: `message-${message.id}`,
                requireInteraction: false,
                silent: false,
            });
        }
    }, []);
    // Socket event listeners
    useEffect(() => {
        if (!socket)
            return;
        socket.on('new_message', handleNewMessage);
        socket.on('typing', handleTyping);
        socket.on('connect', () => handleConnectionChange(true));
        socket.on('disconnect', () => handleConnectionChange(false));
        socket.on('connect_error', () => handleConnectionChange(false));
        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('typing', handleTyping);
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
        };
    }, [socket, handleNewMessage, handleTyping, handleConnectionChange]);
    // Cleanup timeouts
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);
    return {
        // State
        messages,
        isTyping,
        isConnected,
        retryCount,
        // Actions
        sendMessage,
        handleTypingInput,
        uploadPhoto,
        showNotification,
        // Utilities
        triggerHaptic,
        triggerSound,
    };
};
//# sourceMappingURL=useOptimizedChat.js.map