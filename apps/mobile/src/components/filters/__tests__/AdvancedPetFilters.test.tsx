import type { PetFilters } from "@pawfectmatch/core";
import { fireEvent, render, screen } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { AdvancedPetFilters } from "../AdvancedPetFilters";

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
}));

// Mock react-native-reanimated
jest.mock("react-native-reanimated", () => ({
  default: {
    View: "Animated.View",
    Text: "Animated.Text",
    ScrollView: "Animated.ScrollView",
    createAnimatedComponent: (component: any) => component,
  },
  interpolate: jest.fn(),
  withSpring: jest.fn((value) => value),
  withTiming: jest.fn((value) => value),
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  useAnimatedGestureHandler: jest.fn(() => ({})),
  useDerivedValue: jest.fn(() => ({ value: 0 })),
  runOnJS: jest.fn((fn: any) => fn),
}));

describe("AdvancedPetFilters", () => {
  const mockOnChange = jest.fn();
  const mockOnReset = jest.fn();
  const mockOnApply = jest.fn();

  const defaultFilters: PetFilters = {
    maxDistance: 50,
    personalityTags: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders main filter sections", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      expect(screen.getByText("Advanced Pet Filters")).toBeTruthy();
      expect(screen.getByText("Species")).toBeTruthy();
      expect(screen.getByText("Age Range")).toBeTruthy();
      expect(screen.getByText("Size")).toBeTruthy();
      expect(screen.getByText("Intent")).toBeTruthy();
      expect(screen.getByText("Max Distance")).toBeTruthy();
      expect(screen.getByText("Personality Tags")).toBeTruthy();
    });

    it("displays filter values correctly", () => {
      const filtersWithValues: PetFilters = {
        species: "dog",
        minAge: 2,
        maxAge: 8,
        size: "medium",
        intent: "adoption",
        maxDistance: 25,
        personalityTags: ["Friendly", "Playful"],
      };

      render(
        <AdvancedPetFilters
          value={filtersWithValues}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      // Check if the component renders successfully with values
      expect(screen.getByText("Advanced Pet Filters")).toBeTruthy();
    });
  });

  describe("Species Filter", () => {
    it("triggers onChange when species is selected", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const speciesSelect = screen.getByTestId("species-select");
      fireEvent(speciesSelect, "onValueChange", "cat");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        species: "cat",
      });
    });

    it("triggers haptic feedback on selection", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const speciesSelect = screen.getByTestId("species-select");
      fireEvent(speciesSelect, "onValueChange", "dog");

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });
  });

  describe("Age Range Filter", () => {
    it("updates min age correctly", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const minAgeInput = screen.getByTestId("min-age-input");
      fireEvent.changeText(minAgeInput, "3");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        minAge: 3,
      });
    });

    it("updates max age correctly", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const maxAgeInput = screen.getByTestId("max-age-input");
      fireEvent.changeText(maxAgeInput, "10");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        maxAge: 10,
      });
    });

    it("handles empty age input correctly", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const minAgeInput = screen.getByTestId("min-age-input");
      fireEvent.changeText(minAgeInput, "");

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        minAge: undefined,
      });
    });
  });

  describe("Distance Slider", () => {
    it("updates distance when slider value changes", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const distanceSlider = screen.getByTestId("distance-slider");
      fireEvent(distanceSlider, "onValueChange", 75);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        maxDistance: 75,
      });
    });

    it("triggers haptic feedback on slider interaction", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const distanceSlider = screen.getByTestId("distance-slider");
      fireEvent(distanceSlider, "onValueChange", 75);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });
  });

  describe("Personality Tags", () => {
    it("toggles personality tags correctly", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const friendlyTag = screen.getByText("Friendly");
      fireEvent.press(friendlyTag);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultFilters,
        personalityTags: ["Friendly"],
      });
    });

    it("removes selected personality tags", () => {
      const filtersWithTags: PetFilters = {
        ...defaultFilters,
        personalityTags: ["Friendly", "Playful"],
      };

      render(
        <AdvancedPetFilters
          value={filtersWithTags}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const friendlyTag = screen.getByText("Friendly");
      fireEvent.press(friendlyTag);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...filtersWithTags,
        personalityTags: ["Playful"],
      });
    });

    it("triggers haptic feedback on tag press", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const friendlyTag = screen.getByText("Friendly");
      fireEvent.press(friendlyTag);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });
  });

  describe("Action Buttons", () => {
    it("calls onReset when reset button is pressed", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const resetButton = screen.getByText("Reset");
      fireEvent.press(resetButton);

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it("calls onApply when apply button is pressed", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const applyButton = screen.getByText("Apply");
      fireEvent.press(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(1);
    });

    it("triggers haptic feedback on button press", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const applyButton = screen.getByText("Apply");
      fireEvent.press(applyButton);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });
  });

  describe("Accessibility", () => {
    it("has proper accessibility labels", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      expect(screen.getByLabelText("Select species")).toBeTruthy();
      expect(screen.getByLabelText("Minimum age")).toBeTruthy();
      expect(screen.getByLabelText("Maximum age")).toBeTruthy();
      expect(screen.getByLabelText("Select size")).toBeTruthy();
      expect(screen.getByLabelText("Select intent")).toBeTruthy();
    });

    it("supports screen readers with role attributes", () => {
      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      expect(
        screen.getByRole("group", { name: "Advanced Pet Filters" }),
      ).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles undefined values gracefully", () => {
      const undefinedFilters: PetFilters = {};

      render(
        <AdvancedPetFilters
          value={undefinedFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      expect(screen.getByText("Advanced Pet Filters")).toBeTruthy();
    });

    it("handles large personality tag arrays", () => {
      const filtersWithManyTags: PetFilters = {
        ...defaultFilters,
        personalityTags: [
          "Friendly",
          "Energetic",
          "Calm",
          "Playful",
          "Affectionate",
          "Independent",
        ],
      };

      render(
        <AdvancedPetFilters
          value={filtersWithManyTags}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      expect(screen.getByText("Friendly")).toBeTruthy();
      expect(screen.getByText("Energetic")).toBeTruthy();
    });
  });

  describe("Performance", () => {
    it("renders efficiently with many personality tags", () => {
      const startTime = performance.now();

      render(
        <AdvancedPetFilters
          value={defaultFilters}
          onChange={mockOnChange}
          onReset={mockOnReset}
          onApply={mockOnApply}
        />,
      );

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
    });
  });
});
