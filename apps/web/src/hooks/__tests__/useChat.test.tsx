/**
 * useChat Hook Tests
 * Tests the real-time chat functionality hook
 * 
 * CRITICAL: This hook is completely untested
 * Business Impact: Core real-time messaging functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';

// Mock WebSocket
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: WebSocket.OPEN,
  CONNECTING: WebSocket.CONNECTING,
  OPEN: WebSocket.OPEN,
  CLOSING: WebSocket.CLOSING,
  CLOSED: WebSocket.CLOSED,
};

// Mock WebSocket constructor
global.WebSocket = jest.fn(() => mockWebSocket) as any;

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  })),
}));

describe('useChat Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset WebSocket mock
    (global.WebSocket as jest.Mock).mockClear();
    mockWebSocket.send.mockClear();
    mockWebSocket.close.mockClear();
    mockWebSocket.addEventListener.mockClear();
    mockWebSocket.removeEventListener.mockClear();
  });

  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChat('match-123'));

    expect(result.current.messages).toEqual([]);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isTyping).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should connect to WebSocket on mount', async () => {
    renderHook(() => useChat('match-123'));

    await waitFor(() => {
      expect(global.WebSocket).toHaveBeenCalled();
    });
  });

  it('should connect with correct WebSocket URL', async () => {
    renderHook(() => useChat('match-123'));

    await waitFor(() => {
      expect(global.WebSocket).toHaveBeenCalledWith(
        expect.stringContaining('ws://localhost:5001')
      );
    });
  });

  it('should send messages', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    act(() => {
      result.current.sendMessage('Hello!');
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'message',
        content: 'Hello!',
        matchId: 'match-123',
        timestamp: expect.any(String)
      })
    );
  });

  it('should send messages with metadata', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    act(() => {
      result.current.sendMessage('Hello!', {
        messageType: 'text',
        replyTo: 'msg-123'
      });
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'message',
        content: 'Hello!',
        matchId: 'match-123',
        messageType: 'text',
        replyTo: 'msg-123',
        timestamp: expect.any(String)
      })
    );
  });

  it('should receive messages', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message',
        content: 'Hi there!',
        sender: 'user-2',
        timestamp: new Date().toISOString(),
        id: 'msg-456'
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(messageEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Hi there!');
      expect(result.current.messages[0].sender).toBe('user-2');
    });
  });

  it('should handle typing indicators', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    act(() => {
      result.current.sendTypingIndicator();
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'typing',
        matchId: 'match-123',
        timestamp: expect.any(String)
      })
    );
  });

  it('should receive typing indicators', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    const typingEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'typing',
        sender: 'user-2',
        isTyping: true
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(typingEvent);
    });

    await waitFor(() => {
      expect(result.current.isTyping).toBe(true);
    });
  });

  it('should handle typing indicator timeout', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useChat('match-123'));

    const typingEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'typing',
        sender: 'user-2',
        isTyping: true
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(typingEvent);
    });

    expect(result.current.isTyping).toBe(true);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.isTyping).toBe(false);
    });

    jest.useRealTimers();
  });

  it('should mark messages as read', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    // Add a message
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message',
        content: 'Hi there!',
        sender: 'user-2',
        timestamp: new Date().toISOString(),
        id: 'msg-456'
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(messageEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    // Mark as read
    act(() => {
      result.current.markAsRead('msg-456');
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'read',
        messageId: 'msg-456',
        matchId: 'match-123',
        timestamp: expect.any(String)
      })
    );
  });

  it('should handle connection status changes', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    // Simulate connection open
    act(() => {
      const onOpen = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'open'
      )?.[1];
      onOpen?.();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate connection close
    act(() => {
      const onClose = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'close'
      )?.[1];
      onClose?.();
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });
  });

  it('should handle connection errors', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    const errorEvent = new ErrorEvent('error', {
      error: new Error('Connection failed')
    });

    act(() => {
      const onError = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'error'
      )?.[1];
      onError?.(errorEvent);
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Connection failed');
    });
  });

  it('should attempt reconnection on disconnect', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useChat('match-123'));

    // Simulate connection close
    act(() => {
      const onClose = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'close'
      )?.[1];
      onClose?.();
    });

    // Fast-forward reconnection delay
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });

  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => useChat('match-123'));

    unmount();

    expect(mockWebSocket.close).toHaveBeenCalled();
  });

  it('should handle message history loading', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    act(() => {
      result.current.loadMessageHistory();
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'load_history',
        matchId: 'match-123',
        timestamp: expect.any(String)
      })
    );
  });

  it('should handle message history response', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    const historyEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message_history',
        messages: [
          {
            id: 'msg-1',
            content: 'Hello',
            sender: 'user-1',
            timestamp: '2023-10-08T10:00:00Z'
          },
          {
            id: 'msg-2',
            content: 'Hi there',
            sender: 'user-2',
            timestamp: '2023-10-08T10:01:00Z'
          }
        ]
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(historyEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('Hello');
      expect(result.current.messages[1].content).toBe('Hi there');
    });
  });

  it('should handle message deletion', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    // Add a message first
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message',
        content: 'Hi there!',
        sender: 'user-2',
        timestamp: new Date().toISOString(),
        id: 'msg-456'
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(messageEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    // Delete the message
    act(() => {
      result.current.deleteMessage('msg-456');
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'delete_message',
        messageId: 'msg-456',
        matchId: 'match-123',
        timestamp: expect.any(String)
      })
    );
  });

  it('should handle message deletion response', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    // Add a message first
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message',
        content: 'Hi there!',
        sender: 'user-2',
        timestamp: new Date().toISOString(),
        id: 'msg-456'
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(messageEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    // Receive deletion confirmation
    const deleteEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message_deleted',
        messageId: 'msg-456'
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(deleteEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(0);
    });
  });

  it('should handle message editing', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    act(() => {
      result.current.editMessage('msg-456', 'Updated message');
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'edit_message',
        messageId: 'msg-456',
        content: 'Updated message',
        matchId: 'match-123',
        timestamp: expect.any(String)
      })
    );
  });

  it('should handle message edit response', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    // Add a message first
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message',
        content: 'Original message',
        sender: 'user-1',
        timestamp: new Date().toISOString(),
        id: 'msg-456'
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(messageEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe('Original message');
    });

    // Receive edit confirmation
    const editEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message_edited',
        messageId: 'msg-456',
        content: 'Updated message',
        editedAt: new Date().toISOString()
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(editEvent);
    });

    await waitFor(() => {
      expect(result.current.messages[0].content).toBe('Updated message');
      expect(result.current.messages[0].editedAt).toBeDefined();
    });
  });

  it('should handle file uploads', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    act(() => {
      result.current.sendFile(file);
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'file_upload',
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        fileSize: file.size,
        matchId: 'match-123',
        timestamp: expect.any(String)
      })
    );
  });

  it('should handle connection retry limits', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useChat('match-123'));

    // Simulate multiple connection failures
    for (let i = 0; i < 5; i++) {
      act(() => {
        const onClose = mockWebSocket.addEventListener.mock.calls.find(
          call => call[0] === 'close'
        )?.[1];
        onClose?.();
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });
    }

    await waitFor(() => {
      expect(result.current.error).toContain('max retries');
    });

    jest.useRealTimers();
  });

  it('should handle different message types', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    const messageTypes = ['text', 'image', 'file', 'emoji', 'gif'];

    for (const messageType of messageTypes) {
      act(() => {
        result.current.sendMessage('Test message', { messageType });
      });

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'message',
          content: 'Test message',
          matchId: 'match-123',
          messageType,
          timestamp: expect.any(String)
        })
      );
    }
  });

  it('should handle message reactions', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    act(() => {
      result.current.addReaction('msg-456', '👍');
    });

    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'reaction',
        messageId: 'msg-456',
        reaction: '👍',
        matchId: 'match-123',
        timestamp: expect.any(String)
      })
    );
  });

  it('should handle message reaction response', async () => {
    const { result } = renderHook(() => useChat('match-123'));

    // Add a message first
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'message',
        content: 'Test message',
        sender: 'user-2',
        timestamp: new Date().toISOString(),
        id: 'msg-456'
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(messageEvent);
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
    });

    // Receive reaction
    const reactionEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'reaction_added',
        messageId: 'msg-456',
        reaction: '👍',
        user: 'user-1'
      })
    });

    act(() => {
      const onMessage = mockWebSocket.addEventListener.mock.calls.find(
        call => call[0] === 'message'
      )?.[1];
      onMessage?.(reactionEvent);
    });

    await waitFor(() => {
      expect(result.current.messages[0].reactions).toHaveProperty('👍');
      expect(result.current.messages[0].reactions['👍']).toContain('user-1');
    });
  });
});
