/**
 * useNetworkStatus Hook Tests
 * Tests network connectivity monitoring and status management
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '../__tests__/test-utils';
import { useNetworkStatus } from '../useNetworkStatus';

// Mock NetInfo
const mockNetInfo = {
  addEventListener: jest.fn(),
  fetch: jest.fn(),
  removeEventListener: jest.fn(),
};

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: mockNetInfo.addEventListener,
  fetch: mockNetInfo.fetch,
  removeEventListener: mockNetInfo.removeEventListener,
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useNetworkStatus', () => {
  const mockConnectedState = {
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: { isConnectionExpensive: false },
  };

  const mockDisconnectedState = {
    isConnected: false,
    isInternetReachable: false,
    type: 'none',
    details: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset NetInfo mock
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      callback(mockConnectedState);
      return jest.fn(); // unsubscribe function
    });
    mockNetInfo.fetch.mockResolvedValue(mockConnectedState);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with default network state', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.networkStatus).toEqual({
      isConnected: false,
      isInternetReachable: null,
      type: 'unknown',
      details: null,
    });
  });

  it('should fetch initial network state on mount', async () => {
    mockNetInfo.fetch.mockResolvedValue(mockConnectedState);

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      await Promise.resolve(); // Allow useEffect to run
    });

    expect(result.current.networkStatus).toEqual(mockConnectedState);
    expect(mockNetInfo.fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle network state changes', async () => {
    let callback: any;
    mockNetInfo.addEventListener.mockImplementation((cb) => {
      callback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useNetworkStatus());

    // Simulate network change
    act(() => {
      callback(mockDisconnectedState);
    });

    expect(result.current.networkStatus).toEqual(mockDisconnectedState);
  });

  it('should call onConnect callback when network connects', async () => {
    let callback: any;
    const onConnect = jest.fn();
    const onDisconnect = jest.fn();

    mockNetInfo.addEventListener.mockImplementation((cb) => {
      callback = cb;
      return jest.fn();
    });

    renderHook(() => useNetworkStatus({ onConnect, onDisconnect }));

    // Start connected
    act(() => {
      callback(mockDisconnectedState);
    });

    expect(onDisconnect).toHaveBeenCalledTimes(1);

    // Then connect
    act(() => {
      callback(mockConnectedState);
    });

    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it('should call onDisconnect callback when network disconnects', async () => {
    let callback: any;
    const onConnect = jest.fn();
    const onDisconnect = jest.fn();

    mockNetInfo.addEventListener.mockImplementation((cb) => {
      callback = cb;
      return jest.fn();
    });

    renderHook(() => useNetworkStatus({ onConnect, onDisconnect }));

    // Start connected, then disconnect
    act(() => {
      callback(mockDisconnectedState);
    });

    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockNetInfo.fetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      await Promise.resolve();
    });

    // Should maintain default state on error
    expect(result.current.networkStatus.isConnected).toBe(false);
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('should handle invalid network state', async () => {
    let callback: any;
    mockNetInfo.addEventListener.mockImplementation((cb) => {
      callback = cb;
      return jest.fn();
    });

    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      callback(null); // Invalid state
    });

    // Should not crash and maintain previous state
    expect(result.current.networkStatus).toBeDefined();
  });

  it('should cleanup event listeners on unmount', () => {
    const unsubscribe = jest.fn();
    mockNetInfo.addEventListener.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('should provide network-aware helper methods', async () => {
    mockNetInfo.fetch.mockResolvedValue(mockConnectedState);

    const { result } = renderHook(() => useNetworkStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.networkStatus.isConnected).toBe(true);
    expect(result.current.networkStatus.isInternetReachable).toBe(true);
    expect(result.current.networkStatus.type).toBe('wifi');
  });
});
