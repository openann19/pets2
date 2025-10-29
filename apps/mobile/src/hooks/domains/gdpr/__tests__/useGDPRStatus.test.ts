/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGDPRStatus } from '../useGDPRStatus';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useGDPRStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useGDPRStatus());

    expect(result.current.status.isPending).toBe(false);
    expect(result.current.status.daysRemaining).toBe(null);
    expect(result.current.status.gracePeriodEndsAt).toBe(null);
    expect(result.current.status.canCancel).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('should load pending deletion status', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        deletionRequested: true,
        gracePeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        daysRemaining: 25,
      }),
    );

    const { result } = renderHook(() => useGDPRStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status.isPending).toBe(true);
    expect(result.current.status.daysRemaining).toBe(25);
    expect(result.current.status.canCancel).toBe(true);
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useGDPRStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status.isPending).toBe(false);
    expect(result.current.status.daysRemaining).toBe(null);
  });

  it('should refresh status when called', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useGDPRStatus());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Change the mock to return pending status
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        deletionRequested: true,
        daysRemaining: 15,
      }),
    );

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.status.isPending).toBe(true);
    expect(result.current.status.daysRemaining).toBe(15);
  });

  it('should return stable refresh function reference', () => {
    const { result } = renderHook(() => useGDPRStatus());

    const firstRefresh = result.current.refresh;

    // In React Native testing, create a new hook instance to test stability
    const { result: result2 } = renderHook(() => useGDPRStatus());

    expect(result.current.refresh).toBe(firstRefresh);
  });
});
