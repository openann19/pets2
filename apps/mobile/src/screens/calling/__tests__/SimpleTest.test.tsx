import { render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

// Simple test component
const TestComponent = () => {
  return (
    <View>
      <Text>Test</Text>
    </View>
  );
};

describe('Simple Test', () => {
  it('should render a simple component', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test')).toBeTruthy();
  });
});
