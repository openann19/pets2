/**
 * Snapshot Test for SwipeActions Component
 * Fixes T-01: Jest snapshot tests for key screens
 */

import './SwipeActions.test-setup'; // Must be first
import React from 'react';
import { SwipeActions } from '../SwipeActions';
import { renderWithProviders } from '../../../test-utils/component-helpers';

describe('SwipeActions Snapshot', () => {
  const mockOnPass = jest.fn();
  const mockOnLike = jest.fn();
  const mockOnSuperlike = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match snapshot for enabled state', () => {
    const { toJSON } = renderWithProviders(
      <SwipeActions
        onPass={mockOnPass}
        onLike={mockOnLike}
        onSuperlike={mockOnSuperlike}
      />,
      { navigation: false },
    );

    expect(toJSON()).toMatchSnapshot();
  });

  it('should match snapshot for disabled state', () => {
    const { toJSON } = renderWithProviders(
      <SwipeActions
        onPass={mockOnPass}
        onLike={mockOnLike}
        onSuperlike={mockOnSuperlike}
        disabled={true}
      />,
      { navigation: false },
    );

    expect(toJSON()).toMatchSnapshot();
  });
});

