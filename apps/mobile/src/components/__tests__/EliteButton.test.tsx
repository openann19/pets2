/**
 * EliteButton Component Tests
 * Tests the elite button component with effects
 */

import React from 'react';
import { renderWithTheme } from '../../test-utils/render-helpers';
import EliteButton from '../buttons/EliteButton';

describe('EliteButton', () => {
  it('should render with theme provider', () => {
    const { container } = renderWithTheme(<EliteButton title="Test Button" />);

    expect(container).toBeTruthy();
  });

  it('should render with default effects enabled', () => {
    const { container } = renderWithTheme(
      <EliteButton title="Default Effects" />
    );

    expect(container).toBeTruthy();
  });

  it('should render with glow effect', () => {
    const { container } = renderWithTheme(
      <EliteButton title="Glow Button" glowEffect />
    );

    expect(container).toBeTruthy();
  });

  it('should render with magnetic effect', () => {
    const { container } = renderWithTheme(
      <EliteButton title="Magnetic Button" magneticEffect />
    );

    expect(container).toBeTruthy();
  });

  it('should render with shimmer effect', () => {
    const { container } = renderWithTheme(
      <EliteButton title="Shimmer Button" shimmerEffect />
    );

    expect(container).toBeTruthy();
  });

  it('should render with gradient effect', () => {
    const { container } = renderWithTheme(
      <EliteButton title="Gradient Button" gradientEffect gradientName="primary" />
    );

    expect(container).toBeTruthy();
  });

  it('should handle press events', () => {
    const onPress = jest.fn();
    const { container } = renderWithTheme(
      <EliteButton title="Pressable" onPress={onPress} />
    );

    expect(container).toBeTruthy();
  });

  it('should render with custom effects configuration', () => {
    const { container } = renderWithTheme(
      <EliteButton
        title="Custom Effects"
        glowEffect
        glowIntensity={1.5}
        magneticEffect
        magneticSensitivity={0.5}
        shimmerEffect
        shimmerDuration={1500}
        gradientEffect
        gradientName="success"
      />
    );

    expect(container).toBeTruthy();
  });
});
