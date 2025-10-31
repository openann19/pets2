/**
 * Snapshot Test for SettingsScreen
 * Fixes T-01: Jest snapshot tests for key screens
 */

import React from 'react';
import SettingsScreen from '../SettingsScreen';
import { renderWithProviders, createMockScreenProps } from './snapshot-helpers';

// Mock hooks and dependencies
jest.mock('../../hooks/screens/useSettingsScreen', () => ({
  useSettingsScreen: () => ({
    notifications: {
      matches: true,
      messages: true,
      email: true,
      push: true,
    },
    privacy: {
      showLocation: true,
      showAge: true,
      showBreed: true,
    },
    handleSettingToggle: jest.fn(),
    handlePrivacyToggle: jest.fn(),
    handleLogout: jest.fn(),
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
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../hooks/useReducedMotion', () => ({
  useReduceMotion: () => false,
}));

describe('SettingsScreen Snapshot', () => {
  it('should match snapshot', () => {
    const props = createMockScreenProps();
    const { toJSON } = renderWithProviders(<SettingsScreen {...props} />);

    expect(toJSON()).toMatchSnapshot();
  });
});

