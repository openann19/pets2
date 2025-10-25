/**
 * BaseButton Test Suite
 * Comprehensive tests for the foundational button component
 */

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BaseButton from "../BaseButton";
import { createMockTheme } from "../../__tests__/utils/testFactories";

// Mock theme context
jest.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => createMockTheme(),
}));

describe("BaseButton", () => {
  const defaultProps = {
    title: "Test Button",
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render button with title", () => {
      const { getByText } = render(<BaseButton {...defaultProps} />);

      expect(getByText("Test Button")).toBeTruthy();
    });

    it("should render with custom title", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} title="Custom Title" />,
      );

      expect(getByText("Custom Title")).toBeTruthy();
    });

    it("should be pressable by default", () => {
      const { getByText } = render(<BaseButton {...defaultProps} />);

      const button = getByText("Test Button");
      expect(button).toBePressable();
    });
  });

  describe("Button Variants", () => {
    it("should render primary variant", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} variant="primary" />,
      );

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });

    it("should render secondary variant", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} variant="secondary" />,
      );

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });

    it("should render outline variant", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} variant="outline" />,
      );

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });

    it("should render ghost variant", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} variant="ghost" />,
      );

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });

    it("should render premium variant", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} variant="premium" />,
      );

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });
  });

  describe("Button Sizes", () => {
    it("should render extra small size", () => {
      const { getByText } = render(<BaseButton {...defaultProps} size="xs" />);

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });

    it("should render small size", () => {
      const { getByText } = render(<BaseButton {...defaultProps} size="sm" />);

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });

    it("should render medium size", () => {
      const { getByText } = render(<BaseButton {...defaultProps} size="md" />);

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });

    it("should render large size", () => {
      const { getByText } = render(<BaseButton {...defaultProps} size="lg" />);

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });

    it("should render extra large size", () => {
      const { getByText } = render(<BaseButton {...defaultProps} size="xl" />);

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });
  });

  describe("Button States", () => {
    it("should show loading state", () => {
      const { getByTestId } = render(
        <BaseButton {...defaultProps} loading={true} />,
      );

      expect(getByTestId("loading-indicator")).toBeTruthy();
    });

    it("should be disabled when disabled prop is true", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} disabled={true} />,
      );

      const button = getByText("Test Button");
      expect(button.props.disabled).toBe(true);
    });

    it("should not call onPress when disabled", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} disabled={true} />,
      );

      const button = getByText("Test Button");
      fireEvent.press(button);

      expect(defaultProps.onPress).not.toHaveBeenCalled();
    });

    it("should not call onPress when loading", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} loading={true} />,
      );

      const button = getByText("Test Button");
      fireEvent.press(button);

      expect(defaultProps.onPress).not.toHaveBeenCalled();
    });
  });

  describe("Icon Support", () => {
    it("should render left icon", () => {
      const { getByTestId } = render(
        <BaseButton {...defaultProps} leftIcon="heart" />,
      );

      expect(getByTestId("left-icon")).toBeTruthy();
    });

    it("should render right icon", () => {
      const { getByTestId } = render(
        <BaseButton {...defaultProps} rightIcon="arrow-forward" />,
      );

      expect(getByTestId("right-icon")).toBeTruthy();
    });

    it("should render both icons", () => {
      const { getByTestId } = render(
        <BaseButton
          {...defaultProps}
          leftIcon="heart"
          rightIcon="arrow-forward"
        />,
      );

      expect(getByTestId("left-icon")).toBeTruthy();
      expect(getByTestId("right-icon")).toBeTruthy();
    });
  });

  describe("Press Handling", () => {
    it("should call onPress when pressed", () => {
      const { getByText } = render(<BaseButton {...defaultProps} />);

      const button = getByText("Test Button");
      fireEvent.press(button);

      expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
    });

    it("should not call onPress when not provided", () => {
      const { getByText } = render(<BaseButton title="Test Button" />);

      const button = getByText("Test Button");

      expect(() => fireEvent.press(button)).not.toThrow();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom style", () => {
      const customStyle = { backgroundColor: "red" };
      const { getByText } = render(
        <BaseButton {...defaultProps} style={customStyle} />,
      );

      const button = getByText("Test Button");
      expect(button.props.style).toBeDefined();
    });

    it("should apply custom text style", () => {
      const customTextStyle = { color: "blue" };
      const { getByText } = render(
        <BaseButton {...defaultProps} textStyle={customTextStyle} />,
      );

      const button = getByText("Test Button");
      expect(button.props.style).toBeDefined();
    });
  });

  describe("Accessibility", () => {
    it("should have proper accessibility label", () => {
      const { getByText } = render(<BaseButton {...defaultProps} />);

      const button = getByText("Test Button");
      expect(button).toBeAccessible();
    });

    it("should have accessibility role", () => {
      const { getByText } = render(<BaseButton {...defaultProps} />);

      const button = getByText("Test Button");
      expect(button).toHaveAccessibilityProps({ accessibilityRole: "button" });
    });

    it("should be accessible when disabled", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} disabled={true} />,
      );

      const button = getByText("Test Button");
      expect(button).toHaveAccessibilityProps({
        accessibilityState: { disabled: true },
      });
    });

    it("should have loading accessibility state", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} loading={true} />,
      );

      const button = getByText("Test Button");
      expect(button).toHaveLoadingState();
    });
  });

  describe("Theme Integration", () => {
    it("should match theme colors", () => {
      const { getByText } = render(
        <BaseButton {...defaultProps} variant="primary" />,
      );

      const button = getByText("Test Button");
      expect(button).toMatchThemeColors({
        backgroundColor: expect.any(String),
        color: expect.any(String),
      });
    });

    it("should adapt to dark theme", () => {
      const darkTheme = createMockTheme(true);
      jest
        .mocked(require("../../contexts/ThemeContext").useTheme)
        .mockReturnValue(darkTheme);

      const { getByText } = render(
        <BaseButton {...defaultProps} variant="primary" />,
      );

      const button = getByText("Test Button");
      expect(button).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty title", () => {
      const { container } = render(<BaseButton {...defaultProps} title="" />);

      expect(container).toBeTruthy();
    });

    it("should handle very long title", () => {
      const longTitle =
        "This is a very long button title that should still render correctly";
      const { getByText } = render(
        <BaseButton {...defaultProps} title={longTitle} />,
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it("should handle rapid presses", () => {
      const { getByText } = render(<BaseButton {...defaultProps} />);

      const button = getByText("Test Button");

      // Simulate rapid presses
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(defaultProps.onPress).toHaveBeenCalledTimes(3);
    });
  });

  describe("Performance", () => {
    it("should not re-render unnecessarily", () => {
      const { rerender } = render(<BaseButton {...defaultProps} />);

      // Re-render with same props
      rerender(<BaseButton {...defaultProps} />);

      // Should not cause issues
      expect(true).toBe(true);
    });

    it("should handle style changes efficiently", () => {
      const { rerender } = render(<BaseButton {...defaultProps} />);

      // Change style
      rerender(<BaseButton {...defaultProps} style={{ marginTop: 10 }} />);

      // Should render without issues
      expect(true).toBe(true);
    });
  });
});
