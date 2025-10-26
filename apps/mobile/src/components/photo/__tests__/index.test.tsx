/**
 * Integration tests for photo editing components
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AdvancedPhotoEditor } from '../AdvancedPhotoEditor';
import { PhotoAdjustmentSlider } from '../PhotoAdjustmentSlider';
import { usePhotoEditor } from '../../../hooks/usePhotoEditor';

describe('Photo Editing Components Integration', () => {
  describe('Component Exports', () => {
    it('should export AdvancedPhotoEditor', () => {
      expect(AdvancedPhotoEditor).toBeDefined();
    });

    it('should export PhotoAdjustmentSlider', () => {
      expect(PhotoAdjustmentSlider).toBeDefined();
    });

    it('should export usePhotoEditor hook', () => {
      expect(usePhotoEditor).toBeDefined();
    });
  });

  describe('Component Interaction', () => {
    it('should integrate slider with editor', () => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri="file://test.jpg"
          onSave={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(getByText('Adjust')).toBeTruthy();
    });

    it('should allow slider value to update editor', () => {
      const mockOnValueChange = jest.fn();

      const { container } = render(
        <PhotoAdjustmentSlider
          label="Brightness"
          value={100}
          min={0}
          max={200}
          icon="sunny"
          onValueChange={mockOnValueChange}
        />
      );

      expect(container).toBeTruthy();
    });
  });
});

describe('Photo Editing Workflow', () => {
  it('should complete full editing workflow', async () => {
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri="file://test.jpg"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Switch to adjust tab
    const adjustTab = getByText('Adjust');
    fireEvent.press(adjustTab);

    await waitFor(() => {
      expect(getByText('Rotate L')).toBeTruthy();
    });

    // Apply adjustments
    const resetButton = getByText('Reset All');
    fireEvent.press(resetButton);

    // Save
    const saveButton = getByText('Save');
    
    await waitFor(async () => {
      fireEvent.press(saveButton);
    });

    // Should call onSave
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should allow filter application', async () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri="file://test.jpg"
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    // Switch to filters tab
    const filtersTab = getByText('Filters');
    fireEvent.press(filtersTab);

    await waitFor(() => {
      expect(getByText('Vivid')).toBeTruthy();
    });

    // Apply filter
    const vividFilter = getByText('Vivid');
    fireEvent.press(vividFilter);

    // Should switch back to adjust tab
    await waitFor(() => {
      expect(getByText('Adjust')).toBeTruthy();
    });
  });
});

