/**
 * Comprehensive test suite for ModernTypography component
 * Tests all variants, gradients, animations, and accessibility features
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text, StyleSheet, View } from 'react-native';

// Use actual React Native Text component for better React Testing Library support
// This ensures text content is properly rendered and findable
const actualRN = jest.requireActual('react-native');

// Ensure StyleSheet is available
if (!StyleSheet.create) {
  (StyleSheet as any).create = (styles: any) => styles;
}

import ModernText, {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Body,
  BodyLarge,
  BodySmall,
  Caption,
  Overline,
  ButtonText,
  Label,
  GradientHeading,
  GradientText,
  HolographicText,
  AnimatedHeading,
  AnimatedText,
  type TextVariant,
  type TextWeight,
} from '../ModernTypography';
// useTheme will be mocked below

// Mock react-native to use actual Text component but keep other mocks
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  // React Native Text component works better with React Testing Library
  // Use actual Text if available, otherwise fall back to mock
  const TextComponent = RN.Text || RN.default?.Text;
  
  return {
    ...RN,
    // Use actual Text component for better React Testing Library support
    Text: TextComponent,
    View: RN.View || RN.default?.View,
    StyleSheet: {
      ...RN.StyleSheet,
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => {
        if (Array.isArray(style)) {
          return Object.assign({}, ...style);
        }
        return style || {};
      }),
    },
  };
});

// Mock theme hook - ensure it returns the mock theme  
jest.mock('@/theme', () => {
  const actual = jest.requireActual('@/theme');
  return {
    ...actual,
    useTheme: jest.fn(() => ({
      scheme: 'light' as const,
      isDark: false,
      colors: {
        bg: '#FFFFFF',
        surface: '#F5F5F5',
        onSurface: '#000000',
        primary: '#007AFF',
        success: '#34C759',
        danger: '#FF3B30',
        warning: '#FF9500',
        info: '#5AC8FA',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 },
      radii: { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16 },
      typography: {
        body: { size: 16, lineHeight: 24, weight: '400' as const },
        h1: { size: 32, lineHeight: 40, weight: '700' as const },
        h2: { size: 24, lineHeight: 32, weight: '600' as const },
      },
      palette: { gradients: {} as any, neutral: {} as any, brand: {} as any },
      shadows: {} as any,
      motion: {} as any,
    })),
  };
});

// Mock animation hook
jest.mock('../../../hooks/useUnifiedAnimations', () => ({
  useEntranceAnimation: jest.fn(() => ({
    start: jest.fn(),
    animatedStyle: {},
  })),
}));

// Mock LinearGradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, colors, ...props }: any) => {
    const React = require('react');
    return React.createElement('View', { ...props, testID: 'linear-gradient' }, children);
  },
}));

const mockTheme = {
  scheme: 'light' as const,
  isDark: false,
  colors: {
    bg: '#FFFFFF',
    surface: '#F5F5F5',
    surfaceAlt: '#EEEEEE',
    overlay: 'rgba(0, 0, 0, 0.5)',
    border: '#E0E0E0',
    onSurface: '#000000',
    onMuted: '#666666',
    primary: '#007AFF',
    onPrimary: '#FFFFFF',
    success: '#34C759',
    danger: '#FF3B30',
    warning: '#FF9500',
    info: '#5AC8FA',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
  },
  radii: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    pill: 999,
    full: 9999,
  },
  typography: {
    body: {
      size: 16,
      lineHeight: 24,
      weight: '400' as const,
    },
    h1: {
      size: 32,
      lineHeight: 40,
      weight: '700' as const,
    },
    h2: {
      size: 24,
      lineHeight: 32,
      weight: '600' as const,
    },
  },
  palette: {
    gradients: {
      primary: ['#007AFF', '#0051D5'] as readonly [string, string],
      success: ['#34C759', '#248A3D'] as readonly [string, string],
      danger: ['#FF3B30', '#D70015'] as readonly [string, string],
      warning: ['#FF9500', '#FF6D00'] as readonly [string, string],
      info: ['#5AC8FA', '#007AFF'] as readonly [string, string],
    },
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      500: '#9E9E9E',
      900: '#212121',
    } as any,
    brand: {} as any,
  },
  shadows: {} as any,
  motion: {} as any,
};

describe('ModernTypography', () => {
  const { useTheme } = require('@/theme');
  
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  // Helper function to safely get text element with fallback to testID
  const getTextElement = (
    result: ReturnType<typeof render>,
    text: string,
    testID?: string
  ) => {
    // Try queryByText first (doesn't throw)
    const textElement = result.queryByText(text);
    if (textElement) return textElement;
    
    // Fallback to testID if provided
    if (testID) {
      try {
        return result.getByTestId(testID);
      } catch {
        // If testID not found, try to find by accessibility label
        const byLabel = result.queryByLabelText(text);
        if (byLabel) return byLabel;
      }
    }
    
    return null;
  };

  describe('Basic Rendering', () => {
    it('should render text with default variant', () => {
      const result = render(
        <ModernText testID="default-text">Hello World</ModernText>
      );
      // Debug: log what was rendered
      // console.log('Rendered tree:', JSON.stringify(result.toJSON(), null, 2));
      // Try multiple query methods
      const byText = result.queryByText('Hello World');
      const byTestId = result.queryByTestId('default-text');
      const byLabel = result.queryByLabelText('Hello World');
      
      // At least one should find the element
      const text = byText || byTestId || byLabel;
      expect(text).toBeTruthy();
    });

    it('should render with custom variant', () => {
      const result = render(
        <ModernText variant="h1" testID="h1-text">Heading</ModernText>
      );
      const text = getTextElement(result, 'Heading', 'h1-text');
      expect(text).toBeTruthy();
    });

    it('should apply custom color', () => {
      const result = render(
        <ModernText color="primary" testID="colored-text">Colored Text</ModernText>
      );
      const text = getTextElement(result, 'Colored Text', 'colored-text');
      const style = Array.isArray(text?.props.style) 
        ? text.props.style.find((s: any) => s?.color) || text.props.style[0]
        : text?.props.style;
      expect(style).toEqual(
        expect.objectContaining({
          color: mockTheme.colors.primary,
        })
      );
    });

    it('should apply custom weight', () => {
      const result = render(
        <ModernText weight="700" testID="bold-text">Bold Text</ModernText>
      );
      const text = getTextElement(result, 'Bold Text', 'bold-text');
      const style = Array.isArray(text?.props.style) 
        ? text.props.style.find((s: any) => s?.fontWeight) || text.props.style[0]
        : text?.props.style;
      expect(style).toEqual(
        expect.objectContaining({
          fontWeight: '700',
        })
      );
    });

    it('should merge custom styles', () => {
      const result = render(
        <ModernText style={{ marginTop: 10 }} testID="styled-text">Styled Text</ModernText>
      );
      const text = getTextElement(result, 'Styled Text', 'styled-text');
      const style = Array.isArray(text?.props.style) ? text.props.style : [text?.props.style];
      expect(style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            marginTop: 10,
          }),
        ])
      );
    });
  });

  describe('Typography Variants', () => {
    const variants: TextVariant[] = [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'body',
      'bodyLarge',
      'bodySmall',
      'caption',
      'overline',
      'button',
      'label',
    ];

    variants.forEach((variant) => {
      it(`should render ${variant} variant correctly`, () => {
        const result = render(
          <ModernText variant={variant} testID={`${variant}-variant`}>
            {variant} Text
          </ModernText>
        );
        const text = getTextElement(result, `${variant} Text`, `${variant}-variant`);
        expect(text).toBeTruthy();
      });
    });

    it('should apply h1 typography styles', () => {
      const result = render(
        <ModernText variant="h1" testID="h1-styles">Heading 1</ModernText>
      );
      const text = getTextElement(result, 'Heading 1', 'h1-styles');
      const style = Array.isArray(text?.props.style) 
        ? text.props.style.find((s: any) => s?.fontSize) || text.props.style[0]
        : text?.props.style;
      expect(style?.fontSize).toBe(mockTheme.typography.h1.size);
      expect(style?.fontWeight).toBe('700');
      expect(style?.lineHeight).toBe(mockTheme.typography.h1.lineHeight);
    });

    it('should apply h2 typography styles', () => {
      const result = render(
        <ModernText variant="h2" testID="h2-styles">Heading 2</ModernText>
      );
      const text = getTextElement(result, 'Heading 2', 'h2-styles');
      const style = Array.isArray(text?.props.style) 
        ? text.props.style.find((s: any) => s?.fontSize) || text.props.style[0]
        : text?.props.style;
      expect(style?.fontSize).toBe(mockTheme.typography.h2.size);
      expect(style?.fontWeight).toBe('600');
      expect(style?.lineHeight).toBe(mockTheme.typography.h2.lineHeight);
    });

    it('should apply overline text transform', () => {
      const result = render(
        <ModernText variant="overline" testID="overline-styles">OVERLINE</ModernText>
      );
      const text = getTextElement(result, 'OVERLINE', 'overline-styles');
      const style = Array.isArray(text?.props.style) 
        ? text.props.style.find((s: any) => s?.textTransform) || text.props.style[0]
        : text?.props.style;
      expect(style?.textTransform).toBe('uppercase');
    });
  });

  describe('Semantic Components', () => {
    it('should render Heading1 component', () => {
      const result = render(<Heading1 testID="heading1">H1 Text</Heading1>);
      const text = getTextElement(result, 'H1 Text', 'heading1');
      expect(text).toBeTruthy();
    });

    it('should render Heading2 component', () => {
      const result = render(<Heading2 testID="heading2">H2 Text</Heading2>);
      const text = getTextElement(result, 'H2 Text', 'heading2');
      expect(text).toBeTruthy();
    });

    it('should render Body component', () => {
      const result = render(<Body testID="body">Body Text</Body>);
      const text = getTextElement(result, 'Body Text', 'body');
      expect(text).toBeTruthy();
    });

    it('should render BodyLarge component', () => {
      const result = render(<BodyLarge testID="body-large">Body Large</BodyLarge>);
      const text = getTextElement(result, 'Body Large', 'body-large');
      expect(text).toBeTruthy();
    });

    it('should render BodySmall component', () => {
      const result = render(<BodySmall testID="body-small">Body Small</BodySmall>);
      const text = getTextElement(result, 'Body Small', 'body-small');
      expect(text).toBeTruthy();
    });

    it('should render Caption component', () => {
      const result = render(<Caption testID="caption">Caption Text</Caption>);
      const text = getTextElement(result, 'Caption Text', 'caption');
      expect(text).toBeTruthy();
    });

    it('should render Overline component', () => {
      const result = render(<Overline testID="overline">OVERLINE TEXT</Overline>);
      const text = getTextElement(result, 'OVERLINE TEXT', 'overline');
      expect(text).toBeTruthy();
    });

    it('should render ButtonText component', () => {
      const result = render(<ButtonText testID="button-text">Button</ButtonText>);
      const text = getTextElement(result, 'Button', 'button-text');
      expect(text).toBeTruthy();
    });

    it('should render Label component', () => {
      const result = render(<Label testID="label">Label Text</Label>);
      const text = getTextElement(result, 'Label Text', 'label');
      expect(text).toBeTruthy();
    });
  });

  describe('Gradient Text', () => {
    it('should render gradient text with theme gradient', () => {
      const { getByTestId } = render(
        <ModernText gradient="primary">Gradient Text</ModernText>
      );
      expect(getByTestId('linear-gradient')).toBeTruthy();
    });

    it('should render gradient text with custom colors', () => {
      const customColors = ['#FF0000', '#00FF00'];
      const { getByTestId } = render(
        <ModernText gradientColors={customColors}>Custom Gradient</ModernText>
      );
      expect(getByTestId('linear-gradient')).toBeTruthy();
    });

    it('should support different gradient types', () => {
      const gradients: Array<'primary' | 'success' | 'danger' | 'warning' | 'info'> = [
        'primary',
        'success',
        'danger',
        'warning',
        'info',
      ];

      gradients.forEach((gradient) => {
        const { getByTestId, unmount } = render(
          <ModernText gradient={gradient}>{gradient} Gradient</ModernText>
        );
        expect(getByTestId('linear-gradient')).toBeTruthy();
        unmount();
      });
    });

    it('should render GradientHeading component', () => {
      const { getByTestId } = render(<GradientHeading>Gradient H1</GradientHeading>);
      expect(getByTestId('linear-gradient')).toBeTruthy();
    });

    it('should render GradientText component', () => {
      const { getByTestId } = render(<GradientText>Gradient Text</GradientText>);
      expect(getByTestId('linear-gradient')).toBeTruthy();
    });

    it('should render HolographicText component', () => {
      const { getByTestId } = render(<HolographicText>Holographic</HolographicText>);
      expect(getByTestId('linear-gradient')).toBeTruthy();
    });
  });

  describe('Animated Text', () => {
    it('should render animated text when animated prop is true', () => {
      const result = render(<ModernText animated testID="animated-text">Animated Text</ModernText>);
      const text = getTextElement(result, 'Animated Text', 'animated-text');
      expect(text).toBeTruthy();
    });

    it('should support different animation types', () => {
      const animationTypes = ['fadeIn', 'slideIn', 'scaleIn', 'bounceIn'] as const;

      animationTypes.forEach((type) => {
        const result = render(
          <ModernText animated animationType={type} testID={`${type}-animation`}>
            {type} Animation
          </ModernText>
        );
        const text = getTextElement(result, `${type} Animation`, `${type}-animation`);
        expect(text).toBeTruthy();
        result.unmount();
      });
    });

    it('should render AnimatedHeading component', () => {
      const result = render(<AnimatedHeading testID="animated-heading">Animated H1</AnimatedHeading>);
      const text = getTextElement(result, 'Animated H1', 'animated-heading');
      expect(text).toBeTruthy();
    });

    it('should render AnimatedText component', () => {
      const result = render(<AnimatedText testID="animated-text-comp">Animated Text</AnimatedText>);
      const text = getTextElement(result, 'Animated Text', 'animated-text-comp');
      expect(text).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible prop by default', () => {
      const result = render(<ModernText testID="accessible-text">Accessible Text</ModernText>);
      const text = getTextElement(result, 'Accessible Text', 'accessible-text');
      expect(text?.props.accessible).toBe(true);
    });

    it('should set accessibilityRole to header for headings', () => {
      const result = render(<ModernText variant="h1" testID="h1-heading">Heading</ModernText>);
      const text = getTextElement(result, 'Heading', 'h1-heading');
      expect(text?.props.accessibilityRole).toBe('header');
    });

    it('should set accessibilityLevel for h1, h2, h3', () => {
      const h1Result = render(<ModernText variant="h1" testID="h1-level">H1</ModernText>);
      const h1Text = getTextElement(h1Result, 'H1', 'h1-level');
      expect(h1Text?.props.accessibilityLevel).toBe(1);

      const h2Result = render(<ModernText variant="h2" testID="h2-level">H2</ModernText>);
      const h2Text = getTextElement(h2Result, 'H2', 'h2-level');
      expect(h2Text?.props.accessibilityLevel).toBe(2);

      const h3Result = render(<ModernText variant="h3" testID="h3-level">H3</ModernText>);
      const h3Text = getTextElement(h3Result, 'H3', 'h3-level');
      expect(h3Text?.props.accessibilityLevel).toBe(3);
    });

    it('should respect accessible={false} prop', () => {
      const result = render(<ModernText accessible={false} testID="not-accessible">Not Accessible</ModernText>);
      const text = getTextElement(result, 'Not Accessible', 'not-accessible');
      expect(text?.props.accessible).toBe(false);
    });

    it('should allow custom accessibility props', () => {
      const result = render(
        <ModernText
          accessibilityLabel="Custom Label"
          accessibilityHint="Custom Hint"
          testID="custom-accessible"
        >
          Custom Accessible
        </ModernText>
      );
      const text = getTextElement(result, 'Custom Accessible', 'custom-accessible');
      expect(text?.props.accessibilityLabel).toBe('Custom Label');
      expect(text?.props.accessibilityHint).toBe('Custom Hint');
    });
  });

  describe('Text Weight', () => {
    const weights: TextWeight[] = ['400', '500', '600', '700'];

    weights.forEach((weight) => {
      it(`should apply ${weight} weight correctly`, () => {
        const result = render(
          <ModernText weight={weight} testID={`weight-${weight}`}>Weighted Text</ModernText>
        );
        const text = getTextElement(result, 'Weighted Text', `weight-${weight}`);
        const style = Array.isArray(text?.props.style) 
          ? text.props.style.find((s: any) => s?.fontWeight) || text.props.style[0]
          : text?.props.style;
        expect(style?.fontWeight).toBe(weight);
      });
    });
  });

  describe('Color System', () => {
    const colors = [
      'primary',
      'success',
      'danger',
      'warning',
      'info',
      'onSurface',
      'onMuted',
    ] as const;

    colors.forEach((color) => {
      it(`should apply ${color} color correctly`, () => {
        const result = render(
          <ModernText color={color} testID={`color-${color}`}>{color} Text</ModernText>
        );
        const text = getTextElement(result, `${color} Text`, `color-${color}`);
        const style = Array.isArray(text?.props.style) 
          ? text.props.style.find((s: any) => s?.color) || text.props.style[0]
          : text?.props.style;
        expect(style?.color).toBe(mockTheme.colors[color]);
      });
    });

    it('should fallback to onSurface for invalid color', () => {
      const result = render(
        <ModernText color={'invalid' as any} testID="invalid-color">Invalid Color</ModernText>
      );
      const text = getTextElement(result, 'Invalid Color', 'invalid-color');
      const style = Array.isArray(text?.props.style) 
        ? text.props.style.find((s: any) => s?.color) || text.props.style[0]
        : text?.props.style;
      expect(style?.color).toBe(mockTheme.colors.onSurface);
    });
  });

  describe('Combined Features', () => {
    it('should combine gradient with animation', () => {
      const { getByTestId } = render(
        <ModernText gradient="primary" animated>
          Animated Gradient
        </ModernText>
      );
      expect(getByTestId('linear-gradient')).toBeTruthy();
    });

    it('should combine variant with weight and color', () => {
      const result = render(
        <ModernText variant="h2" weight="700" color="danger" testID="combined-text">
          Combined
        </ModernText>
      );
      const text = getTextElement(result, 'Combined', 'combined-text');
      const style = Array.isArray(text?.props.style) 
        ? text.props.style.find((s: any) => s?.fontSize) || text.props.style[0]
        : text?.props.style;
      expect(style?.fontSize).toBe(mockTheme.typography.h2.size);
      expect(style?.fontWeight).toBe('700');
      expect(style?.color).toBe(mockTheme.colors.danger);
    });

    it('should handle all props together', () => {
      const result = render(
        <ModernText
          variant="h1"
          weight="700"
          color="primary"
          gradient="success"
          animated
          animationType="fadeIn"
          style={{ marginTop: 20 }}
          testID="complex-text"
        >
          Complex Text
        </ModernText>
      );
      const text = getTextElement(result, 'Complex Text', 'complex-text');
      expect(text).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      const { root } = render(<ModernText>{''}</ModernText>);
      expect(root).toBeTruthy();
    });

    it('should handle numeric children', () => {
      const { getByTestId } = render(<ModernText testID="numeric-text">{123}</ModernText>);
      expect(getByTestId('numeric-text')).toBeTruthy();
    });

    it('should handle null children', () => {
      const { root } = render(<ModernText>{null}</ModernText>);
      expect(root).toBeTruthy();
    });

    it('should handle undefined children', () => {
      const { root } = render(<ModernText>{undefined}</ModernText>);
      expect(root).toBeTruthy();
    });

    it('should handle multiple children', () => {
      const { UNSAFE_getAllByType } = render(
        <ModernText>
          <Text testID="first">First</Text>
          <Text testID="second">Second</Text>
        </ModernText>
      );
      const texts = UNSAFE_getAllByType(Text);
      expect(texts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Theme Integration', () => {
    it('should use theme colors correctly', () => {
      const result = render(<ModernText color="primary" testID="theme-color">Theme Color</ModernText>);
      const text = getTextElement(result, 'Theme Color', 'theme-color');
      const style = Array.isArray(text?.props.style) 
        ? text.props.style.find((s: any) => s?.color) || text.props.style[0]
        : text?.props.style;
      expect(style?.color).toBe(mockTheme.colors.primary);
    });

    it('should use theme typography correctly', () => {
      const result = render(<ModernText variant="h1" testID="theme-typography">Theme Typography</ModernText>);
      const text = getTextElement(result, 'Theme Typography', 'theme-typography');
      const style = Array.isArray(text?.props.style) 
        ? text.props.style.find((s: any) => s?.fontSize) || text.props.style[0]
        : text?.props.style;
      expect(style?.fontSize).toBe(mockTheme.typography.h1.size);
    });

    it('should use theme gradients correctly', () => {
      const { getByTestId } = render(
        <ModernText gradient="primary">Theme Gradient</ModernText>
      );
      const gradient = getByTestId('linear-gradient');
      expect(gradient).toBeTruthy();
    });
  });
});

