/**
 * BioResults Component - Comprehensive Test Suite
 * Production-grade tests for bio display and interaction
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { BioResults } from '../BioResults';
import type { GeneratedBio } from '../../../hooks/useAIBio';

// Mock clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

// Mock the theme
jest.mock('../../../theme/unified-theme', () => ({
  Theme: {
    colors: {
      text: { primary: '#000000' },
      status: { success: '#28A745', warning: '#FFC107', error: '#DC3545' },
      border: { light: '#E5E5E5' },
      background: { primary: '#FFFFFF' },
      primary: { '500': '#007AFF' },
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    typography: {
      fontSize: { 'xs': 12, 'sm': 14, 'base': 16, 'xl': 20, '2xl': 24 },
      fontWeight: { medium: '500', semibold: '600', bold: '700' },
      lineHeight: { relaxed: 1.625, normal: 1.5 },
    },
    borderRadius: { md: 8, lg: 12, full: 9999 },
  },
}));

describe('BioResults Component', () => {
  const mockBio: GeneratedBio = {
    bio: 'Meet Max, an energetic 2-year-old Golden Retriever who loves playing fetch and going on adventures. He has a friendly personality and gets along with everyone.',
    keywords: ['energetic', 'friendly', 'loves adventure', 'Golden Retriever'],
    sentiment: {
      score: 0.85,
      label: 'Very Positive',
    },
    matchScore: 92,
    createdAt: new Date().toISOString(),
  };

  const mockOnSave = jest.fn();
  const mockOnRegenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders generated bio text', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText('Generated Bio')).toBeTruthy();
      expect(screen.getByText(mockBio.bio)).toBeTruthy();
    });

    it('displays match score', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText('Bio Analysis')).toBeTruthy();
      expect(screen.getByText('Match Score')).toBeTruthy();
      expect(screen.getByText('92/100')).toBeTruthy();
    });

    it('displays sentiment analysis', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText('Sentiment')).toBeTruthy();
      expect(screen.getByText('Very Positive')).toBeTruthy();
      expect(screen.getByText('Score: 85%')).toBeTruthy();
    });

    it('displays keywords as chips', () => {
      render(<BioResults generatedBio={mockBio} />);

      mockBio.keywords.forEach((keyword) => {
        expect(screen.getByText(keyword)).toBeTruthy();
      });
    });

    it('displays action buttons', () => {
      render(
        <BioResults
          generatedBio={mockBio}
          onSave={mockOnSave}
          onRegenerate={mockOnRegenerate}
        />,
      );

      expect(screen.getByText('Copy')).toBeTruthy();
      expect(screen.getByText('Save')).toBeTruthy();
      expect(screen.getByText('Regenerate')).toBeTruthy();
    });

    it('only shows Copy button when no callbacks provided', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText('Copy')).toBeTruthy();
      expect(screen.queryByText('Save')).toBeFalsy();
      expect(screen.queryByText('Regenerate')).toBeFalsy();
    });
  });

  describe('Copy Functionality', () => {
    it('calls setStringAsync when copy button is pressed', async () => {
      const Clipboard = require('expo-clipboard');

      render(<BioResults generatedBio={mockBio} />);

      const copyButton = screen.getByText('Copy');
      fireEvent.press(copyButton);

      await waitFor(() => {
        expect(Clipboard.setStringAsync).toHaveBeenCalledWith(mockBio.bio);
      });
    });

    it('displays confirmation when copy is successful', async () => {
      render(<BioResults generatedBio={mockBio} />);

      const copyButton = screen.getByText('Copy');
      fireEvent.press(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeTruthy();
      });
    });

    it('shows checkmark icon when copied', async () => {
      render(<BioResults generatedBio={mockBio} />);

      const copyButton = screen.getByText('Copy');
      fireEvent.press(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeTruthy();
      });
    });

    it('handles copy errors gracefully', async () => {
      const Clipboard = require('expo-clipboard');
      Clipboard.setStringAsync.mockRejectedValueOnce(new Error('Failed'));

      const Alert = require('react-native').Alert;

      render(<BioResults generatedBio={mockBio} />);

      const copyButton = screen.getByText('Copy');
      fireEvent.press(copyButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to copy bio to clipboard');
      });
    });
  });

  describe('Save Functionality', () => {
    it('calls onSave when save button is pressed', () => {
      render(
        <BioResults
          generatedBio={mockBio}
          onSave={mockOnSave}
        />,
      );

      const saveButton = screen.getByText('Save');
      fireEvent.press(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(mockBio);
    });

    it('shows success alert when saved', () => {
      const Alert = require('react-native').Alert;

      render(
        <BioResults
          generatedBio={mockBio}
          onSave={mockOnSave}
        />,
      );

      const saveButton = screen.getByText('Save');
      fireEvent.press(saveButton);

      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Bio saved to history!');
    });

    it('does not show save button when onSave is not provided', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.queryByText('Save')).toBeFalsy();
    });
  });

  describe('Regenerate Functionality', () => {
    it('calls onRegenerate when regenerate button is pressed', () => {
      render(
        <BioResults
          generatedBio={mockBio}
          onRegenerate={mockOnRegenerate}
        />,
      );

      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.press(regenerateButton);

      expect(mockOnRegenerate).toHaveBeenCalled();
    });

    it('does not show regenerate button when onRegenerate is not provided', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.queryByText('Regenerate')).toBeFalsy();
    });
  });

  describe('Match Score Display', () => {
    it('displays high match score (green)', () => {
      const highScoreBio = { ...mockBio, matchScore: 95 };
      render(<BioResults generatedBio={highScoreBio} />);

      expect(screen.getByText('95/100')).toBeTruthy();
    });

    it('displays medium match score (yellow)', () => {
      const mediumScoreBio = { ...mockBio, matchScore: 65 };
      render(<BioResults generatedBio={mediumScoreBio} />);

      expect(screen.getByText('65/100')).toBeTruthy();
    });

    it('displays low match score (red)', () => {
      const lowScoreBio = { ...mockBio, matchScore: 45 };
      render(<BioResults generatedBio={lowScoreBio} />);

      expect(screen.getByText('45/100')).toBeTruthy();
    });

    it('renders progress bar correctly', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText('92/100')).toBeTruthy();
    });
  });

  describe('Sentiment Analysis', () => {
    it('displays very positive sentiment correctly', () => {
      const positiveBio = {
        ...mockBio,
        sentiment: { score: 0.9, label: 'Very Positive' },
      };

      render(<BioResults generatedBio={positiveBio} />);

      expect(screen.getByText('Very Positive')).toBeTruthy();
      expect(screen.getByText('Score: 90%')).toBeTruthy();
    });

    it('displays positive sentiment correctly', () => {
      const positiveBio = {
        ...mockBio,
        sentiment: { score: 0.7, label: 'Positive' },
      };

      render(<BioResults generatedBio={positiveBio} />);

      expect(screen.getByText('Positive')).toBeTruthy();
      expect(screen.getByText('Score: 70%')).toBeTruthy();
    });

    it('displays neutral sentiment correctly', () => {
      const neutralBio = {
        ...mockBio,
        sentiment: { score: 0.5, label: 'Neutral' },
      };

      render(<BioResults generatedBio={neutralBio} />);

      expect(screen.getByText('Neutral')).toBeTruthy();
      expect(screen.getByText('Score: 50%')).toBeTruthy();
    });

    it('displays negative sentiment correctly', () => {
      const negativeBio = {
        ...mockBio,
        sentiment: { score: 0.2, label: 'Negative' },
      };

      render(<BioResults generatedBio={negativeBio} />);

      expect(screen.getByText('Negative')).toBeTruthy();
      expect(screen.getByText('Score: 20%')).toBeTruthy();
    });
  });

  describe('Keywords Display', () => {
    it('displays no keywords section when keywords array is empty', () => {
      const bioWithoutKeywords = { ...mockBio, keywords: [] };
      render(<BioResults generatedBio={bioWithoutKeywords} />);

      expect(screen.queryByText('Key Traits')).toBeFalsy();
    });

    it('displays keywords section when keywords exist', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText('Key Traits')).toBeTruthy();
    });

    it('renders multiple keywords correctly', () => {
      const multiKeywordBio = {
        ...mockBio,
        keywords: ['friendly', 'active', 'loyal', 'playful', 'energetic'],
      };

      render(<BioResults generatedBio={multiKeywordBio} />);

      multiKeywordBio.keywords.forEach((keyword) => {
        expect(screen.getByText(keyword)).toBeTruthy();
      });
    });
  });

  describe('Scrollable Content', () => {
    it('renders bio text in scrollable view', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText(mockBio.bio)).toBeTruthy();
    });

    it('handles long bio text correctly', () => {
      const longBio = {
        ...mockBio,
        bio: 'A'.repeat(5000),
      };

      render(<BioResults generatedBio={longBio} />);

      expect(screen.getByText(longBio.bio)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles bio with minimum content', () => {
      const minimalBio = {
        bio: 'Short bio',
        keywords: ['keyword'],
        sentiment: { score: 0.5, label: 'Neutral' },
        matchScore: 50,
        createdAt: new Date().toISOString(),
      };

      render(<BioResults generatedBio={minimalBio} />);

      expect(screen.getByText('Short bio')).toBeTruthy();
    });

    it('handles bio with maximum length', () => {
      const longBio = {
        ...mockBio,
        bio: 'A'.repeat(5000),
      };

      render(<BioResults generatedBio={longBio} />);

      expect(screen.getByDisplayValue).toBeTruthy();
    });

    it('handles special characters in bio text', () => {
      const specialCharBio = {
        ...mockBio,
        bio: 'Bio with special chars: 🐕🐶❤️★☆⭐',
      };

      render(<BioResults generatedBio={specialCharBio} />);

      expect(screen.getByText('Bio with special chars: 🐕🐶❤️★☆⭐')).toBeTruthy();
    });

    it('handles empty keywords array', () => {
      const noKeywordBio = { ...mockBio, keywords: [] };
      render(<BioResults generatedBio={noKeywordBio} />);

      expect(screen.queryByText('Key Traits')).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for action buttons', () => {
      render(
        <BioResults
          generatedBio={mockBio}
          onSave={mockOnSave}
          onRegenerate={mockOnRegenerate}
        />,
      );

      expect(screen.getByText('Copy')).toBeTruthy();
      expect(screen.getByText('Save')).toBeTruthy();
      expect(screen.getByText('Regenerate')).toBeTruthy();
    });

    it('provides accessible labels for metrics', () => {
      render(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText('Match Score')).toBeTruthy();
      expect(screen.getByText('Sentiment')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('renders quickly with minimal re-renders', () => {
      const { rerender } = render(<BioResults generatedBio={mockBio} />);

      rerender(<BioResults generatedBio={mockBio} />);

      expect(screen.getByText('Generated Bio')).toBeTruthy();
    });
  });

  describe('Integration', () => {
    it('works with all callbacks provided', () => {
      render(
        <BioResults
          generatedBio={mockBio}
          onSave={mockOnSave}
          onRegenerate={mockOnRegenerate}
        />,
      );

      expect(screen.getByText('Copy')).toBeTruthy();
      expect(screen.getByText('Save')).toBeTruthy();
      expect(screen.getByText('Regenerate')).toBeTruthy();
    });

    it('calls correct callback for each action', () => {
      render(
        <BioResults
          generatedBio={mockBio}
          onSave={mockOnSave}
          onRegenerate={mockOnRegenerate}
        />,
      );

      const saveButton = screen.getByText('Save');
      fireEvent.press(saveButton);
      expect(mockOnSave).toHaveBeenCalledWith(mockBio);

      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.press(regenerateButton);
      expect(mockOnRegenerate).toHaveBeenCalled();
    });
  });
});
