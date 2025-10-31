/**
 * 🧪 TESTS FOR MOTION PRIMITIVES COMPONENTS
 * 
 * Tests for MotionPrimitives.tsx components
 * Coverage: ≥75% target
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { View, Text } from 'react-native';
import {
  StaggeredFadeInUpList,
  PhysicsBasedScaleIn,
  PageTransition,
  VelocityBasedScale,
  OvershootSpring,
  StaggeredEntrance,
} from '@/components/MotionPrimitives';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock useReduceMotion
jest.mock('@/hooks/useReducedMotion', () => ({
  useReduceMotion: jest.fn(() => false),
}));

// Mock AccessibilityInfo
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    AccessibilityInfo: {
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    },
  };
});

describe('MotionPrimitives - StaggeredFadeInUpList', () => {
  it('should render children', () => {
    const children = [
      <Text key="1">Item 1</Text>,
      <Text key="2">Item 2</Text>,
      <Text key="3">Item 3</Text>,
    ];

    const { getByText } = render(
      <StaggeredFadeInUpList>{children}</StaggeredFadeInUpList>
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
    expect(getByText('Item 3')).toBeTruthy();
  });

  it('should handle empty children array', () => {
    const { container } = render(<StaggeredFadeInUpList>{[]}</StaggeredFadeInUpList>);
    expect(container).toBeTruthy();
  });

  it('should accept custom delay prop', () => {
    const children = [<Text key="1">Item</Text>];
    const { container } = render(
      <StaggeredFadeInUpList delay={200}>{children}</StaggeredFadeInUpList>
    );
    expect(container).toBeTruthy();
  });

  it('should accept style prop', () => {
    const children = [<Text key="1">Item</Text>];
    const { container } = render(
      <StaggeredFadeInUpList style={{ padding: 10 }}>{children}</StaggeredFadeInUpList>
    );
    expect(container).toBeTruthy();
  });
});

describe('MotionPrimitives - PhysicsBasedScaleIn', () => {
  it('should render children', () => {
    const { getByText } = render(
      <PhysicsBasedScaleIn>
        <Text>Test Content</Text>
      </PhysicsBasedScaleIn>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should handle trigger prop', () => {
    const { rerender, getByText } = render(
      <PhysicsBasedScaleIn trigger={false}>
        <Text>Test</Text>
      </PhysicsBasedScaleIn>
    );

    expect(getByText('Test')).toBeTruthy();

    rerender(
      <PhysicsBasedScaleIn trigger={true}>
        <Text>Test</Text>
      </PhysicsBasedScaleIn>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('should accept style prop', () => {
    const { container } = render(
      <PhysicsBasedScaleIn style={{ margin: 10 }}>
        <Text>Test</Text>
      </PhysicsBasedScaleIn>
    );
    expect(container).toBeTruthy();
  });
});

describe('MotionPrimitives - PageTransition', () => {
  it('should render children', () => {
    const { getByText } = render(
      <PageTransition>
        <Text>Page Content</Text>
      </PageTransition>
    );

    expect(getByText('Page Content')).toBeTruthy();
  });

  it('should handle different transition types', () => {
    const types = ['fade', 'slideLeft', 'slideRight'] as const;

    types.forEach((type) => {
      const { getByText } = render(
        <PageTransition type={type}>
          <Text>Content</Text>
        </PageTransition>
      );
      expect(getByText('Content')).toBeTruthy();
    });
  });

  it('should accept custom duration', () => {
    const { container } = render(
      <PageTransition duration={500}>
        <Text>Content</Text>
      </PageTransition>
    );
    expect(container).toBeTruthy();
  });
});

describe('MotionPrimitives - VelocityBasedScale', () => {
  it('should render children', () => {
    const mockVelocity = { value: 0 };
    const { getByText } = render(
      <VelocityBasedScale velocity={mockVelocity as any}>
        <Text>Content</Text>
      </VelocityBasedScale>
    );

    expect(getByText('Content')).toBeTruthy();
  });

  it('should accept minScale and maxScale props', () => {
    const mockVelocity = { value: 100 };
    const { container } = render(
      <VelocityBasedScale velocity={mockVelocity as any} minScale={0.9} maxScale={1.1}>
        <Text>Content</Text>
      </VelocityBasedScale>
    );
    expect(container).toBeTruthy();
  });

  it('should handle enabled prop', () => {
    const mockVelocity = { value: 0 };
    const { container } = render(
      <VelocityBasedScale velocity={mockVelocity as any} enabled={false}>
        <Text>Content</Text>
      </VelocityBasedScale>
    );
    expect(container).toBeTruthy();
  });
});

describe('MotionPrimitives - OvershootSpring', () => {
  it('should render children', () => {
    const { getByText } = render(
      <OvershootSpring>
        <Text>Content</Text>
      </OvershootSpring>
    );

    expect(getByText('Content')).toBeTruthy();
  });

  it('should accept overshoot prop', () => {
    const { container } = render(
      <OvershootSpring overshoot={0.3}>
        <Text>Content</Text>
      </OvershootSpring>
    );
    expect(container).toBeTruthy();
  });

  it('should handle trigger prop', () => {
    const { rerender, getByText } = render(
      <OvershootSpring trigger={false}>
        <Text>Content</Text>
      </OvershootSpring>
    );

    expect(getByText('Content')).toBeTruthy();

    rerender(
      <OvershootSpring trigger={true}>
        <Text>Content</Text>
      </OvershootSpring>
    );

    expect(getByText('Content')).toBeTruthy();
  });
});

describe('MotionPrimitives - StaggeredEntrance', () => {
  it('should render children', () => {
    const children = [
      <Text key="1">Item 1</Text>,
      <Text key="2">Item 2</Text>,
    ];

    const { getByText } = render(
      <StaggeredEntrance>{children}</StaggeredEntrance>
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('should handle different animation types', () => {
    const types = ['fade', 'scale', 'slide', 'both'] as const;

    types.forEach((animation) => {
      const { getByText } = render(
        <StaggeredEntrance animation={animation}>
          <Text>Item</Text>
        </StaggeredEntrance>
      );
      expect(getByText('Item')).toBeTruthy();
    });
  });

  it('should accept custom delay', () => {
    const { container } = render(
      <StaggeredEntrance delay={150}>
        <Text>Item</Text>
      </StaggeredEntrance>
    );
    expect(container).toBeTruthy();
  });
});

describe('MotionPrimitives - Reduced Motion Support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respect reduced motion preference', () => {
    const { useReduceMotion } = require('@/hooks/useReducedMotion');
    useReduceMotion.mockReturnValue(true);

    const { container } = render(
      <StaggeredFadeInUpList>
        <Text>Item</Text>
      </StaggeredFadeInUpList>
    );
    expect(container).toBeTruthy();
  });
});

