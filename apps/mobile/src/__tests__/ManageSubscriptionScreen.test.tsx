import { useAuthStore } from "@pawfectmatch/core";
import "@testing-library/jest-native/extend-expect";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import React from "react";
import ManageSubscriptionScreen from "../screens/ManageSubscriptionScreen";
import premiumAPI from "../services/api";

// Mock dependencies
jest.mock("@pawfectmatch/core");
jest.mock("../services/api", () => ({
  premiumAPI: {
    getSubscription: jest.fn(),
    cancelSubscription: jest.fn(),
    updateSubscription: jest.fn(),
    reactivateSubscription: jest.fn(),
    openBillingPortal: jest.fn(),
  },
}));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: "medium",
  },
}));
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock Alert
jest.mock("react-native/Libraries/Alert/Alert", () => ({
  alert: jest.fn((title, message, buttons) => {
    // Simulate pressing the last button (usually confirm)
    if (buttons && buttons.length > 0) {
      buttons[buttons.length - 1]?.onPress?.();
    }
  }),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe("ManageSubscriptionScreen", () => {
  const mockUser = {
    id: "user-123",
    firstName: "Test",
    lastName: "User",
    premium: {
      isActive: true,
      plan: "premium",
    },
  };

  const mockSubscription = {
    plan: {
      id: "premium",
      name: "Premium",
      price: 9.99,
      interval: "monthly",
    },
    currentPeriodStart: "2025-10-01T00:00:00Z",
    currentPeriodEnd: "2025-11-01T00:00:00Z",
    cancelAtPeriodEnd: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    (premiumAPI.getSubscription as jest.Mock).mockResolvedValue(
      mockSubscription,
    );
  });

  it("displays subscription details correctly", async () => {
    const { getByText } = render(
      <ManageSubscriptionScreen navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText("Premium")).toBeTruthy();
      expect(getByText("$9.99/month")).toBeTruthy();
      expect(getByText("Next billing date: November 1, 2025")).toBeTruthy();
    });
  });

  it("handles subscription cancellation", async () => {
    (premiumAPI.cancelSubscription as jest.Mock).mockResolvedValue({
      success: true,
      message: "Subscription cancelled",
    });

    const { getByText } = render(
      <ManageSubscriptionScreen navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText("Cancel Subscription")).toBeTruthy();
    });

    // Click cancel button
    fireEvent.press(getByText("Cancel Subscription"));

    // Should show success message
    await waitFor(() => {
      expect(premiumAPI.cancelSubscription).toHaveBeenCalled();
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  it("displays cancelled status when subscription is set to cancel", async () => {
    // Mock subscription as cancelled at period end
    (premiumAPI.getSubscription as jest.Mock).mockResolvedValue({
      ...mockSubscription,
      cancelAtPeriodEnd: true,
    });

    const { getByText } = render(
      <ManageSubscriptionScreen navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText("Cancels on November 1, 2025")).toBeTruthy();
      expect(getByText("Reactivate Subscription")).toBeTruthy();
    });
  });

  it("handles subscription reactivation", async () => {
    // Mock subscription as cancelled at period end
    (premiumAPI.getSubscription as jest.Mock).mockResolvedValue({
      ...mockSubscription,
      cancelAtPeriodEnd: true,
    });

    (premiumAPI.reactivateSubscription as jest.Mock).mockResolvedValue({
      success: true,
      message: "Subscription reactivated",
    });

    const { getByText } = render(
      <ManageSubscriptionScreen navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText("Reactivate Subscription")).toBeTruthy();
    });

    // Click reactivate button
    fireEvent.press(getByText("Reactivate Subscription"));

    // Should reactivate subscription
    await waitFor(() => {
      expect(premiumAPI.reactivateSubscription).toHaveBeenCalled();
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  it("opens billing portal when update payment is clicked", async () => {
    (premiumAPI.openBillingPortal as jest.Mock).mockResolvedValue({
      success: true,
      url: "https://billing.stripe.com/portal",
    });

    const { getByText } = render(
      <ManageSubscriptionScreen navigation={mockNavigation} />,
    );

    await waitFor(() => {
      expect(getByText("Update Payment Method")).toBeTruthy();
    });

    // Click update payment button
    fireEvent.press(getByText("Update Payment Method"));

    // Should open billing portal
    await waitFor(() => {
      expect(premiumAPI.openBillingPortal).toHaveBeenCalled();
      expect(mockNavigation.navigate).toHaveBeenCalledWith("WebView", {
        url: "https://billing.stripe.com/portal",
        title: "Billing Portal",
      });
    });
  });

  it("handles API errors gracefully", async () => {
    // Mock API error
    (premiumAPI.getSubscription as jest.Mock).mockRejectedValue(
      new Error("Failed to load subscription data"),
    );

    const { getByText } = render(
      <ManageSubscriptionScreen navigation={mockNavigation} />,
    );

    // Should display error message
    await waitFor(() => {
      expect(getByText("Error loading subscription")).toBeTruthy();
    });
  });
});
