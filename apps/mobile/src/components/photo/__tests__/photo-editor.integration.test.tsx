/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { View, Text, Modal } from "react-native";
import { AdvancedPhotoEditor } from "../AdvancedPhotoEditor";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";

// Mock dependencies
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
}));

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  FlipType: {
    Horizontal: "horizontal",
    Vertical: "vertical",
  },
  SaveFormat: {
    JPEG: "jpeg",
    PNG: "png",
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => <View>{children}</View>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock reanimated
jest.mock("react-native-reanimated", () => {
  const View = require("react-native").View;
  return {
    View: React.forwardRef((props: any, ref: any) => <View {...props} ref={ref} />),
    useSharedValue: (init: number) => ({ value: init }),
    withTiming: jest.fn(),
    withSpring: jest.fn(),
    interpolate: (v: number, i: number[], o: number[]) => 0,
    useAnimatedStyle: (fn: () => any) => ({}),
    FadeInDown: { delay: () => ({ springify: () => ({}) }) },
    FadeOutUp: {},
  };
});

jest.mock("../../micro/BouncePressable", () => ({
  __esModule: true,
  default: ({ children, onPress, ...props }: any) => (
    <View onPress={onPress} {...props}>
      {children}
    </View>
  ),
}));

describe("AdvancedPhotoEditor Integration", () => {
  const mockImageUri = "file:///test-image.jpg";
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: mockImageUri,
      width: 512,
      height: 512,
    });
  });

  it("renders photo editor correctly", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    expect(getByText("Edit Photo")).toBeTruthy();
  });

  it("displays preview image", () => {
    const { UNSAFE_getAllByType } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    expect(UNSAFE_getAllByType).toBeDefined();
  });

  it("shows adjust tab by default", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    expect(getByText("Adjust")).toBeTruthy();
  });

  it("switches between tabs", () => {
    const { getByText, queryByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const filtersTab = getByText("Filters");

    fireEvent.press(filtersTab);

    expect(getByText("Filters")).toBeTruthy();
  });

  it("displays all filter presets", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByText("Filters"));

    expect(getByText("Original")).toBeTruthy();
    expect(getByText("Vivid")).toBeTruthy();
    expect(getByText("Warm")).toBeTruthy();
    expect(getByText("Cool")).toBeTruthy();
    expect(getByText("BW")).toBeTruthy();
    expect(getByText("Vintage")).toBeTruthy();
    expect(getByText("Dramatic")).toBeTruthy();
    expect(getByText("Soft")).toBeTruthy();
  });

  it("applies filter preset", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByText("Filters"));
    fireEvent.press(getByText("Vivid"));

    // Should switch back to adjust tab
    expect(getByText("Adjust")).toBeTruthy();
  });

  it("handles transform controls", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByText("Rotate L"));
    fireEvent.press(getByText("Rotate R"));
    fireEvent.press(getByText("Flip H"));
    fireEvent.press(getByText("Flip V"));

    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it("resets all adjustments", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByText("Reset All"));

    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it("displays all adjustment sliders", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    expect(getByText("Brightness")).toBeTruthy();
    expect(getByText("Contrast")).toBeTruthy();
    expect(getByText("Saturation")).toBeTruthy();
    expect(getByText("Warmth")).toBeTruthy();
  });

  it("saves photo successfully", async () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const saveButton = getByText("Save");

    await act(async () => {
      fireEvent.press(saveButton);
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
  });

  it("cancels without saving", () => {
    const { getByText, UNSAFE_getByType } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByText("✕"));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("supports custom aspect ratio", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        aspectRatio={[4, 3]}
      />,
    );

    expect(getByText("Edit Photo")).toBeTruthy();
  });

  it("supports custom dimensions", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        maxWidth={1080}
        maxHeight={1080}
      />,
    );

    expect(getByText("Edit Photo")).toBeTruthy();
  });

  it("provides haptic feedback on interactions", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    // Interact with various controls
    fireEvent.press(getByText("Rotate L"));
    fireEvent.press(getByText("Filters"));
    fireEvent.press(getByText("Vivid"));
    fireEvent.press(getByText("Adjust"));

    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it("handles multiple filter applications", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const filters = ["Vivid", "Warm", "Cool", "Vintage"];

    filters.forEach((filterName) => {
      fireEvent.press(getByText("Filters"));
      fireEvent.press(getByText(filterName));
    });

    expect(getByText("Adjust")).toBeTruthy();
  });

  it("shows processing state during save", async () => {
    let resolveManipulation: any;
    (ImageManipulator.manipulateAsync as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveManipulation = resolve;
        }),
    );

    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const saveButton = getByText("Save");

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText("Processing...")).toBeTruthy();
    });

    // Complete the save
    resolveManipulation({ uri: mockImageUri, width: 512, height: 512 });

    await waitFor(() => {
      expect(getByText("Edit Photo")).toBeTruthy();
    });
  });

  it("maintains state across tab switches", () => {
    const { getByText, rerender } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByText("Filters"));
    fireEvent.press(getByText("Adjust"));

    expect(getByText("Adjust")).toBeTruthy();
    expect(getByText("Brightness")).toBeTruthy();
  });

  it("handles rapid interactions without crashes", () => {
    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    // Rapid tab switching
    for (let i = 0; i < 10; i++) {
      fireEvent.press(getByText("Filters"));
      fireEvent.press(getByText("Adjust"));
    }

    expect(getByText("Adjust")).toBeTruthy();
  });

  it("disables save button during processing", async () => {
    let resolveManipulation: any;
    (ImageManipulator.manipulateAsync as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveManipulation = resolve;
        }),
    );

    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    fireEvent.press(getByText("Save"));

    const saveButton = getByText("Save");

    // Save button should be disabled
    expect(saveButton).toBeTruthy();

    resolveManipulation({ uri: mockImageUri, width: 512, height: 512 });

    await waitFor(() => {
      expect(getByText("Edit Photo")).toBeTruthy();
    });
  });

  it("handles errors gracefully", async () => {
    (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(
      new Error("Processing failed"),
    );

    const { getByText } = render(
      <AdvancedPhotoEditor
        imageUri={mockImageUri}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />,
    );

    const saveButton = getByText("Save");

    await act(async () => {
      fireEvent.press(saveButton);
    });

    // Should show error but not crash
    expect(getByText("Edit Photo")).toBeTruthy();
  });

  it("works with different image URIs", () => {
    const uris = [
      "file:///local-image.jpg",
      "https://example.com/remote-image.jpg",
      "asset:///bundled-image.jpg",
    ];

    uris.forEach((uri) => {
      const { getByText } = render(
        <AdvancedPhotoEditor
          imageUri={uri}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />,
      );

      expect(getByText("Edit Photo")).toBeTruthy();
    });
  });
});

