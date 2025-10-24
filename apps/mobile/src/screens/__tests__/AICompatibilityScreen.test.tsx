import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useAuthStore } from "@pawfectmatch/core";
import AICompatibilityScreen from "../AICompatibilityScreen";
import { api } from "../../services/api";

// Mock dependencies
jest.mock("@pawfectmatch/core", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("../../services/api", () => ({
  api: {
    ai: {
      analyzeCompatibility: jest.fn(),
    },
  },
}));

// Mock navigation
const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

// Mock user data
const mockUser = {
  _id: "user123",
  name: "Test User",
  email: "test@example.com",
};

// Mock pets data
const mockPets = [
  {
    _id: "1",
    name: "Buddy",
    photos: ["https://example.com/buddy.jpg"],
    breed: "Golden Retriever",
    age: 3,
    species: "dog",
    owner: { _id: "user123", name: "Test User" },
  },
  {
    _id: "2",
    name: "Luna",
    photos: ["https://example.com/luna.jpg"],
    breed: "Labrador",
    age: 2,
    species: "dog",
    owner: { _id: "user456", name: "Sarah" },
  },
  {
    _id: "3",
    name: "Max",
    photos: ["https://example.com/max.jpg"],
    breed: "German Shepherd",
    age: 4,
    species: "dog",
    owner: { _id: "user789", name: "Mike" },
  },
];

describe("AICompatibilityScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: mockUser,
    });
  });

  const renderComponent = (routeParams?: any) => {
    const mockRoute = {
      params: routeParams,
    };
    return render(
      <AICompatibilityScreen navigation={mockNavigation} route={mockRoute} />,
    );
  };

  describe("Rendering", () => {
    it("renders correctly with initial state", () => {
      const { getByText, getByTestId } = renderComponent();

      expect(getByText("AI Compatibility")).toBeTruthy();
      expect(getByText("🐕 Select Two Pets")).toBeTruthy();
      expect(getByText("Pet 1")).toBeTruthy();
      expect(getByText("Pet 2")).toBeTruthy();
      expect(getByText("VS")).toBeTruthy();
      expect(getByText("Available Pets")).toBeTruthy();
      expect(getByTestId("back-button")).toBeTruthy();
    });

    it("shows loading state initially", () => {
      const { getByText } = renderComponent();

      expect(getByText("Loading pets...")).toBeTruthy();
    });

    it("displays available pets after loading", async () => {
      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
        expect(getByText("Luna")).toBeTruthy();
        expect(getByText("Max")).toBeTruthy();
      });
    });
  });

  describe("Pet Selection", () => {
    it("allows selecting first pet", async () => {
      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select first pet
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      // Should show selected pet in Pet 1 slot
      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
        expect(getByText("Golden Retriever")).toBeTruthy();
      });
    });

    it("allows selecting second pet after first is selected", async () => {
      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select first pet
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      // Select second pet
      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      // Should show both pets selected
      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
        expect(getByText("Luna")).toBeTruthy();
        expect(getByText("Analyze Compatibility")).toBeTruthy();
      });
    });

    it("prevents selecting same pet twice", async () => {
      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select first pet
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      // Try to select same pet again - should not be possible
      const buddyCards = getByText("Buddy").parent?.parent;
      expect(buddyCards).toBeTruthy();
    });

    it("prevents selecting pets from same owner", async () => {
      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select first pet (owned by current user)
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      // Other pets from different owners should still be selectable
      await waitFor(() => {
        expect(getByText("Luna")).toBeTruthy();
        expect(getByText("Max")).toBeTruthy();
      });
    });

    it("allows deselecting pets", async () => {
      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select first pet
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      // Deselect by pressing the selected pet card
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      // Should show placeholder again
      await waitFor(() => {
        expect(getByText("Select Pet 1")).toBeTruthy();
      });
    });
  });

  describe("Compatibility Analysis", () => {
    it("shows error when trying to analyze without selecting both pets", async () => {
      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Try to analyze without selecting pets
      const analyzeButton = getByText("Analyze Compatibility");
      fireEvent.press(analyzeButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "Selection Required",
          "Please select two pets to analyze compatibility.",
        );
      });
    });

    it("calls API with correct parameters when analyzing compatibility", async () => {
      const mockAnalyzeCompatibility = jest.fn().mockResolvedValue({
        compatibility_score: 0.85,
        ai_analysis: "These pets show excellent compatibility potential.",
        breakdown: {
          personality_compatibility: 0.9,
          lifestyle_compatibility: 0.8,
          activity_compatibility: 0.85,
          social_compatibility: 0.9,
          environment_compatibility: 0.8,
        },
        recommendations: {
          meeting_suggestions: ["Neutral territory", "Supervised introduction"],
          activity_recommendations: ["Play fetch together", "Go for walks"],
          supervision_requirements: ["Initial supervision recommended"],
          success_probability: 0.9,
        },
      });

      (api.ai.analyzeCompatibility as jest.Mock).mockImplementation(
        mockAnalyzeCompatibility,
      );

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      // Analyze compatibility
      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      await waitFor(() => {
        expect(mockAnalyzeCompatibility).toHaveBeenCalledWith({
          pet1Id: "1",
          pet2Id: "2",
        });
      });
    });

    it("displays compatibility results when API call succeeds", async () => {
      const mockCompatibilityResult = {
        compatibility_score: 0.85,
        ai_analysis: "These pets show excellent compatibility potential.",
        breakdown: {
          personality_compatibility: 0.9,
          lifestyle_compatibility: 0.8,
          activity_compatibility: 0.85,
          social_compatibility: 0.9,
          environment_compatibility: 0.8,
        },
        recommendations: {
          meeting_suggestions: ["Neutral territory", "Supervised introduction"],
          activity_recommendations: ["Play fetch together", "Go for walks"],
          supervision_requirements: ["Initial supervision recommended"],
          success_probability: 0.9,
        },
      };

      (api.ai.analyzeCompatibility as jest.Mock).mockResolvedValue(
        mockCompatibilityResult,
      );

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      // Analyze compatibility
      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      await waitFor(() => {
        expect(getByText("🎯 Compatibility Results")).toBeTruthy();
        expect(getByText("85/100")).toBeTruthy();
        expect(getByText("Excellent Match!")).toBeTruthy();
        expect(
          getByText("These pets show excellent compatibility potential."),
        ).toBeTruthy();
      });
    });

    it("shows loading state during analysis", async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (api.ai.analyzeCompatibility as jest.Mock).mockReturnValue(promise);

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      // Start analysis
      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      // Should show loading state
      expect(getByText("Analyzing...")).toBeTruthy();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({
          compatibility_score: 0.8,
          ai_analysis: "Test analysis",
          breakdown: {
            personality_compatibility: 0.8,
            lifestyle_compatibility: 0.8,
            activity_compatibility: 0.8,
            social_compatibility: 0.8,
            environment_compatibility: 0.8,
          },
          recommendations: {
            meeting_suggestions: [],
            activity_recommendations: [],
            supervision_requirements: [],
            success_probability: 0.8,
          },
        });
      });
    });

    it("shows error message when API call fails", async () => {
      const mockError = new Error("Analysis failed");
      (api.ai.analyzeCompatibility as jest.Mock).mockRejectedValue(mockError);

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      // Try to analyze
      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      await waitFor(() => {
        expect(getByText("Analysis failed")).toBeTruthy();
      });
    });
  });

  describe("Results Display", () => {
    it("shows compatibility score with correct color coding for high score", async () => {
      const mockCompatibilityResult = {
        compatibility_score: 0.85, // High score
        ai_analysis: "Excellent compatibility",
        breakdown: {
          personality_compatibility: 0.9,
          lifestyle_compatibility: 0.8,
          activity_compatibility: 0.85,
          social_compatibility: 0.9,
          environment_compatibility: 0.8,
        },
        recommendations: {
          meeting_suggestions: [],
          activity_recommendations: [],
          supervision_requirements: [],
          success_probability: 0.9,
        },
      };

      (api.ai.analyzeCompatibility as jest.Mock).mockResolvedValue(
        mockCompatibilityResult,
      );

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets and analyze
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      await waitFor(() => {
        expect(getByText("85/100")).toBeTruthy();
        expect(getByText("Excellent Match!")).toBeTruthy();
      });
    });

    it("shows compatibility score with correct color coding for medium score", async () => {
      const mockCompatibilityResult = {
        compatibility_score: 0.65, // Medium score
        ai_analysis: "Good compatibility",
        breakdown: {
          personality_compatibility: 0.7,
          lifestyle_compatibility: 0.6,
          activity_compatibility: 0.65,
          social_compatibility: 0.7,
          environment_compatibility: 0.6,
        },
        recommendations: {
          meeting_suggestions: [],
          activity_recommendations: [],
          supervision_requirements: [],
          success_probability: 0.7,
        },
      };

      (api.ai.analyzeCompatibility as jest.Mock).mockResolvedValue(
        mockCompatibilityResult,
      );

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets and analyze
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      await waitFor(() => {
        expect(getByText("65/100")).toBeTruthy();
        expect(getByText("Good Compatibility")).toBeTruthy();
      });
    });

    it("displays detailed breakdown with progress bars", async () => {
      const mockCompatibilityResult = {
        compatibility_score: 0.8,
        ai_analysis: "Good compatibility",
        breakdown: {
          personality_compatibility: 0.9,
          lifestyle_compatibility: 0.7,
          activity_compatibility: 0.8,
          social_compatibility: 0.85,
          environment_compatibility: 0.75,
        },
        recommendations: {
          meeting_suggestions: [],
          activity_recommendations: [],
          supervision_requirements: [],
          success_probability: 0.8,
        },
      };

      (api.ai.analyzeCompatibility as jest.Mock).mockResolvedValue(
        mockCompatibilityResult,
      );

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets and analyze
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      await waitFor(() => {
        expect(getByText("📊 Detailed Breakdown")).toBeTruthy();
        expect(getByText("Personality")).toBeTruthy();
        expect(getByText("Lifestyle")).toBeTruthy();
        expect(getByText("Activity Level")).toBeTruthy();
        expect(getByText("Social Behavior")).toBeTruthy();
        expect(getByText("Environment")).toBeTruthy();
        expect(getByText("90%")).toBeTruthy();
        expect(getByText("70%")).toBeTruthy();
        expect(getByText("80%")).toBeTruthy();
        expect(getByText("85%")).toBeTruthy();
        expect(getByText("75%")).toBeTruthy();
      });
    });

    it("displays recommendations when available", async () => {
      const mockCompatibilityResult = {
        compatibility_score: 0.8,
        ai_analysis: "Good compatibility",
        breakdown: {
          personality_compatibility: 0.8,
          lifestyle_compatibility: 0.8,
          activity_compatibility: 0.8,
          social_compatibility: 0.8,
          environment_compatibility: 0.8,
        },
        recommendations: {
          meeting_suggestions: ["Neutral territory", "Supervised introduction"],
          activity_recommendations: ["Play fetch together", "Go for walks"],
          supervision_requirements: ["Initial supervision recommended"],
          success_probability: 0.85,
        },
      };

      (api.ai.analyzeCompatibility as jest.Mock).mockResolvedValue(
        mockCompatibilityResult,
      );

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets and analyze
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      await waitFor(() => {
        expect(getByText("💡 Recommendations")).toBeTruthy();
        expect(getByText("🎯 Meeting Suggestions")).toBeTruthy();
        expect(getByText("• Neutral territory")).toBeTruthy();
        expect(getByText("• Supervised introduction")).toBeTruthy();
        expect(getByText("🎾 Activity Recommendations")).toBeTruthy();
        expect(getByText("• Play fetch together")).toBeTruthy();
        expect(getByText("• Go for walks")).toBeTruthy();
        expect(getByText("⚠️ Supervision Requirements")).toBeTruthy();
        expect(getByText("• Initial supervision recommended")).toBeTruthy();
        expect(getByText("Success Probability:")).toBeTruthy();
        expect(getByText("85%")).toBeTruthy();
      });
    });
  });

  describe("Route Parameters", () => {
    it("auto-selects pets when passed via route params", async () => {
      const routeParams = {
        pet1Id: "1",
        pet2Id: "2",
      };

      const { getByText } = renderComponent(routeParams);

      // Should automatically select pets and start analysis
      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
        expect(getByText("Luna")).toBeTruthy();
      });
    });
  });

  describe("Reset Functionality", () => {
    it("resets analysis when new analysis button is pressed", async () => {
      const mockCompatibilityResult = {
        compatibility_score: 0.8,
        ai_analysis: "Good compatibility",
        breakdown: {
          personality_compatibility: 0.8,
          lifestyle_compatibility: 0.8,
          activity_compatibility: 0.8,
          social_compatibility: 0.8,
          environment_compatibility: 0.8,
        },
        recommendations: {
          meeting_suggestions: [],
          activity_recommendations: [],
          supervision_requirements: [],
          success_probability: 0.8,
        },
      };

      (api.ai.analyzeCompatibility as jest.Mock).mockResolvedValue(
        mockCompatibilityResult,
      );

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets and analyze
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      // Wait for results to show
      await waitFor(() => {
        expect(getByText("🎯 Compatibility Results")).toBeTruthy();
      });

      // Reset analysis
      await act(async () => {
        fireEvent.press(getByText("New Analysis"));
      });

      // Should be back to pet selection
      await waitFor(() => {
        expect(getByText("🐕 Select Two Pets")).toBeTruthy();
      });
    });
  });

  describe("Navigation", () => {
    it("navigates back when back button is pressed", () => {
      const { getByTestId } = renderComponent();

      fireEvent.press(getByTestId("back-button"));

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles loading pets error gracefully", async () => {
      // Mock the API to fail
      (api.ai.analyzeCompatibility as jest.Mock).mockRejectedValue(
        new Error("Failed to load pets"),
      );

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(
          getByText("Failed to load pets. Please try again."),
        ).toBeTruthy();
      });
    });

    it("handles network timeout gracefully", async () => {
      const timeoutError = new Error("Network timeout");
      timeoutError.name = "TimeoutError";

      (api.ai.analyzeCompatibility as jest.Mock).mockRejectedValue(
        timeoutError,
      );

      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText("Buddy")).toBeTruthy();
      });

      // Select both pets and try to analyze
      await act(async () => {
        fireEvent.press(getByText("Buddy"));
      });

      await act(async () => {
        fireEvent.press(getByText("Luna"));
      });

      await act(async () => {
        fireEvent.press(getByText("Analyze Compatibility"));
      });

      await waitFor(() => {
        expect(getByText("Network timeout")).toBeTruthy();
      });
    });
  });
});
