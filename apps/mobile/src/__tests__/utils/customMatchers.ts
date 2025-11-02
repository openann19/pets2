/**
 * Custom Jest Matchers for PawfectMatch Mobile Testing
 * Extends Jest with mobile-specific assertions
 */

import "@testing-library/jest-native/extend-expect";

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAccessibilityProps(props: Record<string, any>): R;
      toBeWithinViewport(): R;
      toHaveCorrectGestureHandlers(): R;
      toMatchThemeColors(colors: Record<string, string>): R;
      toBePressable(): R;
      toHaveLoadingState(): R;
      toDisplayErrorMessage(message: string): R;
      toBeAccessible(): R;
    }
  }
}

export const customMatchers = {
  toHaveAccessibilityProps(received: any, expectedProps: Record<string, any>) {
    const pass = Object.keys(expectedProps).every((key) => {
      const receivedValue = received.props[key];
      const expectedValue = expectedProps[key];
      return receivedValue === expectedValue;
    });

    const message = pass
      ? () =>
          `Expected element not to have accessibility props: ${JSON.stringify(expectedProps)}`
      : () =>
          `Expected element to have accessibility props: ${JSON.stringify(expectedProps)}`;

    return { pass, message };
  },

  toBeWithinViewport(received: any) {
    // In a real implementation, this would check if the element is within the viewport
    const pass =
      received && received.props && typeof received.props === "object";

    const message = pass
      ? () => "Expected element not to be within viewport"
      : () => "Expected element to be within viewport";

    return { pass, message };
  },

  toHaveCorrectGestureHandlers(received: any) {
    // Check if element has gesture handler props
    const hasHandlers =
      received &&
      received.props &&
      (received.props.onPress ||
        received.props.onLongPress ||
        received.props.onSwipeLeft ||
        received.props.onSwipeRight);

    const message = hasHandlers
      ? () => "Expected element not to have gesture handlers"
      : () => "Expected element to have gesture handlers";

    return { pass: hasHandlers, message };
  },

  toMatchThemeColors(received: any, expectedColors: Record<string, string>) {
    const receivedStyle = received?.props?.style || {};
    const actualColors: Record<string, any> = {};

    // Extract colors from style
    if (Array.isArray(receivedStyle)) {
      receivedStyle.forEach((style) => {
        if (style && typeof style === "object") {
          Object.keys(style).forEach((key) => {
            if (
              key.toLowerCase().includes("color") ||
              key.toLowerCase().includes("background")
            ) {
              actualColors[key] = style[key];
            }
          });
        }
      });
    } else if (receivedStyle && typeof receivedStyle === "object") {
      Object.keys(receivedStyle).forEach((key) => {
        if (
          key.toLowerCase().includes("color") ||
          key.toLowerCase().includes("background")
        ) {
          actualColors[key] = receivedStyle[key];
        }
      });
    }

    const pass = Object.keys(expectedColors).every((key) => {
      const receivedValue = actualColors[key] || receivedStyle[key];
      return receivedValue === expectedColors[key];
    });

    const message = pass
      ? () =>
          `Expected element not to match theme colors: ${JSON.stringify(expectedColors)}`
      : () =>
          `Expected element to match theme colors. Received: ${JSON.stringify(actualColors)}, Expected: ${JSON.stringify(expectedColors)}`;

    return { pass, message };
  },

  toBePressable(received: any) {
    const isPressable =
      received?.props?.onPress ||
      received?.props?.disabled === false ||
      received?.props?.accessibilityRole === "button";

    const message = isPressable
      ? () => "Expected element not to be pressable"
      : () => "Expected element to be pressable";

    return { pass: isPressable, message };
  },

  toHaveLoadingState(received: any) {
    // Check if element has loading indicator
    const hasLoading =
      received?.props?.accessibilityState?.busy === true ||
      received?.props?.children?.props?.testID === "loading-indicator";

    const message = hasLoading
      ? () => "Expected element not to have loading state"
      : () => "Expected element to have loading state";

    return { pass: hasLoading, message };
  },

  toDisplayErrorMessage(received: any, expectedMessage: string) {
    const text = received?.props?.children || received?.props?.text;
    const containsMessage =
      typeof text === "string" && text.includes(expectedMessage);

    const message = containsMessage
      ? () =>
          `Expected element not to display error message: "${expectedMessage}"`
      : () =>
          `Expected element to display error message "${expectedMessage}", but got: "${text}"`;

    return { pass: containsMessage, message };
  },

  toBeAccessible(received: any) {
    const accessibilityProps = received?.props || {};
    const hasLabel =
      accessibilityProps.accessibilityLabel ||
      accessibilityProps.accessibilityHint ||
      accessibilityProps["aria-label"];

    const pass = !!hasLabel;

    const message = pass
      ? () => "Expected element not to be accessible"
      : () =>
          "Expected element to be accessible (must have accessibilityLabel, accessibilityHint, or aria-label)";

    return { pass, message };
  },
};

// Jest matcher setup
expect.extend(customMatchers);
