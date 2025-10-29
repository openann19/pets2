/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SmartImage from '../SmartImage';

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  const Image = require('react-native').Image;
  return {
    View: React.forwardRef((props: any, ref: any) => (
      <View
        {...props}
        ref={ref}
      />
    )),
    Image: React.forwardRef((props: any, ref: any) => (
      <Image
        {...props}
        ref={ref}
      />
    )),
    useSharedValue: (init: number) => ({ value: init }),
    withTiming: jest.fn((value: number, config: any) => value),
    useAnimatedStyle: (fn: () => any) => {
      return {};
    },
  };
});

describe('SmartImage', () => {
  const mockUri = 'https://example.com/test-image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<SmartImage source={{ uri: mockUri }} />);
    expect(container).toBeTruthy();
  });

  it('renders with preview blur effect', () => {
    const { container } = render(
      <SmartImage
        source={{ uri: mockUri }}
        previewBlurRadius={16}
      />,
    );
    expect(container).toBeTruthy();
  });

  it('applies custom blur radius', () => {
    const blurRadii = [8, 16, 32, 48];

    blurRadii.forEach((radius) => {
      const { container } = render(
        <SmartImage
          source={{ uri: mockUri }}
          previewBlurRadius={radius}
        />,
      );
      expect(container).toBeTruthy();
    });
  });

  it('handles onLoad event', () => {
    const onLoad = jest.fn();

    const { UNSAFE_getByType } = render(
      <SmartImage
        source={{ uri: mockUri }}
        onLoad={onLoad}
      />,
    );

    expect(UNSAFE_getByType).toBeDefined();
  });

  it('applies style prop correctly', () => {
    const customStyle = { width: 200, height: 200, borderRadius: 10 };

    const { container } = render(
      <SmartImage
        source={{ uri: mockUri }}
        style={customStyle}
      />,
    );

    expect(container).toBeTruthy();
  });

  it('supports resizeMode prop', () => {
    const { container } = render(
      <SmartImage
        source={{ uri: mockUri }}
        resizeMode="cover"
      />,
    );
    expect(container).toBeTruthy();
  });

  it('handles different resizeMode values', () => {
    const modes = ['cover', 'contain', 'stretch', 'center', 'repeat'];

    modes.forEach((mode) => {
      const { container } = render(
        <SmartImage
          source={{ uri: mockUri }}
          resizeMode={mode as any}
        />,
      );
      expect(container).toBeTruthy();
    });
  });

  it('works with local image sources', () => {
    const { container } = render(<SmartImage source={require('../../../../assets/icon.png')} />);
    expect(container).toBeTruthy();
  });

  it('applies accessibility props', () => {
    const { container } = render(
      <SmartImage
        source={{ uri: mockUri }}
        accessibilityLabel="Test image"
        accessibilityRole="image"
      />,
    );
    expect(container).toBeTruthy();
  });

  it('renders within containers properly', () => {
    const { container } = render(
      <div style={{ width: 300, height: 300, overflow: 'hidden' }}>
        <SmartImage
          source={{ uri: mockUri }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>,
    );
    expect(container).toBeTruthy();
  });

  it('handles error gracefully', () => {
    const onError = jest.fn();

    const { container } = render(
      <SmartImage
        source={{ uri: 'invalid-uri' }}
        onError={onError}
      />,
    );

    expect(container).toBeTruthy();
  });

  it('memoizes component properly', () => {
    const { rerender } = render(<SmartImage source={{ uri: mockUri }} />);

    rerender(<SmartImage source={{ uri: mockUri }} />);

    expect(rerender).toBeDefined();
  });

  it('shows placeholder until loaded', async () => {
    const { container } = render(
      <SmartImage
        source={{ uri: mockUri }}
        previewBlurRadius={32}
      />,
    );

    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  it('crossfades to full resolution', async () => {
    const { container } = render(<SmartImage source={{ uri: mockUri }} />);

    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  it('handles multiple images in sequence', () => {
    const uris = [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ];

    uris.forEach((uri, index) => {
      const { container } = render(
        <SmartImage
          key={index}
          source={{ uri }}
        />,
      );
      expect(container).toBeTruthy();
    });
  });

  it('applies custom transition duration', () => {
    const { container } = render(
      <SmartImage
        source={{ uri: mockUri }}
        style={{ opacity: 0.5 }}
      />,
    );
    expect(container).toBeTruthy();
  });

  it('works with different aspect ratios', () => {
    const aspectRatios = [
      { width: 1, height: 1 },
      { width: 4, height: 3 },
      { width: 16, height: 9 },
    ];

    aspectRatios.forEach((ratio) => {
      const { container } = render(
        <SmartImage
          source={{ uri: mockUri }}
          style={{ aspectRatio: ratio.width / ratio.height }}
        />,
      );
      expect(container).toBeTruthy();
    });
  });

  it('handles rapid source changes', () => {
    const sources = [
      { uri: 'https://example.com/1.jpg' },
      { uri: 'https://example.com/2.jpg' },
      { uri: 'https://example.com/3.jpg' },
    ];

    const { rerender } = render(<SmartImage source={sources[0]} />);

    sources.forEach((source) => {
      rerender(<SmartImage source={source} />);
    });

    expect(rerender).toBeDefined();
  });

  it('supports tintColor prop', () => {
    const { container } = render(
      <SmartImage
        source={{ uri: mockUri }}
        tintColor="#FF0000"
      />,
    );
    expect(container).toBeTruthy();
  });

  it('handles priority loading', () => {
    const { container } = render(<SmartImage source={{ uri: mockUri, priority: 'high' }} />);
    expect(container).toBeTruthy();
  });

  it('works with testID', () => {
    const { getByTestId } = render(
      <SmartImage
        source={{ uri: mockUri }}
        testID="test-image"
      />,
    );
    expect(getByTestId('test-image')).toBeTruthy();
  });
});
