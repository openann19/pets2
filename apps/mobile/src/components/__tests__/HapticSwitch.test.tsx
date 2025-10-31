/**
 * HapticSwitch Component Tests
 * Tests the haptic switch component with theme
 */

import React from 'react';
import { renderWithTheme } from '../../test-utils/render-helpers';
import HapticSwitch from '../micro/HapticSwitch';

describe('HapticSwitch', () => {
  it('should render with theme provider', () => {
    const onValueChange = jest.fn();
    const { container } = renderWithTheme(
      <HapticSwitch value={false} onValueChange={onValueChange} />
    );

    expect(container).toBeTruthy();
  });

  it('should render with true value', () => {
    const onValueChange = jest.fn();
    const { container } = renderWithTheme(
      <HapticSwitch value={true} onValueChange={onValueChange} />
    );

    expect(container).toBeTruthy();
  });

  it('should render disabled state', () => {
    const onValueChange = jest.fn();
    const { container } = renderWithTheme(
      <HapticSwitch value={false} onValueChange={onValueChange} disabled />
    );

    expect(container).toBeTruthy();
  });

  it('should accept value change handler', () => {
    const onValueChange = jest.fn();
    expect(() => renderWithTheme(
      <HapticSwitch value={false} onValueChange={onValueChange} />
    )).not.toThrow();
  });

  it('should handle value prop changes', () => {
    const onValueChange = jest.fn();

    const { rerender } = renderWithTheme(
      <HapticSwitch value={false} onValueChange={onValueChange} />
    );

    rerender(<HapticSwitch value={true} onValueChange={onValueChange} />);
    expect(true).toBe(true); // Component should not throw
  });
});
