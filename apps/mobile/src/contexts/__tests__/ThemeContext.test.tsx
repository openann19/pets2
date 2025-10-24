import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { ThemeProvider, useTheme } from "../ThemeContext";

// Test component that uses the theme
const TestComponent = () => {
  const { colors, isDark } = useTheme();
  return <Text testID="theme-test">{isDark ? "dark" : "light"}</Text>;
};

describe("ThemeContext", () => {
  it("provides theme context to children", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const testElement = getByTestId("theme-test");
    expect(testElement).toBeTruthy();
  });

  it("defaults to light theme", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );

    const testElement = getByTestId("theme-test");
    expect(testElement.props.children).toBe("light");
  });
});
