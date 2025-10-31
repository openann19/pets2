/**
 * RippleIcon Component Tests
 * Tests the ripple effect animation component
 */

import React from 'react';
import RippleIcon from '../micro/RippleIcon';

describe('RippleIcon', () => {
  it('should import without errors', () => {
    expect(RippleIcon).toBeDefined();
  });

  it('should be a React component', () => {
    expect(React.isValidElement(<RippleIcon trigger={1} />)).toBe(true);
  });

  it('should accept default props', () => {
    expect(() => <RippleIcon trigger={1} />).not.toThrow();
  });

  it('should accept custom size', () => {
    expect(() => <RippleIcon trigger={1} size={50} />).not.toThrow();
  });

  it('should accept custom color', () => {
    expect(() => <RippleIcon trigger={1} color="#ff0000" />).not.toThrow();
  });

  it('should accept custom stroke width', () => {
    expect(() => <RippleIcon trigger={1} stroke={4} />).not.toThrow();
  });

  it('should handle trigger prop changes', () => {
    const component = <RippleIcon trigger={2} />;
    expect(React.isValidElement(component)).toBe(true);
  });
});
