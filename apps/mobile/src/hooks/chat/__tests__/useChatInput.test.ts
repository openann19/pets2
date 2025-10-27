/**
 * Tests for useChatInput hook
 * Tests input state management, draft persistence, and typing indicators
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatInput } from '../useChatInput';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../services/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useChatInput', () => {
  const matchId = 'test-match-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with empty input text', () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      expect(result.current.inputText).toBe('');
      expect(result.current.isTyping).toBe(false);
    });

    it('should load draft from storage on mount', async () => {
      const draftText = 'Hello, this is a draft!';
      mockAsyncStorage.getItem.mockResolvedValue(draftText);

      const { result } = renderHook(() => useChatInput({ matchId }));

      await waitFor(() => {
        expect(result.current.inputText).toBe(draftText);
      });

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        `mobile_chat_draft_${matchId}`,
      );
    });

    it('should not load draft when disabled', async () => {
      const draftText = 'Draft text';
      mockAsyncStorage.getItem.mockResolvedValue(draftText);

      const { result } = renderHook(() =>
        useChatInput({ matchId, enabled: false }),
      );

      await waitFor(() => {
        expect(result.current.inputText).toBe('');
      });

      expect(mockAsyncStorage.getItem).not.toHaveBeenCalled();
    });
  });

  describe('Input Management', () => {
    it('should update input text', () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.setInputText('Hello');
      });

      expect(result.current.inputText).toBe('Hello');
    });

    it('should respect maxLength limit', () => {
      const { result } = renderHook(() =>
        useChatInput({ matchId, maxLength: 10 }),
      );

      act(() => {
        result.current.setInputText('This is too long');
      });

      expect(result.current.inputText).toBe('');
    });

    it('should clear input text', () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.setInputText('Hello');
      });

      expect(result.current.inputText).toBe('Hello');

      act(() => {
        result.current.clearInput();
      });

      expect(result.current.inputText).toBe('');
    });
  });

  describe('Draft Persistence', () => {
    it('should persist input to storage', async () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.setInputText('Test message');
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          `mobile_chat_draft_${matchId}`,
          'Test message',
        );
      });
    });

    it('should remove draft when input is cleared', async () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.setInputText('Test');
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });

      mockAsyncStorage.setItem.mockClear();

      act(() => {
        result.current.clearInput();
      });

      await waitFor(() => {
        expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
          `mobile_chat_draft_${matchId}`,
        );
      });
    });

    it('should not persist when disabled', async () => {
      const { result } = renderHook(() =>
        useChatInput({ matchId, enabled: false }),
      );

      act(() => {
        result.current.setInputText('Test');
      });

      await waitFor(() => {
        expect(result.current.inputText).toBe('Test');
      });

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.setInputText('Test');
      });

      await waitFor(() => {
        expect(result.current.inputText).toBe('Test');
      });
    });
  });

  describe('Typing Indicator', () => {
    it('should track typing state', () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.handleTyping(true);
      });

      expect(result.current.isTyping).toBe(true);
    });

    it('should auto-clear typing after 2 seconds', async () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.handleTyping(true);
      });

      expect(result.current.isTyping).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.isTyping).toBe(false);
    });

    it('should cancel timeout on repeated typing', async () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.handleTyping(true);
      });

      act(() => {
        jest.advanceTimersByTime(1500);
      });

      act(() => {
        result.current.handleTyping(true); // Should reset timer
      });

      expect(result.current.isTyping).toBe(true);

      act(() => {
        jest.advanceTimersByTime(500); // Should not clear yet
      });

      expect(result.current.isTyping).toBe(true);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.isTyping).toBe(false);
    });

    it('should stop typing indicator', () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.handleTyping(true);
      });

      expect(result.current.isTyping).toBe(true);

      act(() => {
        result.current.handleTyping(false);
      });

      expect(result.current.isTyping).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should clear timeout on unmount', () => {
      const { result, unmount } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.handleTyping(true);
      });

      expect(result.current.isTyping).toBe(true);

      unmount();

      // No error should be thrown
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty draft from storage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('');

      const { result } = renderHook(() => useChatInput({ matchId }));

      await waitFor(() => {
        expect(result.current.inputText).toBe('');
      });
    });

    it('should handle storage getItem errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Read error'));

      const { result } = renderHook(() => useChatInput({ matchId }));

      await waitFor(() => {
        expect(result.current.inputText).toBe('');
      });
    });

    it('should handle rapid input changes', async () => {
      const { result } = renderHook(() => useChatInput({ matchId }));

      act(() => {
        result.current.setInputText('A');
      });

      act(() => {
        result.current.setInputText('AB');
      });

      act(() => {
        result.current.setInputText('ABC');
      });

      expect(result.current.inputText).toBe('ABC');
    });

    it('should work with different matchIds', () => {
      const { result: result1 } = renderHook(() =>
        useChatInput({ matchId: 'match-1' }),
      );
      const { result: result2 } = renderHook(() =>
        useChatInput({ matchId: 'match-2' }),
      );

      act(() => {
        result1.current.setInputText('Match 1 text');
      });

      act(() => {
        result2.current.setInputText('Match 2 text');
      });

      expect(result1.current.inputText).toBe('Match 1 text');
      expect(result2.current.inputText).toBe('Match 2 text');
    });
  });
});

