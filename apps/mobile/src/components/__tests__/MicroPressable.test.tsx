/**
 * MicroPressable Component Tests
 * Tests the micro-interaction pressable component
 */

import React from 'react';
import MicroPressable from '../primitives/MicroPressable';

describe('MicroPressable', () => {
  it('should import without errors', () => {
    expect(MicroPressable).toBeDefined();
  });

  it('should be a React component', () => {
    expect(React.isValidElement(<MicroPressable><div /></MicroPressable>)).toBe(true);
  });

  it('should accept props without throwing', () => {
    expect(() => (
      <MicroPressable
        scaleFrom={1}
        scaleTo={0.9}
        disabledMotion={false}
        onPress={() => {}}
      >
        <div>Test</div>
      </MicroPressable>
    )).not.toThrow();
  });

  it('should handle default props', () => {
    expect(() => (
      <MicroPressable>
        <div>Content</div>
      </MicroPressable>
    )).not.toThrow();
  });

  it('should accept custom scale values', () => {
    expect(() => (
      <MicroPressable scaleFrom={1.2} scaleTo={0.8}>
        <div>Scaled</div>
      </MicroPressable>
    )).not.toThrow();
  });

  it('should handle disabled motion', () => {
    expect(() => (
      <MicroPressable disabledMotion>
        <div>No motion</div>
      </MicroPressable>
    )).not.toThrow();
  });
});
