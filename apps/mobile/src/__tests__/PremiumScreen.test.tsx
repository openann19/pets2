import React from "react";
import {} from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";
import PremiumScreen from "../screens/PremiumScreen";
import {} from "@pawfectmatch/core";
import {} from "../services/api";
import * as Haptics from "expo-haptics";

// Mock dependencies
jest.mock("@pawfectmatch/core");
jest.mock("../services/api", () => ({
  premiumAPI: {
    createCheckoutSession: jest.fn(),
    getPlanDetails: jest.fn(),
    getCurrentSubscription: jest.fn(),
  },
}));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: "medium",
  },
}));
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe("PremiumScreen", () => {
  const mockUser = {
    id: "user-123",
    firstName: "Test",
    lastName: "User",
    premium: {
      isActive: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    (premiumAPI.getPlanDetails as jest.Mock).mockResolvedValue({
      monthly: [
        {
          id: "basic",
          name: "Basic",
          price: 0,
          features: ["Limited swipes per day", "Basic matching"],
        },
        {
          id: "premium",
          name: "Premium",
          price: 9.99,
          features: ["Unlimited swipes", "See who liked you"],
          popular: true,
        },
        {
          id: "ultimate",
          name: "Ultimate",
          price: 19.99,
          features: [
            "All Premium features",
            "Priority matching",
            "Profile boost",
          ],
        },
      ],
      yearly: [
        {
          id: "basic",
          name: "Basic",
          price: 0,
          features: ["Limited swipes per day", "Basic matching"],
        },
        {
          id: "premium",
          name: "Premium",
          price: 99.99,
          features: ["Unlimited swipes", "See who liked you"],
          popular: true,
          savings: "15%",
        },
        {
          id: "ultimate",
          name: "Ultimate",
          price: 199.99,
          features: [
            "All Premium features",
            "Priority matching",
            "Profile boost",
          ],
          savings: "15%",
        },
      ],
    });
  });

  it("renders premium plans correctly", async () => {
    const { getByText, getAllByTestId } = render(
      <PremiumScreen navigation={mockNavigation} />,
    );

    // Wait for plans to load
    await waitFor(() => {
      expect(getByText("Premium Features")).toBeTruthy();
      expect(getByText("Basic")).toBeTruthy();
      expect(getByText("Premium")).toBeTruthy();
      expect(getByText("Ultimate")).toBeTruthy();
    });

    // Should render all plan cards
    const planCards = getAllByTestId("premium-plan-card");
    expect(planCards.length).toBe(3);
  });

  it("toggles between monthly and yearly billing", async () => {
    const { getByText, getByTestId } = render(
      <PremiumScreen navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText("Monthly")).toBeTruthy();
      expect(getByText("Yearly")).toBeTruthy();
    });

    // Default should be monthly
    expect(getByText("$9.99/month")).toBeTruthy();

    // Switch to yearly
    fireEvent.press(getByText("Yearly"));

    await waitFor(() => {
      // Should show yearly price
      expect(getByText("$99.99/year")).toBeTruthy();
      // Should show savings badge
      expect(getByTestId("savings-badge")).toBeTruthy();
    });
  });

  it("initiates subscription checkout", async () => {
    (premiumAPI.createCheckoutSession as jest.Mock).mockResolvedValue({
      success: true,
      checkoutUrl: "https://stripe.com/checkout",
    });

    const { getByText } = render(<PremiumScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("Subscribe")).toBeTruthy();
    });

    // Click subscribe button for premium plan
    fireEvent.press(getByText("Subscribe"));

    await waitFor(() => {
      // Should call createCheckoutSession
      expect(premiumAPI.createCheckoutSession).toHaveBeenCalledWith({
        planId: "premium",
        interval: "monthly",
      });

      // Should navigate to checkout
      expect(mockNavigation.navigate).toHaveBeenCalledWith("WebView", {
        url: "https://stripe.com/checkout",
        title: "Checkout",
      });
    });
  });

  it("displays user as premium member when subscribed", async () => {
    // Mock user as premium
    (useAuthStore as jest.Mock).mockReturnValue({
      user: {
        ...mockUser,
        premium: {
          isActive: true,
          plan: "premium",
        },
      },
    });

    (premiumAPI.getCurrentSubscription as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        plan: {
          id: "premium",
          name: "Premium",
        },
        currentPeriodEnd: "2025-12-31T00:00:00Z",
        cancelAtPeriodEnd: false,
      },
    });

    const { getByText } = render(<PremiumScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("Premium Member")).toBeTruthy();
      expect(getByText("Manage Subscription")).toBeTruthy();
    });
  });

  it("applies haptic feedback when interacting with plans", async () => {
    const { getByText } = render(<PremiumScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(getByText("Subscribe")).toBeTruthy();
    });

    // Click subscribe button
    fireEvent.press(getByText("Subscribe"));

    // Should trigger haptic feedback
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium,
    );
  });
});
