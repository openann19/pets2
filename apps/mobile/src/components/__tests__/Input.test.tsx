/**
 * Input Component Tests
 * Tests the themed input component
 */

import React from 'react';
import { renderWithTheme } from '../../test-utils/render-helpers';
import { Input } from '../ui/Input';

describe('Input', () => {
  it('should render with theme provider', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <Input placeholder="Enter text" />
    );

    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('should render with label', () => {
    const { getByText } = renderWithTheme(
      <Input label="Email" placeholder="Enter email" />
    );

    expect(getByText('Email')).toBeTruthy();
  });

  it('should render with helper text', () => {
    const { getByText } = renderWithTheme(
      <Input placeholder="Enter text" helperText="This is a hint" />
    );

    expect(getByText('This is a hint')).toBeTruthy();
  });

  it('should render with error text', () => {
    const { getByText } = renderWithTheme(
      <Input placeholder="Enter text" errorText="This field is required" />
    );

    expect(getByText('This field is required')).toBeTruthy();
  });

  it('should handle disabled state', () => {
    const { getByPlaceholderText } = renderWithTheme(
      <Input placeholder="Disabled input" editable={false} />
    );

    expect(getByPlaceholderText('Disabled input')).toBeTruthy();
  });

  it('should accept value and onChangeText', () => {
    const onChangeText = jest.fn();
    const { getByDisplayValue } = renderWithTheme(
      <Input value="test value" onChangeText={onChangeText} />
    );

    expect(getByDisplayValue('test value')).toBeTruthy();
  });

  it('should combine label, helper, and error states', () => {
    const { getByText } = renderWithTheme(
      <Input
        label="Full Name"
        placeholder="Enter your name"
        helperText="Enter your full legal name"
        errorText="Name is required"
      />
    );

    expect(getByText('Full Name')).toBeTruthy();
    expect(getByText('Name is required')).toBeTruthy();
  });
});
