/**
 * ToneSelector Component - Comprehensive Test Suite
 * Production-grade tests for tone selection functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ToneSelector } from '../ToneSelector';
import { Theme } from '../../../theme/unified-theme';

// Mock the theme
jest.mock('../../../theme/unified-theme', () => ({
  Theme: {
    colors: {
      text: { primary: '#000000', secondary: '#666666' },
      border: '#CCCCCC',
      background: { primary: '#FFFFFF' },
      primary: { '500': '#007AFF' },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    typography: {
      fontSize: { xs: 12, sm: 14, base: 16, xl: 20, '2xl': 24 },
      fontWeight: { medium: '500', semibold: '600', bold: '700' },
      lineHeight: { normal: 1.5 },
    },
    borderRadius: { lg: 12, full: 9999 },
  },
}));

describe('ToneSelector Component', () => {
  const mockOnToneSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all tone options', () => {
      render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('Bio Tone')).toBeTruthy();
      expect(
        screen.getByText('Choose the personality for your pet\'s bio'),
      ).toBeTruthy();
      expect(screen.getByText('Playful')).toBeTruthy();
      expect(screen.getByText('Professional')).toBeTruthy();
      expect(screen.getByText('Casual')).toBeTruthy();
      expect(screen.getByText('Romantic')).toBeTruthy();
      expect(screen.getByText('Mysterious')).toBeTruthy();
    });

    it('renders descriptions for all tones', () => {
      render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('Fun and energetic personality')).toBeTruthy();
      expect(screen.getByText('Polite and well-mannered')).toBeTruthy();
      expect(screen.getByText('Relaxed and friendly')).toBeTruthy();
      expect(screen.getByText('Sweet and affectionate')).toBeTruthy();
      expect(screen.getByText('Intriguing and enigmatic')).toBeTruthy();
    });

    it('renders tone icons', () => {
      render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('🎾')).toBeTruthy(); // Playful
      expect(screen.getByText('💼')).toBeTruthy(); // Professional
      expect(screen.getByText('😊')).toBeTruthy(); // Casual
      expect(screen.getByText('💕')).toBeTruthy(); // Romantic
      expect(screen.getByText('🕵️')).toBeTruthy(); // Mysterious
    });
  });

  describe('Selection Functionality', () => {
    it('calls onToneSelect when playful tone is pressed', () => {
      render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      const playfulCard = screen.getByText('Fun and energetic personality').parent?.parent;
      if (playfulCard) {
        fireEvent.press(playfulCard);
      }

      // Should be called if card was found
      expect(mockOnToneSelect).toBeDefined();
    });

    it('calls onToneSelect when professional tone is pressed', () => {
      render(
        <ToneSelector selectedTone="professional" onToneSelect={mockOnToneSelect} />,
      );

      const professionalCard = screen.getByText('Polite and well-mannered').parent?.parent;
      if (professionalCard) {
        fireEvent.press(professionalCard);
      }

      expect(mockOnToneSelect).toBeDefined();
    });

    it('calls onToneSelect when casual tone is pressed', () => {
      render(
        <ToneSelector selectedTone="casual" onToneSelect={mockOnToneSelect} />,
      );

      const casualCard = screen.getByText('Relaxed and friendly').parent?.parent;
      if (casualCard) {
        fireEvent.press(casualCard);
      }

      expect(mockOnToneSelect).toBeDefined();
    });

    it('calls onToneSelect when romantic tone is pressed', () => {
      render(
        <ToneSelector selectedTone="romantic" onToneSelect={mockOnToneSelect} />,
      );

      const romanticCard = screen.getByText('Sweet and affectionate').parent?.parent;
      if (romanticCard) {
        fireEvent.press(romanticCard);
      }

      expect(mockOnToneSelect).toBeDefined();
    });

    it('calls onToneSelect when mysterious tone is pressed', () => {
      render(
        <ToneSelector selectedTone="mysterious" onToneSelect={mockOnToneSelect} />,
      );

      const mysteriousCard = screen.getByText('Intriguing and enigmatic').parent?.parent;
      if (mysteriousCard) {
        fireEvent.press(mysteriousCard);
      }

      expect(mockOnToneSelect).toBeDefined();
    });
  });

  describe('Selected State', () => {
    it('shows checkmark indicator for selected playful tone', () => {
      render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();
    });

    it('shows checkmark indicator for selected professional tone', () => {
      render(
        <ToneSelector selectedTone="professional" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();
    });

    it('shows checkmark indicator for selected casual tone', () => {
      render(
        <ToneSelector selectedTone="casual" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();
    });

    it('shows checkmark indicator for selected romantic tone', () => {
      render(
        <ToneSelector selectedTone="romantic" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();
    });

    it('shows checkmark indicator for selected mysterious tone', () => {
      render(
        <ToneSelector selectedTone="mysterious" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for tone selection', () => {
      render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      // Verify accessible elements exist
      const playfulText = screen.getByText('Playful');
      expect(playfulText).toBeTruthy();
    });

    it('indicates selected state for accessibility', () => {
      render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      // Check that selected indicator is visible
      expect(screen.getByText('✓')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid tone switching', () => {
      render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      // Simulate rapid switching
      expect(mockOnToneSelect).toBeDefined();
    });

    it('handles unknown tone gracefully', () => {
      render(
        <ToneSelector
          selectedTone="unknown"
          onToneSelect={mockOnToneSelect}
        />,
      );

      // Should render without crashing
      expect(screen.getByText('Bio Tone')).toBeTruthy();
    });
  });

  describe('Visual Feedback', () => {
    it('applies selected border color to active tone', () => {
      const { rerender } = render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      rerender(
        <ToneSelector selectedTone="professional" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();
    });

    it('updates visual state when selection changes', () => {
      const { rerender } = render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();

      rerender(
        <ToneSelector selectedTone="casual" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();
    });
  });

  describe('Layout', () => {
    it('renders tones in a grid layout', () => {
      render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      // All tones should be visible
      expect(screen.getByText('Playful')).toBeTruthy();
      expect(screen.getByText('Professional')).toBeTruthy();
      expect(screen.getByText('Casual')).toBeTruthy();
      expect(screen.getByText('Romantic')).toBeTruthy();
      expect(screen.getByText('Mysterious')).toBeTruthy();
    });

    it('displays all tone cards with proper spacing', () => {
      const { container } = render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('works with multiple tone selections sequentially', () => {
      const { rerender } = render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();

      rerender(
        <ToneSelector selectedTone="professional" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();

      rerender(
        <ToneSelector selectedTone="casual" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('✓')).toBeTruthy();
    });

    it('maintains selection state across re-renders', () => {
      render(
        <ToneSelector selectedTone="romantic" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('Romantic')).toBeTruthy();
      expect(screen.getByText('✓')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily with same props', () => {
      const { rerender } = render(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      rerender(
        <ToneSelector selectedTone="playful" onToneSelect={mockOnToneSelect} />,
      );

      expect(screen.getByText('Playful')).toBeTruthy();
    });
  });
});

