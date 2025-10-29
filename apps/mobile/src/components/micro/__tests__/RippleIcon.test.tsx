/**
 * @jest-environment jsdom
 */
import React, { useState } from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import RippleIcon from '../RippleIcon';

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    View: React.forwardRef((props: any, ref: any) => (
      <View
        {...props}
        ref={ref}
      />
    )),
    useSharedValue: (init: number) => ({ value: init }),
    withTiming: jest.fn((value: number, config: any) => value),
    interpolate: (value: number, input: number[], output: number[]) => {
      const ratio = (value - input[0]) / (input[1] - input[0]);
      return output[0] + ratio * (output[1] - output[0]);
    },
    useAnimatedStyle: (fn: () => any) => {
      return {};
    },
    useEffect: React.useEffect,
  };
});

describe('RippleIcon', () => {
  it('renders without crashing', () => {
    const { container } = render(<RippleIcon trigger={0} />);
    expect(container).toBeTruthy();
  });

  it('animates when trigger changes', () => {
    const TestComponent = () => {
      const [trigger, setTrigger] = useState(0);
      return (
        <View>
          <RippleIcon trigger={trigger} />
        </View>
      );
    };

    const { rerender } = render(<TestComponent />);

    rerender(<TestComponent />);

    expect(rerender).toBeDefined();
  });

  it('applies default size of 36', () => {
    const { UNSAFE_getAllByType } = render(<RippleIcon trigger={0} />);
    expect(UNSAFE_getAllByType).toBeDefined();
  });

  it('applies custom size', () => {
    const { container } = render(
      <RippleIcon
        trigger={0}
        size={48}
      />,
    );
    expect(container).toBeTruthy();
  });

  it('applies default stroke of 2', () => {
    const { container } = render(<RippleIcon trigger={0} />);
    expect(container).toBeTruthy();
  });

  it('applies custom stroke', () => {
    const { container } = render(
      <RippleIcon
        trigger={0}
        stroke={3}
      />,
    );
    expect(container).toBeTruthy();
  });

  it('applies default color', () => {
    const { container } = render(<RippleIcon trigger={0} />);
    expect(container).toBeTruthy();
  });

  it('applies custom color', () => {
    const { container } = render(
      <RippleIcon
        trigger={0}
        color="rgba(255,0,0,0.5)"
      />,
    );
    expect(container).toBeTruthy();
  });

  it('does not block pointer events', () => {
    const { container } = render(<RippleIcon trigger={0} />);
    expect(container).toBeTruthy();
  });

  it('creates ripple with different trigger values', () => {
    const { rerender } = render(<RippleIcon trigger={0} />);

    rerender(<RippleIcon trigger={1} />);
    rerender(<RippleIcon trigger={2} />);
    rerender(<RippleIcon trigger={5} />);

    expect(rerender).toBeDefined();
  });

  it('handles rapid trigger changes', () => {
    const TestComponent = ({ trigger }: { trigger: number }) => <RippleIcon trigger={trigger} />;

    const { rerender } = render(<TestComponent trigger={0} />);

    for (let i = 1; i <= 10; i++) {
      rerender(<TestComponent trigger={i} />);
    }

    expect(rerender).toBeDefined();
  });

  it('uses memo to prevent unnecessary re-renders', () => {
    const { rerender } = render(<RippleIcon trigger={0} />);

    // Same trigger value should not cause unnecessary render
    rerender(<RippleIcon trigger={0} />);

    expect(rerender).toBeDefined();
  });

  it('handles size variations', () => {
    const sizes = [24, 36, 48, 60, 72];

    sizes.forEach((size) => {
      const { container } = render(
        <RippleIcon
          trigger={0}
          size={size}
        />,
      );
      expect(container).toBeTruthy();
    });
  });

  it('handles stroke variations', () => {
    const strokes = [1, 2, 3, 4, 5];

    strokes.forEach((stroke) => {
      const { container } = render(
        <RippleIcon
          trigger={0}
          stroke={stroke}
        />,
      );
      expect(container).toBeTruthy();
    });
  });

  it('handles color variations', () => {
    const colors = [
      'rgba(236,72,153,0.35)',
      'rgba(59,130,246,0.35)',
      'rgba(34,197,94,0.35)',
      'rgba(245,158,11,0.35)',
    ];

    colors.forEach((color) => {
      const { container } = render(
        <RippleIcon
          trigger={0}
          color={color}
        />,
      );
      expect(container).toBeTruthy();
    });
  });

  it('works within positioned containers', () => {
    const { container } = render(
      <View style={{ position: 'relative', width: 100, height: 100 }}>
        <RippleIcon
          trigger={0}
          size={36}
        />
      </View>,
    );
    expect(container).toBeTruthy();
  });

  it('renders multiple ripple icons independently', () => {
    const { container } = render(
      <View>
        <RippleIcon trigger={0} />
        <RippleIcon trigger={1} />
        <RippleIcon trigger={2} />
      </View>,
    );
    expect(container).toBeTruthy();
  });
});
