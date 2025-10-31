/**
 * Admin Chats Hook
 * Extracts business logic for AdminChatsScreen
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { _adminAPI } from '../../../../services/api';
import { errorHandler } from '../../../../services/errorHandler';
import type { ChatFilter, ChatMessage } from '../types';

export const useAdminChats = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<ChatFilter>('flagged');

  const loadMessages = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        const response = await _adminAPI.getChatMessages({
          filter,
          search: searchQuery,
          limit: 50,
        });

        if (response?.success && response.data) {
          // Ensure data is an array
          const dataArray = Array.isArray(response.data) ? response.data : [response.data];
          setMessages(dataArray as ChatMessage[]);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to load chat messages'),
          {
            component: 'AdminChatsScreen',
            action: 'loadMessages',
          },
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, searchQuery],
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const handleMessageAction = useCallback(
    async (messageId: string, action: 'approve' | 'remove' | 'warn') => {
      try {
        const response = await _adminAPI.moderateMessage({
          messageId,
          action,
        });

        if (response?.success) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    reviewed: true,
                    reviewedAt: new Date().toISOString(),
                    action:
                      action === 'approve'
                        ? 'approved'
                        : action === 'remove'
                          ? 'removed'
                          : 'warned',
                  }
                : msg,
            ),
          );

          Alert.alert('Success', `Message ${action}d successfully`);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error(`Failed to ${action} message`),
          {
            component: 'AdminChatsScreen',
            action: 'handleMessageAction',
            metadata: { messageId, action },
          },
        );
      }
    },
    [],
  );

  return {
    messages,
    loading,
    refreshing,
    searchQuery,
    filter,
    setSearchQuery,
    setFilter,
    loadMessages,
    handleMessageAction,
  };
};

