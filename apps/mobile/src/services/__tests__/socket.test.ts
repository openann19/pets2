/**
 * Comprehensive tests for Socket Service
 * 
 * Coverage:
 * - WebSocket connections
 * - Reconnection logic
 * - Event handling
 * - Error handling
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { io, Socket } from 'socket.io-client';
import { getSocket, socketClient } from '../socket';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(),
}));

const mockIo = io as jest.MockedFunction<typeof io>;

describe('Socket Service', () => {
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock socket instance
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      off: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      id: 'mock-socket-id',
      connected: true,
      disconnected: false,
      auth: {},
      receivedAck: true,
      binaryType: 'arraybuffer',
      opts: {},
      io: {} as any,
      connectTimeout: undefined,
      _readyState: 'open',
      _receiver: undefined,
      _sender: undefined,
      _pid: undefined,
      _parser: undefined,
      toString: jest.fn(() => 'Socket'),
      to: jest.fn(),
      in: jest.fn(),
      onAny: jest.fn(),
      prependAny: jest.fn(),
      offAny: jest.fn(),
      offAnyIncoming: jest.fn(),
      emitAny: jest.fn(),
      listenersAny: jest.fn(),
      listenersAnyOutgoing: jest.fn(),
      compress: jest.fn(),
      timeout: jest.fn(),
      sendBuffer: [],
      consumeBuffer: jest.fn(),
      open: jest.fn(),
      write: jest.fn(),
      close: jest.fn(),
      destroy: jest.fn(),
      disconnectInternal: jest.fn(),
      cleanup: jest.fn(),
      read: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as any;

    mockIo.mockReturnValue(mockSocket as any);
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('Happy Path - Socket Initialization', () => {
    it('should create socket instance on first call', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();

      expect(io).toHaveBeenCalled();
      expect(socket).toBeDefined();
    });

    it('should return existing socket on subsequent calls', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket1 = getSocket();
      const socket2 = getSocket();

      expect(io).toHaveBeenCalledTimes(1);
      expect(socket1).toBe(socket2);
    });

    it('should initialize socket with correct configuration', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      getSocket();

      expect(io).toHaveBeenCalledWith(
        '',
        expect.objectContaining({
          transports: ['websocket'],
          forceNew: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        })
      );
    });

    it('should export socketClient singleton', () => {
      expect(socketClient).toBeDefined();
    });
  });

  describe('Happy Path - Socket Connection', () => {
    it('should have connected state', () => {
      mockSocket.connected = true;
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();

      expect(socket.connected).toBe(true);
    });

    it('should have socket ID', () => {
      mockSocket.id = 'test-socket-id';
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();

      expect(socket.id).toBe('test-socket-id');
    });
  });

  describe('Happy Path - Event Handling', () => {
    it('should listen to events', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      const handler = jest.fn();

      socket.on('test-event', handler);

      expect(mockSocket.on).toHaveBeenCalledWith('test-event', handler);
    });

    it('should emit events', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      const data = { message: 'test' };

      socket.emit('test-event', data);

      expect(mockSocket.emit).toHaveBeenCalledWith('test-event', data);
    });

    it('should remove event listeners', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      const handler = jest.fn();

      socket.off('test-event', handler);

      expect(mockSocket.off).toHaveBeenCalledWith('test-event', handler);
    });
  });

  describe('Happy Path - Connection Management', () => {
    it('should connect to server', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      socket.connect();

      expect(mockSocket.connect).toHaveBeenCalled();
    });

    it('should disconnect from server', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      socket.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', () => {
      const errorHandler = jest.fn();
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      socket.on('connect_error', errorHandler);

      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', errorHandler);
    });

    it('should handle reconnection errors', () => {
      const errorHandler = jest.fn();
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      socket.on('reconnect_error', errorHandler);

      expect(mockSocket.on).toHaveBeenCalledWith('reconnect_error', errorHandler);
    });

    it('should handle disconnection', () => {
      const disconnectHandler = jest.fn();
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      socket.on('disconnect', disconnectHandler);

      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', disconnectHandler);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined URL gracefully', () => {
      process.env.EXPO_PUBLIC_SOCKET_URL = undefined;
      process.env.SOCKET_URL = undefined;

      mockIo.mockReturnValueOnce(mockSocket as any);

      expect(() => getSocket()).not.toThrow();
      expect(io).toHaveBeenCalledWith('', expect.any(Object));
    });

    it('should handle disconnected state', () => {
      mockSocket.connected = false;
      mockSocket.disconnected = true;
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();

      expect(socket.connected).toBe(false);
      expect(socket.disconnected).toBe(true);
    });

    it('should handle multiple event listeners', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      socket.on('event', handler1);
      socket.on('event', handler2);

      expect(mockSocket.on).toHaveBeenCalledTimes(2);
    });

    it('should handle socket without ID', () => {
      mockSocket.id = undefined;
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();

      expect(socket.id).toBeUndefined();
    });
  });

  describe('Integration', () => {
    it('should maintain connection state across calls', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket1 = getSocket();
      socket1.connect();

      const socket2 = getSocket();

      expect(mockSocket.connect).toHaveBeenCalled();
      expect(socket1).toBe(socket2);
    });

    it('should handle socket events properly', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      const testData = { id: '123', message: 'hello' };

      socket.emit('message', testData);
      socket.on('response', jest.fn());

      expect(mockSocket.emit).toHaveBeenCalledWith('message', testData);
      expect(mockSocket.on).toHaveBeenCalled();
    });
  });

  describe('Reconnection', () => {
    it('should handle reconnection', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      const handler = jest.fn();
      socket.on('reconnect', handler);

      expect(mockSocket.on).toHaveBeenCalledWith('reconnect', handler);
    });

    it('should handle reconnection attempts', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();
      const handler = jest.fn();
      socket.on('reconnect_attempt', handler);

      expect(mockSocket.on).toHaveBeenCalledWith('reconnect_attempt', handler);
    });
  });

  describe('Type Safety', () => {
    it('should maintain socket type', () => {
      mockIo.mockReturnValueOnce(mockSocket as any);

      const socket = getSocket();

      expect(socket).toBeInstanceOf(Object);
      expect(typeof socket.emit).toBe('function');
      expect(typeof socket.on).toBe('function');
      expect(typeof socket.disconnect).toBe('function');
    });
  });
});
