/**
 * Tests for useMessageActions hook
 * Tests message retry and delete functionality
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import { useMessageActions } from '../useMessageActions';
import { matchesAPI } from '../../../services/api';
import { logger } from '@pawfectmatch/core';
import type { Message } from '../../useChatData';

// Mock dependencies
jest.mock('../../../services/api');
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockMatchesAPI = matchesAPI as jest.Mocked<typeof matchesAPI>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('useMessageActions', () => {
  const matchId = 'test-match-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockMatchesAPI.sendMessage = jest.fn().mockResolvedValue(undefined);
    mockMatchesAPI.deleteMessage = jest.fn().mockResolvedValue(undefined);
  });

  const mockMessages: Message[] = [
    {
      _id: 'msg-1',
      content: 'Hello',
      senderId: 'user-1',
      receiverId: 'user-2',
      createdAt: new Date().toISOString(),
      status: 'sent',
    },
    {
      _id: 'msg-2',
      content: 'World',
      senderId: 'user-1',
      receiverId: 'user-2',
      createdAt: new Date().toISOString(),
      status: 'sent',
    },
  ];

  describe('Initialization', () => {
    it('should initialize with retry and delete functions', () => {
      const { result } = renderHook(() => useMessageActions({ matchId }));

      expect(result.current.retryMessage).toBeDefined();
      expect(result.current.deleteMessage).toBeDefined();
    });
  });

  describe('Retry Message', () => {
    it('should retry an existing message', async () => {
      const onMessageRetried = jest.fn();
      const { result } = renderHook(() => useMessageActions({ matchId, onMessageRetried }));

      await result.current.retryMessage('msg-1', mockMessages);

      expect(mockMatchesAPI.sendMessage).toHaveBeenCalledWith(matchId, 'Hello');
      expect(onMessageRetried).toHaveBeenCalledWith('msg-1');
      expect(mockLogger.info).toHaveBeenCalledWith('Message retried', {
        messageId: 'msg-1',
        matchId,
      });
    });

    it('should not retry non-existent message', async () => {
      const { result } = renderHook(() => useMessageActions({ matchId }));

      await result.current.retryMessage('msg-999', mockMessages);

      expect(mockMatchesAPI.sendMessage).not.toHaveBeenCalled();
    });

    it('should handle retry errors', async () => {
      const error = new Error('Network error');
      mockMatchesAPI.sendMessage.mockRejectedValue(error);

      const { result } = renderHook(() => useMessageActions({ matchId }));

      await expect(result.current.retryMessage('msg-1', mockMessages)).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to retry message', {
        error,
        messageId: 'msg-1',
      });
    });

    it('should work without callback', async () => {
      const { result } = renderHook(() => useMessageActions({ matchId }));

      await result.current.retryMessage('msg-2', mockMessages);

      expect(mockMatchesAPI.sendMessage).toHaveBeenCalledWith(matchId, 'World');
    });
  });

  describe('Delete Message', () => {
    it('should delete a message', async () => {
      const onMessageDeleted = jest.fn();
      const { result } = renderHook(() => useMessageActions({ matchId, onMessageDeleted }));

      await result.current.deleteMessage('msg-1');

      expect(mockMatchesAPI.deleteMessage).toHaveBeenCalledWith(matchId, 'msg-1');
      expect(onMessageDeleted).toHaveBeenCalledWith('msg-1');
      expect(mockLogger.info).toHaveBeenCalledWith('Message deleted', {
        messageId: 'msg-1',
        matchId,
      });
    });

    it('should handle delete errors', async () => {
      const error = new Error('Network error');
      mockMatchesAPI.deleteMessage.mockRejectedValue(error);

      const { result } = renderHook(() => useMessageActions({ matchId }));

      await expect(result.current.deleteMessage('msg-1')).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to delete message', {
        error,
        messageId: 'msg-1',
      });
    });

    it('should work without callback', async () => {
      const { result } = renderHook(() => useMessageActions({ matchId }));

      await result.current.deleteMessage('msg-2');

      expect(mockMatchesAPI.deleteMessage).toHaveBeenCalledWith(matchId, 'msg-2');
    });
  });

  describe('Integration', () => {
    it('should retry then delete message', async () => {
      const { result } = renderHook(() => useMessageActions({ matchId }));

      await result.current.retryMessage('msg-1', mockMessages);

      await result.current.deleteMessage('msg-1');

      expect(mockMatchesAPI.sendMessage).toHaveBeenCalledWith(matchId, 'Hello');
      expect(mockMatchesAPI.deleteMessage).toHaveBeenCalledWith(matchId, 'msg-1');
    });
  });
});
