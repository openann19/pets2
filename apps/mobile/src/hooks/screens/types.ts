/**
 * Home Screen Types
 * Shared types for HomeScreen functionality
 */
export interface Stats {
  matches: number;
  messages: number;
  pets: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'match' | 'message';
  title: string;
  description: string;
  timestamp: string; // ISO string
  timeAgo: string; // "2m ago", "5m ago"
}

