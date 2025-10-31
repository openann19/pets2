/**
 * 🎯 ACTION REGISTRY - Single Source of Truth
 * All header actions defined here with visibility rules, badges, and priority
 */

import type { NavigationProp } from '../navigation/types';

export type HeaderContext = {
  route: string;
  role: 'user' | 'premium' | 'admin';
  counts: {
    messages: number;
    notifications: number;
    community: number;
  };
  caps: {
    highPerf: boolean;
    hdr: boolean;
    skia: boolean;
    thermalsOk: boolean;
  };
  isNewUser: boolean;
};

export type HeaderAction = {
  id: string;
  icon: string; // Ionicons name
  label: string;
  priority: number; // Higher = more likely to surface
  onPress: (navigation?: NavigationProp) => void;
  onLongPress?: (navigation?: NavigationProp) => void;
  badge?: (ctx: HeaderContext) => number | undefined;
  visible?: (ctx: HeaderContext) => boolean; // Default true
  a11yLabel?: string;
};

export const ACTIONS: HeaderAction[] = [
  {
    id: 'search',
    icon: 'search-outline',
    label: 'Search',
    priority: 90,
    onPress: () => {},
    a11yLabel: 'Open search',
  },
  {
    id: 'messages',
    icon: 'chatbubbles-outline',
    label: 'Messages',
    priority: 95,
    onPress: (nav) => nav?.navigate('Matches'),
    badge: (c) => c.counts.messages,
    a11yLabel: 'Open messages',
  },
  {
    id: 'notifications',
    icon: 'notifications-outline',
    label: 'Alerts',
    priority: 92,
    onPress: () => {},
    badge: (c) => c.counts.notifications,
    a11yLabel: 'Open notifications',
  },
  {
    id: 'swipe',
    icon: 'heart-outline',
    label: 'Swipe',
    priority: 85,
    onPress: (nav) => nav?.navigate('Swipe'),
    a11yLabel: 'Go to swipe',
  },
  {
    id: 'community',
    icon: 'people-outline',
    label: 'Community',
    priority: 80,
    onPress: (nav) => nav?.navigate('Community'),
    badge: (c) => c.counts.community,
    a11yLabel: 'Open community',
  },
  {
    id: 'premium',
    icon: 'star-outline',
    label: 'Premium',
    priority: 70,
    onPress: (nav) => nav?.navigate('Premium'),
    visible: (c) => c.role !== 'premium',
    a11yLabel: 'View premium',
  },
  {
    id: 'profile',
    icon: 'person-outline',
    label: 'Profile',
    priority: 88,
    onPress: (nav) => nav?.navigate('Profile'),
    a11yLabel: 'Open profile',
  },
  {
    id: 'settings',
    icon: 'settings-outline',
    label: 'Settings',
    priority: 60,
    onPress: (nav) => nav?.navigate('Settings'),
    a11yLabel: 'Open settings',
  },
  {
    id: 'tutorial',
    icon: 'help-circle-outline',
    label: 'Tutorial',
    priority: 75,
    onPress: () => {},
    visible: (c) => c.isNewUser,
    a11yLabel: 'View tutorial',
  },
  {
    id: 'vip',
    icon: 'diamond-outline',
    label: 'VIP Support',
    priority: 86,
    onPress: () => {},
    visible: (c) => c.role === 'premium',
    a11yLabel: 'Contact VIP support',
  },
  {
    id: 'admin',
    icon: 'shield-checkmark-outline',
    label: 'Admin',
    priority: 99,
    onPress: (nav) => nav?.navigate('AdminDashboard'),
    visible: (c) => c.role === 'admin',
    a11yLabel: 'Open admin dashboard',
  },
];

