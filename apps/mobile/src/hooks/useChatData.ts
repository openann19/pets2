import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@pawfectmatch/core';
import { logger } from '../services/logger';
import { matchesAPI } from '../services/api';
import { useSocket } from './useSocket';
import { offlineMessageQueue } from '../services/OfflineMessageQueue';
import NetInfo from '@react-native-community/netinfo';

export interface Message {
  _id: string;
  matchId?: string;
  content: string;
  senderId: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'emoji' | 'voice' | 'file' | 'location';
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  error?: boolean;
  audioUrl?: string;
  duration?: number;
  replyTo?: { _id: string; author?: string; text?: string };
  deliveredAt?: string;
  readAt?: string;
}

export interface ChatData {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isOnline: boolean;
  otherUserTyping: boolean;
  typingUsers: string[];
  error: string | null;
}

export interface ChatActions {
  sendMessage: (
    content: string,
    replyTo?: { _id: string; author?: string; text?: string },
  ) => Promise<void>;
  loadMessages: () => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  clearError: () => void;
}

export interface UseChatDataReturn {
  data: ChatData;
  actions: ChatActions;
}


export function useChatData(matchId: string): UseChatDataReturn {
  const { user } = useAuthStore();

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [networkStatus, setNetworkStatus] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socket = useSocket();

  // Setup network status listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      setNetworkStatus(connected);
      
      if (connected) {
        // Process offline queue when coming back online
        offlineMessageQueue.processQueue().catch((error) => {
          logger.error('Failed to process offline queue', { error });
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Setup socket connection and event listeners
  useEffect(() => {
    if (!socket) {
      logger.debug('Socket not available yet', { matchId });
      return;
    }

    logger.info('Socket connected for chat', { matchId, socketId: socket.id });

    // Set up event listeners
    const handleNewMessage = (data: { matchId: string; message: any }) => {
      if (data.matchId === matchId) {
        const convertedMessage = convertMessage(data.message);
        logger.debug('New message received via socket', { message: convertedMessage });
        setMessages((prev) => {
          // Avoid duplicates
          const exists = prev.find((msg) => msg._id === convertedMessage._id);
          if (exists) {
            return prev.map((msg) =>
              msg._id === convertedMessage._id ? { ...convertedMessage } : msg
            );
          }
          return [...prev, convertedMessage];
        });
      }
    };

    const handleMessageSent = (data: { matchId: string; messageId: string; message: any }) => {
      if (data.matchId === matchId) {
        const convertedMessage = convertMessage(data.message);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId || msg._id === convertedMessage._id
              ? { ...convertedMessage, status: 'sent' }
              : msg
          )
        );
      }
    };

    const handleMessageDelivered = (data: { matchId: string; messageId: string; deliveredAt: Date }) => {
      if (data.matchId === matchId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, status: 'delivered', deliveredAt: new Date(data.deliveredAt).toISOString() }
              : msg
          )
        );
      }
    };

    const handleMessagesRead = (data: { matchId: string; messageIds?: string[]; userId: string; readAt: Date }) => {
      if (data.matchId === matchId && data.userId !== user?._id) {
        // Update status of our messages that were read
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.senderId === user?._id) {
              if (data.messageIds && data.messageIds.includes(msg._id)) {
                return { ...msg, status: 'read', readAt: new Date(data.readAt).toISOString(), read: true };
              }
              // If no specific IDs, mark all our unread messages as read
              if (!data.messageIds && msg.status !== 'read') {
                return { ...msg, status: 'read', readAt: new Date(data.readAt).toISOString(), read: true };
              }
            }
            return msg;
          })
        );
      }
    };

    const handleUserTyping = (data: { matchId: string; userId: string; isTyping: boolean; userName?: string }) => {
      if (data.matchId === matchId) {
        setOtherUserTyping(data.isTyping);
        if (data.isTyping) {
          setTypingUsers((prev) => [...new Set([...prev, data.userId])]);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
        }
      }
    };

    const handleUserOnline = (data: { userId: string }) => {
      setIsOnline(true);
      logger.debug('User came online', { data });
    };

    const handleUserOffline = (data: { userId: string }) => {
      setIsOnline(false);
      logger.debug('User went offline', { data });
    };

    // Register event listeners
    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('message_delivered', handleMessageDelivered);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_online', handleUserOnline);
    socket.on('user_offline', handleUserOffline);

    // Join the match room
    socket.emit('join_match', matchId);

    // Cleanup on unmount
    return () => {
      logger.debug('Cleaning up socket listeners', { matchId });
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('message_delivered', handleMessageDelivered);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_online', handleUserOnline);
      socket.off('user_offline', handleUserOffline);
      socket.emit('leave_match', matchId);
    };
  }, [socket, matchId, user?._id]);

  // Helper to convert core Message to local Message format
  const convertMessage = useCallback((coreMsg: any): Message => {
    const senderId = typeof coreMsg.sender === 'string' ? coreMsg.sender : (coreMsg.sender?._id || coreMsg.sender);
    const isOwnMessage = senderId === user?._id;
    const readBy = coreMsg.readBy || [];
    const isRead = readBy.some((r: any) => {
      const readerId = typeof r.user === 'string' ? r.user : r.user?._id;
      return readerId === user?._id;
    });

    // Determine status
    let status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' = 'sent';
    if (coreMsg.status && ['sending', 'sent', 'delivered', 'read', 'failed'].includes(coreMsg.status)) {
      status = coreMsg.status;
    } else if (isOwnMessage && readBy.length > 0) {
      status = 'read';
    } else if (isOwnMessage && !isRead) {
      status = 'delivered';
    }

    let replyToObj: { _id: string; author?: string; text?: string } | undefined;
    if (coreMsg.replyTo) {
      const replyId = typeof coreMsg.replyTo === 'string' ? coreMsg.replyTo : coreMsg.replyTo._id;
      replyToObj = { _id: replyId };
      if (typeof coreMsg.replyTo === 'object' && coreMsg.replyTo.sender?.firstName) {
        replyToObj.author = coreMsg.replyTo.sender.firstName;
      }
      if (typeof coreMsg.replyTo === 'object' && coreMsg.replyTo.content) {
        replyToObj.text = coreMsg.replyTo.content;
      }
    }

    const result: Message = {
      _id: coreMsg._id?.toString() || coreMsg._id,
      content: coreMsg.content,
      senderId,
      timestamp: coreMsg.sentAt || coreMsg.timestamp || new Date().toISOString(),
      read: isRead || readBy.length > 0,
      type:
        coreMsg.messageType === 'text'
          ? 'text'
          : coreMsg.messageType === 'image'
            ? 'image'
            : coreMsg.messageType === 'voice'
              ? 'voice'
              : coreMsg.messageType === 'file'
                ? 'file'
                : coreMsg.messageType === 'location'
                  ? 'location'
                  : 'text',
      status,
      error: false,
    };

    if (replyToObj) {
      result.replyTo = replyToObj;
    }
    if (coreMsg.deliveredAt) {
      result.deliveredAt = new Date(coreMsg.deliveredAt).toISOString();
    }
    if (readBy.length > 0 && readBy[0]?.readAt) {
      result.readAt = new Date(readBy[0].readAt).toISOString();
    }

    return result;
  }, [user?._id]);

  // Load messages from API
  const loadMessages = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const coreMessages = await matchesAPI.getMessages(matchId);

      if (coreMessages.length > 0) {
        const convertedMessages = coreMessages.map(convertMessage);
        setMessages(convertedMessages);
        await markAsRead();
      } else {
        setMessages([]);
      }
    } catch (err) {
      const errorMessage = 'Failed to load messages. Please check your connection and try again.';
      logger.error('Failed to load messages', {
        error: err instanceof Error ? err : new Error(String(err)),
        matchId,
      });
      setError(errorMessage);
      Alert.alert('Connection Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, convertMessage]);

  // Setup offline queue handler
  useEffect(() => {
    offlineMessageQueue.setSendHandler(async (queuedMessage) => {
      try {
        // Try to send via API first
        const sentMessage = await matchesAPI.sendMessage(
          queuedMessage.matchId,
          queuedMessage.content,
          queuedMessage.replyTo ? { _id: queuedMessage.replyTo } : undefined,
        );

        // If socket is connected, emit to socket
        if (socket && socket.connected) {
          socket.emit('send_message', {
            matchId: queuedMessage.matchId,
            content: queuedMessage.content,
            messageType: queuedMessage.messageType || 'text',
            attachments: queuedMessage.attachments || [],
            replyTo: queuedMessage.replyTo || null,
          });
        }

        // Update message in UI if this is the current match
        if (queuedMessage.matchId === matchId) {
          const convertedMessage = convertMessage(sentMessage);
          setMessages((prev) => {
            const exists = prev.find((msg) => msg._id === convertedMessage._id);
            if (exists) {
              return prev.map((msg) =>
                msg._id === convertedMessage._id ? convertedMessage : msg
              );
            }
            return [...prev, convertedMessage];
          });
        }

        logger.info('Queued message sent successfully', { messageId: queuedMessage.id });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error('Failed to send queued message', { error, messageId: queuedMessage.id });
        throw error;
      }
    });

    return () => {
      offlineMessageQueue.setSendHandler(() => Promise.resolve());
    };
  }, [socket, matchId]);

  // Send message with optimistic updates and offline queue
  const sendMessage = useCallback(
    async (
      content: string,
      replyTo?: { _id: string; author?: string; text?: string },
    ): Promise<void> => {
      if (!content.trim() || isSending) return;

      const messageContent = content.trim();
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Optimistic UI update
      const optimisticMessage: Message = {
        _id: tempId,
        content: messageContent,
        senderId: user?._id ?? 'me',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
        status: 'sending',
        ...(replyTo ? { replyTo: { _id: replyTo._id, ...(replyTo.author ? { author: replyTo.author } : {}), ...(replyTo.text ? { text: replyTo.text } : {}) } } : {}),
      };

      setIsSending(true);
      setMessages((prev) => [...prev, optimisticMessage]);

      // Check network status
      const netInfo = await NetInfo.fetch();
      const isOnline = netInfo.isConnected ?? false;

      try {
        if (isOnline && socket?.connected) {
          // Send via socket
          socket.emit('send_message', {
            matchId,
            content: messageContent,
            messageType: 'text',
            attachments: [],
            replyTo: replyTo ? replyTo._id : null,
          });

          // Also send via API for persistence
          try {
            const sentMessage = await matchesAPI.sendMessage(matchId, messageContent, replyTo);
            const convertedSentMessage = convertMessage(sentMessage);
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === tempId ? { ...convertedSentMessage, status: 'sent' } : msg
              )
            );
          } catch (apiErr) {
            const apiError = apiErr instanceof Error ? apiErr : new Error(String(apiErr));
            logger.warn('API send failed but socket succeeded', { error: apiError });
            // Update status to sent even if API fails (socket succeeded)
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === tempId ? { ...msg, status: 'sent' } : msg
              )
            );
          }

          // Clear typing indicator
          socket.emit('typing', {
            matchId,
            isTyping: false,
          });
        } else {
          // Queue message for offline
          const queueData: Parameters<typeof offlineMessageQueue.enqueue>[0] = {
            matchId,
            content: messageContent,
            messageType: 'text',
          };
          if (replyTo?._id) {
            queueData.replyTo = replyTo._id;
          }
          await offlineMessageQueue.enqueue(queueData);

          // Update status to pending
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === tempId ? { ...msg, status: 'sent' } : msg
            )
          );
          logger.info('Message queued for offline send', { tempId });
        }
      } catch (err) {
        logger.error('Failed to send message', {
          error: err instanceof Error ? err : new Error(String(err)),
          matchId,
          content,
        });

        // Try to queue if network error
        if (!isOnline) {
          try {
            const queueData: Parameters<typeof offlineMessageQueue.enqueue>[0] = {
              matchId,
              content: messageContent,
              messageType: 'text',
            };
            if (replyTo?._id) {
              queueData.replyTo = replyTo._id;
            }
            await offlineMessageQueue.enqueue(queueData);
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === tempId ? { ...msg, status: 'sent' } : msg
              )
            );
          } catch (queueErr) {
            const queueError = queueErr instanceof Error ? queueErr : new Error(String(queueErr));
            logger.error('Failed to queue message', { error: queueError });
            setMessages((prev) =>
              prev.map((msg) => (msg._id === tempId ? { ...msg, status: 'failed', error: true } : msg))
            );
            setError('Failed to send message. Please try again.');
          }
        } else {
          // Show error state
          setMessages((prev) =>
            prev.map((msg) => (msg._id === tempId ? { ...msg, status: 'failed', error: true } : msg))
          );
          setError('Failed to send message. Please try again.');
        }
      } finally {
        setIsSending(false);
      }
    },
    [isSending, user?._id, matchId, socket],
  );

  // Retry failed message
  const retryMessage = useCallback(
    async (messageId: string): Promise<void> => {
      const message = messages.find((msg) => msg._id === messageId);
      if (!message) return;

      const retryMessage: Message = {
        ...message,
        _id: `retry_${Date.now()}`,
        status: 'sending',
        error: false,
      };

      setMessages((prev) => prev.map((msg) => (msg._id === messageId ? retryMessage : msg)));

      try {
        await matchesAPI.sendMessage(matchId, message.content);
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === retryMessage._id ? { ...msg, status: 'sent', error: false } : msg,
          ),
        );
      } catch (err) {
        logger.error('Failed to retry message', {
          error: err instanceof Error ? err : new Error(String(err)),
          messageId,
        });
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === retryMessage._id ? { ...msg, status: 'failed', error: true } : msg,
          ),
        );
      }
    },
    [messages, matchId],
  );

  // Mark messages as read
  const markAsRead = useCallback(async (): Promise<void> => {
    try {
      if (socket && socket.connected) {
        socket.emit('mark_messages_read', { matchId });
      }

      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.senderId !== user?._id && !msg.read) {
            return { ...msg, read: true };
          }
          return msg;
        })
      );

      logger.debug('Messages marked as read', { matchId });
    } catch (err) {
      logger.error('Failed to mark messages as read', {
        error: err instanceof Error ? err : new Error(String(err)),
        matchId,
      });
    }
  }, [matchId, socket, user?._id]);

  // Clear error state
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    data: {
      messages,
      isLoading,
      isSending,
      isOnline: isOnline && networkStatus,
      otherUserTyping,
      typingUsers,
      error,
    },
    actions: {
      sendMessage,
      loadMessages,
      retryMessage,
      markAsRead,
      clearError,
    },
  };
}

