/**
 * Tests for useWhoLikedYouScreen Hook
 */

import { renderHook, waitFor } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useWhoLikedYouScreen } from '../../../hooks/screens/useWhoLikedYouScreen';
import { likesAPI } from '../../../services/api';
import { useSeeWhoLikedGate } from '../../../utils/featureGates';

// Mock dependencies
jest.mock('../../../services/api');
jest.mock('../../../utils/featureGates');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as any;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useWhoLikedYouScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with premium gate check', () => {
    (useSeeWhoLikedGate as jest.Mock).mockReturnValue({
      canUse: false,
      reason: 'Premium required',
      upgradeRequired: true,
    });

    const { result } = renderHook(() => useWhoLikedYouScreen(mockNavigation), {
      wrapper: createWrapper(),
    });

    expect(result.current.canUse).toBe(false);
    expect(result.current.upgradeRequired).toBe(true);
    expect(result.current.reason).toBe('Premium required');
  });

  it('should fetch likes when user has premium access', async () => {
    (useSeeWhoLikedGate as jest.Mock).mockReturnValue({
      canUse: true,
      reason: undefined,
      upgradeRequired: false,
    });

    const mockLikes = [
      {
        userId: 'user1',
        name: 'User One',
        likedAt: new Date().toISOString(),
        isSuperLike: false,
        petsLiked: [],
      },
    ];

    (likesAPI.getReceivedLikes as jest.Mock).mockResolvedValue(mockLikes);

    const { result } = renderHook(() => useWhoLikedYouScreen(mockNavigation), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.likes).toEqual(mockLikes);
    expect(result.current.canUse).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    (useSeeWhoLikedGate as jest.Mock).mockReturnValue({
      canUse: true,
      reason: undefined,
      upgradeRequired: false,
    });

    const mockError = new Error('Failed to fetch likes');
    (likesAPI.getReceivedLikes as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useWhoLikedYouScreen(mockNavigation), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.message).toBe('Failed to fetch likes');
  });

  it('should not fetch when user does not have premium access', () => {
    (useSeeWhoLikedGate as jest.Mock).mockReturnValue({
      canUse: false,
      reason: 'Premium required',
      upgradeRequired: true,
    });

    renderHook(() => useWhoLikedYouScreen(mockNavigation), {
      wrapper: createWrapper(),
    });

    expect(likesAPI.getReceivedLikes).not.toHaveBeenCalled();
  });

  it('should navigate to Premium screen when handleUpgrade is called', () => {
    (useSeeWhoLikedGate as jest.Mock).mockReturnValue({
      canUse: false,
      reason: 'Premium required',
      upgradeRequired: true,
    });

    const { result } = renderHook(() => useWhoLikedYouScreen(mockNavigation), {
      wrapper: createWrapper(),
    });

    result.current.handleUpgrade();

    expect(mockNavigation.goBack).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Premium');
  });

  it('should navigate to Matches when handleUserPress is called', () => {
    (useSeeWhoLikedGate as jest.Mock).mockReturnValue({
      canUse: true,
      reason: undefined,
      upgradeRequired: false,
    });

    const mockLike = {
      userId: 'user1',
      name: 'User One',
      likedAt: new Date().toISOString(),
      isSuperLike: false,
      petsLiked: [],
    };

    const { result } = renderHook(() => useWhoLikedYouScreen(mockNavigation), {
      wrapper: createWrapper(),
    });

    result.current.handleUserPress(mockLike);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Matches');
  });
});

