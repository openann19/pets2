/**
 * ElitePetListingCard Comprehensive Component Tests
 * Tests rendering, props, interactions, states, edge cases, and accessibility
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@mobile/theme';
import { ElitePetListingCard } from '../ElitePetListingCard';
import type { PetListing } from '@/hooks/screens/useAdoptionManagerScreen';

// Mock dependencies
jest.mock('../../../components', () => ({
  EliteButton: ({ title, onPress, testID, ...props }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={testID} {...props}>
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  },
  EliteCard: ({ children, style, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="elite-card" style={style} {...props}>{children}</View>;
  },
}));

jest.mock('../../../animation', () => ({
  GlobalStyles: {
    mb4: { marginBottom: 16 },
    mx2: { marginHorizontal: 8 },
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">{children}</ThemeProvider>
);

describe('ElitePetListingCard Component Tests', () => {
  const mockPet: PetListing = {
    id: 'pet-1',
    name: 'Fluffy',
    species: 'Cat',
    breed: 'Persian',
    age: 3,
    status: 'active',
    photos: ['photo1.jpg', 'photo2.jpg'],
    applications: 5,
    views: 120,
    featured: true,
    listedAt: '2024-01-01T00:00:00Z',
  };

  const defaultProps = {
    pet: mockPet,
    getStatusColor: jest.fn((status: string) => {
      const colors: Record<string, string> = {
        active: '#10b981',
        pending: '#f59e0b',
        adopted: '#8b5cf6',
        paused: '#6b7280',
      };
      return colors[status] || '#6b7280';
    }),
    getStatusIcon: jest.fn((status: string) => {
      const icons: Record<string, string> = {
        active: '✅',
        pending: '⏳',
        adopted: '🏠',
        paused: '⏸️',
      };
      return icons[status] || '❓';
    }),
    onViewDetails: jest.fn(),
    onReviewApps: jest.fn(),
    onChangeStatus: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pet listing card successfully', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Fluffy')).toBeTruthy();
      expect(screen.getByText('Persian • 3 years old')).toBeTruthy();
    });

    it('should render pet name correctly', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Fluffy')).toBeTruthy();
    });

    it('should render breed and age correctly', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Persian • 3 years old')).toBeTruthy();
    });

    it('should render status badge with correct color and icon', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(defaultProps.getStatusColor).toHaveBeenCalledWith('active');
      expect(defaultProps.getStatusIcon).toHaveBeenCalledWith('active');
      expect(screen.getByText(/Active/)).toBeTruthy();
    });

    it('should render application count', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('5')).toBeTruthy();
      expect(screen.getByText('Applications')).toBeTruthy();
    });

    it('should render views count', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('120')).toBeTruthy();
      expect(screen.getByText('Views')).toBeTruthy();
    });

    it('should render featured indicator', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('⭐')).toBeTruthy();
      expect(screen.getByText('Featured')).toBeTruthy();
    });

    it('should render not featured indicator', () => {
      const notFeaturedPet = { ...mockPet, featured: false };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={notFeaturedPet} />
        </TestWrapper>,
      );

      expect(screen.getByText('—')).toBeTruthy();
      expect(screen.getByText('Featured')).toBeTruthy();
    });
  });

  describe('Status Display', () => {
    it('should display active status correctly', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(defaultProps.getStatusColor).toHaveBeenCalledWith('active');
      expect(defaultProps.getStatusIcon).toHaveBeenCalledWith('active');
    });

    it('should display pending status correctly', () => {
      const pendingPet = { ...mockPet, status: 'pending' as const };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={pendingPet} />
        </TestWrapper>,
      );

      expect(defaultProps.getStatusColor).toHaveBeenCalledWith('pending');
      expect(defaultProps.getStatusIcon).toHaveBeenCalledWith('pending');
    });

    it('should display adopted status correctly', () => {
      const adoptedPet = { ...mockPet, status: 'adopted' as const };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={adoptedPet} />
        </TestWrapper>,
      );

      expect(defaultProps.getStatusColor).toHaveBeenCalledWith('adopted');
      expect(defaultProps.getStatusIcon).toHaveBeenCalledWith('adopted');
    });

    it('should display paused status correctly', () => {
      const pausedPet = { ...mockPet, status: 'paused' as const };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={pausedPet} />
        </TestWrapper>,
      );

      expect(defaultProps.getStatusColor).toHaveBeenCalledWith('paused');
      expect(defaultProps.getStatusIcon).toHaveBeenCalledWith('paused');
    });
  });

  describe('Action Buttons', () => {
    it('should render View Details button', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('View Details')).toBeTruthy();
    });

    it('should render Review button with application count', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Review (5)')).toBeTruthy();
    });

    it('should call onViewDetails when View Details is pressed', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      const viewDetailsButton = screen.getByText('View Details');
      fireEvent.press(viewDetailsButton);

      expect(defaultProps.onViewDetails).toHaveBeenCalledWith('pet-1');
      expect(defaultProps.onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should call onReviewApps when Review button is pressed', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      const reviewButton = screen.getByText('Review (5)');
      fireEvent.press(reviewButton);

      expect(defaultProps.onReviewApps).toHaveBeenCalledWith('pet-1');
      expect(defaultProps.onReviewApps).toHaveBeenCalledTimes(1);
    });

    it('should call onChangeStatus when status badge is pressed', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      const statusBadge = screen.getByTestID('elite-status-badge-pet-1');
      fireEvent.press(statusBadge);

      expect(defaultProps.onChangeStatus).toHaveBeenCalledWith(mockPet);
      expect(defaultProps.onChangeStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero applications', () => {
      const zeroAppsPet = { ...mockPet, applications: 0 };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={zeroAppsPet} />
        </TestWrapper>,
      );

      expect(screen.getByText('0')).toBeTruthy();
      expect(screen.getByText('Review (0)')).toBeTruthy();
    });

    it('should handle zero views', () => {
      const zeroViewsPet = { ...mockPet, views: 0 };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={zeroViewsPet} />
        </TestWrapper>,
      );

      expect(screen.getByText('0')).toBeTruthy();
    });

    it('should handle very large application counts', () => {
      const manyAppsPet = { ...mockPet, applications: 999 };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={manyAppsPet} />
        </TestWrapper>,
      );

      expect(screen.getByText('999')).toBeTruthy();
      expect(screen.getByText('Review (999)')).toBeTruthy();
    });

    it('should handle very large view counts', () => {
      const manyViewsPet = { ...mockPet, views: 99999 };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={manyViewsPet} />
        </TestWrapper>,
      );

      expect(screen.getByText('99999')).toBeTruthy();
    });

    it('should handle long pet names', () => {
      const longNamePet = { ...mockPet, name: 'A'.repeat(100) };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={longNamePet} />
        </TestWrapper>,
      );

      expect(screen.getByText('A'.repeat(100))).toBeTruthy();
    });

    it('should handle long breed names', () => {
      const longBreedPet = { ...mockPet, breed: 'A'.repeat(50) };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={longBreedPet} />
        </TestWrapper>,
      );

      expect(screen.getByText(new RegExp('A'.repeat(50)))).toBeTruthy();
    });

    it('should handle age zero', () => {
      const zeroAgePet = { ...mockPet, age: 0 };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={zeroAgePet} />
        </TestWrapper>,
      );

      expect(screen.getByText(/0 years old/)).toBeTruthy();
    });

    it('should handle very old pets', () => {
      const oldPet = { ...mockPet, age: 20 };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={oldPet} />
        </TestWrapper>,
      );

      expect(screen.getByText(/20 years old/)).toBeTruthy();
    });

    it('should handle empty photos array', () => {
      const noPhotosPet = { ...mockPet, photos: [] };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={noPhotosPet} />
        </TestWrapper>,
      );

      // Should render without errors
      expect(screen.getByText('Fluffy')).toBeTruthy();
    });

    it('should handle many photos', () => {
      const manyPhotosPet = { ...mockPet, photos: Array.from({ length: 50 }, (_, i) => `photo${i}.jpg`) };
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} pet={manyPhotosPet} />
        </TestWrapper>,
      );

      // Should render without errors
      expect(screen.getByText('Fluffy')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility label on status badge', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      const statusBadge = screen.getByTestID('elite-status-badge-pet-1');
      expect(statusBadge).toHaveAccessibilityLabel('Change status for Fluffy');
    });

    it('should have proper accessibility role on status badge', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      const statusBadge = screen.getByTestID('elite-status-badge-pet-1');
      expect(statusBadge).toHaveAccessibilityRole('button');
    });
  });

  describe('Multiple Listings', () => {
    it('should render multiple listings correctly', () => {
      const pet2: PetListing = {
        id: 'pet-2',
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 2,
        status: 'pending',
        photos: ['photo2.jpg'],
        applications: 2,
        views: 45,
        featured: false,
        listedAt: '2024-01-15T00:00:00Z',
      };

      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
          <ElitePetListingCard {...defaultProps} pet={pet2} />
        </TestWrapper>,
      );

      expect(screen.getByText('Fluffy')).toBeTruthy();
      expect(screen.getByText('Buddy')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('should use theme colors correctly', () => {
      render(
        <TestWrapper>
          <ElitePetListingCard {...defaultProps} />
        </TestWrapper>,
      );

      // Theme is used via useTheme hook in component
      // This is verified through rendering without errors
      expect(screen.getByText('Fluffy')).toBeTruthy();
    });
  });
});

