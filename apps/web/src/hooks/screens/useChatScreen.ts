/**
 * useChatScreen Hook - Web Version
 * Matches mobile useChatScreen exactly
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@pawfectmatch/core';
import apiClient from '@/lib/api-client';

export interface ChatMessage {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  type: 'text' | 'image' | 'voice' | 'system';
  reactions?: Array<{ emoji: string; userId: string }>;
}

export interface UseChatScreenReturn {
  inputText: string;
  setInputText: (text: string) => void;
  isTyping: boolean;
  showReactions: boolean;
  data: {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    isOnline: boolean;
    match: any | null;
  };
  actions: {
    sendMessage: () => Promise<void>;
    loadMoreMessages: () => Promise<void>;
  };
  handleSendMessage: () => Promise<void>;
  handleTypingChange: (text: string) => void;
  handleScroll: (offset: number) => void;
  handleQuickReplySelect: (reply: string) => void;
  handleMessageLongPress: (messageId: string) => void;
  handleReactionSelect: (messageId: string, emoji: string) => void;
  handleReactionCancel: () => void;
  handleVoiceCall: () => void;
  handleVideoCall: () => void;
  handleMoreOptions: () => void;
  quickReplies: string[];
}

export function useChatScreen(
  matchId: string,
  petName: string,
  router: ReturnType<typeof useRouter>
): UseChatScreenReturn {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [match, setMatch] = useState<any | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const flatListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const chatMessages = await apiClient.getChatMessages(matchId);
        setMessages(Array.isArray(chatMessages) ? chatMessages : []);
        const matchData = await apiClient.getMatch(matchId);
        setMatch(matchData);
        setIsOnline(matchData?.isOnline || false);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
        setError(errorMessage);
        logger.error('Failed to load chat messages:', { error: err });
      } finally {
        setIsLoading(false);
      }
    };

    void loadMessages();
  }, [matchId]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      await apiClient.sendMessage(matchId, messageText);
      // Reload messages to get the new one
      const chatMessages = await apiClient.getChatMessages(matchId);
      setMessages(Array.isArray(chatMessages) ? chatMessages : []);
    } catch (err) {
      logger.error('Failed to send message:', { error: err });
      setInputText(messageText); // Restore text on error
    }
  }, [inputText, matchId]);

  const handleTypingChange = useCallback((text: string) => {
    setInputText(text);
    // Implement typing indicator
  }, []);

  const handleScroll = useCallback((offset: number) => {
    // Store scroll position if needed
  }, []);

  const handleQuickReplySelect = useCallback((reply: string) => {
    setInputText(reply);
  }, []);

  const handleMessageLongPress = useCallback((messageId: string) => {
    setSelectedMessageId(messageId);
    setShowReactions(true);
  }, []);

  const handleReactionSelect = useCallback(async (messageId: string, emoji: string) => {
    try {
      await apiClient.addReaction(matchId, messageId, emoji);
      // Reload messages
      const chatMessages = await apiClient.getChatMessages(matchId);
      setMessages(Array.isArray(chatMessages) ? chatMessages : []);
    } catch (err) {
      logger.error('Failed to add reaction:', { error: err });
    }
    setShowReactions(false);
    setSelectedMessageId(null);
  }, [matchId]);

  const handleReactionCancel = useCallback(() => {
    setShowReactions(false);
    setSelectedMessageId(null);
  }, []);

  const handleVoiceCall = useCallback(() => {
    router.push(`/video-call/${matchId}`);
  }, [router, matchId]);

  const handleVideoCall = useCallback(() => {
    router.push(`/video-call/${matchId}`);
  }, [router, matchId]);

  const handleMoreOptions = useCallback(() => {
    // Open more options menu
  }, []);

  const loadMoreMessages = useCallback(async () => {
    // Implement pagination if needed
  }, []);

  const quickReplies = [
    'Hey! 👋',
    'That\'s awesome!',
    'Sounds great!',
    'Let\'s meet up!',
  ];

  return {
    inputText,
    setInputText,
    isTyping,
    showReactions,
    data: {
      messages,
      isLoading,
      error,
      isOnline,
      match,
    },
    actions: {
      sendMessage: handleSendMessage,
      loadMoreMessages,
    },
    handleSendMessage,
    handleTypingChange,
    handleScroll,
    handleQuickReplySelect,
    handleMessageLongPress,
    handleReactionSelect,
    handleReactionCancel,
    handleVoiceCall,
    handleVideoCall,
    handleMoreOptions,
    quickReplies,
  };
}

