/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useMatchesActions } from "../useMatchesActions";

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

jest.mock("../../services/logger", () => ({
  logger: mockLogger,
}));

// Mock matchesAPI
const mockUnmatch = jest.fn();
const mockBlock = jest.fn();
const mockReport = jest.fn();

jest.mock("../../services/api", () => ({
  matchesAPI: {
    unmatch: mockUnmatch,
    block: mockBlock,
    report: mockReport,
  },
}));

describe("useMatchesActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with action handlers", () => {
    const { result } = renderHook(() => useMatchesActions());

    expect(result.current.handleUnmatch).toBeDefined();
    expect(result.current.handleBlock).toBeDefined();
    expect(result.current.handleReport).toBeDefined();
  });

  it("should show confirmation dialog for unmatch", async () => {
    const { result } = renderHook(() => useMatchesActions());

    await act(async () => {
      await result.current.handleUnmatch("match123", "Buddy");
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Unmatch",
      "Are you sure you want to unmatch with Buddy?",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Unmatch" }),
      ]),
    );
  });

  it("should unmatch when confirmed", async () => {
    mockUnmatch.mockResolvedValue(undefined);
    const onMatchRemoved = jest.fn();

    // Mock Alert to auto-confirm
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const unmatchButton = buttons?.find((b: any) => b.text === "Unmatch");
      if (unmatchButton?.onPress) {
        unmatchButton.onPress();
      }
    });

    const { result } = renderHook(() => useMatchesActions({ onMatchRemoved }));

    await act(async () => {
      await result.current.handleUnmatch("match123", "Buddy");
    });

    expect(mockUnmatch).toHaveBeenCalledWith("match123");
    expect(mockLogger.info).toHaveBeenCalledWith("Match removed", {
      matchId: "match123",
      petName: "Buddy",
    });
    expect(onMatchRemoved).toHaveBeenCalledWith("match123");
  });

  it("should handle unmatch error", async () => {
    mockUnmatch.mockRejectedValue(new Error("API error"));

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const unmatchButton = buttons?.find((b: any) => b.text === "Unmatch");
      if (unmatchButton?.onPress) {
        unmatchButton.onPress();
      }
    });

    const { result } = renderHook(() => useMatchesActions());

    await act(async () => {
      await result.current.handleUnmatch("match123", "Buddy");
    });

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to unmatch",
      expect.any(Object),
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Failed to unmatch. Please try again.",
    );
  });

  it("should show confirmation dialog for block", async () => {
    const { result } = renderHook(() => useMatchesActions());

    await act(async () => {
      await result.current.handleBlock("match123", "Max");
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Block",
      "Are you sure you want to block Max? This action cannot be undone.",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Block" }),
      ]),
    );
  });

  it("should block user when confirmed", async () => {
    mockBlock.mockResolvedValue(undefined);
    const onMatchBlocked = jest.fn();

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const blockButton = buttons?.find((b: any) => b.text === "Block");
      if (blockButton?.onPress) {
        blockButton.onPress();
      }
    });

    const { result } = renderHook(() => useMatchesActions({ onMatchBlocked }));

    await act(async () => {
      await result.current.handleBlock("match123", "Max");
    });

    expect(mockBlock).toHaveBeenCalledWith("match123");
    expect(mockLogger.info).toHaveBeenCalledWith("User blocked", {
      matchId: "match123",
      petName: "Max",
    });
    expect(onMatchBlocked).toHaveBeenCalledWith("match123");
  });

  it("should handle block error", async () => {
    mockBlock.mockRejectedValue(new Error("API error"));

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const blockButton = buttons?.find((b: any) => b.text === "Block");
      if (blockButton?.onPress) {
        blockButton.onPress();
      }
    });

    const { result } = renderHook(() => useMatchesActions());

    await act(async () => {
      await result.current.handleBlock("match123", "Max");
    });

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to block user",
      expect.any(Object),
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Failed to block user. Please try again.",
    );
  });

  it("should show report options dialog", async () => {
    const { result } = renderHook(() => useMatchesActions());

    await act(async () => {
      await result.current.handleReport("match123", "Charlie");
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Report",
      "Why are you reporting Charlie?",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel" }),
        expect.objectContaining({ text: "Spam" }),
        expect.objectContaining({ text: "Inappropriate Content" }),
        expect.objectContaining({ text: "Other" }),
      ]),
    );
  });

  it("should report as spam when selected", async () => {
    mockReport.mockResolvedValue(undefined);
    const onMatchReported = jest.fn();

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const spamButton = buttons?.find((b: any) => b.text === "Spam");
      if (spamButton?.onPress) {
        spamButton.onPress();
      }
    });

    const { result } = renderHook(() => useMatchesActions({ onMatchReported }));

    await act(async () => {
      await result.current.handleReport("match123", "Charlie");
    });

    expect(mockReport).toHaveBeenCalledWith("match123", "spam");
    expect(mockLogger.info).toHaveBeenCalledWith("User reported", {
      matchId: "match123",
      petName: "Charlie",
      reason: "spam",
    });
    expect(onMatchReported).toHaveBeenCalledWith("match123");
    expect(Alert.alert).toHaveBeenCalledWith(
      "Reported",
      "Thank you for reporting. We'll review this.",
    );
  });

  it("should report as inappropriate when selected", async () => {
    mockReport.mockResolvedValue(undefined);
    const onMatchReported = jest.fn();

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const inappropriateButton = buttons?.find(
        (b: any) => b.text === "Inappropriate Content",
      );
      if (inappropriateButton?.onPress) {
        inappropriateButton.onPress();
      }
    });

    const { result } = renderHook(() => useMatchesActions({ onMatchReported }));

    await act(async () => {
      await result.current.handleReport("match123", "Charlie");
    });

    expect(mockReport).toHaveBeenCalledWith("match123", "inappropriate");
    expect(mockLogger.info).toHaveBeenCalledWith("User reported", {
      matchId: "match123",
      petName: "Charlie",
      reason: "inappropriate",
    });
    expect(onMatchReported).toHaveBeenCalledWith("match123");
  });

  it("should report as other when selected", async () => {
    mockReport.mockResolvedValue(undefined);
    const onMatchReported = jest.fn();

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const otherButton = buttons?.find((b: any) => b.text === "Other");
      if (otherButton?.onPress) {
        otherButton.onPress();
      }
    });

    const { result } = renderHook(() => useMatchesActions({ onMatchReported }));

    await act(async () => {
      await result.current.handleReport("match123", "Charlie");
    });

    expect(mockReport).toHaveBeenCalledWith("match123", "other");
    expect(mockLogger.info).toHaveBeenCalledWith("User reported", {
      matchId: "match123",
      petName: "Charlie",
      reason: "other",
    });
    expect(onMatchReported).toHaveBeenCalledWith("match123");
  });

  it("should handle report error", async () => {
    mockReport.mockRejectedValue(new Error("API error"));

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const spamButton = buttons?.find((b: any) => b.text === "Spam");
      if (spamButton?.onPress) {
        spamButton.onPress();
      }
    });

    const { result } = renderHook(() => useMatchesActions());

    await act(async () => {
      await result.current.handleReport("match123", "Charlie");
    });

    expect(mockLogger.error).toHaveBeenCalledWith(
      "Failed to report",
      expect.any(Object),
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      "Error",
      "Failed to report. Please try again.",
    );
  });

  it("should work without callbacks", async () => {
    mockUnmatch.mockResolvedValue(undefined);

    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const unmatchButton = buttons?.find((b: any) => b.text === "Unmatch");
      if (unmatchButton?.onPress) {
        unmatchButton.onPress();
      }
    });

    const { result } = renderHook(() => useMatchesActions());

    await act(async () => {
      await result.current.handleUnmatch("match123", "Buddy");
    });

    expect(mockUnmatch).toHaveBeenCalled();
    // Should not throw even without callback
  });

  it("should return stable function references", () => {
    const { result, rerender } = renderHook(() => useMatchesActions());

    const firstHandleUnmatch = result.current.handleUnmatch;
    const firstHandleBlock = result.current.handleBlock;
    const firstHandleReport = result.current.handleReport;

    rerender();

    expect(result.current.handleUnmatch).toBe(firstHandleUnmatch);
    expect(result.current.handleBlock).toBe(firstHandleBlock);
    expect(result.current.handleReport).toBe(firstHandleReport);
  });

  it("should use destructive style for unmatch button", async () => {
    const { result } = renderHook(() => useMatchesActions());

    await act(async () => {
      await result.current.handleUnmatch("match123", "Buddy");
    });

    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const unmatchButton = buttons?.find((b: any) => b.text === "Unmatch");

    expect(unmatchButton?.style).toBe("destructive");
  });

  it("should use destructive style for block button", async () => {
    const { result } = renderHook(() => useMatchesActions());

    await act(async () => {
      await result.current.handleBlock("match123", "Max");
    });

    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const buttons = alertCall[2];
    const blockButton = buttons?.find((b: any) => b.text === "Block");

    expect(blockButton?.style).toBe("destructive");
  });

  it("should have cancel option for all actions", async () => {
    const { result } = renderHook(() => useMatchesActions());

    // Test unmatch
    await act(async () => {
      await result.current.handleUnmatch("match123", "Buddy");
    });

    let alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    let buttons = alertCall[2];
    expect(buttons?.find((b: any) => b.text === "Cancel")).toBeDefined();

    // Test block
    await act(async () => {
      await result.current.handleBlock("match123", "Max");
    });

    alertCall = (Alert.alert as jest.Mock).mock.calls[1];
    buttons = alertCall[2];
    expect(buttons?.find((b: any) => b.text === "Cancel")).toBeDefined();

    // Test report
    await act(async () => {
      await result.current.handleReport("match123", "Charlie");
    });

    alertCall = (Alert.alert as jest.Mock).mock.calls[2];
    buttons = alertCall[2];
    expect(buttons?.find((b: any) => b.text === "Cancel")).toBeDefined();
  });
});
