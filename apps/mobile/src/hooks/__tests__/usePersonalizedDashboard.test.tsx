/**
 * Integration Tests for usePersonalizedDashboard Hook
 * Phase 1 Product Enhancement
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { usePersonalizedDashboard } from '../usePersonalizedDashboard';
import { personalizedDashboardService } from '@/services/personalizedDashboardService';
import type { PersonalizedDashboardData } from '@pawfectmatch/core/types/phase1-contracts';
import {
  createTestQueryClient,
  cleanupQueryClient,
  createWrapperWithQueryClient,
} from '@/test-utils/react-query-helpers';

jest.mock('@/services/personalizedDashboardService');
jest.mock('@pawfectmatch/core', () => ({
  ...jest.requireActual('@pawfectmatch/core'),
  featureFlags: {
    isEnabled: jest.fn((flag: string) => flag === 'homeDashboard'),
  },
}));

describe('usePersonalizedDashboard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    // Comprehensive cleanup: cancel queries, remove observers, clear cache
    cleanupQueryClient(queryClient);
  });

  it('should fetch dashboard data successfully', async () => {
    const mockDashboardData: PersonalizedDashboardData = {
      recentlyViewedProfiles: [
        {
          id: '1',
          petId: 'pet1',
          petName: 'Luna',
          petPhoto: 'https://example.com/luna.jpg',
          viewedAt: new Date().toISOString(),
        },
      ],
      suggestedMatches: [],
      activityInsights: {
        streakDays: 5,
        lastActivityAt: new Date().toISOString(),
        totalSwipes: 50,
        matchRate: 0.15,
      },
      quickActions: [],
    };

    (personalizedDashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    const wrapper = createWrapperWithQueryClient(queryClient);
    const { result } = renderHook(() => usePersonalizedDashboard(), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.dashboardData).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.dashboardData).toEqual(mockDashboardData);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to load dashboard');
    (personalizedDashboardService.getDashboard as jest.Mock).mockRejectedValue(error);

    const wrapper = createWrapperWithQueryClient(queryClient);
    const { result } = renderHook(() => usePersonalizedDashboard(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.dashboardData).toBeUndefined();
  });

  it('should respect feature flag', () => {
    const { featureFlags } = require('@pawfectmatch/core');
    featureFlags.isEnabled.mockReturnValue(false);

    const wrapper = createWrapperWithQueryClient(queryClient);
    const { result } = renderHook(() => usePersonalizedDashboard(), {
      wrapper,
    });

    expect(result.current.isEnabled).toBe(false);
    expect(personalizedDashboardService.getDashboard).not.toHaveBeenCalled();
  });

  it('should provide refetch function', async () => {
    const mockDashboardData: PersonalizedDashboardData = {
      recentlyViewedProfiles: [],
      suggestedMatches: [],
      activityInsights: {
        streakDays: 0,
        lastActivityAt: new Date().toISOString(),
        totalSwipes: 0,
        matchRate: 0,
      },
      quickActions: [],
    };

    (personalizedDashboardService.getDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    const wrapper = createWrapperWithQueryClient(queryClient);
    const { result } = renderHook(() => usePersonalizedDashboard(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });
});

