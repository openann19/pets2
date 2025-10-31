/**
 * Shimmer Component Tests
 * Tests the loading shimmer animation component
 */

import React from 'react';
import Shimmer from '../micro/Shimmer';

describe('Shimmer', () => {
  it('should import without errors', () => {
    expect(Shimmer).toBeDefined();
  });

  it('should be a React component', () => {
    expect(React.isValidElement(<Shimmer />)).toBe(true);
  });

  it('should accept default props', () => {
    expect(() => <Shimmer />).not.toThrow();
  });

  it('should accept custom height', () => {
    expect(() => <Shimmer height={32} />).not.toThrow();
  });

  it('should accept custom width and height', () => {
    expect(() => <Shimmer width={200} height={24} />).not.toThrow();
  });

  it('should accept custom radius', () => {
    expect(() => <Shimmer radius={12} />).not.toThrow();
  });

  it('should handle all custom props', () => {
    expect(() => (
      <Shimmer width={150} height={20} radius={6} />
    )).not.toThrow();
  });
});
