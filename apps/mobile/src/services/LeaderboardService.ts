/**
 * Leaderboard Service
 * Comprehensive leaderboard system for mobile app matching web functionality
 */

import { logger } from '@pawfectmatch/core';
import { authService } from './AuthService';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  petId: string;
  petName: string;
  petImage: string;
  ownerName: string;
  score: number;
  rank: number;
  category: LeaderboardCategory;
  badges: Badge[];
  stats: LeaderboardStats;
  lastUpdated: number;
}

export interface LeaderboardStats {
  matches: number;
  likes: number;
  superLikes: number;
  messages: number;
  profileViews: number;
  daysActive: number;
  streak: number;
  achievements: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  isActive: boolean;
}

export interface LeaderboardFilter {
  category?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  ageRange?: {
    min: number;
    max: number;
  };
  breed?: string;
  gender?: 'male' | 'female' | 'all';
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  userRank?: number;
  userEntry?: LeaderboardEntry;
}

class LeaderboardService {
  private baseUrl: string;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheExpiration: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = process.env['EXPO_PUBLIC_API_URL'] ?? 'https://api.pawfectmatch.com';
  }

  /**
   * Get leaderboard entries
   */
  async getLeaderboard(
    filter: LeaderboardFilter = {},
    page = 1,
    limit = 20
  ): Promise<LeaderboardResponse> {
    try {
      const cacheKey = `leaderboard-${JSON.stringify(filter)}-${page.toString()}-${limit.toString()}`;
      const cached = this.getCachedData(cacheKey) as LeaderboardResponse | null;

      if (cached !== null) {
        return cached;
      }

      // Cache was checked above, continue with API call

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filter as Record<string, string>
      });

      const response = await fetch(`${this.baseUrl}/api/leaderboard?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      const data = await response.json() as LeaderboardResponse;
      this.setCachedData(cacheKey, data);

      return data;
    } catch (error) {
      logger.error('Failed to get leaderboard', { error });
      throw error;
    }
  }

  /**
   * Get user's rank and entry
   */
  async getUserRank(category?: string): Promise<{ rank: number; entry: LeaderboardEntry | null }> {
    try {
      const cacheKey = `user-rank-${category ?? 'all'}`;
      const cached = this.getCachedData(cacheKey) as { rank: number; entry: LeaderboardEntry | null } | null;

      if (cached !== null) {
        return cached;
      }

      const params = category !== undefined ? `?category=${category}` : '';
      const response = await fetch(`${this.baseUrl}/api/leaderboard/user-rank${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      const data = await response.json() as { rank: number; entry: LeaderboardEntry | null };
      this.setCachedData(cacheKey, data);

      return data;
    } catch (error) {
      logger.error('Failed to get user rank', { error });
      throw error;
    }
  }

  /**
   * Get available categories
   */
  async getCategories(): Promise<LeaderboardCategory[]> {
    try {
      const cacheKey = 'leaderboard-categories';
      const cached = this.getCachedData(cacheKey) as LeaderboardCategory[] | null;

      if (cached !== null) {
        return cached;
      }

      const response = await fetch(`${this.baseUrl}/api/leaderboard/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      const data = await response.json() as LeaderboardCategory[];
      this.setCachedData(cacheKey, data);

      return data;
    } catch (error) {
      logger.error('Failed to get categories', { error });
      throw error;
    }
  }

  /**
   * Get user's badges
   */
  async getUserBadges(): Promise<Badge[]> {
    try {
      const cacheKey = 'user-badges';
      const cached = this.getCachedData(cacheKey) as Badge[] | null;

      if (cached !== null) {
        return cached;
      }

      const response = await fetch(`${this.baseUrl}/api/leaderboard/badges`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      const data = await response.json() as Badge[];
      this.setCachedData(cacheKey, data);

      return data;
    } catch (error) {
      logger.error('Failed to get user badges', { error });
      throw error;
    }
  }

  /**
   * Get leaderboard stats for a specific pet
   */
  async getPetStats(petId: string): Promise<LeaderboardStats> {
    try {
      const cacheKey = `pet-stats-${petId}`;
      const cached = this.getCachedData(cacheKey) as LeaderboardStats | null;

      if (cached !== null) {
        return cached;
      }

      const response = await fetch(`${this.baseUrl}/api/leaderboard/pet/${petId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      const data = await response.json() as LeaderboardStats;
      this.setCachedData(cacheKey, data);

      return data;
    } catch (error) {
      logger.error('Failed to get pet stats', { error });
      throw error;
    }
  }

  /**
   * Update leaderboard score
   */
  async updateScore(
    petId: string,
    category: string,
    points: number,
    reason: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaderboard/update-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          petId,
          category,
          points,
          reason
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      // Clear relevant cache entries
      this.clearCacheByPattern('leaderboard');
      this.clearCacheByPattern('user-rank');
      this.clearCacheByPattern(`pet-stats-${petId}`);
    } catch (error) {
      logger.error('Failed to update score', { error });
      throw error;
    }
  }

  /**
   * Get leaderboard history
   */
  async getLeaderboardHistory(
    category: string,
    period: 'daily' | 'weekly' | 'monthly' = 'weekly',
    weeks = 4
  ): Promise<{ date: string; rank: number; score: number }[]> {
    try {
      const cacheKey = `leaderboard-history-${category}-${period}-${weeks.toString()}`;
      const cached = this.getCachedData(cacheKey) as { date: string; rank: number; score: number }[] | null;

      if (cached !== null) {
        return cached;
      }

      const params = new URLSearchParams({
        category,
        period,
        weeks: weeks.toString()
      });

      const response = await fetch(`${this.baseUrl}/api/leaderboard/history?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      const data = await response.json() as { date: string; rank: number; score: number }[];
      this.setCachedData(cacheKey, data);

      return data;
    } catch (error) {
      logger.error('Failed to get leaderboard history', { error });
      throw error;
    }
  }

  /**
   * Get nearby leaders
   */
  async getNearbyLeaders(
    latitude: number,
    longitude: number,
    radius = 10
  ): Promise<LeaderboardEntry[]> {
    try {
      const cacheKey = `nearby-leaders-${latitude.toString()}-${longitude.toString()}-${radius.toString()}`;
      const cached = this.getCachedData(cacheKey) as LeaderboardEntry[] | null;

      if (cached !== null) {
        return cached;
      }

      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radius: radius.toString()
      });

      const response = await fetch(`${this.baseUrl}/api/leaderboard/nearby?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      const data = await response.json() as LeaderboardEntry[];
      this.setCachedData(cacheKey, data);

      return data;
    } catch (error) {
      logger.error('Failed to get nearby leaders', { error });
      throw error;
    }
  }

  /**
   * Get achievement progress
   */
  async getAchievementProgress(): Promise<{
    completed: Badge[];
    inProgress: {
      badge: Badge;
      progress: number;
      target: number;
    }[];
  }> {
    try {
      const cacheKey = 'achievement-progress';
      const cached = this.getCachedData(cacheKey) as {
        completed: Badge[];
        inProgress: {
          badge: Badge;
          progress: number;
          target: number;
        }[];
      } | null;

      if (cached !== null) {
        return cached;
      }

      const response = await fetch(`${this.baseUrl}/api/leaderboard/achievements/progress`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      const data = await response.json() as {
        completed: Badge[];
        inProgress: {
          badge: Badge;
          progress: number;
          target: number;
        }[];
      };
      this.setCachedData(cacheKey, data);

      return data;
    } catch (error) {
      logger.error('Failed to get achievement progress', { error });
      throw error;
    }
  }

  /**
   * Share leaderboard achievement
   */
  async shareAchievement(badgeId: string, platform: 'facebook' | 'twitter' | 'instagram'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/leaderboard/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          badgeId,
          platform
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status.toString()}: ${response.statusText}`);
      }

      const data = await response.json() as { shareUrl: string };
      return data.shareUrl;
    } catch (error) {
      logger.error('Failed to share achievement', { error });
      throw error;
    }
  }

  /**
   * Get cached data
   */
  private getCachedData(key: string): unknown {
    const cached = this.cache.get(key);
    if (cached !== undefined && Date.now() - cached.timestamp < this.cacheExpiration) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached data
   */
  private setCachedData(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache by pattern
   */
  private clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get auth token
   */
  private async getAuthToken(): Promise<string> {
    const token = await authService.getAccessToken();
    if (token === null) {
      throw new Error('Authentication required for leaderboard access');
    }
    return token;
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export default new LeaderboardService();
