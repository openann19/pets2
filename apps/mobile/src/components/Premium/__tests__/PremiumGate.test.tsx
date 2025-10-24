import React from "react";
import {} from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";
import PremiumGate from "../../Premium/PremiumGate";
import {} from "@pawfectmatch/core";
import {} from "../../../contexts/ThemeContext";

// Mock dependencies
jest.mock("@pawfectmatch/core");
jest.mock("../../../contexts/ThemeContext");

const mockNavigation = {
  navigate: jest.fn(),
};

describe("PremiumGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock theme context
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        primary: "#7c3aed",
        secondary: "#ec4899",
        background: "#ffffff",
        text: "#000000",
      },
      isDark: false,
    });
  });

  it("renders premium content when user is premium", () => {
    // Mock user as premium
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: "user-123",
        firstName: "Test",
        premium: {
          isActive: true,
          plan: "premium",
        },
      },
    });

    const mockPremiumContent = jest.fn(() => (
      <React.Fragment>Premium Content</React.Fragment>
    ));
    const { getByText, queryByText } = render(
      <PremiumGate
        navigation={mockNavigation}
        premiumContent={mockPremiumContent}
        featureDescription="This feature"
      />,
    );

    // Should render premium content
    expect(getByText("Premium Content")).toBeTruthy();

    // Should not render paywall
    expect(queryByText("Premium Feature")).toBeNull();
  });

  it("renders paywall when user is not premium", () => {
    // Mock user as non-premium
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: "user-123",
        firstName: "Test",
        premium: {
          isActive: false,
        },
      },
    });

    const mockPremiumContent = jest.fn(() => (
      <React.Fragment>Premium Content</React.Fragment>
    ));
    const { getByText, queryByText, getByTestId } = render(
      <PremiumGate
        navigation={mockNavigation}
        premiumContent={mockPremiumContent}
        featureDescription="Advanced filters"
      />,
    );

    // Should render paywall
    expect(getByText("Premium Feature")).toBeTruthy();
    expect(
      getByText("Advanced filters requires a premium subscription"),
    ).toBeTruthy();

    // Should not render premium content
    expect(queryByText("Premium Content")).toBeNull();

    // Should show upgrade button
    expect(getByTestId("upgrade-button")).toBeTruthy();
  });

  it("navigates to Premium screen when upgrade button is pressed", () => {
    // Mock user as non-premium
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: "user-123",
        firstName: "Test",
        premium: {
          isActive: false,
        },
      },
    });

    const mockPremiumContent = jest.fn(() => (
      <React.Fragment>Premium Content</React.Fragment>
    ));
    const { getByText } = render(
      <PremiumGate
        navigation={mockNavigation}
        premiumContent={mockPremiumContent}
        featureDescription="Advanced filters"
      />,
    );

    // Press upgrade button
    fireEvent.press(getByText("Upgrade to Premium"));

    // Should navigate to Premium screen
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Premium");
  });

  it("renders custom message when provided", () => {
    // Mock user as non-premium
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: "user-123",
        firstName: "Test",
        premium: {
          isActive: false,
        },
      },
    });

    const mockPremiumContent = jest.fn(() => (
      <React.Fragment>Premium Content</React.Fragment>
    ));
    const { getByText } = render(
      <PremiumGate
        navigation={mockNavigation}
        premiumContent={mockPremiumContent}
        featureDescription="Advanced filters"
        customMessage="Get premium to unlock advanced filters!"
      />,
    );

    // Should render custom message
    expect(getByText("Get premium to unlock advanced filters!")).toBeTruthy();
  });

  it("renders with dark theme style", () => {
    // Mock dark theme
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        primary: "#7c3aed",
        secondary: "#ec4899",
        background: "#1f2937",
        text: "#ffffff",
        card: "#374151",
      },
      isDark: true,
    });

    // Mock user as non-premium
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        id: "user-123",
        firstName: "Test",
        premium: {
          isActive: false,
        },
      },
    });

    const mockPremiumContent = jest.fn(() => (
      <React.Fragment>Premium Content</React.Fragment>
    ));
    const { getByTestId } = render(
      <PremiumGate
        navigation={mockNavigation}
        premiumContent={mockPremiumContent}
        featureDescription="Advanced filters"
      />,
    );

    // Should have dark theme style
    const container = getByTestId("premium-gate-container");
    expect(container.props.style).toBeDefined();
  });
});
