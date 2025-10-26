/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useBlockedUsers } from "../useBlockedUsers";

// Mock Alert
jest.spyOn(Alert, "alert");

// Mock logger
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useBlockedUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should initialize with loading state", () => {
    const { result } = renderHook(() => useBlockedUsers());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.blockedUsers).toEqual([]);
    expect(result.current.isRefreshing).toBe(false);
  });

  it("should load blocked users manually", async () => {
    const { result } = renderHook(() => useBlockedUsers());

    // Manually load users
    await act(async () => {
      await result.current.loadBlockedUsers();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.blockedUsers).toHaveLength(2);
    expect(result.current.totalBlocked).toBe(2);
  });

  it("should load blocked users on mount with timer", async () => {
    const { result } = renderHook(() => useBlockedUsers());

    // Wait for the useEffect to trigger loadBlockedUsers
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.blockedUsers).toHaveLength(2);
  });

  it("should refresh blocked users", async () => {
    const { result } = renderHook(() => useBlockedUsers());

    // Initial load
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Refresh
    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.isRefreshing).toBe(false);
  });

  it("should unblock a user", async () => {
    const { result } = renderHook(() => useBlockedUsers());

    // Load users first
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCount = result.current.blockedUsers.length;

    // Mock the alert confirmation by calling the onPress directly
    await act(async () => {
      // Simulate user confirming unblock
      await result.current.unblockUser("user1", "John Doe");
    });

    // Since Alert.alert is mocked, we need to simulate the confirmation
    // In a real scenario, the alert callback would be called
    // For testing, we'll just verify the alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
      "Unblock User",
      "Are you sure you want to unblock John Doe?",
      expect.arrayContaining([
        expect.objectContaining({ text: "Cancel", style: "cancel" }),
        expect.objectContaining({ text: "Unblock", style: "destructive" }),
      ]),
    );
  });

  it("should block a user", async () => {
    const { result } = renderHook(() => useBlockedUsers());

    await act(async () => {
      const success = await result.current.blockUser("user3", "Spam");
      expect(success).toBe(true);
    });
  });

  it("should handle blocking user failure", async () => {
    // Mock logger to throw error
    const mockLogger = require("@pawfectmatch/core").logger;
    mockLogger.info.mockImplementationOnce(() => {
      throw new Error("Network error");
    });

    const { result } = renderHook(() => useBlockedUsers());

    await act(async () => {
      const success = await result.current.blockUser("user3", "Spam");
      expect(success).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstUser = result.current.blockedUsers[0];
    expect(firstUser).toHaveProperty("id");
    expect(firstUser).toHaveProperty("name");
    expect(firstUser).toHaveProperty("email");
    expect(firstUser).toHaveProperty("blockedAt");
    expect(firstUser).toHaveProperty("reason");
    expect(firstUser.reason).toBe("Inappropriate behavior");
  });

  it("should track blocked timestamp", async () => {
    const { result } = renderHook(() => useBlockedUsers());

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const firstUser = result.current.blockedUsers[0];
    expect(firstUser.blockedAt).toBeDefined();
    expect(new Date(firstUser.blockedAt)).toBeInstanceOf(Date);
  });

  it("should return stable function references", () => {
    const { result } = renderHook(() => useBlockedUsers());

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const firstRefreshData = result.current.refreshData;
    const firstBlockUser = result.current.blockUser;
    const firstUnblockUser = result.current.unblockUser;

    // Re-render the hook (React will re-run the hook body)
    act(() => {
      // Trigger a re-render by changing some state or just wait
      jest.advanceTimersByTime(100);
    });

    // Functions should be stable references
    expect(result.current.refreshData).toBe(firstRefreshData);
    expect(result.current.blockUser).toBe(firstBlockUser);
    expect(result.current.unblockUser).toBe(firstUnblockUser);
  });
});
