/**
 * Comprehensive tests for useHomeScreen hook
 *
 * Coverage:
 * - Home screen data fetching and state management
 * - Activity feed and recommendations
 * - Quick actions and navigation
 * - Real-time updates and refresh
 * - Error handling and loading states
 * - Cache management and offline support
 * - Performance metrics and analytics
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHomeScreen } from '../useHomeScreen';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../services/homeAPI', () => ({
  homeAPI: {
    getHomeData: jest.fn(),
    getActivityFeed: jest.fn(),
    getRecommendations: jest.fn(),
    markActivityRead: jest.fn(),
    getQuickActions: jest.fn(),
  },
}));

jest.mock('../../../services/analyticsService', () => ({
  analyticsService: {
    trackEvent: jest.fn(),
    trackScreenView: jest.fn(),
  },
}));

jest.mock('../../../hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

import { homeAPI } from '../../../services/homeAPI';
import { analyticsService } from '../../../services/analyticsService';
import { useColorScheme } from '../../../hooks/useColorScheme';

const mockHomeAPI = homeAPI as jest.Mocked<typeof homeAPI>;
const mockAnalyticsService = analyticsService as jest.Mocked<typeof analyticsService>;
const mockUseColorScheme = useColorScheme as jest.Mock;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useHomeScreen', () => {
  const mockHomeData = {
    user: {
      id: 'user123',
      name: 'John Doe',
      profileImage: 'profile.jpg',
      isPremium: true,
    },
    stats: {
      matchesToday: 3,
      messagesUnread: 5,
      profileViews: 12,
      superLikes: 2,
    },
    recommendations: [
      {
        id: 'pet1',
        name: 'Buddy',
        breed: 'Golden Retriever',
        distance: 2.5,
        images: ['buddy1.jpg', 'buddy2.jpg'],
        compatibilityScore: 85,
      },
      {
        id: 'pet2',
        name: 'Luna',
        breed: 'Siamese Cat',
        distance: 1.8,
        images: ['luna1.jpg'],
        compatibilityScore: 92,
      },
    ],
    quickActions: [
      {
        id: 'boost_profile',
        title: 'Boost Profile',
        icon: 'rocket',
        action: 'boost',
        available: true,
      },
      {
        id: 'view_likes',
        title: 'View Likes',
        icon: 'heart',
        action: 'navigate',
        available: true,
      },
    ],
  };

  const mockActivityFeed = [
    {
      id: 'activity1',
      type: 'match',
      title: 'New Match!',
      description: 'You matched with Buddy',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      isRead: false,
      data: { matchId: 'match123' },
    },
    {
      id: 'activity2',
      type: 'message',
      title: 'New Message',
      description: 'Luna sent you a message',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      isRead: true,
      data: { chatId: 'chat456' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);

    mockHomeAPI.getHomeData.mockResolvedValue(mockHomeData);
    mockHomeAPI.getActivityFeed.mockResolvedValue(mockActivityFeed);
    mockHomeAPI.getQuickActions.mockResolvedValue(mockHomeData.quickActions);

    mockUseColorScheme.mockReturnValue('light');
    mockAnalyticsService.trackScreenView.mockResolvedValue(undefined);
  });

  describe('Initial State and Data Loading', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useHomeScreen());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.homeData).toBeNull();
      expect(result.current.activityFeed).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should load home data on mount', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.homeData).toEqual(mockHomeData);
      expect(result.current.activityFeed).toEqual(mockActivityFeed);
      expect(mockHomeAPI.getHomeData).toHaveBeenCalled();
      expect(mockHomeAPI.getActivityFeed).toHaveBeenCalled();
      expect(mockAnalyticsService.trackScreenView).toHaveBeenCalledWith('HomeScreen');
    });

    it('should load cached data when available', async () => {
      const cachedData = {
        homeData: mockHomeData,
        activityFeed: mockActivityFeed,
        lastUpdated: Date.now() - (5 * 60 * 1000), // 5 minutes ago (fresh)
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedData));

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.homeData).toEqual(mockHomeData);
      });

      // Should not make API calls for fresh cache
      expect(mockHomeAPI.getHomeData).not.toHaveBeenCalled();
    });

    it('should refresh expired cache', async () => {
      const expiredCache = {
        homeData: mockHomeData,
        activityFeed: mockActivityFeed,
        lastUpdated: Date.now() - (30 * 60 * 1000), // 30 minutes ago (expired)
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(expiredCache));

      const { result } = renderHook(() => useHomeScreen());

      // Should refresh expired data
      await waitFor(() => {
        expect(mockHomeAPI.getHomeData).toHaveBeenCalled();
      });
    });
  });

  describe('Data Refresh and Pull-to-Refresh', () => {
    it('should refresh data on demand', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Modify mock to return updated data
      const updatedData = {
        ...mockHomeData,
        stats: { ...mockHomeData.stats, matchesToday: 5 },
      };
      mockHomeAPI.getHomeData.mockResolvedValue(updatedData);

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.homeData?.stats.matchesToday).toBe(5);
      expect(mockHomeAPI.getHomeData).toHaveBeenCalledTimes(2);
    });

    it('should handle refresh loading state', async () => {
      let resolveRefresh: (value: any) => void;
      const refreshPromise = new Promise(resolve => {
        resolveRefresh = resolve;
      });

      mockHomeAPI.getHomeData.mockReturnValue(refreshPromise);

      const { result } = renderHook(() => useHomeScreen());

      // Start refresh
      act(() => {
        result.current.refreshData();
      });

      expect(result.current.isRefreshing).toBe(true);

      // Complete refresh
      act(() => {
        resolveRefresh(mockHomeData);
      });

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });
    });

    it('should handle refresh errors gracefully', async () => {
      mockHomeAPI.getHomeData.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First call succeeded, now test refresh failure
      mockHomeAPI.getHomeData.mockRejectedValueOnce(new Error('Refresh failed'));

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.error).toBe('Refresh failed');
      // Should keep previous data
      expect(result.current.homeData).toEqual(mockHomeData);
    });
  });

  describe('Activity Feed Management', () => {
    it('should mark activity as read', async () => {
      mockHomeAPI.markActivityRead.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markActivityRead('activity1');
      });

      expect(mockHomeAPI.markActivityRead).toHaveBeenCalledWith('activity1');

      // Should update local state
      const unreadActivity = result.current.activityFeed.find(a => a.id === 'activity1');
      expect(unreadActivity?.isRead).toBe(true);
    });

    it('should get unread activity count', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getUnreadActivityCount()).toBe(1); // activity1 is unread

      // Mark as read
      await act(async () => {
        await result.current.markActivityRead('activity1');
      });

      expect(result.current.getUnreadActivityCount()).toBe(0);
    });

    it('should filter activities by type', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const matches = result.current.getActivitiesByType('match');
      const messages = result.current.getActivitiesByType('message');

      expect(matches).toHaveLength(1);
      expect(matches[0].type).toBe('match');
      expect(messages).toHaveLength(1);
      expect(messages[0].type).toBe('message');
    });
  });

  describe('Quick Actions', () => {
    it('should load and provide quick actions', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.quickActions).toEqual(mockHomeData.quickActions);
    });

    it('should execute quick actions', async () => {
      const mockNavigate = jest.fn();

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test navigation action
      await act(async () => {
        await result.current.executeQuickAction(mockHomeData.quickActions[1], mockNavigate);
      });

      expect(mockNavigate).toHaveBeenCalledWith('Likes');

      // Test boost action (should not navigate)
      await act(async () => {
        await result.current.executeQuickAction(mockHomeData.quickActions[0], mockNavigate);
      });

      // Should not have called navigate again
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should check action availability', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isActionAvailable('boost_profile')).toBe(true);
      expect(result.current.isActionAvailable('unknown_action')).toBe(false);
    });
  });

  describe('Recommendations', () => {
    it('should provide recommendations data', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.recommendations).toEqual(mockHomeData.recommendations);
      expect(result.current.getTopRecommendations(1)).toEqual([mockHomeData.recommendations[1]]);
    });

    it('should sort recommendations by compatibility', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const sorted = result.current.getRecommendationsSortedBy('compatibility');
      expect(sorted[0].compatibilityScore).toBeGreaterThanOrEqual(sorted[1].compatibilityScore);
    });

    it('should sort recommendations by distance', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const sorted = result.current.getRecommendationsSortedBy('distance');
      expect(sorted[0].distance).toBeLessThanOrEqual(sorted[1].distance);
    });
  });

  describe('User Stats and Analytics', () => {
    it('should provide user statistics', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getUserStats()).toEqual(mockHomeData.stats);
      expect(result.current.hasNewMatches()).toBe(true);
      expect(result.current.hasUnreadMessages()).toBe(true);
      expect(result.current.getTotalEngagement()).toBe(22); // 3 + 5 + 12 + 2
    });

    it('should track user interactions', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.trackInteraction('recommendation_tap', { petId: 'pet1' });
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'user_interaction',
        {
          element: 'recommendation_tap',
          action: 'tap',
          petId: 'pet1',
        },
        'user123'
      );
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time activity updates', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newActivity = {
        id: 'activity3',
        type: 'super_like' as const,
        title: 'Super Like!',
        description: 'Someone super liked your pet',
        timestamp: new Date(),
        isRead: false,
        data: { petId: 'pet789' },
      };

      act(() => {
        result.current.addRealTimeActivity(newActivity);
      });

      expect(result.current.activityFeed).toContain(newActivity);
      expect(result.current.getUnreadActivityCount()).toBe(2); // Original 1 + new 1
    });

    it('should update stats in real-time', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateStats({ messagesUnread: 10, superLikes: 5 });
      });

      expect(result.current.homeData?.stats.messagesUnread).toBe(10);
      expect(result.current.homeData?.stats.superLikes).toBe(5);
    });
  });

  describe('Cache Management', () => {
    it('should cache home data', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'home_screen_cache',
        expect.any(String)
      );
    });

    it('should clear cache when requested', async () => {
      const { result } = renderHook(() => useHomeScreen());

      // Set some data
      act(() => {
        result.current.homeData = mockHomeData;
        result.current.activityFeed = mockActivityFeed;
      });

      act(() => {
        result.current.clearCache();
      });

      expect(result.current.homeData).toBeNull();
      expect(result.current.activityFeed).toEqual([]);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('home_screen_cache');
    });
  });

  describe('Error Handling', () => {
    it('should handle initial data loading errors', async () => {
      mockHomeAPI.getHomeData.mockRejectedValue(new Error('API unavailable'));

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('API unavailable');
      expect(result.current.homeData).toBeNull();
    });

    it('should handle activity feed loading errors', async () => {
      mockHomeAPI.getActivityFeed.mockRejectedValue(new Error('Feed unavailable'));

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activityFeed).toEqual([]);
      // Should still load home data
      expect(result.current.homeData).toEqual(mockHomeData);
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still work despite storage errors
      expect(result.current.homeData).toEqual(mockHomeData);
    });

    it('should reset error state on successful operations', async () => {
      // First load fails
      mockHomeAPI.getHomeData.mockRejectedValueOnce(new Error('First error'));

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.error).toBe('First error');
      });

      // Second load succeeds
      mockHomeAPI.getHomeData.mockResolvedValueOnce(mockHomeData);

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.homeData).toEqual(mockHomeData);
    });
  });

  describe('Performance and Analytics', () => {
    it('should track screen performance', async () => {
      const { result } = renderHook(() => useHomeScreen());

      act(() => {
        result.current.trackPerformance({ loadTime: 1250, apiCalls: 3 });
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'performance_metric',
        { loadTime: 1250, apiCalls: 3 },
        'user123'
      );
    });

    it('should track user engagement metrics', async () => {
      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate user scrolling through recommendations
      act(() => {
        result.current.trackEngagement('recommendations_view', { count: 5 });
      });

      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith(
        'user_engagement',
        {
          feature: 'recommendations_view',
          count: 5,
          timeSpent: expect.any(Number),
        },
        'user123'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty recommendations', async () => {
      const emptyData = { ...mockHomeData, recommendations: [] };
      mockHomeAPI.getHomeData.mockResolvedValue(emptyData);

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.recommendations).toEqual([]);
      expect(result.current.getTopRecommendations(5)).toEqual([]);
    });

    it('should handle empty activity feed', async () => {
      mockHomeAPI.getActivityFeed.mockResolvedValue([]);

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.activityFeed).toEqual([]);
      expect(result.current.getUnreadActivityCount()).toBe(0);
    });

    it('should handle missing user data', async () => {
      const dataWithoutUser = { ...mockHomeData };
      delete (dataWithoutUser as any).user;
      mockHomeAPI.getHomeData.mockResolvedValue(dataWithoutUser);

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.homeData?.user).toBeUndefined();
    });

    it('should handle very large datasets', async () => {
      const largeRecommendations = Array.from({ length: 100 }, (_, i) => ({
        id: `pet${i}`,
        name: `Pet ${i}`,
        breed: 'Mixed',
        distance: Math.random() * 50,
        images: [`pet${i}.jpg`],
        compatibilityScore: Math.floor(Math.random() * 100),
      }));

      const largeData = { ...mockHomeData, recommendations: largeRecommendations };
      mockHomeAPI.getHomeData.mockResolvedValue(largeData);

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.recommendations).toHaveLength(100);
      expect(result.current.getTopRecommendations(10)).toHaveLength(10);
    });

    it('should handle malformed cached data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('{invalid json}');

      const { result } = renderHook(() => useHomeScreen());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should load fresh data despite corrupted cache
      expect(result.current.homeData).toEqual(mockHomeData);
    });
  });
});
