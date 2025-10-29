/**
 * useAdvancedFiltersScreen Tests
 * Unit tests for advanced filters functionality
 */

import { renderHook, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAdvancedFiltersScreen } from '../useAdvancedFiltersScreen';

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

describe('useAdvancedFiltersScreen', () => {
  describe('Initial State', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useAdvancedFiltersScreen());

      expect(result.current.filters).toHaveLength(16);
      expect(result.current.filters[0].id).toBe('neutered');
    });
  });

  describe('toggleFilter', () => {
    it('should toggle filter value', () => {
      const { result } = renderHook(() => useAdvancedFiltersScreen());

      const initialValue = result.current.filters[0].value;

      act(() => {
        result.current.toggleFilter('neutered');
      });

      expect(result.current.filters[0].value).toBe(!initialValue);
    });
  });

  describe('resetFilters', () => {
    it('should show confirmation alert', () => {
      const { result } = renderHook(() => useAdvancedFiltersScreen());

      act(() => {
        result.current.resetFilters();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Reset Filters',
        'Are you sure you want to reset all advanced filters?',
        expect.any(Array),
      );
    });
  });

  describe('getFiltersByCategory', () => {
    it('should return filters for a specific category', () => {
      const { result } = renderHook(() => useAdvancedFiltersScreen());

      const characteristics = result.current.getFiltersByCategory('characteristics');

      expect(characteristics).toHaveLength(4);
      characteristics.forEach((filter) => {
        expect(filter.category).toBe('characteristics');
      });
    });
  });

  describe('saveFilters', () => {
    it('should save filters and show success alert', () => {
      const { result } = renderHook(() => useAdvancedFiltersScreen());

      act(() => {
        result.current.saveFilters();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Advanced filters saved successfully!');
    });
  });
});
