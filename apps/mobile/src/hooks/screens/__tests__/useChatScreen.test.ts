/**
 * Comprehensive tests for useChatScreen hook
 *
 * Coverage:
 * - Message sending and receiving
 * - Input state management
 * - Typing indicators
 * - Quick replies
 * - Reactions handling
 * - Voice and video calls
 * - Scroll position persistence
 * - Draft persistence
 * - Error handling
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatScreen } from '../useChatScreen';
import { useChatData } from '../../useChatData';
import { useReactionMetrics } from '../../useInteractionMetrics';
import { haptic } from '../../../ui/haptics';
import { api } from '../../../services/api';
import { logger } from '../../../services/logger';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../useChatData');
jest.mock('../../useInteractionMetrics');
jest.mock('../../../ui/haptics');
jest.mock('../../../services/api');
jest.mock('../../../services/logger');
// Mock Animated API
const AnimatedMock = require('../../../../__mocks__/Animated.js');

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const AnimatedMock = require('../../../../__mocks__/Animated.js');
  
  return {
    ...RN,
    Animated: AnimatedMock,
    Alert: {
      alert: jest.fn(),
    },
    StatusBar: {
      setBarStyle: jest.fn(),
    },
    LayoutAnimation: {
      configureNext: jest.fn(),
      Presets: { easeInEaseOut: {} },
    },
    Platform: {
      OS: 'ios',
      Version: '14.0',
      select: jest.fn((obj) => obj.ios || obj.default),
      isTV: false,
      isTesting: true,
    },
  };
});

// Mock theme context
jest.mock('../../../theme/Provider', () => ({
  useTheme: () => ({ isDark: false }),
}));

const mockUseChatData = useChatData as jest.MockedFunction<typeof useChatData>;
const mockUseReactionMetrics = useReactionMetrics as jest.MockedFunction<typeof useReactionMetrics>;
const mockSetItem = AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>;
const mockGetItem = AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>;
const mockRemoveItem = AsyncStorage.removeItem as jest.MockedFunction<typeof AsyncStorage.removeItem>;

describe('useChatScreen Hook', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  } as any;

  const mockMatchId = 'match-123';
  const mockPetName = 'Buddy';

  const mockChatData = {
    messages: [],
    isLoading: false,
    error: null,
    hasMore: false,
  };

  const mockChatActions = {
    sendMessage: jest.fn().mockResolvedValue(undefined),
    loadMoreMessages: jest.fn(),
    refreshMessages: jest.fn(),
  };

  const mockReactionMetrics = {
    startInteraction: jest.fn(),
    endInteraction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseChatData.mockReturnValue({
      data: mockChatData,
      actions: mockChatActions,
    });

    mockUseReactionMetrics.mockReturnValue(mockReactionMetrics as any);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      expect(result.current.inputText).toBe('');
      expect(result.current.isTyping).toBe(false);
      expect(result.current.showReactions).toBe(false);
      expect(result.current.selectedMessageId).toBeNull();
      expect(result.current.data).toBe(mockChatData);
      expect(result.current.actions).toBe(mockChatActions);
    });

    it('should load draft from AsyncStorage on mount', async () => {
      const draftText = 'This is a draft message';
      mockGetItem.mockResolvedValue(draftText);

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      await waitFor(() => {
        expect(mockGetItem).toHaveBeenCalledWith(`mobile_chat_draft_${mockMatchId}`);
      });

      expect(result.current.inputText).toBe(draftText);
    });

    it('should handle no draft gracefully', async () => {
      mockGetItem.mockResolvedValue(null);

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      await waitFor(() => {
        expect(result.current.inputText).toBe('');
      });
    });
  });

  describe('Input Management', () => {
    it('should update input text correctly', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.setInputText('New message');
      });

      expect(result.current.inputText).toBe('New message');
    });

    it('should persist input text to AsyncStorage', async () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.setInputText('Test message');
      });

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith(
          `mobile_chat_draft_${mockMatchId}`,
          'Test message'
        );
      });
    });

    it('should remove draft when input is cleared', async () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.setInputText('');
      });

      await waitFor(() => {
        expect(mockRemoveItem).toHaveBeenCalledWith(`mobile_chat_draft_${mockMatchId}`);
      });
    });
  });

  describe('Message Sending', () => {
    it('should send message successfully', async () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.setInputText('Test message');
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockChatActions.sendMessage).toHaveBeenCalledWith('Test message');
      expect(result.current.inputText).toBe('');
      expect(haptic.confirm).toHaveBeenCalled();
    });

    it('should not send empty message', async () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.setInputText('   ');
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockChatActions.sendMessage).not.toHaveBeenCalled();
    });

    it('should trim message content before sending', async () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.setInputText('   Trimmed message   ');
      });

      await act(async () => {
        await result.current.handleSendMessage();
      });

      expect(mockChatActions.sendMessage).toHaveBeenCalledWith('Trimmed message');
    });
  });

  describe('Typing Indicators', () => {
    it('should handle typing state changes', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.handleTypingChange(true);
      });

      expect(result.current.isTyping).toBe(true);
      expect(api.chat.sendTypingIndicator).toHaveBeenCalledWith(mockMatchId, true);

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(result.current.isTyping).toBe(false);
        expect(api.chat.sendTypingIndicator).toHaveBeenCalledWith(mockMatchId, false);
      });

      jest.useRealTimers();
    });

    it('should clear timeout on unmount', () => {
      jest.useFakeTimers();
      const { unmount } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        const result = renderHook(() => useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })).result;
        result.current.handleTypingChange(true);
      });

      unmount();
      jest.useRealTimers();
    });
  });

  describe('Quick Replies', () => {
    it('should populate quick replies correctly', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      expect(result.current.quickReplies).toHaveLength(4);
      expect(result.current.quickReplies).toContain('Sounds good! 👍');
      expect(result.current.quickReplies).toContain('Let\'s do it! 🎾');
    });

    it('should handle quick reply selection', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.handleQuickReplySelect('Sounds good! 👍');
      });

      expect(result.current.inputText).toBe('Sounds good! 👍');
      expect(haptic.tap).toHaveBeenCalled();
    });
  });

  describe('Reactions', () => {
    it('should handle message long press to show reactions', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.handleMessageLongPress('message-123');
      });

      expect(result.current.selectedMessageId).toBe('message-123');
      expect(result.current.showReactions).toBe(true);
      expect(haptic.tap).toHaveBeenCalled();
    });

    it('should handle reaction selection', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.handleMessageLongPress('message-123');
      });

      act(() => {
        result.current.handleReactionSelect('👍');
      });

      expect(result.current.showReactions).toBe(false);
      expect(result.current.selectedMessageId).toBeNull();
      expect(mockReactionMetrics.startInteraction).toHaveBeenCalled();
      expect(mockReactionMetrics.endInteraction).toHaveBeenCalled();
      expect(haptic.confirm).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Reacted with emoji', { emoji: '👍', messageId: 'message-123' });
    });

    it('should handle reaction cancel', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.handleMessageLongPress('message-123');
      });

      act(() => {
        result.current.handleReactionCancel();
      });

      expect(result.current.showReactions).toBe(false);
      expect(result.current.selectedMessageId).toBeNull();
      expect(haptic.selection).toHaveBeenCalled();
    });

    it('should not react if no message is selected', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.handleReactionSelect('👍');
      });

      expect(mockReactionMetrics.startInteraction).not.toHaveBeenCalled();
    });
  });

  describe('Call Handlers', () => {
    it('should handle voice call alert', async () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      await act(async () => {
        await result.current.handleVoiceCall();
      });

      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('should handle video call alert', async () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      await act(async () => {
        await result.current.handleVideoCall();
      });

      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Scroll Position', () => {
    it('should save scroll position to AsyncStorage', async () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      const mockEvent = {
        nativeEvent: { contentOffset: { y: 100 } },
      } as any;

      await act(async () => {
        await result.current.handleScroll(mockEvent);
      });

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith(
          `mobile_chat_scroll_${mockMatchId}`,
          '100'
        );
      });
    });
  });

  describe('Data Integration', () => {
    it('should provide chat data and actions', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      expect(result.current.data).toBe(mockChatData);
      expect(result.current.actions).toBe(mockChatActions);
    });

    it('should handle loading state from chat data', () => {
      mockUseChatData.mockReturnValue({
        data: { ...mockChatData, isLoading: true },
        actions: mockChatActions,
      });

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      expect(result.current.data.isLoading).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      mockGetItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      await waitFor(() => {
        expect(result.current.inputText).toBe('');
      });
    });

    it('should handle empty input text updates', () => {
      const { result } = renderHook(() =>
        useChatScreen({
          matchId: mockMatchId,
          petName: mockPetName,
          navigation: mockNavigation,
        })
      );

      act(() => {
        result.current.setInputText('');
      });

      expect(result.current.inputText).toBe('');
    });
  });
});

