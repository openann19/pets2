/**
 * usePremiumStatus Hook Tests
 * Tests premium subscription status and feature access control
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '../__tests__/test-utils';
import { usePremiumStatus, type PremiumStatus } from '../usePremium';
import { setupFakeTimers, cleanupTimers } from '../test-utils/timer-helpers';

// Mock API service
const mockRequest = jest.fn();
jest.mock('../services/api', () => ({
  request: mockRequest,
}));

describe('usePremiumStatus', () => {
  const mockFreeSubscription: PremiumStatus = {
    active: false,
    plan: 'free',
    renewsAt: null,
    trialEndsAt: null,
  };

  const mockProSubscription: PremiumStatus = {
    active: true,
    plan: 'pro',
    renewsAt: '2025-12-31T00:00:00.000Z',
    trialEndsAt: null,
  };

  const mockEliteSubscription: PremiumStatus = {
    active: true,
    plan: 'elite',
    renewsAt: '2025-12-31T00:00:00.000Z',
    trialEndsAt: '2025-11-15T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupFakeTimers();
    // Default mock response
    mockRequest.mockResolvedValue({
      subscription: mockFreeSubscription,
    });
  });

  afterEach(() => {
    cleanupTimers();
    jest.restoreAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => usePremiumStatus());

    expect(result.current.loading).toBe(true);
    expect(result.current.status).toEqual({ active: false });
    expect(result.current.error).toBeNull();
  });

  it('should fetch premium status on mount', async () => {
    mockRequest.mockResolvedValue({
      subscription: mockProSubscription,
    });

    const { result } = renderHook(() => usePremiumStatus());

    await act(async () => {
      await Promise.resolve(); // Allow useEffect to run
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.status).toEqual({
      active: true,
      plan: 'pro',
      renewsAt: '2025-12-31T00:00:00.000Z',
      trialEndsAt: null,
    });
    expect(result.current.error).toBeNull();
    expect(mockRequest).toHaveBeenCalledWith('/api/premium/status', {
      method: 'GET',
    });
  });

  it('should handle free subscription correctly', async () => {
    mockRequest.mockResolvedValue({
      subscription: mockFreeSubscription,
    });

    const { result } = renderHook(() => usePremiumStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.status.active).toBe(false);
    expect(result.current.status.plan).toBe('free');
    expect(result.current.can.superLike).toBe(false);
    expect(result.current.can.rewind).toBe(false);
    expect(result.current.can.boost).toBe(false);
    expect(result.current.can.arTrails).toBe(false);
    expect(result.current.can.advancedFilters).toBe(false);
    expect(result.current.can.unlimitedLikes).toBe(false);
  });

  it('should handle pro subscription features', async () => {
    mockRequest.mockResolvedValue({
      subscription: mockProSubscription,
    });

    const { result } = renderHook(() => usePremiumStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.status.active).toBe(true);
    expect(result.current.status.plan).toBe('pro');
    expect(result.current.can.superLike).toBe(true);
    expect(result.current.can.rewind).toBe(true);
    expect(result.current.can.boost).toBe(false); // Only elite
    expect(result.current.can.arTrails).toBe(true);
    expect(result.current.can.advancedFilters).toBe(true);
    expect(result.current.can.unlimitedLikes).toBe(false); // Only elite
  });

  it('should handle elite subscription features', async () => {
    mockRequest.mockResolvedValue({
      subscription: mockEliteSubscription,
    });

    const { result } = renderHook(() => usePremiumStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.status.active).toBe(true);
    expect(result.current.status.plan).toBe('elite');
    expect(result.current.can.superLike).toBe(true);
    expect(result.current.can.rewind).toBe(true);
    expect(result.current.can.boost).toBe(true);
    expect(result.current.can.arTrails).toBe(true);
    expect(result.current.can.advancedFilters).toBe(true);
    expect(result.current.can.unlimitedLikes).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    const errorMessage = 'Network error';
    mockRequest.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePremiumStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.status.active).toBe(false);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('should handle non-Error exceptions', async () => {
    mockRequest.mockRejectedValue('String error');

    const { result } = renderHook(() => usePremiumStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load premium status');
  });

  it('should handle missing subscription data', async () => {
    mockRequest.mockResolvedValue({});

    const { result } = renderHook(() => usePremiumStatus());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.status).toEqual({
      active: false,
      plan: 'free',
      renewsAt: undefined,
      trialEndsAt: undefined,
    });
  });

  it('should poll when pollMs is provided', async () => {
    mockRequest.mockResolvedValue({
      subscription: mockProSubscription,
    });

    const pollMs = 1000;
    const { result } = renderHook(() => usePremiumStatus(pollMs));

    await act(async () => {
      await Promise.resolve(); // Initial fetch
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    // Advance timers to trigger polling
    await act(async () => {
      jest.advanceTimersByTime(pollMs);
    });

    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it('should not poll when pollMs is 0', async () => {
    mockRequest.mockResolvedValue({
      subscription: mockProSubscription,
    });

    const { result } = renderHook(() => usePremiumStatus(0));

    await act(async () => {
      await Promise.resolve(); // Initial fetch
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);

    // Advance timers - should not trigger additional calls
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('should cleanup polling interval on unmount', async () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => usePremiumStatus(1000));

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should provide refresh function', async () => {
    mockRequest.mockResolvedValue({
      subscription: mockFreeSubscription,
    });

    const { result } = renderHook(() => usePremiumStatus());

    await act(async () => {
      await Promise.resolve(); // Initial fetch
    });

    expect(result.current.status.plan).toBe('free');
    expect(mockRequest).toHaveBeenCalledTimes(1);

    // Change mock response
    mockRequest.mockResolvedValue({
      subscription: mockProSubscription,
    });

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status.plan).toBe('pro');
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it('should handle refresh errors', async () => {
    const { result } = renderHook(() => usePremiumStatus());

    await act(async () => {
      await Promise.resolve(); // Initial successful fetch
    });

    expect(result.current.error).toBeNull();

    // Setup error for refresh
    mockRequest.mockRejectedValueOnce(new Error('Refresh failed'));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.error).toBe('Refresh failed');
  });
});
