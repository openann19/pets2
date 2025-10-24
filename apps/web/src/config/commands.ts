/**
 * Global Command Palette Commands
 * Cmd/Ctrl+K to open
 */

import type { Command } from '@/components/Animations';

export const globalCommands: Command[] = [
  // Navigation
  {
    id: 'nav-home',
    label: 'Go to Home',
    description: 'Navigate to homepage',
    icon: '🏠',
    shortcut: ['⌘', 'H'],
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    },
    category: 'Navigation',
  },
  {
    id: 'nav-pets',
    label: 'Browse Pets',
    description: 'View all available pets',
    icon: '🐾',
    shortcut: ['⌘', 'P'],
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/pets';
      }
    },
    category: 'Navigation',
  },
  {
    id: 'nav-profile',
    label: 'My Profile',
    description: 'View your profile',
    icon: '👤',
    shortcut: ['⌘', 'U'],
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/profile';
      }
    },
    category: 'Navigation',
  },
  {
    id: 'nav-calendar',
    label: 'Calendar',
    description: 'View your calendar',
    icon: '📅',
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/calendar';
      }
    },
    category: 'Navigation',
  },
  {
    id: 'nav-map',
    label: 'Map View',
    description: 'View pets on map',
    icon: '🗺️',
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/map';
      }
    },
    category: 'Navigation',
  },
  {
    id: 'nav-settings',
    label: 'Settings',
    description: 'Manage your settings',
    icon: '⚙️',
    shortcut: ['⌘', ','],
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/settings';
      }
    },
    category: 'Navigation',
  },

  // Actions
  {
    id: 'action-animations',
    label: 'View Animations Demo',
    description: 'See all premium animations',
    icon: '✨',
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/animations-demo';
      }
    },
    category: 'Actions',
  },
  {
    id: 'action-search',
    label: 'Search',
    description: 'Search for pets',
    icon: '🔍',
    shortcut: ['⌘', 'K'],
    action: () => {
      // Trigger search modal
      if (typeof window !== 'undefined') {
        window.location.href = '/search';
      }
    },
    category: 'Actions',
  },

  // Help
  {
    id: 'help-docs',
    label: 'Documentation',
    description: 'View help documentation',
    icon: '📚',
    action: () => {
      if (typeof window !== 'undefined') {
        window.open('/docs', '_blank');
      }
    },
    category: 'Help',
  },
  {
    id: 'help-support',
    label: 'Contact Support',
    description: 'Get help from our team',
    icon: '💬',
    action: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/support';
      }
    },
    category: 'Help',
  },
];
