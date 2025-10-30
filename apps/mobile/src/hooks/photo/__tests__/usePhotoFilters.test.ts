/**
 * Tests for usePhotoFilters hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePhotoFilters } from '../usePhotoFilters';

const mockHaptics = {
  impactAsync: jest.fn(),
};

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

describe('usePhotoFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default presets', () => {
    const onApplyFilter = jest.fn();
    const { result } = renderHook(() =>
      usePhotoFilters({
        onApplyFilter,
      }),
    );

    expect(result.current.selectedPreset).toBe(null);
    expect(result.current.presets.length).toBeGreaterThan(0);
  });

  it('should apply filter preset', () => {
    const onApplyFilter = jest.fn();
    const { result } = renderHook(() =>
      usePhotoFilters({
        onApplyFilter,
      }),
    );

    const preset = result.current.presets[1]; // Vivid

    act(() => {
      result.current.applyPreset(preset);
    });

    expect(result.current.selectedPreset).toBe(preset.name);
    expect(onApplyFilter).toHaveBeenCalledWith(preset.adjustments);
  });

  it('should use custom presets when provided', () => {
    const onApplyFilter = jest.fn();
    const customPresets = [
      { name: 'Custom1', icon: 'star', adjustments: { brightness: 110 } },
      { name: 'Custom2', icon: 'heart', adjustments: { contrast: 120 } },
    ];

    const { result } = renderHook(() =>
      usePhotoFilters({
        onApplyFilter,
        presets: customPresets,
      }),
    );

    expect(result.current.presets).toEqual(customPresets);
  });

  it('should update selected preset when applying', () => {
    const onApplyFilter = jest.fn();
    const { result } = renderHook(() =>
      usePhotoFilters({
        onApplyFilter,
      }),
    );

    const preset1 = result.current.presets[0];
    const preset2 = result.current.presets[1];

    act(() => {
      result.current.applyPreset(preset1);
    });

    expect(result.current.selectedPreset).toBe(preset1.name);

    act(() => {
      result.current.applyPreset(preset2);
    });

    expect(result.current.selectedPreset).toBe(preset2.name);
  });
});

