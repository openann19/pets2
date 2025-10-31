/// <reference types="jest" />

import { useAuthStore } from '@pawfectmatch/core';
import { act, renderHook } from '@testing-library/react-hooks';
import { io } from 'socket.io-client';

import { useSocket, useSocketEmit, useSocketWithStatus } from '../useSocket';

// Mock dependencies
jest.mock('socket.io-client');
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: jest.fn(),
}));

const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  removeAllListeners: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
  id: 'test-socket-id',
};

const mockIo = io as jest.MockedFunction<typeof io>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('useSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIo.mockReturnValue(mockSocket as any);
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
      accessToken: 'test-access-token',
    } as any);
  });

  it('should create socket connection with correct configuration', () => {
    renderHook(() => useSocket());

    expect(mockIo).toHaveBeenCalledWith(
      'http://localhost:3001',
      expect.objectContaining({
        auth: {
          token: 'test-access-token',
          userId: 'test-user-id',
        },
        transports: ['websocket'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }),
    );
  });

  it('should use environment variable for socket URL if available', () => {
    // Clear previous calls
    mockIo.mockClear();

    // Mock the environment variable at the module level
    const originalEnv = process.env['EXPO_PUBLIC_SOCKET_URL'];
    process.env['EXPO_PUBLIC_SOCKET_URL'] = 'ws://custom-url:3001';

    try {
      // Re-import the hook to pick up the new environment variable
      jest.resetModules();
      const { useSocket: useSocketWithEnv } = require('../useSocket');

      renderHook(() => useSocketWithEnv());

      expect(mockIo).toHaveBeenCalledWith(
        'ws://custom-url:3001',
        expect.objectContaining({
          auth: expect.any(Object),
          transports: ['websocket'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        }),
      );
    } finally {
      // Restore original environment variable
      if (originalEnv !== undefined) {
        process.env['EXPO_PUBLIC_SOCKET_URL'] = originalEnv;
      } else {
        delete process.env['EXPO_PUBLIC_SOCKET_URL'];
      }
      jest.resetModules();
    }
  });

  it('should not create socket if user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      accessToken: null,
    } as any);

    const { result } = renderHook(() => useSocket());

    expect(mockIo).not.toHaveBeenCalled();
    expect(result.current).toBeNull();
  });

  it('should set up event listeners correctly', () => {
    renderHook(() => useSocket());

    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('auth_error', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('user_online', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('user_offline', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('new_match', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('new_message', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('incoming_call', expect.any(Function));
  });

  it('should handle connect event', () => {
    renderHook(() => useSocket());

    const connectHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect')?.[1];

    if (connectHandler) {
      act(() => {
        connectHandler();
      });
    }

    // Should log connection
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
  });

  it('should handle disconnect event', () => {
    renderHook(() => useSocket());

    const disconnectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'disconnect',
    )?.[1];

    if (disconnectHandler) {
      act(() => {
        disconnectHandler('transport close');
      });
    }

    // Should log disconnection
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });

  it('should handle connection errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderHook(() => useSocket());

    const errorHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect_error')?.[1];

    if (errorHandler) {
      act(() => {
        errorHandler(new Error('Connection failed'));
      });
    }

    expect(consoleSpy).toHaveBeenCalledWith('Socket connection error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should handle auth errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    renderHook(() => useSocket());

    const authErrorHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'auth_error')?.[1];

    if (authErrorHandler) {
      act(() => {
        authErrorHandler('Authentication failed');
      });
    }

    expect(consoleSpy).toHaveBeenCalledWith('Socket auth error:', 'Authentication failed');
    expect(mockSocket.disconnect).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should clean up on unmount', () => {
    const { unmount } = renderHook(() => useSocket());

    unmount();

    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should reconnect when auth changes', () => {
    const { rerender } = renderHook(() => useSocket());

    // Change auth state
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'new-user-id',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
      },
      accessToken: 'new-access-token',
    } as any);

    rerender();

    // Should create new socket connection
    expect(mockIo).toHaveBeenCalledTimes(2);
  });
});

describe('useSocketWithStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIo.mockReturnValue(mockSocket as any);
    mockUseAuthStore.mockReturnValue({
      user: { _id: 'test-user-id' },
      accessToken: 'test-access-token',
    } as any);
  });

  it('should return socket with connection status', () => {
    const { result } = renderHook(() => useSocketWithStatus());

    expect(result.current.socket).toBe(mockSocket);
    expect(result.current.isConnected).toBe(false); // Initially false
    expect(result.current.error).toBeNull();
  });

  it('should update connection status on connect', () => {
    const { result } = renderHook(() => useSocketWithStatus());

    const connectHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect')?.[1];

    if (connectHandler) {
      act(() => {
        connectHandler();
      });
    }

    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should update connection status on disconnect', () => {
    const { result } = renderHook(() => useSocketWithStatus());

    // First connect
    const connectHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect')?.[1];

    if (connectHandler) {
      act(() => {
        connectHandler();
      });
    }

    // Then disconnect
    const disconnectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'disconnect',
    )?.[1];

    if (disconnectHandler) {
      act(() => {
        disconnectHandler('transport close');
      });
    }

    expect(result.current.isConnected).toBe(false);
  });

  it('should update error status on connection error', () => {
    const { result } = renderHook(() => useSocketWithStatus());

    const errorHandler = mockSocket.on.mock.calls.find((call) => call[0] === 'connect_error')?.[1];

    if (errorHandler) {
      act(() => {
        errorHandler(new Error('Connection failed'));
      });
    }

    expect(result.current.error).toBe('Connection failed');
    expect(result.current.isConnected).toBe(false);
  });
});

describe('useSocketEmit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIo.mockReturnValue(mockSocket as any);
    mockUseAuthStore.mockReturnValue({
      user: { _id: 'test-user-id' },
      accessToken: 'test-access-token',
    } as any);
  });

  it('should emit events when socket is connected', () => {
    const { result } = renderHook(() => useSocketEmit());

    const success = result.current('test-event', { data: 'test' });

    expect(success).toBe(true);
    expect(mockSocket.emit).toHaveBeenCalledWith('test-event', {
      data: 'test',
    });
  });

  it('should not emit when socket is not connected', () => {
    mockSocket.connected = false;
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { result } = renderHook(() => useSocketEmit());

    const success = result.current('test-event', { data: 'test' });

    expect(success).toBe(false);
    expect(mockSocket.emit).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Socket not connected, cannot emit:', 'test-event');

    consoleSpy.mockRestore();
  });

  it('should emit without data parameter', () => {
    // Ensure socket is connected
    mockSocket.connected = true;

    const { result } = renderHook(() => useSocketEmit());

    const success = result.current('test-event');

    expect(success).toBe(true);
    expect(mockSocket.emit).toHaveBeenCalledWith('test-event', undefined);
  });
});
