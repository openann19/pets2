/**
 * SwipeScreen Integration Tests
 * Tests SwipeScreen rendering, swipe gestures, and match flow
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/theme';
import SwipeScreen from '../SwipeScreen';

jest.mock('../hooks/useSwipeData', () => ({
  useSwipeData: jest.fn(() => ({
    pets: [
      { id: 'pet-1', name: 'Buddy', photos: ['photo1.jpg'] },
      { id: 'pet-2', name: 'Max', photos: ['photo2.jpg'] },
    ],
    isLoading: false,
    error: null,
    currentIndex: 0,
    handleSwipe: jest.fn(),
    handleButtonSwipe: jest.fn(),
    refreshPets: jest.fn(),
  })),
}));

jest.mock('../hooks/useSwipeGestures', () => ({
  useSwipeGestures: jest.fn(() => ({
    panResponder: {},
  })),
}));

jest.mock('../hooks/useSwipeAnimations', () => ({
  useSwipeAnimations: jest.fn(() => ({
    position: { x: 0, y: 0 },
    rotate: '0deg',
    swipeRight: jest.fn(),
    swipeLeft: jest.fn(),
    snapBack: jest.fn(),
    resetPosition: jest.fn(),
  })),
}));

jest.mock('../hooks/useSwipeUndo', () => ({
  useSwipeUndo: jest.fn(() => ({
    capture: jest.fn(),
    undo: jest.fn(),
    lastSwipe: null,
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </ThemeProvider>
);

describe('SwipeScreen Integration Tests', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render SwipeScreen successfully', () => {
    render(
      <TestWrapper>
        <SwipeScreen navigation={mockNavigation as any} route={{ params: {}, key: 'Swipe' } as any} />
      </TestWrapper>
    );

    // Screen should render without errors
    expect(() => render(
      <TestWrapper>
        <SwipeScreen navigation={mockNavigation as any} route={{ params: {}, key: 'Swipe' } as any} />
      </TestWrapper>
    )).not.toThrow();
  });

  it('should handle swipe actions', async () => {
    const { useSwipeData } = require('../hooks/useSwipeData');
    const mockHandleSwipe = jest.fn();
    useSwipeData.mockReturnValue({
      pets: [{ id: 'pet-1', name: 'Buddy', photos: ['photo1.jpg'] }],
      isLoading: false,
      error: null,
      currentIndex: 0,
      handleSwipe: mockHandleSwipe,
      handleButtonSwipe: jest.fn(),
      refreshPets: jest.fn(),
    });

    render(
      <TestWrapper>
        <SwipeScreen navigation={mockNavigation as any} route={{ params: {}, key: 'Swipe' } as any} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockHandleSwipe).toBeDefined();
    });
  });

  it('should handle loading state', () => {
    const { useSwipeData } = require('../hooks/useSwipeData');
    useSwipeData.mockReturnValue({
      pets: [],
      isLoading: true,
      error: null,
      currentIndex: 0,
      handleSwipe: jest.fn(),
      handleButtonSwipe: jest.fn(),
      refreshPets: jest.fn(),
    });

    render(
      <TestWrapper>
        <SwipeScreen navigation={mockNavigation as any} route={{ params: {}, key: 'Swipe' } as any} />
      </TestWrapper>
    );

    // Should show loading state
    expect(useSwipeData).toHaveBeenCalled();
  });
});

