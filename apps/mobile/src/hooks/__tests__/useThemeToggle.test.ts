/// <reference types="jest" />

import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useThemeToggle } from '../useThemeToggle';
import * as Haptics from 'expo-haptics';

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock theme and UI store with simple mocks
jest.mock('@mobile/theme', () => ({
  useTheme: () => ({
    scheme: 'light',
    isDark: false,
    colors: { bg: '#fff', text: '#000' },
    spacing: { sm: 8, md: 16 },
    radius: { sm: 4, md: 8 },
    motion: {},
  }),
}));

jest.mock('../stores/useUIStore', () => ({
  useUIStore: () => ({
    isDark: false,
    themeMode: 'light',
    setThemeMode: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));

describe('useThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('should return theme toggle functions', () => {
    const { result } = renderHook(() => useThemeToggle());

    expect(typeof result.current.toggleTheme).toBe('function');
    expect(typeof result.current.setLightTheme).toBe('function');
    expect(typeof result.current.setDarkTheme).toBe('function');
    expect(typeof result.current.setSystemTheme).toBe('function');
    expect(typeof result.current.showThemeSelector).toBe('function');
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useThemeToggle());

    expect(result.current.isDark).toBe(false);
    expect(result.current.themeMode).toBe('light');
    expect(result.current.colors).toBeDefined();
  });

  it('should call haptic feedback when toggling theme', async () => {
    const { result } = renderHook(() => useThemeToggle());

    await act(async () => {
      await result.current.toggleTheme();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });
});
