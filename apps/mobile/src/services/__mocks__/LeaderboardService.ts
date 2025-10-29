/**
 * Mock LeaderboardService for testing
 */

export interface LeaderboardCategory {
  id: string;
  name: string;
  icon: string;
}

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
  badges: any[];
  stats: any;
  lastUpdated: number;
}

export interface LeaderboardFilter {
  category?: string;
  timeRange?: 'daily' | 'weekly' | 'monthly' | 'allTime';
  location?: string;
}

const mockLeaderboardService = {
  getCategories: jest.fn().mockResolvedValue([
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'matches', name: 'Matches', icon: '💕' },
    { id: 'likes', name: 'Likes', icon: '❤️' },
  ]),
  
  getLeaderboard: jest.fn().mockResolvedValue([]),
  
  getUserRank: jest.fn().mockResolvedValue(null),
  
  refreshLeaderboard: jest.fn().mockResolvedValue(undefined),
  
  clearCache: jest.fn(),
};

export default mockLeaderboardService;
