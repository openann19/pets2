/**
 * Tests for useWhoLikedYouScreen Hook
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import React from 'react';
import { useWhoLikedYouScreen } from '../useWhoLikedYouScreen';
import { likesAPI } from '@/services/api';
import { useSeeWhoLikedGate } from '@/utils/featureGates';
import {
  createTestQueryClient,
  cleanupQueryClient,
  createWrapperWithQueryClient,
} from '@/test-utils/react-query-helpers';

// Mock dependencies
jest.mock('@/services/api');
jest.mock('@/utils/featureGates');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
} as any;

describe('useWhoLikedYouScreen', () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
    wrapper = createWrapperWithQueryClient(queryClient);
  });

  afterEach(() => {
    // Comprehensive cleanup: cancel queries, remove observers, clear cache
    cleanupQueryClient(queryClient);
  });

  it('should initialize with premium gate check', () => {
    (useSeeWhoLikedGate as jest.Mock).mockReturnValue({
      canUse: false,
      reason: 'Premium required',
      upgradeRequired: true,
    });

    const { result } = renderHook(() => useWhoLikedYouScreen(mockNavigation), {
      wrapper,
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
      wrapper,
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
      wrapper,
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
      wrapper,
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
      wrapper,
    });

    result.current.handleUserPress(mockLike);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Matches');
  });
});

