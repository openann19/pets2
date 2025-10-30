/**
 * Admin Chats Screen Hook
 * Manages chat moderation, monitoring, and intervention
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import type { AdminScreenProps } from '../../navigation/types';
import { useErrorHandler } from '../useErrorHandler';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  messageType: 'text' | 'image' | 'system';
  isReported?: boolean;
  reportReason?: string;
}

interface ActiveChat {
  id: string;
  participants: {
    user1: { id: string; name: string; avatar?: string };
    user2: { id: string; name: string; avatar?: string };
  };
  lastMessage: ChatMessage;
  messageCount: number;
  isReported: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatFilter {
  type: 'all' | 'reported' | 'active' | 'inactive';
  searchQuery: string;
}

interface UseAdminChatsScreenParams {
  navigation: AdminScreenProps<'AdminChats'>['navigation'];
}

export interface AdminChatsScreenState {
  // Data
  chats: ActiveChat[];
  selectedChat: ActiveChat | null;
  chatMessages: ChatMessage[];

  // Filters & Search
  filter: ChatFilter;
  filteredChats: ActiveChat[];

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMessages: boolean;

  // Actions
  onRefresh: () => Promise<void>;
  onFilterChange: (filter: Partial<ChatFilter>) => void;
  onChatSelect: (chat: ActiveChat) => void;
  onChatClose: () => void;
  onMessageDelete: (messageId: string) => Promise<void>;
  onChatBlock: (chatId: string) => Promise<void>;
  onChatWarn: (chatId: string) => Promise<void>;
  onBackPress: () => void;
}

/**
 * Hook for admin chats screen
 * Provides chat monitoring and moderation capabilities
 */
export function useAdminChatsScreen({
  navigation,
}: UseAdminChatsScreenParams): AdminChatsScreenState {
  const { handleNetworkError, handleOfflineError } = useErrorHandler();

  const [chats, setChats] = useState<ActiveChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<ActiveChat | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [filter, setFilter] = useState<ChatFilter>({
    type: 'all',
    searchQuery: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Mock data loading - replace with real API calls
  const loadChats = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        if (!options?.force) {
          setIsLoading(true);
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockChats: ActiveChat[] = [
          {
            id: 'chat1',
            participants: {
              user1: {
                id: 'user1',
                name: 'Alice Johnson',
                avatar: 'avatar1.jpg',
              },
              user2: { id: 'user2', name: 'Bob Smith', avatar: 'avatar2.jpg' },
            },
            lastMessage: {
              id: 'msg1',
              senderId: 'user1',
              senderName: 'Alice Johnson',
              content: 'Hi! I think we would be a great match for our pets!',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              messageType: 'text',
            },
            messageCount: 15,
            isReported: false,
            reportCount: 0,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 30 * 60 * 1000),
          },
          {
            id: 'chat2',
            participants: {
              user1: { id: 'user3', name: 'Charlie Brown' },
              user2: { id: 'user4', name: 'Diana Wilson' },
            },
            lastMessage: {
              id: 'msg2',
              senderId: 'user4',
              senderName: 'Diana Wilson',
              content: 'This conversation violates our community guidelines',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              messageType: 'text',
              isReported: true,
              reportReason: 'Inappropriate content',
            },
            messageCount: 8,
            isReported: true,
            reportCount: 2,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
        ];

        setChats(mockChats);
        logger.info('Admin chats loaded', { count: mockChats.length });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load chats');
        logger.error('Failed to load admin chats', { error: err });
        handleNetworkError(err, 'admin.chats.load');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleNetworkError],
  );

  const loadChatMessages = useCallback(
    async (chatId: string) => {
      if (!chatId) return;

      setIsLoadingMessages(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockMessages: ChatMessage[] = [
          {
            id: 'msg1',
            senderId: 'user1',
            senderName: 'Alice Johnson',
            content: 'Hi! I think we would be a great match for our pets!',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            messageType: 'text',
          },
          {
            id: 'msg2',
            senderId: 'user2',
            senderName: 'Bob Smith',
            content: 'Hello! Tell me more about your dog.',
            timestamp: new Date(Date.now() - 25 * 60 * 1000),
            messageType: 'text',
          },
          {
            id: 'msg3',
            senderId: 'user1',
            senderName: 'Alice Johnson',
            content: 'He loves playing fetch and is very friendly!',
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
            messageType: 'text',
          },
        ];

        setChatMessages(mockMessages);
        logger.info('Chat messages loaded', {
          chatId,
          messageCount: mockMessages.length,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load messages');
        logger.error('Failed to load chat messages', { error: err, chatId });
        handleNetworkError(err, 'admin.chats.messages.load');
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [handleNetworkError],
  );

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  const filteredChats = useMemo(() => {
    const query = filter.searchQuery.trim().toLowerCase();
    return chats.filter((chat) => {
      // Filter by type
      if (filter.type === 'reported' && !chat.isReported) return false;
      if (filter.type === 'active' && chat.updatedAt < new Date(Date.now() - 24 * 60 * 60 * 1000))
        return false;
      if (
        filter.type === 'inactive' &&
        chat.updatedAt >= new Date(Date.now() - 24 * 60 * 60 * 1000)
      )
        return false;

      // Filter by search query
      if (query.length > 0) {
        const participantNames = [chat.participants.user1.name, chat.participants.user2.name]
          .join(' ')
          .toLowerCase();
        return participantNames.includes(query);
      }

      return true;
    });
  }, [chats, filter]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadChats({ force: true });
  }, [loadChats]);

  const onFilterChange = useCallback((newFilter: Partial<ChatFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const onChatSelect = useCallback(
    (chat: ActiveChat) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setSelectedChat(chat);
      void loadChatMessages(chat.id);
    },
    [loadChatMessages],
  );

  const onChatClose = useCallback(() => {
    setSelectedChat(null);
    setChatMessages([]);
  }, []);

  const onMessageDelete = useCallback(
    async (messageId: string) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        setChatMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        logger.info('Message deleted by admin', { messageId });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to delete message');
        logger.error('Failed to delete message', { error: err, messageId });
        handleNetworkError(err, 'admin.chats.message.delete');
      }
    },
    [handleNetworkError],
  );

  const onChatBlock = useCallback(
    async (chatId: string) => {
      try {
        const confirmed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Block Chat',
            'This will prevent both users from communicating. Are you sure?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                  resolve(false);
                },
              },
              {
                text: 'Block',
                style: 'destructive',
                onPress: () => {
                  resolve(true);
                },
              },
            ],
          );
        });

        if (!confirmed) return;

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        if (selectedChat?.id === chatId) {
          onChatClose();
        }

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        logger.info('Chat blocked by admin', { chatId });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to block chat');
        logger.error('Failed to block chat', { error: err, chatId });
        handleNetworkError(err, 'admin.chats.block');
      }
    },
    [selectedChat, onChatClose, handleNetworkError],
  );

  const onChatWarn = useCallback(
    async (chatId: string) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));

        Alert.alert('Warning Sent', 'Both users have been warned about community guidelines.');

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        logger.info('Chat warning sent by admin', { chatId });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to send warning');
        logger.error('Failed to send chat warning', { error: err, chatId });
        handleNetworkError(err, 'admin.chats.warn');
      }
    },
    [handleNetworkError],
  );

  return {
    // Data
    chats,
    selectedChat,
    chatMessages,

    // Filters & Search
    filter,
    filteredChats,

    // UI State
    isLoading,
    isRefreshing,
    isLoadingMessages,

    // Actions
    onRefresh,
    onFilterChange,
    onChatSelect,
    onChatClose,
    onMessageDelete,
    onChatBlock,
    onChatWarn,
    onBackPress: () => navigation.goBack(),
  };
}

export default useAdminChatsScreen;
