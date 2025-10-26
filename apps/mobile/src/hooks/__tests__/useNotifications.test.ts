/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useNotifications } from "../useNotifications";

// Mock notification service
const mockInitializeNotificationsService = jest.fn();
const mockSendMatchNotification = jest.fn();
const mockSendMessageNotification = jest.fn();
const mockSendLikeNotification = jest.fn();
const mockScheduleReminderNotification = jest.fn();
const mockSetBadgeCount = jest.fn();
const mockClearBadge = jest.fn();
const mockCleanup = jest.fn();

const mockNotificationService = {
  sendMatchNotification: mockSendMatchNotification,
  sendMessageNotification: mockSendMessageNotification,
  sendLikeNotification: mockSendLikeNotification,
  scheduleReminderNotification: mockScheduleReminderNotification,
  setBadgeCount: mockSetBadgeCount,
  clearBadge: mockClearBadge,
  cleanup: mockCleanup,
};

jest.mock("../../services/notifications", () => ({
  initializeNotificationsService: mockInitializeNotificationsService,
  notificationService: mockNotificationService,
}));

describe("useNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInitializeNotificationsService.mockResolvedValue(
      "ExpoPushToken[test123]",
    );
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.isInitialized).toBe(false);
    expect(result.current.pushToken).toBe(null);
  });

  it("should initialize notifications on mount", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(mockInitializeNotificationsService).toHaveBeenCalled();
    expect(result.current.pushToken).toBe("ExpoPushToken[test123]");
  });

  it("should cleanup on unmount", () => {
    const { unmount } = renderHook(() => useNotifications());

    unmount();

    expect(mockCleanup).toHaveBeenCalled();
  });

  it("should provide sendMatchNotification function", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.sendMatchNotification).toBeDefined();
    expect(typeof result.current.sendMatchNotification).toBe("function");
  });

  it("should provide sendMessageNotification function", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.sendMessageNotification).toBeDefined();
    expect(typeof result.current.sendMessageNotification).toBe("function");
  });

  it("should provide sendLikeNotification function", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.sendLikeNotification).toBeDefined();
    expect(typeof result.current.sendLikeNotification).toBe("function");
  });

  it("should provide scheduleReminderNotification function", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.scheduleReminderNotification).toBeDefined();
    expect(typeof result.current.scheduleReminderNotification).toBe("function");
  });

  it("should provide setBadgeCount function", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.setBadgeCount).toBeDefined();
    expect(typeof result.current.setBadgeCount).toBe("function");
  });

  it("should provide clearBadge function", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.clearBadge).toBeDefined();
    expect(typeof result.current.clearBadge).toBe("function");
  });

  it("should handle initialization error gracefully", async () => {
    mockInitializeNotificationsService.mockRejectedValue(
      new Error("Permission denied"),
    );

    const { result } = renderHook(() => useNotifications());

    // Should not crash
    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.pushToken).toBe(null);
  });

  it("should handle null push token", async () => {
    mockInitializeNotificationsService.mockResolvedValue(null);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.pushToken).toBe(null);
  });

  it("should provide all notification methods", async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    const methods = [
      "sendMatchNotification",
      "sendMessageNotification",
      "sendLikeNotification",
      "scheduleReminderNotification",
      "setBadgeCount",
      "clearBadge",
    ];

    methods.forEach((method) => {
      expect(result.current[method]).toBeDefined();
      expect(typeof result.current[method]).toBe("function");
    });
  });

  it("should only initialize once", async () => {
    const { rerender } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(mockInitializeNotificationsService).toHaveBeenCalledTimes(1);
    });

    rerender();

    // Should still be called only once
    expect(mockInitializeNotificationsService).toHaveBeenCalledTimes(1);
  });

  it("should set push token after initialization", async () => {
    const testToken = "ExpoPushToken[xyz789]";
    mockInitializeNotificationsService.mockResolvedValue(testToken);

    const { result } = renderHook(() => useNotifications());

    expect(result.current.pushToken).toBe(null);

    await waitFor(() => {
      expect(result.current.pushToken).toBe(testToken);
    });
  });

  it("should mark as initialized after setup completes", async () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.isInitialized).toBe(false);

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });
  });

  it("should cleanup notifications on unmount", () => {
    const { unmount } = renderHook(() => useNotifications());

    expect(mockCleanup).not.toHaveBeenCalled();

    unmount();

    expect(mockCleanup).toHaveBeenCalledTimes(1);
  });
});
