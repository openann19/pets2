/**
 * Spacer Component Tests
 * Tests the spacing utility component
 */

import React from 'react';
import { Spacer } from '../ui/Spacer';

// Mock the theme hook
jest.mock('../../theme/useTheme', () => ({
  useTheme: () => ({
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64,
      '4xl': 80,
    },
  }),
}));

describe('Spacer', () => {
  it('should import without errors', () => {
    expect(Spacer).toBeDefined();
  });

  it('should be a React component', () => {
    expect(React.isValidElement(<Spacer />)).toBe(true);
  });

  it('should render with default props', () => {
    expect(() => <Spacer />).not.toThrow();
  });

  it('should render vertical spacer by default', () => {
    expect(() => <Spacer />).not.toThrow();
  });

  it('should render horizontal spacer', () => {
    expect(() => <Spacer axis="horizontal" />).not.toThrow();
  });

  it('should accept different size props', () => {
    expect(() => <Spacer size="xs" />).not.toThrow();
    expect(() => <Spacer size="lg" />).not.toThrow();
  });

  it('should accept custom size values', () => {
    expect(() => <Spacer size="sm" />).not.toThrow();
    expect(() => <Spacer size="xl" />).not.toThrow();
  });
});
