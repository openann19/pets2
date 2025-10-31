/**
 * Snapshot Test for SwipeScreen
 * Fixes T-01: Jest snapshot tests for key screens
 */

import React from 'react';
import SwipeScreen from '../SwipeScreen';
import { renderWithProviders, createMockScreenProps } from './snapshot-helpers';

// Mock hooks and dependencies
jest.mock('../../hooks/useSwipeData', () => ({
  useSwipeData: () => ({
    pets: [
      {
        _id: 'pet1',
        name: 'Fluffy',
        age: 2,
        breed: 'Golden Retriever',
        photos: ['https://example.com/photo1.jpg'],
        bio: 'A friendly dog',
        tags: ['friendly', 'active'],
        distance: 5,
        compatibility: 85,
        isVerified: true,
      },
    ],
    isLoading: false,
    error: null,
    currentIndex: 0,
    handleSwipe: jest.fn(),
    handleButtonSwipe: jest.fn(),
    refreshPets: jest.fn(),
  }),
}));

jest.mock('../../hooks/useSwipeGestures', () => ({
  useSwipeGestures: () => ({
    panHandlers: {},
    shouldTriggerSwipe: jest.fn(),
  }),
}));

jest.mock('../../hooks/useSwipeAnimations', () => ({
  useSwipeAnimations: () => ({
    position: { x: { __getValue: () => 0 }, y: { __getValue: () => 0 } },
    rotate: { __getValue: () => '0deg' },
    likeOpacity: { __getValue: () => 0 },
    nopeOpacity: { __getValue: () => 0 },
    swipeRight: jest.fn(),
    swipeLeft: jest.fn(),
    snapBack: jest.fn(),
  }),
}));

jest.mock('../../hooks/useSwipeUndo', () => ({
  useSwipeUndo: () => ({
    showUndo: false,
    undoAction: jest.fn(),
    triggerUndoPill: jest.fn(),
  }),
}));

jest.mock('../../hooks/navigation/useTabDoublePress', () => ({
  useTabDoublePress: () => ({
    handleDoublePress: jest.fn(),
  }),
}));

jest.mock('../../hooks/useReducedMotion', () => ({
  useReduceMotion: () => false,
}));

describe('SwipeScreen Snapshot', () => {
  it('should match snapshot', () => {
    const props = createMockScreenProps();
    const { toJSON } = renderWithProviders(<SwipeScreen {...props} />);

    expect(toJSON()).toMatchSnapshot();
  });
});

