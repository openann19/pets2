/**
 * Demo Home Fixtures
 * Deterministic data for HomeScreen in demo mode
 */

import type { RecentActivityItem } from '../../hooks/screens/types';

const now = Date.now();

// Stats for demo mode
export const demoHomeStats = {
  matches: 3,
  messages: 5,
  pets: 2,
};

// Keep backward compatibility
export const demoStats = demoHomeStats;

// Recent activity items
export const demoRecentActivity: RecentActivityItem[] = [
  {
    id: 'activity-1',
    type: 'match',
    title: 'New Match',
    description: 'You matched with Buddy!',
    timestamp: new Date(now - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    timeAgo: '2m ago',
  },
  {
    id: 'activity-2',
    type: 'message',
    title: 'New Message',
    description: 'Piper sent you a message',
    timestamp: new Date(now - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    timeAgo: '5m ago',
  },
  {
    id: 'activity-3',
    type: 'match',
    title: 'New Match',
    description: 'You matched with Mittens!',
    timestamp: new Date(now - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    timeAgo: '15m ago',
  },
];

