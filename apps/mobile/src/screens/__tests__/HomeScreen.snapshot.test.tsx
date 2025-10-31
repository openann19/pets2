/**
 * Snapshot Test for HomeScreen
 * Fixes T-01: Jest snapshot tests for key screens
 */

import React from 'react';
import HomeScreen from '../HomeScreen';
import { renderWithProviders } from './snapshot-helpers';

// Mock hooks and dependencies
jest.mock('../../hooks/screens/useHomeScreen', () => ({
  useHomeScreen: () => ({
    stats: {
      matches: 5,
      likes: 12,
      pets: 2,
    },
    recentActivity: [],
    refreshing: false,
    onRefresh: jest.fn(),
    handleProfilePress: jest.fn(),
    handlePetPress: jest.fn(),
    handleMatchPress: jest.fn(),
  }),
}));

jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: () => ({
    user: {
      _id: 'user1',
      email: 'test@example.com',
      name: 'Test User',
    },
  }),
}));

jest.mock('../../hooks/navigation', () => ({
  useScrollOffsetTracker: () => ({
    onScroll: jest.fn(),
    getOffset: jest.fn(() => 0),
  }),
  useTabReselectRefresh: () => ({
    scrollToTop: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('../../hooks/useReducedMotion', () => ({
  useReduceMotion: () => false,
}));

describe('HomeScreen Snapshot', () => {
  it('should match snapshot', () => {
    const { toJSON } = renderWithProviders(<HomeScreen />);

    expect(toJSON()).toMatchSnapshot();
  });
});

