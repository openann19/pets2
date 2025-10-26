import React from "react";
import {} from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";
import PremiumCard from "../../Premium/PremiumCard";
import {} from "../../../theme/Provider";
import * as Haptics from "expo-haptics";
import { Theme } from '../../../theme/unified-theme';

// Mock dependencies
jest.mock("../../../theme/Provider");
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: "medium",
  },
}));

describe("PremiumCard", () => {
  const mockPlan = {
    id: "premium",
    name: "Premium",
    price: 9.99,
    duration: "month",
    features: ["Unlimited swipes", "See who liked you", "Advanced filters"],
    popular: true,
  };

  const mockYearlyPlan = {
    ...mockPlan,
    price: 99.99,
    duration: "year",
    savings: "15%",
  };

  const mockOnSubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock theme context
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        primary: "#7c3aed",
        secondary: "Theme.colors.primary[500]",
        background: "Theme.colors.neutral[0]",
        text: "Theme.colors.neutral[950]",
        card: "Theme.colors.neutral[0]",
        accent: "Theme.colors.secondary[500]",
      },
      isDark: false,
    });
  });

  it("renders plan details correctly", () => {
    const { getByText, getByTestId } = render(
      <PremiumCard plan={mockPlan} onSubscribe={mockOnSubscribe} />,
    );

    // Check plan details
    expect(getByText("Premium")).toBeTruthy();
    expect(getByText("$9.99/month")).toBeTruthy();

    // Check features
    expect(getByText("Unlimited swipes")).toBeTruthy();
    expect(getByText("See who liked you")).toBeTruthy();
    expect(getByText("Advanced filters")).toBeTruthy();

    // Check popular badge
    expect(getByTestId("popular-badge")).toBeTruthy();
  });

  it("renders yearly plan with savings correctly", () => {
    const { getByText, getByTestId } = render(
      <PremiumCard plan={mockYearlyPlan} onSubscribe={mockOnSubscribe} />,
    );

    // Check yearly price
    expect(getByText("$99.99/year")).toBeTruthy();

    // Check savings badge
    expect(getByTestId("savings-badge")).toBeTruthy();
    expect(getByText("Save 15%")).toBeTruthy();
  });

  it("calls onSubscribe when subscribe button is pressed", () => {
    const { getByText } = render(
      <PremiumCard plan={mockPlan} onSubscribe={mockOnSubscribe} />,
    );

    // Press subscribe button
    fireEvent.press(getByText("Subscribe"));

    // Check if onSubscribe was called with correct plan
    expect(mockOnSubscribe).toHaveBeenCalledWith(mockPlan);

    // Check if haptic feedback was triggered
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium,
    );
  });

  it("renders with dark theme style", () => {
    // Mock dark theme
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        primary: "#7c3aed",
        secondary: "Theme.colors.primary[500]",
        background: "Theme.colors.neutral[800]",
        text: "Theme.colors.neutral[0]",
        card: "Theme.colors.neutral[700]",
        accent: "Theme.colors.secondary[500]",
      },
      isDark: true,
    });

    const { getByTestId } = render(
      <PremiumCard plan={mockPlan} onSubscribe={mockOnSubscribe} />,
    );

    // Should have dark theme style
    const card = getByTestId("premium-plan-card");
    expect(card.props.style).toBeDefined();
  });

  it("renders free plan correctly", () => {
    const freePlan = {
      id: "basic",
      name: "Basic",
      price: 0,
      duration: "month",
      features: ["Limited swipes per day", "Basic matching"],
    };

    const { getByText, queryByTestId } = render(
      <PremiumCard plan={freePlan} onSubscribe={mockOnSubscribe} />,
    );

    // Check free plan details
    expect(getByText("Basic")).toBeTruthy();
    expect(getByText("Free")).toBeTruthy();

    // Should not have popular or savings badge
    expect(queryByTestId("popular-badge")).toBeNull();
    expect(queryByTestId("savings-badge")).toBeNull();
  });

  it("renders with custom styles when provided", () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <PremiumCard
        plan={mockPlan}
        onSubscribe={mockOnSubscribe}
        style={customStyle}
      />,
    );

    const card = getByTestId("premium-plan-card");
    expect(card.props.style).toBeDefined();
    // Additional style-specific assertions could be added here
  });
});
