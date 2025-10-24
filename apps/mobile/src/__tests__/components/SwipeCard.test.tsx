import React from 'react';
import { render } from '@testing-library/react-native';
import SwipeCard from '../../components/SwipeCard';
import { ThemeContext } from '../../contexts/ThemeContext';

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock theme context
const mockTheme = {
  colors: {
    primary: '#ec4899',
    background: '#ffffff',
    text: '#000000',
    card: '#f8f9fa',
    border: '#e9ecef',
  },
  isDark: false,
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeContext.Provider value={mockTheme}>
    {children}
  </ThemeContext.Provider>
);

// Mock pet data
const mockPet = {
  _id: '1',
  name: 'Buddy',
  age: 3,
  breed: 'Golden Retriever',
  photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  bio: 'A friendly and energetic dog who loves to play fetch and go on long walks.',
  distance: 2,
  compatibility: 85,
  isVerified: true,
  tags: ['Friendly', 'Energetic', 'Trained'],
};

describe('SwipeCard Component', () => {
  const mockOnSwipeLeft = jest.fn();
  const mockOnSwipeRight = jest.fn();
  const mockOnSwipeUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with pet data', () => {
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={mockPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when disabled', () => {
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={mockPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
          disabled={true}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly as top card', () => {
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={mockPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
          isTopCard={true}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly without verification badge', () => {
    const unverifiedPet = { ...mockPet, isVerified: false };
    
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={unverifiedPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with single photo', () => {
    const singlePhotoPet = { ...mockPet, photos: ['https://example.com/photo1.jpg'] };
    
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={singlePhotoPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with long bio text', () => {
    const longBioPet = {
      ...mockPet,
      bio: 'This is a very long bio that should be truncated when displayed in the card. It contains lots of information about the pet including their personality, habits, favorite activities, and much more detailed information that might not fit in the preview.',
    };
    
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={longBioPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with many tags', () => {
    const manyTagsPet = {
      ...mockPet,
      tags: ['Friendly', 'Energetic', 'Trained', 'Playful', 'Loyal', 'Smart', 'Gentle'],
    };
    
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={manyTagsPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with low compatibility score', () => {
    const lowCompatibilityPet = { ...mockPet, compatibility: 25 };
    
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={lowCompatibilityPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with high distance', () => {
    const farAwayPet = { ...mockPet, distance: 50 };
    
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={farAwayPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with custom style', () => {
    const customStyle = { marginTop: 20, marginHorizontal: 10 };
    
    const tree = render(
      <ThemeProvider>
        <SwipeCard
          pet={mockPet}
          onSwipeLeft={mockOnSwipeLeft}
          onSwipeRight={mockOnSwipeRight}
          onSwipeUp={mockOnSwipeUp}
          style={customStyle}
        />
      </ThemeProvider>
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
