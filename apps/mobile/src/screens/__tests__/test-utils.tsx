import React, { type PropsWithChildren } from 'react';
import { render } from '@testing-library/react-native';
import type { RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

export const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  // @ts-expect-error - jest.requireActual is defined by jest
  const actual = jest.requireActual(
    '@react-navigation/native',
  ) as typeof import('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate }),
  };
});

function Providers({ children }: PropsWithChildren<{}>) {
  // Keep providers minimal; MapScreen already receives navigation prop in tests where needed
  return <NavigationContainer>{children}</NavigationContainer>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>,
) {
  return render(ui, { wrapper: Providers, ...options });
}
