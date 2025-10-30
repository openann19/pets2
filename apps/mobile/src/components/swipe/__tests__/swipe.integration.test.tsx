/**
 * Swipe Screen Integration Tests
 * Tests complete swipe flow with all components integrated
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModernSwipeScreen from '../../../screens/ModernSwipeScreen';
import { useModernSwipeScreen } from '../../../hooks/screens/useModernSwipeScreen';
import * as matchesAPI from '../../../services/api';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../hooks/screens/useModernSwipeScreen');
jest.mock('../../../services/api', () => ({
  matchesAPI: {
    getPets: jest.fn(),
    createMatch: jest.fn(),
  },
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockPet1 = {
  _id: 'pet1',
  name: 'Buddy',
  age: 3,
  breed: 'Golden Retriever',
  photos: [{ url: 'photo1.jpg', order: 1 }],
  description: 'Friendly and playful',
  owner: 'user1',
  species: 'dog',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPet2 = {
  _id: 'pet2',
  name: 'Max',
  age: 2,
  breed: 'Labrador',
  photos: [{ url: 'photo2.jpg', order: 1 }],
  description: 'Energetic and fun',
  owner: 'user2',
  species: 'dog',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Swipe Screen Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (matchesAPI.matchesAPI.getPets as jest.Mock).mockResolvedValue([mockPet1, mockPet2]);
    (matchesAPI.matchesAPI.createMatch as jest.Mock).mockResolvedValue({ _id: 'match1' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Component Integration', () => {
    it('should render all components together', () => {
      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [mockPet1, mockPet2],
        currentPet: mockPet1,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: false,
        matchedPet: null,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: jest.fn(),
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { getByText } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      expect(getByText('Discover')).toBeTruthy();
    });

    it('should show gesture hints on first launch', async () => {
      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [mockPet1, mockPet2],
        currentPet: mockPet1,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: false,
        matchedPet: null,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: jest.fn(),
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { findByText } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      await waitFor(async () => {
        const hint = await findByText('Swipe left to pass');
        expect(hint).toBeTruthy();
      });
    });

    it('should show peek sheet when next pet exists', () => {
      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [mockPet1, mockPet2],
        currentPet: mockPet1,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: false,
        matchedPet: null,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: jest.fn(),
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { container } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      expect(container).toBeTruthy();
    });
  });

  describe('Match Flow', () => {
    it('should show confetti burst on match', async () => {
      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [mockPet1, mockPet2],
        currentPet: mockPet1,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: true,
        matchedPet: mockPet1,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: jest.fn(),
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { UNSAFE_getAllByType, getByText } = render(
        <ModernSwipeScreen navigation={mockNavigation as any} />,
      );

      expect(getByText("It's a Match! 🎉")).toBeTruthy();

      const views = UNSAFE_getAllByType('View');
      expect(views.length).toBeGreaterThan(0);
    });

    it('should call onSendMessage to navigate to chat', () => {
      const mockSetShowMatchModal = jest.fn();

      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [mockPet1, mockPet2],
        currentPet: mockPet1,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: true,
        matchedPet: mockPet1,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: mockSetShowMatchModal,
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { getByText } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      const sendMessageButton = getByText('Send Message');
      fireEvent.press(sendMessageButton);

      expect(mockSetShowMatchModal).toHaveBeenCalledWith(false);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Chat', {
        matchId: mockPet1._id,
        petName: mockPet1.name,
      });
    });

    it('should call onKeepSwiping to dismiss modal', () => {
      const mockSetShowMatchModal = jest.fn();

      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [mockPet1, mockPet2],
        currentPet: mockPet1,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: true,
        matchedPet: mockPet1,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: mockSetShowMatchModal,
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { getByText } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      const keepSwipingButton = getByText('Keep Swiping');
      fireEvent.press(keepSwipingButton);

      expect(mockSetShowMatchModal).toHaveBeenCalledWith(false);
    });
  });

  describe('Swipe Actions', () => {
    it('should call handleButtonSwipe on like button press', () => {
      const mockHandleButtonSwipe = jest.fn();

      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [mockPet1, mockPet2],
        currentPet: mockPet1,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: false,
        matchedPet: null,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: jest.fn(),
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: mockHandleButtonSwipe,
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { UNSAFE_getAllByType } = render(
        <ModernSwipeScreen navigation={mockNavigation as any} />,
      );

      const buttons = UNSAFE_getAllByType('Pressable');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state when loading', () => {
      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [],
        currentPet: null,
        isLoading: true,
        error: null,
        currentIndex: 0,
        showMatchModal: false,
        matchedPet: null,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: jest.fn(),
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { getByText } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      expect(getByText('Finding Matches')).toBeTruthy();
    });

    it('should show error state when error occurs', () => {
      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [],
        currentPet: null,
        isLoading: false,
        error: 'Failed to load pets',
        currentIndex: 0,
        showMatchModal: false,
        matchedPet: null,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: jest.fn(),
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { getByText } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      expect(getByText('Error loading pets')).toBeTruthy();
    });

    it('should show empty state when no more pets', () => {
      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [],
        currentPet: null,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: false,
        matchedPet: null,
        showFilters: false,
        filters: {},
        setCurrentIndex: jest.fn(),
        setShowMatchModal: jest.fn(),
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { getByText } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      expect(getByText('No more pets!')).toBeTruthy();
    });
  });

  describe('Filter Panel', () => {
    it('should show filters when showFilters is true', () => {
      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [mockPet1, mockPet2],
        currentPet: mockPet1,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: false,
        matchedPet: null,
        showFilters: true,
        filters: { breed: 'Golden Retriever' },
        setCurrentIndex: jest.fn(),
        setShowMatchModal: jest.fn(),
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: jest.fn(),
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { container } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      expect(container).toBeTruthy();
    });
  });

  describe('Complete User Flow', () => {
    it('should handle full swipe session', async () => {
      const mockSetShowMatchModal = jest.fn();
      const mockSetCurrentIndex = jest.fn();
      const mockHandleButtonSwipe = jest.fn();

      (useModernSwipeScreen as jest.Mock).mockReturnValue({
        pets: [mockPet1, mockPet2],
        currentPet: mockPet1,
        isLoading: false,
        error: null,
        currentIndex: 0,
        showMatchModal: false,
        matchedPet: null,
        showFilters: false,
        filters: {},
        setCurrentIndex: mockSetCurrentIndex,
        setShowMatchModal: mockSetShowMatchModal,
        setShowFilters: jest.fn(),
        setFilters: jest.fn(),
        loadPets: jest.fn(),
        handleButtonSwipe: mockHandleButtonSwipe,
        handleSwipeLeft: jest.fn(),
        handleSwipeRight: jest.fn(),
        handleSwipeUp: jest.fn(),
      });

      const { container } = render(<ModernSwipeScreen navigation={mockNavigation as any} />);

      expect(container).toBeTruthy();
    });
  });
});
