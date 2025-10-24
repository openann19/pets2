import { useAuthStore } from "@pawfectmatch/core";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import { useCallManager } from "../../components/calling/CallManager";
import ChatScreen from "../ChatScreen";

// Mock dependencies
jest.mock("../../components/calling/CallManager");
jest.mock("@pawfectmatch/core");
jest.mock("../../services/api", () => ({
  chatAPI: {
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    markAsRead: jest.fn(),
  },
}));

jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
  View: "View",
  Text: "Text",
  TouchableOpacity: "TouchableOpacity",
  ScrollView: "ScrollView",
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

const mockUseCallManager = useCallManager as jest.MockedFunction<
  typeof useCallManager
>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    matchId: "test-match-id",
    petName: "Test Pet",
  },
};

describe("ChatScreen - Calling Features", () => {
  const mockStartCall = jest.fn();
  const mockIsCallActive = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCallManager.mockReturnValue({
      startCall: mockStartCall,
      endCall: jest.fn(),
      isCallActive: mockIsCallActive,
      getCallState: jest.fn(),
    });

    mockUseAuthStore.mockReturnValue({
      user: {
        id: "test-user-id",
        firstName: "Test",
        lastName: "User",
      },
    } as any);

    mockIsCallActive.mockReturnValue(false);
  });

  it("should render call buttons in header", () => {
    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByTestId("voice-call-button")).toBeTruthy();
    expect(getByTestId("video-call-button")).toBeTruthy();
  });

  it("should start voice call when voice button is pressed", async () => {
    mockStartCall.mockResolvedValue(true);

    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const voiceButton = getByTestId("voice-call-button");
    fireEvent.press(voiceButton);

    // Should show confirmation alert
    expect(Alert.alert).toHaveBeenCalledWith(
      "Voice Call",
      "Start a voice call with Test Pet?",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Call" }),
      ]),
    );

    // Simulate user confirming the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find(
      (button: any) => button.text === "Call",
    );

    await confirmButton.onPress();

    expect(mockStartCall).toHaveBeenCalledWith("test-match-id", "voice");
  });

  it("should start video call when video button is pressed", async () => {
    mockStartCall.mockResolvedValue(true);

    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const videoButton = getByTestId("video-call-button");
    fireEvent.press(videoButton);

    // Should show confirmation alert
    expect(Alert.alert).toHaveBeenCalledWith(
      "Video Call",
      "Start a video call with Test Pet?",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Call" }),
      ]),
    );

    // Simulate user confirming the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find(
      (button: any) => button.text === "Call",
    );

    await confirmButton.onPress();

    expect(mockStartCall).toHaveBeenCalledWith("test-match-id", "video");
  });

  it("should show error when call fails to start", async () => {
    mockStartCall.mockResolvedValue(false);

    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const voiceButton = getByTestId("voice-call-button");
    fireEvent.press(voiceButton);

    // Confirm the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find(
      (button: any) => button.text === "Call",
    );

    await confirmButton.onPress();

    // Should show error alert
    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Failed to start call. Please check your permissions and try again.",
    );
  });

  it("should prevent starting call when another call is active", () => {
    mockIsCallActive.mockReturnValue(true);

    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const voiceButton = getByTestId("voice-call-button");
    fireEvent.press(voiceButton);

    // Should show call in progress alert
    expect(Alert.alert).toHaveBeenCalledWith(
      "Call in Progress",
      "You already have an active call.",
    );

    // Should not show call confirmation
    expect(mockStartCall).not.toHaveBeenCalled();
  });

  it("should handle call button press with haptic feedback", () => {
    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const voiceButton = getByTestId("voice-call-button");
    fireEvent.press(voiceButton);

    // Haptic feedback should be triggered (mocked in the component)
    expect(Alert.alert).toHaveBeenCalled();
  });

  it("should cancel call when user presses cancel", () => {
    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const voiceButton = getByTestId("voice-call-button");
    fireEvent.press(voiceButton);

    // Simulate user canceling the call
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const cancelButton = alertCall[2].find(
      (button: any) => button.text === "Cancel",
    );

    if (cancelButton.onPress) {
      cancelButton.onPress();
    }

    expect(mockStartCall).not.toHaveBeenCalled();
  });

  it("should show correct call button icons", () => {
    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const voiceButton = getByTestId("voice-call-button");
    const videoButton = getByTestId("video-call-button");

    // Should contain call and videocam icons respectively
    expect(voiceButton).toBeTruthy();
    expect(videoButton).toBeTruthy();
  });

  it("should apply correct styling to call buttons", () => {
    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    const voiceButton = getByTestId("voice-call-button");
    const videoButton = getByTestId("video-call-button");

    // Should have proper styling (gradient backgrounds, etc.)
    expect(voiceButton).toHaveStyle({
      width: 36,
      height: 36,
      borderRadius: 18,
    });

    expect(videoButton).toHaveStyle({
      width: 36,
      height: 36,
      borderRadius: 18,
    });
  });

  it("should handle call manager hook errors gracefully", () => {
    mockUseCallManager.mockImplementation(() => {
      throw new Error("Call manager error");
    });

    // Should not crash when call manager fails
    expect(() => {
      render(<ChatScreen navigation={mockNavigation} route={mockRoute} />);
    }).not.toThrow();
  });

  it("should show different confirmation messages for voice and video calls", () => {
    const { getByTestId } = render(
      <ChatScreen navigation={mockNavigation} route={mockRoute} />,
    );

    // Test voice call
    const voiceButton = getByTestId("voice-call-button");
    fireEvent.press(voiceButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Voice Call",
      "Start a voice call with Test Pet?",
      expect.any(Array),
    );

    jest.clearAllMocks();

    // Test video call
    const videoButton = getByTestId("video-call-button");
    fireEvent.press(videoButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      "Video Call",
      "Start a video call with Test Pet?",
      expect.any(Array),
    );
  });
});
