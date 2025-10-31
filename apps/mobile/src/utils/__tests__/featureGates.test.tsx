/**
 * Unit Tests for Feature Gates
 * Tests all premium feature gates including Advanced Filters and See Who Liked You
 */

import { renderHook } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useAdvancedFiltersGate,
  useSeeWhoLikedGate,
  useSuperLikeGate,
  useProfileBoostGate,
  useReadReceiptsGate,
  useVideoCallsGate,
  useSwipeLimitGate,
} from '../featureGates';
import * as usePremiumStatusModule from '../../hooks/domains/premium/usePremiumStatus';
import * as useIAPBalanceModule from '../../hooks/domains/premium/useIAPBalance';

// Mock the hooks
jest.mock('../../hooks/domains/premium/usePremiumStatus');
jest.mock('../../hooks/domains/premium/useIAPBalance');

const mockUsePremiumStatus = usePremiumStatusModule.usePremiumStatus as jest.MockedFunction<
  typeof usePremiumStatusModule.usePremiumStatus
>;
const mockUseIAPBalance = useIAPBalanceModule.useIAPBalance as jest.MockedFunction<
  typeof useIAPBalanceModule.useIAPBalance
>;

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

describe('Feature Gates', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for IAP balance
    mockUseIAPBalance.mockReturnValue({
      balance: { superLikes: 0, boosts: 0 },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  describe('useAdvancedFiltersGate', () => {
    it('should allow access for premium users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useAdvancedFiltersGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.upgradeRequired).toBe(false);
      expect(result.current.reason).toBeUndefined();
    });

    it('should allow access for ultimate users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'ultimate',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useAdvancedFiltersGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.upgradeRequired).toBe(false);
    });

    it('should deny access for free users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: undefined,
        status: 'inactive',
        expiresAt: null,
      });

      const { result } = renderHook(() => useAdvancedFiltersGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(false);
      expect(result.current.upgradeRequired).toBe(true);
      expect(result.current.reason).toContain('Premium feature');
    });

    it('should deny access for expired premium', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'premium',
        status: 'expired',
        expiresAt: new Date(Date.now() - 1000),
      });

      const { result } = renderHook(() => useAdvancedFiltersGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(false);
      expect(result.current.upgradeRequired).toBe(true);
    });
  });

  describe('useSeeWhoLikedGate', () => {
    it('should allow access for premium users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useSeeWhoLikedGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.upgradeRequired).toBe(false);
      expect(result.current.reason).toBeUndefined();
    });

    it('should allow access for ultimate users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'ultimate',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useSeeWhoLikedGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.upgradeRequired).toBe(false);
    });

    it('should deny access for free users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: undefined,
        status: 'inactive',
        expiresAt: null,
      });

      const { result } = renderHook(() => useSeeWhoLikedGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(false);
      expect(result.current.upgradeRequired).toBe(true);
      expect(result.current.reason).toContain('Premium feature');
    });
  });

  describe('useSuperLikeGate', () => {
    it('should allow access for premium users with unlimited super likes', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useSuperLikeGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.upgradeRequired).toBe(false);
    });

    it('should allow access for free users with IAP balance', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: undefined,
        status: 'inactive',
        expiresAt: null,
      });

      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 5, boosts: 0 },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useSuperLikeGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.balance).toBe(5);
      expect(result.current.upgradeRequired).toBe(false);
    });

    it('should deny access for free users without IAP balance', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: undefined,
        status: 'inactive',
        expiresAt: null,
      });

      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0, boosts: 0 },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useSuperLikeGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(false);
      expect(result.current.balance).toBe(0);
      expect(result.current.upgradeRequired).toBe(true);
      expect(result.current.reason).toContain('No Super Likes remaining');
    });
  });

  describe('useProfileBoostGate', () => {
    it('should allow access for ultimate users with unlimited boosts', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'ultimate',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useProfileBoostGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.upgradeRequired).toBe(false);
    });

    it('should allow access for premium users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useProfileBoostGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.upgradeRequired).toBe(false);
    });

    it('should allow access for free users with IAP balance', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: undefined,
        status: 'inactive',
        expiresAt: null,
      });

      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0, boosts: 3 },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { result } = renderHook(() => useProfileBoostGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.balance).toBe(3);
      expect(result.current.upgradeRequired).toBe(false);
    });
  });

  describe('useReadReceiptsGate', () => {
    it('should allow access for premium users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useReadReceiptsGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.upgradeRequired).toBe(false);
    });

    it('should deny access for free users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: undefined,
        status: 'inactive',
        expiresAt: null,
      });

      const { result } = renderHook(() => useReadReceiptsGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(false);
      expect(result.current.upgradeRequired).toBe(true);
    });
  });

  describe('useVideoCallsGate', () => {
    it('should allow access for premium users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useVideoCallsGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(true);
      expect(result.current.upgradeRequired).toBe(false);
    });

    it('should deny access for free users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: undefined,
        status: 'inactive',
        expiresAt: null,
      });

      const { result } = renderHook(() => useVideoCallsGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.canUse).toBe(false);
      expect(result.current.upgradeRequired).toBe(true);
    });
  });

  describe('useSwipeLimitGate', () => {
    it('should return unlimited for premium users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
        status: 'active',
        expiresAt: null,
      });

      const { result } = renderHook(() => useSwipeLimitGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isUnlimited).toBe(true);
      expect(result.current.canSwipe).toBe(true);
      expect(result.current.limit).toBe(-1);
      expect(result.current.remaining).toBe(-1);
      expect(result.current.upgradeRequired).toBe(false);
    });

    it('should return limited for free users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: undefined,
        status: 'inactive',
        expiresAt: null,
      });

      const { result } = renderHook(() => useSwipeLimitGate(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isUnlimited).toBe(false);
      expect(result.current.canSwipe).toBe(true); // Assuming default remaining > 0
      expect(result.current.limit).toBe(5);
      expect(result.current.remaining).toBe(5);
      expect(result.current.upgradeRequired).toBe(false);
    });
  });
});

