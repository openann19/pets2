/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, ActivityIndicator } from 'react-native';
import { SubjectSuggestionsBar } from '../SubjectSuggestionsBar';
import { AutoCropEngine } from '../../../utils/AutoCropEngine';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('../../../utils/AutoCropEngine');
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: 'medium',
  },
}));

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    View: React.forwardRef((props: any, ref: any) => (
      <View
        {...props}
        ref={ref}
      />
    )),
  };
});

jest.mock('../micro', () => ({
  BouncePressable: ({ children, onPress, ...props }: any) => {
    const TouchableOpacity = require('react-native').TouchableOpacity;
    return (
      <TouchableOpacity
        onPress={onPress}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  },
}));

describe('SubjectSuggestionsBar', () => {
  const mockImageUri = 'file://test-image.jpg';

  const mockSuggestions = [
    {
      ratio: '1:1',
      focus: { x: 100, y: 100, width: 400, height: 400 },
      crop: { x: 50, y: 50, width: 500, height: 500 },
      thumbUri: 'file://thumb-1x1.jpg',
      method: 'eyes' as const,
    },
    {
      ratio: '4:5',
      focus: { x: 100, y: 100, width: 400, height: 400 },
      crop: { x: 0, y: 0, width: 400, height: 500 },
      thumbUri: 'file://thumb-4x5.jpg',
      method: 'face' as const,
    },
    {
      ratio: '9:16',
      focus: { x: 100, y: 100, width: 400, height: 400 },
      crop: { x: 0, y: 0, width: 225, height: 400 },
      thumbUri: 'file://thumb-9x16.jpg',
      method: 'eyes' as const,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (AutoCropEngine.suggestCrops as jest.Mock).mockResolvedValue(mockSuggestions);
    (AutoCropEngine.makeThumbnails as jest.Mock).mockResolvedValue(mockSuggestions);
  });

  describe('rendering', () => {
    it('should render loading state initially', async () => {
      const { getByText } = render(<SubjectSuggestionsBar uri={mockImageUri} />);

      expect(getByText(/Finding the best frames/i)).toBeTruthy();
      // ActivityIndicator should be present but we can't easily test it
    });

    it('should render suggestions after loading', async () => {
      const { getByText, queryByText } = render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(queryByText(/Finding the best frames/i)).toBeNull();
      });

      // Should show all ratios
      expect(getByText('1:1')).toBeTruthy();
      expect(getByText('4:5')).toBeTruthy();
      expect(getByText('9:16')).toBeTruthy();
    });

    it('should render method badges', async () => {
      const { getByText } = render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(getByText(/Eye-focus.*1:1/i)).toBeTruthy();
        expect(getByText(/Face.*4:5/i)).toBeTruthy();
        expect(getByText(/Eye-focus.*9:16/i)).toBeTruthy();
      });
    });

    it('should render use buttons', async () => {
      const { getByText } = render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        const useButtons = getByText(/Use/i);
        expect(useButtons).toBeTruthy();
      });
    });
  });

  describe('interactions', () => {
    it('should call onFocus when thumbnail is tapped', async () => {
      const onFocus = jest.fn();
      const { getByText } = render(
        <SubjectSuggestionsBar
          uri={mockImageUri}
          onFocus={onFocus}
        />,
      );

      await waitFor(() => {
        expect(getByText('1:1')).toBeTruthy();
      });

      // Find and tap thumbnail (simulated by tapping the text/container)
      fireEvent.press(getByText('1:1'));

      expect(onFocus).toHaveBeenCalledWith(mockSuggestions[0].focus);
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should call onApply when use button is tapped', async () => {
      const onApply = jest.fn();
      const { getAllByText } = render(
        <SubjectSuggestionsBar
          uri={mockImageUri}
          onApply={onApply}
        />,
      );

      await waitFor(() => {
        expect(getAllByText('Use').length).toBeGreaterThan(0);
      });

      const useButtons = getAllByText('Use');
      fireEvent.press(useButtons[0]);

      expect(onApply).toHaveBeenCalledWith(mockSuggestions[0].crop);
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('should handle missing callbacks gracefully', async () => {
      const { getAllByText } = render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(getAllByText('Use').length).toBeGreaterThan(0);
      });

      const useButtons = getAllByText('Use');
      fireEvent.press(useButtons[0]);

      // Should not throw when callbacks are undefined
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('custom ratios', () => {
    it('should accept custom ratios', async () => {
      const customRatios = ['16:9', '3:2'];
      (AutoCropEngine.suggestCrops as jest.Mock).mockResolvedValue([
        {
          ratio: '16:9',
          focus: { x: 100, y: 100, width: 400, height: 225 },
          crop: { x: 0, y: 0, width: 800, height: 450 },
          method: 'fallback' as const,
        },
        {
          ratio: '3:2',
          focus: { x: 100, y: 100, width: 400, height: 225 },
          crop: { x: 0, y: 0, width: 600, height: 400 },
          method: 'fallback' as const,
        },
      ]);

      const { getByText } = render(
        <SubjectSuggestionsBar
          uri={mockImageUri}
          ratios={customRatios}
        />,
      );

      await waitFor(() => {
        expect(getByText('16:9')).toBeTruthy();
        expect(getByText('3:2')).toBeTruthy();
      });
    });

    it('should use default ratios when none provided', async () => {
      render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(AutoCropEngine.suggestCrops).toHaveBeenCalledWith(
          mockImageUri,
          ['1:1', '4:5', '9:16'],
          expect.any(Object),
        );
      });
    });
  });

  describe('error handling', () => {
    it('should display empty state when detection fails', async () => {
      (AutoCropEngine.suggestCrops as jest.Mock).mockResolvedValue([]);

      const { getByText } = render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(getByText(/No suggestions—try manual crop/i)).toBeTruthy();
      });
    });

    it('should display empty state when engine throws error', async () => {
      (AutoCropEngine.suggestCrops as jest.Mock).mockRejectedValue(new Error('Processing failed'));

      const { getByText } = render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(getByText(/No suggestions—try manual crop/i)).toBeTruthy();
      });
    });
  });

  describe('lifecycle', () => {
    it('should cleanup on unmount', async () => {
      const { unmount } = render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(AutoCropEngine.suggestCrops).toHaveBeenCalled();
      });

      unmount();

      // Should not cause errors
      expect(true).toBe(true);
    });

    it('should re-run on URI change', async () => {
      const { rerender } = render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(AutoCropEngine.suggestCrops).toHaveBeenCalledWith(
          mockImageUri,
          expect.any(Array),
          expect.any(Object),
        );
      });

      const newUri = 'file://new-image.jpg';
      rerender(<SubjectSuggestionsBar uri={newUri} />);

      await waitFor(() => {
        expect(AutoCropEngine.suggestCrops).toHaveBeenCalledWith(
          newUri,
          expect.any(Array),
          expect.any(Object),
        );
      });
    });

    it('should re-run on ratios change', async () => {
      const { rerender } = render(
        <SubjectSuggestionsBar
          uri={mockImageUri}
          ratios={['1:1']}
        />,
      );

      await waitFor(() => {
        expect(AutoCropEngine.suggestCrops).toHaveBeenCalledWith(
          mockImageUri,
          ['1:1'],
          expect.any(Object),
        );
      });

      rerender(
        <SubjectSuggestionsBar
          uri={mockImageUri}
          ratios={['4:5']}
        />,
      );

      await waitFor(() => {
        expect(AutoCropEngine.suggestCrops).toHaveBeenCalledWith(
          mockImageUri,
          ['4:5'],
          expect.any(Object),
        );
      });
    });
  });

  describe('engine options', () => {
    it('should pass custom eye weight to engine', async () => {
      render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(AutoCropEngine.suggestCrops).toHaveBeenCalledWith(
          mockImageUri,
          expect.any(Array),
          expect.objectContaining({ eyeWeight: 0.6, padPct: 0.16 }),
        );
      });
    });

    it('should generate thumbnails with correct options', async () => {
      render(<SubjectSuggestionsBar uri={mockImageUri} />);

      await waitFor(() => {
        expect(AutoCropEngine.makeThumbnails).toHaveBeenCalledWith(
          mockImageUri,
          expect.any(Array),
          expect.objectContaining({ size: 220, quality: 0.9 }),
        );
      });
    });
  });
});
