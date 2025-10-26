import React, { PropsWithChildren } from "react";
import { render, RenderOptions } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

export const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
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
  options?: Omit<RenderOptions, "queries">
) {
  return render(ui, { wrapper: Providers, ...options });
}

