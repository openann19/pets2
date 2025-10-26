/**
 * 🧪 SwipeCardV2 Test Suite
 * Comprehensive tests for the new pixel-perfect swipe card component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { motion } from 'framer-motion';
import SwipeCardV2, { type PetCardData } from '../SwipeCardV2';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    article: ({ children, ...props }: React.ComponentProps<'article'>) => <article {...props}>{children}</article>,
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
  },
  useMotionValue: () => ({ get: () => 0, set: jest.fn() }),
  useTransform: () => 0,
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: React.ComponentProps<'img'>) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock haptic feedback
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  value: mockVibrate,
  writable: true,
});

// Mock data
const mockPetData: PetCardData = {
  id: 'test-pet-1',
  name: 'Buddy',
  breed: 'Golden Retriever',
  age: 3,
  size: 'large',
  distanceKm: 5,
  bio: 'Super friendly and loves the water!',
  photos: [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=500&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=500&fit=crop',
  ],
  compatibility: 85,
  gender: 'male',
  species: 'dog',
};

describe('SwipeCardV2', () => {
  const mockOnSwipe = jest.fn();
  const mockOnCardClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockVibrate.mockClear();
  });

  it('renders pet information correctly', () => {
    render(
      <SwipeCardV2
        pet={mockPetData}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    // Check pet name and breed
    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText('Golden Retriever')).toBeInTheDocument();
    
    // Check age and size
    expect(screen.getByText('3 years')).toBeInTheDocument();
    expect(screen.getByText('large')).toBeInTheDocument(); // lowercase due to capitalize class
    
    // Check distance
    expect(screen.getByText('5 km away')).toBeInTheDocument();
    
    // Check bio (text is split across elements)
    expect(screen.getByText((content, element) => {
      return element?.textContent === '"Super friendly and loves the water!"';
    })).toBeInTheDocument();
    
    // Check compatibility
    expect(screen.getByText('Compatibility 85%')).toBeInTheDocument();
  });

  it('renders action buttons with correct labels', () => {
    render(
      <SwipeCardV2
        pet={mockPetData}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    // Check action buttons
    expect(screen.getByLabelText('Pass')).toBeInTheDocument();
    expect(screen.getByLabelText('Super Like')).toBeInTheDocument();
    expect(screen.getByLabelText('Like')).toBeInTheDocument();
  });

  it('handles button clicks correctly', async () => {
    render(
      <SwipeCardV2
        pet={mockPetData}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
        hapticFeedback={true}
      />
    );

    // Test pass button
    const passButton = screen.getByLabelText('Pass');
    fireEvent.click(passButton);
    
    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('pass', 'test-pet-1');
    });

    // Test like button
    const likeButton = screen.getByLabelText('Like');
    fireEvent.click(likeButton);
    
    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('like', 'test-pet-1');
    });

    // Test super like button
    const superLikeButton = screen.getByLabelText('Super Like');
    fireEvent.click(superLikeButton);
    
    await waitFor(() => {
      expect(mockOnSwipe).toHaveBeenCalledWith('superlike', 'test-pet-1');
    });
  });

  it('handles card click correctly', () => {
    render(
      <SwipeCardV2
        pet={mockPetData}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    const card = screen.getByRole('article');
    fireEvent.click(card);
    
    expect(mockOnCardClick).toHaveBeenCalledTimes(1);
  });

  it('triggers haptic feedback when enabled', async () => {
    render(
      <SwipeCardV2
        pet={mockPetData}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
        hapticFeedback={true}
      />
    );

    const likeButton = screen.getByLabelText('Like');
    fireEvent.click(likeButton);
    
    await waitFor(() => {
      expect(mockVibrate).toHaveBeenCalledWith([16]); // medium haptic
    });
  });

  it('does not trigger haptic feedback when disabled', async () => {
    render(
      <SwipeCardV2
        pet={mockPetData}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
        hapticFeedback={false}
      />
    );

    const likeButton = screen.getByLabelText('Like');
    fireEvent.click(likeButton);
    
    await waitFor(() => {
      expect(mockVibrate).not.toHaveBeenCalled();
    });
  });

  it('handles multiple photos correctly', () => {
    render(
      <SwipeCardV2
        pet={mockPetData}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    // Should show photo indicators
    const photoIndicators = screen.getAllByRole('button');
    const photoButtons = photoIndicators.filter(button => 
      button.className.includes('w-2 h-2 rounded-full')
    );
    
    expect(photoButtons).toHaveLength(2); // Two photos
  });

  it('handles single photo correctly', () => {
    const singlePhotoPet = {
      ...mockPetData,
      photos: ['https://example.com/photo1.jpg'],
    };

    render(
      <SwipeCardV2
        pet={singlePhotoPet}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    // Should not show photo indicators for single photo
    const photoIndicators = screen.queryAllByRole('button');
    const photoButtons = photoIndicators.filter(button => 
      button.className.includes('w-2 h-2 rounded-full')
    );
    
    expect(photoButtons).toHaveLength(0);
  });

  it('handles missing compatibility score', () => {
    const petWithoutCompatibility = {
      ...mockPetData,
      compatibility: undefined,
    };

    render(
      <SwipeCardV2
        pet={petWithoutCompatibility}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    // Should not show compatibility badge
    expect(screen.queryByText(/Compatibility/)).not.toBeInTheDocument();
  });

  it('handles zero compatibility score', () => {
    const petWithZeroCompatibility = {
      ...mockPetData,
      compatibility: 0,
    };

    render(
      <SwipeCardV2
        pet={petWithZeroCompatibility}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    // Should not show compatibility badge for zero score
    expect(screen.queryByText(/Compatibility/)).not.toBeInTheDocument();
  });

  it('formats age correctly for months', () => {
    const youngPet = {
      ...mockPetData,
      age: 0.5, // 6 months
    };

    render(
      <SwipeCardV2
        pet={youngPet}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    expect(screen.getByText('6 months')).toBeInTheDocument();
  });

  it('formats distance correctly for meters', () => {
    const closePet = {
      ...mockPetData,
      distanceKm: 0.5, // 500 meters
    };

    render(
      <SwipeCardV2
        pet={closePet}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    expect(screen.getByText('500m away')).toBeInTheDocument();
  });

  it('displays gender icon correctly', () => {
    const femalePet = {
      ...mockPetData,
      gender: 'female' as const,
    };

    render(
      <SwipeCardV2
        pet={femalePet}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    expect(screen.getByText('♀')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SwipeCardV2
        pet={mockPetData}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles missing bio gracefully', () => {
    const petWithoutBio = {
      ...mockPetData,
      bio: '',
    };

    render(
      <SwipeCardV2
        pet={petWithoutBio}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    // Should not crash and should show empty bio (just quotes)
    const bioElement = screen.getByText((content, element) => {
      return element?.textContent === '""';
    });
    expect(bioElement).toBeInTheDocument();
  });

  it('handles missing photos gracefully', () => {
    const petWithoutPhotos = {
      ...mockPetData,
      photos: [],
    };

    render(
      <SwipeCardV2
        pet={petWithoutPhotos}
        onSwipe={mockOnSwipe}
        onCardClick={mockOnCardClick}
      />
    );

    // Should not crash and should show placeholder
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
  });
});
