/**
 * Integration Tests for useAdvancedMatchFilter Hook
 * Phase 1 Product Enhancement
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { useAdvancedMatchFilter, useMatchInsights } from '../useAdvancedMatchFilter';
import { advancedMatchFilterService } from '@/services/advancedMatchFilterService';
import type { MatchFilterResponse } from '@pawfectmatch/core/types/phase1-contracts';
import {
  createTestQueryClient,
  cleanupQueryClient,
  createWrapperWithQueryClient,
} from '@/test-utils/react-query-helpers';

jest.mock('@/services/advancedMatchFilterService');
jest.mock('@pawfectmatch/core', () => ({
  ...jest.requireActual('@pawfectmatch/core'),
  featureFlags: {
    isEnabled: jest.fn((flag: string) => flag === 'matchesAdvancedFilter'),
  },
}));

describe('useAdvancedMatchFilter', () => {
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

  it('should filter matches with default parameters', async () => {
    const mockFilterResponse: MatchFilterResponse['data'] = {
      matches: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    };

    (advancedMatchFilterService.filterMatches as jest.Mock).mockResolvedValue(mockFilterResponse);

    const { result } = renderHook(() => useAdvancedMatchFilter(), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.matches).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(20);
    expect(result.current.hasMore).toBe(false);
  });

  it('should update filter and refetch', async () => {
    const mockFilterResponse: MatchFilterResponse['data'] = {
      matches: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    };

    (advancedMatchFilterService.filterMatches as jest.Mock).mockResolvedValue(mockFilterResponse);

    const { result } = renderHook(() => useAdvancedMatchFilter(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateFilter({ sort: 'distance' });
    });

    await waitFor(() => {
      expect(advancedMatchFilterService.filterMatches).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'distance' })
      );
    });
  });

  it('should reset filter to defaults', async () => {
    const mockFilterResponse: MatchFilterResponse['data'] = {
      matches: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    };

    (advancedMatchFilterService.filterMatches as jest.Mock).mockResolvedValue(mockFilterResponse);

    const { result } = renderHook(() => useAdvancedMatchFilter(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateFilter({ sort: 'distance' });
    });

    act(() => {
      result.current.resetFilter();
    });

    await waitFor(() => {
      expect(result.current.filter.sort).toBe('newest');
      expect(result.current.filter.page).toBe(1);
    });
  });

  it('should load more when hasMore is true', async () => {
    const mockFilterResponsePage1: MatchFilterResponse['data'] = {
      matches: [],
      total: 50,
      page: 1,
      limit: 20,
      hasMore: true,
    };

    const mockFilterResponsePage2: MatchFilterResponse['data'] = {
      matches: [],
      total: 50,
      page: 2,
      limit: 20,
      hasMore: false,
    };

    (advancedMatchFilterService.filterMatches as jest.Mock)
      .mockResolvedValueOnce(mockFilterResponsePage1)
      .mockResolvedValueOnce(mockFilterResponsePage2);

    const { result } = renderHook(() => useAdvancedMatchFilter(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.hasMore).toBe(true);
    });

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.page).toBe(2);
    });
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Filter failed');
    (advancedMatchFilterService.filterMatches as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useAdvancedMatchFilter(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});

describe('useMatchInsights', () => {
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

  it('should fetch match insights', async () => {
    const matchId = 'match123';
    const mockInsights = {
      matchId,
      compatibilityScore: 85,
      reasons: ['Both are dogs'],
      mutualInterests: [],
      conversationStarters: [],
    };

    (advancedMatchFilterService.getMatchInsights as jest.Mock).mockResolvedValue(mockInsights);

    const { result } = renderHook(() => useMatchInsights(matchId), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.insights).toEqual(mockInsights);
  });

  it('should not fetch when matchId is null', () => {
    const { result } = renderHook(() => useMatchInsights(null), {
      wrapper: createWrapper(),
    });

    expect(advancedMatchFilterService.getMatchInsights).not.toHaveBeenCalled();
    expect(result.current.insights).toBeNull();
  });
});

