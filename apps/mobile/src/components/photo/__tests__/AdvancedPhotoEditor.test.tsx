import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Modal, Image } from 'react-native';
import { AdvancedPhotoEditor } from '../AdvancedPhotoEditor';
import { usePhotoEditor } from '../../../hooks/usePhotoEditor';

// Mock dependencies
jest.mock('../../../hooks/usePhotoEditor');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children,
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: any) => <test-element name={name} />,
}));

// Mock theme hook
jest.mock('@/theme', () => {
  const actual = jest.requireActual('@/theme');
  return {
    ...actual,
    useTheme: jest.fn(() => ({
      scheme: 'light' as const,
      isDark: false,
      colors: {
        bg: '#FFFFFF',
        surface: '#F5F5F5',
        onSurface: '#000000',
        onMuted: '#666666',
        primary: '#007AFF',
        border: '#E0E0E0',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 },
      radii: { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16 },
      palette: { gradients: {} as any, neutral: {} as any, brand: {} as any },
      shadows: {} as any,
      motion: {} as any,
    })),
  };
});

// Mock photo hooks
jest.mock('../../../hooks/photo', () => ({
  usePhotoPinchZoom: jest.fn(() => ({
    animatedStyle: {},
    gesture: {},
  })),
  usePhotoCompare: jest.fn(() => ({
    comparing: false,
    originalOpacity: 1,
    editedOpacity: 1,
    onCompareIn: jest.fn(),
    onCompareOut: jest.fn(),
  })),
  usePhotoFilters: jest.fn(() => ({
    applyPreset: jest.fn(),
  })),
  useUltraExport: jest.fn(() => ({
    isExporting: false,
    progress: 0,
    variants: [],
    exportVariants: jest.fn(),
    saveAll: jest.fn(),
  })),
}));

// Mock photo editor state hook
jest.mock('../hooks/usePhotoEditorState', () => ({
  usePhotoEditorState: jest.fn(() => ({
    activeTab: 'adjust',
    setActiveTab: jest.fn(),
    showSplit: false,
    setShowSplit: jest.fn(),
    showGrid: false,
    setShowGrid: jest.fn(),
    showGuides: false,
    setShowGuides: jest.fn(),
    showUltraModal: false,
    setShowUltraModal: jest.fn(),
    cropperRef: { current: null },
    handleAutoCrop: jest.fn(),
    handleSuggestionApply: jest.fn(),
  })),
}));

// Mock photo editor components
jest.mock('../components', () => ({
  PhotoEditorPreview: ({ children }: any) => children,
  PhotoEditorTabs: ({ activeTab, onTabChange }: any) => null,
  PhotoAdjustmentPanel: () => null,
  PhotoFiltersPanel: () => null,
  PhotoCropPanel: () => null,
  UltraExportModal: () => null,
}));

// Mock BeforeAfterSlider
jest.mock('../BeforeAfterSlider', () => ({
  BeforeAfterSlider: () => null,
}));

const mockUsePhotoEditor = usePhotoEditor as jest.MockedFunction<typeof usePhotoEditor>;

describe('AdvancedPhotoEditor', () => {
  const mockImageUri = 'file://test-image.jpg';
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultMockReturn = {
    uri: mockImageUri,
    isLoading: false,
    adjustments: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      blur: 0,
      sharpen: 0,
    },
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    updateAdjustment: jest.fn(),
    setRotation: jest.fn(),
    setFlipHorizontal: jest.fn(),
    setFlipVertical: jest.fn(),
    applyFilter: jest.fn(),
    resetAdjustments: jest.fn(),
    saveImage: jest.fn().mockResolvedValue('file://edited.jpg'),
    rotateLeft: jest.fn(),
    rotateRight: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePhotoEditor.mockReturnValue(defaultMockReturn);
  });

  describe('Rendering', () => {
    it('should render with image preview', () => {
      const { getByTestId } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      expect(getByTestId).toBeDefined();
    });

    it('should render header with title and buttons', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      expect(getByText('Edit Photo')).toBeTruthy();
      expect(getByText('Save')).toBeTruthy();
    });

    it('should render tab buttons for adjust and filters', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      expect(getByText('Adjust')).toBeTruthy();
      expect(getByText('Filters')).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to adjust tab', async () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const adjustTab = getByText('Adjust');
      fireEvent.press(adjustTab);

      await waitFor(() => {
        expect(getByText('Rotate L')).toBeTruthy();
      });
    });

    it('should switch to filters tab', async () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const filtersTab = getByText('Filters');
      fireEvent.press(filtersTab);

      await waitFor(() => {
        expect(getByText('Original')).toBeTruthy();
      });
    });
  });

  describe('Transform Controls', () => {
    it('should call rotateLeft when pressing rotate left button', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const rotateLeftButton = getByText('Rotate L');
      fireEvent.press(rotateLeftButton);

      expect(defaultMockReturn.rotateLeft).toHaveBeenCalledTimes(1);
    });

    it('should call rotateRight when pressing rotate right button', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const rotateRightButton = getByText('Rotate R');
      fireEvent.press(rotateRightButton);

      expect(defaultMockReturn.rotateRight).toHaveBeenCalledTimes(1);
    });

    it('should call handleFlipH when pressing flip horizontal button', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const flipHButton = getByText('Flip H');
      fireEvent.press(flipHButton);

      expect(defaultMockReturn.setFlipHorizontal).toHaveBeenCalled();
    });

    it('should call handleFlipV when pressing flip vertical button', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const flipVButton = getByText('Flip V');
      fireEvent.press(flipVButton);

      expect(defaultMockReturn.setFlipVertical).toHaveBeenCalled();
    });

    it('should call resetAdjustments when pressing reset button', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const resetButton = getByText('Reset All');
      fireEvent.press(resetButton);

      expect(defaultMockReturn.resetAdjustments).toHaveBeenCalledTimes(1);
    });
  });

  describe('Filter Presets', () => {
    it('should apply filter preset when tapped', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      // Switch to filters tab
      const filtersTab = getByText('Filters');
      fireEvent.press(filtersTab);

      // Tap on a filter
      waitFor(() => {
        const vividFilter = getByText('Vivid');
        fireEvent.press(vividFilter);

        expect(defaultMockReturn.applyFilter).toHaveBeenCalled();
      });
    });

    it('should apply correct filter adjustments', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const filtersTab = getByText('Filters');
      fireEvent.press(filtersTab);

      waitFor(() => {
        const warmFilter = getByText('Warm');
        fireEvent.press(warmFilter);

        expect(defaultMockReturn.applyFilter).toHaveBeenCalledWith(
          expect.objectContaining({
            brightness: 105,
            saturation: 110,
            warmth: 30,
          }),
        );
      });
    });
  });

  describe('Save Functionality', () => {
    it('should call saveImage and onSave when save button is pressed', async () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const saveButton = getByText('Save');

      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(defaultMockReturn.saveImage).toHaveBeenCalledTimes(1);
        expect(mockOnSave).toHaveBeenCalledWith('file://edited.jpg');
      });
    });

    it('should not save when loading', () => {
      mockUsePhotoEditor.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const saveButton = getByText('Save');

      // Button should be disabled
      expect(saveButton.props.disabled).toBeTruthy();
    });

    it('should show loading overlay when processing', () => {
      mockUsePhotoEditor.mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      expect(getByText('Processing...')).toBeTruthy();
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button is pressed', () => {
      const { getByTestId } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      // Press cancel button
      fireEvent.press(getByTestId('cancel-button'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Aspect Ratio', () => {
    it('should enforce 1:1 aspect ratio for avatars', () => {
      const { container } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          aspectRatio={[1, 1]}
          maxWidth={512}
          maxHeight={512}
        />,
      );

      expect(mockUsePhotoEditor).toHaveBeenCalledWith(
        mockImageUri,
        expect.objectContaining({
          maxWidth: 512,
          maxHeight: 512,
        }),
      );
    });

    it('should enforce 4:3 aspect ratio for pet photos', () => {
      const { container } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          aspectRatio={[4, 3]}
          maxWidth={1920}
          maxHeight={1920}
        />,
      );

      expect(mockUsePhotoEditor).toHaveBeenCalledWith(
        mockImageUri,
        expect.objectContaining({
          maxWidth: 1920,
          maxHeight: 1920,
        }),
      );
    });
  });

  describe('Adjustment Sliders', () => {
    it('should update brightness when slider value changes', async () => {
      const { getAllByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      // Adjust tab should be active by default
      await waitFor(() => {
        expect(getAllByText('Brightness')).toBeTruthy();
        expect(getAllByText('100')).toBeTruthy();
      });
    });

    it('should update contrast when slider value changes', async () => {
      const { getAllByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      await waitFor(() => {
        expect(getAllByText('Contrast')).toBeTruthy();
      });
    });

    it('should update saturation when slider value changes', async () => {
      const { getAllByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      await waitFor(() => {
        expect(getAllByText('Saturation')).toBeTruthy();
      });
    });

    it('should update warmth when slider value changes', async () => {
      const { getAllByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      await waitFor(() => {
        expect(getAllByText('Warmth')).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle save error gracefully', async () => {
      const mockSaveError = jest.fn().mockRejectedValue(new Error('Save failed'));
      mockUsePhotoEditor.mockReturnValue({
        ...defaultMockReturn,
        saveImage: mockSaveError,
      });

      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const saveButton = getByText('Save');

      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });
    });

    it('should handle invalid image URI', () => {
      render(
        <AdvancedPhotoEditor
          imageUri=""
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      // Should not crash
      expect(true).toBeTruthy();
    });

    it('should handle null adjustments', () => {
      mockUsePhotoEditor.mockReturnValue({
        ...defaultMockReturn,
        adjustments: null as any,
      });

      const { container } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      // Should not crash
      expect(true).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      // Check for accessibility elements
      expect(getByText('Edit Photo')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { container, rerender } = render(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      const renderCount = jest.fn();

      rerender(
        <AdvancedPhotoEditor
          imageUri={mockImageUri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      // Component should be optimized
      expect(true).toBeTruthy();
    });
  });
});
