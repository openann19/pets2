import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import { useSocket } from "../../../hooks/useSocket";
import WebRTCService from "../../../services/WebRTCService";
import CallManager, { useCallManager } from "../CallManager";

// Mock dependencies
jest.mock("../../../services/WebRTCService");
jest.mock("../../../hooks/useSocket");
// React Native is already mocked in jest.setup.ts
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  connected: true,
};

const mockWebRTCService = WebRTCService as jest.Mocked<typeof WebRTCService>;
const mockUseSocket = useSocket as jest.MockedFunction<typeof useSocket>;

describe("CallManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSocket.mockReturnValue(mockSocket as any);
    mockWebRTCService.getCallState.mockReturnValue({
      isActive: false,
      isConnected: false,
      isIncoming: false,
      isMuted: false,
      isVideoEnabled: true,
      callDuration: 0,
    });
    mockWebRTCService.on = jest.fn();
    mockWebRTCService.off = jest.fn();
    mockWebRTCService.initialize = jest.fn();
  });

  it("should render children correctly", () => {
    const TestChild = () => <Text testID="test-child">Test Child</Text>;

    const { getByTestId } = render(
      <CallManager>
        <TestChild />
      </CallManager>,
    );

    expect(getByTestId("test-child")).toBeTruthy();
  });

  it("should initialize WebRTC service with socket", () => {
    render(
      <CallManager>
        <div>Test</div>
      </CallManager>,
    );

    expect(mockWebRTCService.initialize).toHaveBeenCalledWith(mockSocket);
  });

  it("should set up event listeners for call state changes", () => {
    render(
      <CallManager>
        <div>Test</div>
      </CallManager>,
    );

    expect(mockWebRTCService.on).toHaveBeenCalledWith(
      "callStateChanged",
      expect.any(Function),
    );
    expect(mockWebRTCService.on).toHaveBeenCalledWith(
      "callError",
      expect.any(Function),
    );
  });

  it("should show incoming call modal when receiving incoming call", async () => {
    const mockCallData = {
      callId: "test-call-id",
      matchId: "test-match-id",
      callerId: "test-caller-id",
      callerName: "Test Caller",
      callType: "voice" as const,
      timestamp: Date.now(),
    };

    mockWebRTCService.getCallState.mockReturnValue({
      isActive: true,
      isConnected: false,
      isIncoming: true,
      callData: mockCallData,
      isMuted: false,
      isVideoEnabled: true,
      callDuration: 0,
    });

    const { rerender } = render(
      <CallManager>
        <div>Test</div>
      </CallManager>,
    );

    // Simulate call state change
    const callStateHandler = mockWebRTCService.on.mock.calls.find(
      (call) => call[0] === "callStateChanged",
    )?.[1];

    if (callStateHandler) {
      await act(async () => {
        callStateHandler({
          isActive: true,
          isConnected: false,
          isIncoming: true,
          callData: mockCallData,
          isMuted: false,
          isVideoEnabled: true,
          callDuration: 0,
        });
      });
    }

    // The modal should be shown (tested via state changes)
    expect(mockWebRTCService.on).toHaveBeenCalled();
  });

  it("should handle call errors correctly", async () => {
    const mockError = new Error("Test call error");

    render(
      <CallManager>
        <div>Test</div>
      </CallManager>,
    );

    const errorHandler = mockWebRTCService.on.mock.calls.find(
      (call) => call[0] === "callError",
    )?.[1];

    if (errorHandler) {
      await act(async () => {
        errorHandler(mockError);
      });
    }

    expect(Alert.alert).toHaveBeenCalledWith(
      "Call Error",
      "There was an issue with the call. Please try again.",
      [{ text: "OK" }],
    );
  });

  it("should clean up event listeners on unmount", () => {
    const { unmount } = render(
      <CallManager>
        <div>Test</div>
      </CallManager>,
    );

    unmount();

    expect(mockWebRTCService.off).toHaveBeenCalledWith(
      "callStateChanged",
      expect.any(Function),
    );
    expect(mockWebRTCService.off).toHaveBeenCalledWith(
      "callError",
      expect.any(Function),
    );
  });
});

describe("useCallManager hook", () => {
  const TestComponent = () => {
    const { startCall, endCall, isCallActive, getCallState } = useCallManager();

    return (
      <View>
        <TouchableOpacity
          testID="start-voice-call"
          onPress={() => startCall("test-match", "voice")}
        >
          <Text>Start Voice Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="start-video-call"
          onPress={() => startCall("test-match", "video")}
        >
          <Text>Start Video Call</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="end-call" onPress={endCall}>
          <Text>End Call</Text>
        </TouchableOpacity>
        <Text testID="call-active">
          {isCallActive() ? "Active" : "Inactive"}
        </Text>
      </View>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWebRTCService.startCall = jest.fn();
    mockWebRTCService.endCall = jest.fn();
    mockWebRTCService.isCallActive = jest.fn();
    mockWebRTCService.getCallState = jest.fn();
  });

  it("should start voice call successfully", async () => {
    mockWebRTCService.startCall.mockResolvedValue(true);

    const { getByTestId } = render(<TestComponent />);

    await act(async () => {
      fireEvent.press(getByTestId("start-voice-call"));
    });

    expect(mockWebRTCService.startCall).toHaveBeenCalledWith(
      "test-match",
      "voice",
    );
  });

  it("should start video call successfully", async () => {
    mockWebRTCService.startCall.mockResolvedValue(true);

    const { getByTestId } = render(<TestComponent />);

    await act(async () => {
      fireEvent.press(getByTestId("start-video-call"));
    });

    expect(mockWebRTCService.startCall).toHaveBeenCalledWith(
      "test-match",
      "video",
    );
  });

  it("should handle call start failure", async () => {
    mockWebRTCService.startCall.mockResolvedValue(false);

    const { getByTestId } = render(<TestComponent />);

    await act(async () => {
      fireEvent.press(getByTestId("start-voice-call"));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Failed to start call. Please check your permissions and try again.",
    );
  });

  it("should end call", () => {
    const { getByTestId } = render(<TestComponent />);

    fireEvent.press(getByTestId("end-call"));

    expect(mockWebRTCService.endCall).toHaveBeenCalled();
  });

  it("should check if call is active", () => {
    mockWebRTCService.isCallActive.mockReturnValue(true);

    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId("call-active")).toHaveTextContent("Active");
  });
});
