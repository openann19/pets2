import React from 'react';
import { render } from '@testing-library/react-native';
import { AnimatedSplash } from '../../components/AnimatedSplash';

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: 'medium',
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.Animated.timing = () => ({
    start: jest.fn(),
    stop: jest.fn(),
  });

  RN.Animated.spring = () => ({
    start: jest.fn(),
    stop: jest.fn(),
  });

  RN.Animated.sequence = () => ({
    start: jest.fn(),
    stop: jest.fn(),
  });

  RN.Animated.parallel = () => ({
    start: jest.fn(),
    stop: jest.fn(),
  });

  RN.Animated.delay = () => ({
    start: jest.fn(),
    stop: jest.fn(),
  });

  return RN;
});

describe('AnimatedSplash Component', () => {
  const mockOnAnimationComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const tree = render(<AnimatedSplash />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with custom duration', () => {
    const tree = render(<AnimatedSplash duration={3000} />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with onAnimationComplete callback', () => {
    const tree = render(<AnimatedSplash onAnimationComplete={mockOnAnimationComplete} />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with both custom props', () => {
    const tree = render(
      <AnimatedSplash
        duration={1500}
        onAnimationComplete={mockOnAnimationComplete}
      />,
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
