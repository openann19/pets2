import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Vibration } from "react-native";

// Mock Animated module specifically for this test
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  const createMockValue = (value) => {
    const mockValue = jest.fn(() => value);
    mockValue._value = value;
    mockValue.setValue = jest.fn();
    mockValue.interpolate = jest.fn((config) => {
      const mockInterpolated = jest.fn(() => config.outputRange[0]);
      mockInterpolated._config = config;
      mockInterpolated._value = value;
      return mockInterpolated;
    });
    mockValue.addListener = jest.fn();
    mockValue.removeListener = jest.fn();
    mockValue.removeAllListeners = jest.fn();
    return mockValue;
  };

  return {
    ...RN,
    Animated: {
      View: "Animated.View",
      Text: "Animated.Text",
      Value: createMockValue,
      timing: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      stagger: jest.fn(() => ({ start: jest.fn() })),
      loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    },
  };
});

// Mock WebRTCService before importing IncomingCallScreen
jest.mock("../../../services/WebRTCService", () => ({
  __esModule: true,
  default: jest.fn(),
}));

import IncomingCallScreen from "../IncomingCallScreen";
import { Theme } from '../theme/unified-theme';

// Debug: Log what we imported
console.log("IncomingCallScreen imported:", typeof IncomingCallScreen);
console.log("IncomingCallScreen:", IncomingCallScreen);

// Mock dependencies - React Native is already mocked in jest.setup.ts

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

jest.mock("expo-blur", () => ({
  BlurView: "BlurView",
}));

const mockCallData = {
  callId: "test-call-id",
  matchId: "test-match-id",
  callerId: "test-caller-id",
  callerName: "Test Caller",
  callerAvatar: "https://example.com/avatar.jpg",
  callType: "voice" as const,
  timestamp: Date.now(),
};

describe("IncomingCallScreen", () => {
  const mockOnAnswer = jest.fn();
  const mockOnReject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly with call data", () => {
    const { getByText } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    expect(getByText("Incoming Call")).toBeTruthy();
    expect(getByText("Voice Call")).toBeTruthy();
    expect(getByText("Test Caller")).toBeTruthy();
    expect(getByText("PawfectMatch")).toBeTruthy();
  });

  it("should display video call type correctly", () => {
    const videoCallData = { ...mockCallData, callType: "video" as const };

    const { getByText } = render(
      <IncomingCallScreen
        callData={videoCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    expect(getByText("Video Call")).toBeTruthy();
  });

  it("should start vibration on mount", () => {
    render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    expect(Vibration.vibrate).toHaveBeenCalledWith(
      [0, 1000, 500, 1000, 500],
      true,
    );
  });

  it("should cancel vibration on unmount", () => {
    const { unmount } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    unmount();

    expect(Vibration.cancel).toHaveBeenCalled();
  });

  it("should call onAnswer when answer button is pressed", () => {
    const { getByTestId } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    const answerButton = getByTestId("answer-button");
    fireEvent.press(answerButton);

    expect(Vibration.cancel).toHaveBeenCalled();
    expect(mockOnAnswer).toHaveBeenCalled();
  });

  it("should call onReject when reject button is pressed", () => {
    const { getByTestId } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    const rejectButton = getByTestId("reject-button");
    fireEvent.press(rejectButton);

    expect(Vibration.cancel).toHaveBeenCalled();
    expect(mockOnReject).toHaveBeenCalled();
  });

  it("should render default avatar when no avatar provided", () => {
    const callDataWithoutAvatar = { ...mockCallData, callerAvatar: undefined };

    const { getByTestId } = render(
      <IncomingCallScreen
        callData={callDataWithoutAvatar}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    // Check if default avatar is rendered
    const avatar = getByTestId("caller-avatar");
    expect(avatar).toBeTruthy();
  });

  it("should handle animations correctly", async () => {
    const { getByTestId } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    // Wait for animations to start
    await waitFor(() => {
      expect(getByTestId("incoming-call-container")).toBeTruthy();
    });

    // Animations should be set up (mocked functions should be called)
    expect(require("react-native").Animated.loop).toHaveBeenCalled();
    expect(require("react-native").Animated.timing).toHaveBeenCalled();
  });

  it("should format call type correctly", () => {
    const { rerender, getByText } = render(
      <IncomingCallScreen
        callData={{ ...mockCallData, callType: "voice" }}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    expect(getByText("Voice Call")).toBeTruthy();

    rerender(
      <IncomingCallScreen
        callData={{ ...mockCallData, callType: "video" }}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    expect(getByText("Video Call")).toBeTruthy();
  });

  it("should render additional action buttons", () => {
    const { getByText } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    expect(getByText("Message")).toBeTruthy();
    expect(getByText("Profile")).toBeTruthy();
  });

  it("should apply correct styles for different call states", () => {
    const { getByTestId } = render(
      <IncomingCallScreen
        callData={mockCallData}
        onAnswer={mockOnAnswer}
        onReject={mockOnReject}
      />,
    );

    const container = getByTestId("incoming-call-container");
    expect(container).toHaveStyle({
      flex: 1,
      backgroundColor: "Theme.colors.neutral[950]",
    });
  });
});
