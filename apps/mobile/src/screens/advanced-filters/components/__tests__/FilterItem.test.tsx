/**
 * Tests for FilterItem Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterItem } from '../components/FilterItem';
import type { FilterOption } from '../components/FilterItem';

const mockFilter: FilterOption = {
  id: 'neutered',
  label: 'Neutered/Spayed Only',
  value: false,
  category: 'characteristics',
};

describe('FilterItem', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render filter label correctly', () => {
    const { getByText } = render(<FilterItem filter={mockFilter} onToggle={mockOnToggle} />);

    expect(getByText('Neutered/Spayed Only')).toBeTruthy();
  });

  it('should call onToggle when filter is pressed', () => {
    const { getByTestId } = render(<FilterItem filter={mockFilter} onToggle={mockOnToggle} />);

    const filterItem = getByTestId('filter-neutered');
    fireEvent.press(filterItem);

    expect(mockOnToggle).toHaveBeenCalledWith('neutered');
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should display active state when value is true', () => {
    const activeFilter = { ...mockFilter, value: true };
    const { getByTestId } = render(<FilterItem filter={activeFilter} onToggle={mockOnToggle} />);

    const filterItem = getByTestId('filter-neutered');
    expect(filterItem).toBeTruthy();
    // Check accessibility state
    expect(filterItem.props.accessibilityState?.selected).toBe(true);
  });

  it('should display inactive state when value is false', () => {
    const { getByTestId } = render(<FilterItem filter={mockFilter} onToggle={mockOnToggle} />);

    const filterItem = getByTestId('filter-neutered');
    expect(filterItem.props.accessibilityState?.selected).toBe(false);
  });

  it('should have correct accessibility label', () => {
    const { getByTestId } = render(<FilterItem filter={mockFilter} onToggle={mockOnToggle} />);

    const filterItem = getByTestId('filter-neutered');
    expect(filterItem.props.accessibilityLabel).toBe('Filter: Neutered/Spayed Only');
  });
});

