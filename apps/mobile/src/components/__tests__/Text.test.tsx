/**
 * Text Component Tests
 * Tests the themed text component
 */

import React from 'react';
import { Text } from '../ui/Text';

// Mock the theme hook
jest.mock('../../theme/useTheme', () => ({
  useTheme: () => ({
    typography: {
      h1: { size: 32, lineHeight: 40 },
      h2: { size: 24, lineHeight: 32 },
      body: { size: 16, lineHeight: 24 },
      caption: { size: 12, lineHeight: 16 },
    },
    colors: {
      text: '#000000',
      primary: '#007AFF',
      textMuted: '#666666',
      success: '#34C759',
    },
  }),
}));

describe('Text', () => {
  it('should import without errors', () => {
    expect(Text).toBeDefined();
  });

  it('should render with default props', () => {
    expect(() => <Text>Hello World</Text>).not.toThrow();
  });

  it('should render with different variants', () => {
    expect(() => <Text variant="h1">Heading 1</Text>).not.toThrow();
    expect(() => <Text variant="body">Body text</Text>).not.toThrow();
    expect(() => <Text variant="caption">Caption</Text>).not.toThrow();
  });

  it('should render with different tones', () => {
    expect(() => <Text tone="primary">Primary text</Text>).not.toThrow();
    expect(() => <Text tone="textMuted">Muted text</Text>).not.toThrow();
    expect(() => <Text tone="success">Success text</Text>).not.toThrow();
  });

  it('should render with different alignments', () => {
    expect(() => <Text align="center">Centered</Text>).not.toThrow();
    expect(() => <Text align="right">Right aligned</Text>).not.toThrow();
  });

  it('should combine variant and tone', () => {
    expect(() => (
      <Text variant="h2" tone="primary">Styled heading</Text>
    )).not.toThrow();
  });

  it('should accept custom style prop', () => {
    expect(() => (
      <Text style={{ fontSize: 20 }}>Custom styled text</Text>
    )).not.toThrow();
  });
