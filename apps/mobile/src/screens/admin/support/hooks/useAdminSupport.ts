/**
 * Admin Support Hook
 * Manages support chat list and conversation state
 */

import { logger } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { _adminAPI } from '../../../services/adminAPI';
import type { SupportChat, SupportChatFilter, SupportMessage } from '../types';
import { useErrorHandler } from '../../../hooks/useErrorHandler';

interface UseAdminSupportReturn {
  chats: SupportChat[];
  isLoading: boolean;
  isRefreshing: boolean;
  searchQuery: string;
  filter: SupportChatFilter;
  selectedChat: SupportChat | null;
  messages: SupportMessage[];
  isLoadingMessages: boolean;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: SupportChatFilter) => void;
  loadChats: (force?: boolean) => Promise<void>;
  selectChat: (chat: SupportChat) => void;
  closeChat: () => void;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, message: string) => Promise<void>;
  closeSupportChat: (chatId: string, resolution?: string) => Promise<void>;
}

export function useAdminSupport(): UseAdminSupportReturn {
  const { handleNetworkError } = useErrorHandler();
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<SupportChatFilter>('all');
  const [selectedChat, setSelectedChat] = useState<SupportChat | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const loadChats = useCallback(
    async (force = false) => {
      try {
        if (!force) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        const response = await _adminAPI.getSupportChats({
          page: 1,
          limit: 100,
        });

        if (response.success && response.data) {
          setChats(response.data.chats);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load support chats');
        logger.error('Failed to load support chats', { error: err });
        handleNetworkError(err, 'admin.support.chats.load');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleNetworkError],
  );

  const loadMessages = useCallback(
    async (chatId: string) => {
      try {
        setIsLoadingMessages(true);
        const response = await _adminAPI.getSupportChatMessages(chatId, {
          page: 1,
          limit: 100,
        });

        if (response.success && response.data) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load messages');
        logger.error('Failed to load support messages', { error: err, chatId });
        handleNetworkError(err, 'admin.support.messages.load');
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [handleNetworkError],
  );

  const sendMessage = useCallback(
    async (chatId: string, message: string) => {
      try {
        const response = await _adminAPI.sendSupportMessage(chatId, message);
        if (response.success) {
          // Reload messages to get the new one
          await loadMessages(chatId);
          // Reload chats to update last message
          await loadChats(true);
        } else {
          Alert.alert('Error', 'Failed to send message');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to send message');
        logger.error('Failed to send support message', { error: err, chatId });
        handleNetworkError(err, 'admin.support.message.send');
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    },
    [handleNetworkError, loadMessages, loadChats],
  );

  const closeSupportChat = useCallback(
    async (chatId: string, resolution?: string) => {
      try {
        const response = await _adminAPI.closeSupportChat(chatId, resolution);
        if (response.success) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
            () => undefined,
          );
          // Reload chats to reflect status change
          await loadChats(true);
          // Clear selected chat if it was closed
          if (selectedChat?.id === chatId) {
            setSelectedChat(null);
            setMessages([]);
          }
          Alert.alert('Success', 'Support chat closed successfully');
        } else {
          Alert.alert('Error', 'Failed to close chat');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to close chat');
        logger.error('Failed to close support chat', { error: err, chatId });
        handleNetworkError(err, 'admin.support.chat.close');
        Alert.alert('Error', 'Failed to close chat. Please try again.');
      }
    },
    [handleNetworkError, loadChats, selectedChat],
  );

  const selectChat = useCallback(
    async (chat: SupportChat) => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics not available
      }
      setSelectedChat(chat);
      await loadMessages(chat.id);
    },
    [loadMessages],
  );

  const closeChat = useCallback(() => {
    setSelectedChat(null);
    setMessages([]);
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  return {
    chats,
    isLoading,
    isRefreshing,
    searchQuery,
    filter,
    selectedChat,
    messages,
    isLoadingMessages,
    setSearchQuery,
    setFilter,
    loadChats,
    selectChat,
    closeChat,
    loadMessages,
    sendMessage,
    closeSupportChat,
  };
}

