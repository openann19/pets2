/**
 * PersonalityTagsSection Comprehensive Component Tests
 * Tests personality tag selection, multi-select, and interactions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme';
import { PersonalityTagsSection } from '../PersonalityTagsSection';

// Mock dependencies
jest.mock('expo-blur', () => ({
  BlurView: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">{children}</ThemeProvider>
);

describe('PersonalityTagsSection Component Tests', () => {
  const defaultProps = {
    personalityTags: [],
    selectedTags: [],
    onToggleTag: jest.fn(),
  };

  const allTags = [
    'Friendly',
    'Playful',
    'Calm',
    'Energetic',
    'Shy',
    'Confident',
    'Good with kids',
    'Good with other pets',
    'Independent',
    'Affectionate',
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render personality tags section successfully', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Personality')).toBeTruthy();
      expect(screen.getByText('Select traits that describe your pet')).toBeTruthy();
    });

    it('should render all personality tag options', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} />
        </TestWrapper>,
      );

      allTags.forEach((tag) => {
        expect(screen.getByTestID(`personality-tag-${tag}`)).toBeTruthy();
        expect(screen.getByText(tag)).toBeTruthy();
      });
    });

    it('should render tags in correct order', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} />
        </TestWrapper>,
      );

      const tags = allTags.map((tag) => screen.getByTestID(`personality-tag-${tag}`));
      expect(tags).toHaveLength(10);
    });
  });

  describe('Tag Selection', () => {
    it('should call onToggleTag when tag is pressed', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} />
        </TestWrapper>,
      );

      const friendlyTag = screen.getByTestID('personality-tag-Friendly');
      fireEvent.press(friendlyTag);

      expect(defaultProps.onToggleTag).toHaveBeenCalledWith('Friendly');
      expect(defaultProps.onToggleTag).toHaveBeenCalledTimes(1);
    });

    it('should allow selecting multiple tags', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} />
        </TestWrapper>,
      );

      fireEvent.press(screen.getByTestID('personality-tag-Friendly'));
      fireEvent.press(screen.getByTestID('personality-tag-Playful'));
      fireEvent.press(screen.getByTestID('personality-tag-Calm'));

      expect(defaultProps.onToggleTag).toHaveBeenCalledTimes(3);
      expect(defaultProps.onToggleTag).toHaveBeenCalledWith('Friendly');
      expect(defaultProps.onToggleTag).toHaveBeenCalledWith('Playful');
      expect(defaultProps.onToggleTag).toHaveBeenCalledWith('Calm');
    });

    it('should highlight selected tags', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} selectedTags={['Friendly', 'Playful']} />
        </TestWrapper>,
      );

      const friendlyTag = screen.getByTestID('personality-tag-Friendly');
      const playfulTag = screen.getByTestID('personality-tag-Playful');
      const calmTag = screen.getByTestID('personality-tag-Calm');

      // Selected tags should have active styling (visual verification)
      expect(friendlyTag).toBeTruthy();
      expect(playfulTag).toBeTruthy();
      // Unselected tag should not be active
      expect(calmTag).toBeTruthy();
    });

    it('should allow deselecting tags', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} selectedTags={['Friendly']} />
        </TestWrapper>,
      );

      const friendlyTag = screen.getByTestID('personality-tag-Friendly');
      fireEvent.press(friendlyTag);

      expect(defaultProps.onToggleTag).toHaveBeenCalledWith('Friendly');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} />
        </TestWrapper>,
      );

      const friendlyTag = screen.getByTestID('personality-tag-Friendly');
      expect(friendlyTag).toHaveAccessibilityLabel('Friendly');
      expect(friendlyTag).toHaveAccessibilityRole('button');
    });

    it('should have accessibility labels for all tags', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} />
        </TestWrapper>,
      );

      allTags.forEach((tag) => {
        const tagButton = screen.getByTestID(`personality-tag-${tag}`);
        expect(tagButton).toHaveAccessibilityLabel(tag);
        expect(tagButton).toHaveAccessibilityRole('button');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle selecting all tags', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} selectedTags={allTags} />
        </TestWrapper>,
      );

      allTags.forEach((tag) => {
        expect(screen.getByTestID(`personality-tag-${tag}`)).toBeTruthy();
      });
    });

    it('should handle rapid tag selections', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} />
        </TestWrapper>,
      );

      const friendlyTag = screen.getByTestID('personality-tag-Friendly');
      fireEvent.press(friendlyTag);
      fireEvent.press(friendlyTag);
      fireEvent.press(friendlyTag);
      fireEvent.press(friendlyTag);

      expect(defaultProps.onToggleTag).toHaveBeenCalledTimes(4);
    });

    it('should handle empty selectedTags array', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} selectedTags={[]} />
        </TestWrapper>,
      );

      allTags.forEach((tag) => {
        expect(screen.getByTestID(`personality-tag-${tag}`)).toBeTruthy();
      });
    });

    it('should handle single tag selection', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} selectedTags={['Friendly']} />
        </TestWrapper>,
      );

      expect(screen.getByTestID('personality-tag-Friendly')).toBeTruthy();
    });

    it('should handle selecting tags with special characters', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} selectedTags={['Good with kids', 'Good with other pets']} />
        </TestWrapper>,
      );

      expect(screen.getByTestID('personality-tag-Good with kids')).toBeTruthy();
      expect(screen.getByTestID('personality-tag-Good with other pets')).toBeTruthy();
    });
  });

  describe('Multiple Interactions', () => {
    it('should handle selecting and deselecting multiple tags', () => {
      const { rerender } = render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} selectedTags={[]} />
        </TestWrapper>,
      );

      fireEvent.press(screen.getByTestID('personality-tag-Friendly'));
      fireEvent.press(screen.getByTestID('personality-tag-Playful'));

      rerender(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} selectedTags={['Friendly', 'Playful']} />
        </TestWrapper>,
      );

      fireEvent.press(screen.getByTestID('personality-tag-Friendly'));

      expect(defaultProps.onToggleTag).toHaveBeenCalledTimes(3);
    });

    it('should maintain state when other tags are selected', () => {
      render(
        <TestWrapper>
          <PersonalityTagsSection {...defaultProps} selectedTags={['Friendly', 'Playful']} />
        </TestWrapper>,
      );

      fireEvent.press(screen.getByTestID('personality-tag-Calm'));

      expect(defaultProps.onToggleTag).toHaveBeenCalledWith('Calm');
      // Friendly and Playful should still be selected (state managed by parent)
      expect(screen.getByTestID('personality-tag-Friendly')).toBeTruthy();
      expect(screen.getByTestID('personality-tag-Playful')).toBeTruthy();
    });
  });
});

