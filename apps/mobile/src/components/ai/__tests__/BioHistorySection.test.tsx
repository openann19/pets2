/**
 * BioHistorySection Component Tests
 * Comprehensive test coverage for the bio history section component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BioHistorySection, type BioHistoryItem } from '../BioHistorySection';

// Mock theme
jest.mock('@mobile/theme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      bg: '#FFFFFF',
      surface: '#F8F9FA',
      onSurface: '#000000',
      onMuted: '#666666',
      success: '#28A745',
      border: '#CCCCCC',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    radii: { md: 8, lg: 12, full: 9999 },
    typography: {
      h2: { size: 20, weight: '700' },
      body: { size: 16 },
    },
    shadows: {
      elevation1: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
    },
  })),
}));

describe('BioHistorySection', () => {
  const mockHistory: BioHistoryItem[] = [
    { bio: 'First bio', matchScore: 85 },
    { bio: 'Second bio', matchScore: 90 },
    { bio: 'Third bio', matchScore: 75 },
  ];

  describe('Rendering', () => {
    it('should render nothing when history has 1 or fewer items', () => {
      const { container } = render(
        <BioHistorySection history={[{ bio: 'Only bio', matchScore: 80 }]} />,
      );

      expect(container.children.length).toBe(0);
    });

    it('should render nothing when history is empty', () => {
      const { container } = render(<BioHistorySection history={[]} />);

      expect(container.children.length).toBe(0);
    });

    it('should render history items when history has more than 1 item', () => {
      const { getByText, getAllByTestId } = render(
        <BioHistorySection history={mockHistory} />,
      );

      expect(getByText('Previous Versions')).toBeTruthy();
      expect(getByText('Second bio')).toBeTruthy();
      expect(getByText('Third bio')).toBeTruthy();
      expect(getAllByTestId(/bio-history-item-/).length).toBe(2);
    });

    it('should display match scores correctly', () => {
      const { getByText } = render(
        <BioHistorySection history={mockHistory} />,
      );

      expect(getByText('90%')).toBeTruthy();
      expect(getByText('75%')).toBeTruthy();
    });

    it('should skip the first item (current bio)', () => {
      const { queryByText } = render(
        <BioHistorySection history={mockHistory} />,
      );

      expect(queryByText('First bio')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('should call onSelectBio when history item is pressed', () => {
      const mockOnSelectBio = jest.fn();
      const { getByTestId } = render(
        <BioHistorySection
          history={mockHistory}
          onSelectBio={mockOnSelectBio}
        />,
      );

      const firstItem = getByTestId('bio-history-item-0');
      fireEvent.press(firstItem);

      expect(mockOnSelectBio).toHaveBeenCalledTimes(1);
      expect(mockOnSelectBio).toHaveBeenCalledWith(mockHistory[1], 1);
    });

    it('should not call onSelectBio when not provided', () => {
      const { getByTestId } = render(
        <BioHistorySection history={mockHistory} />,
      );

      const firstItem = getByTestId('bio-history-item-0');
      expect(() => fireEvent.press(firstItem)).not.toThrow();
    });

    it('should call onSelectBio with correct index for each item', () => {
      const mockOnSelectBio = jest.fn();
      const { getByTestId } = render(
        <BioHistorySection
          history={mockHistory}
          onSelectBio={mockOnSelectBio}
        />,
      );

      const firstItem = getByTestId('bio-history-item-0');
      const secondItem = getByTestId('bio-history-item-1');

      fireEvent.press(firstItem);
      expect(mockOnSelectBio).toHaveBeenCalledWith(mockHistory[1], 1);

      fireEvent.press(secondItem);
      expect(mockOnSelectBio).toHaveBeenCalledWith(mockHistory[2], 2);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility labels', () => {
      const { getByTestId } = render(
        <BioHistorySection history={mockHistory} />,
      );

      const firstItem = getByTestId('bio-history-item-0');
      expect(firstItem.props.accessibilityLabel).toBe('Previous bio version 1');
      expect(firstItem.props.accessibilityRole).toBe('button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle history with exactly 2 items', () => {
      const twoItemHistory: BioHistoryItem[] = [
        { bio: 'Current', matchScore: 80 },
        { bio: 'Previous', matchScore: 75 },
      ];

      const { getByText, getByTestId } = render(
        <BioHistorySection history={twoItemHistory} />,
      );

      expect(getByText('Previous Versions')).toBeTruthy();
      expect(getByText('Previous')).toBeTruthy();
      expect(getByTestId('bio-history-item-0')).toBeTruthy();
    });

    it('should handle very long bio text', () => {
      const longBioHistory: BioHistoryItem[] = [
        { bio: 'Current', matchScore: 80 },
        {
          bio: 'This is a very long bio text that should be truncated because it exceeds the normal length limits and should show ellipsis when displayed',
          matchScore: 75,
        },
      ];

      const { getByText } = render(
        <BioHistorySection history={longBioHistory} />,
      );

      const longBioText = getByText(/This is a very long bio/);
      expect(longBioText.props.numberOfLines).toBe(2);
    });

    it('should handle history with many items', () => {
      const manyItems: BioHistoryItem[] = Array.from({ length: 10 }, (_, i) => ({
        bio: `Bio ${i}`,
        matchScore: 70 + i,
      }));

      const { getAllByTestId } = render(
        <BioHistorySection history={manyItems} />,
      );

      // Should render all items except the first one
      expect(getAllByTestId(/bio-history-item-/).length).toBe(9);
    });

    it('should handle match scores at boundaries', () => {
      const boundaryHistory: BioHistoryItem[] = [
        { bio: 'Current', matchScore: 80 },
        { bio: 'Low score', matchScore: 0 },
        { bio: 'High score', matchScore: 100 },
      ];

      const { getByText } = render(
        <BioHistorySection history={boundaryHistory} />,
      );

      expect(getByText('0%')).toBeTruthy();
      expect(getByText('100%')).toBeTruthy();
    });

    it('should handle empty bio strings', () => {
      const emptyBioHistory: BioHistoryItem[] = [
        { bio: 'Current', matchScore: 80 },
        { bio: '', matchScore: 75 },
      ];

      const { getByTestId } = render(
        <BioHistorySection history={emptyBioHistory} />,
      );

      const item = getByTestId('bio-history-item-0');
      expect(item).toBeTruthy();
    });
  });
});

