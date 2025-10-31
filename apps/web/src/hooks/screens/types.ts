/**
 * Types for screen hooks
 */

export interface Stats {
  matches: number;
  messages: number;
  pets: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'match' | 'message' | 'like' | 'view';
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
}

