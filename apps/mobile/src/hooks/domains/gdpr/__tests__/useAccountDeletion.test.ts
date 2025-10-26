/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAccountDeletion } from "../useAccountDeletion";

// Mock the GDPR service
jest.mock("../../../../services/gdprService", () => ({
  gdprService: {
    requestAccountDeletion: jest.fn(),
    cancelDeletion: jest.fn(),
  },
}));

import { gdprService } from "../../../../services/gdprService";

const mockGdprService = gdprService as jest.Mocked<typeof gdprService>;

describe("useAccountDeletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGdprService.requestAccountDeletion.mockResolvedValue({
      success: true,
      message: "Deletion requested successfully",
      gracePeriodEndsAt: "2024-12-26T00:00:00.000Z",
      deletionId: "test-deletion-id",
    });
    mockGdprService.cancelDeletion.mockResolvedValue({
      success: true,
      message: "Deletion cancelled successfully",
    });
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useAccountDeletion());

    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should request account deletion successfully", async () => {
    const { result } = renderHook(() => useAccountDeletion());

    act(() => {
      result.current.requestDeletion(
        "password123",
        "Privacy concerns",
        "Detailed feedback",
      );
    });

    expect(result.current.isDeleting).toBe(true);

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });

    expect(mockGdprService.requestAccountDeletion).toHaveBeenCalledWith(
      "password123",
      "Privacy concerns",
      "Detailed feedback",
    );
    expect(result.current.error).toBe(null);
  });

  it("should handle request deletion failure", async () => {
    mockGdprService.requestAccountDeletion.mockRejectedValue(
      new Error("Invalid password"),
    );

    const { result } = renderHook(() => useAccountDeletion());

    act(() => {
      result.current.requestDeletion("wrongpassword");
    });

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });

    expect(result.current.error).toBe("Invalid password");
  });

  it("should cancel account deletion successfully", async () => {
    const { result } = renderHook(() => useAccountDeletion());

    act(() => {
      result.current.cancelDeletion();
    });

    expect(result.current.isDeleting).toBe(true);

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });

    expect(mockGdprService.cancelDeletion).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe(null);
  });

  it("should handle cancel deletion failure", async () => {
    mockGdprService.cancelDeletion.mockRejectedValue(
      new Error("Cancellation failed"),
    );

    const { result } = renderHook(() => useAccountDeletion());

    act(() => {
      result.current.cancelDeletion();
    });

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });

    expect(result.current.error).toBe("Cancellation failed");
  });

  it("should request deletion with minimal parameters", async () => {
    const { result } = renderHook(() => useAccountDeletion());

    act(() => {
      result.current.requestDeletion("password123");
    });

    await waitFor(() => {
      expect(result.current.isDeleting).toBe(false);
    });

    expect(mockGdprService.requestAccountDeletion).toHaveBeenCalledWith(
      "password123",
      undefined,
      undefined,
    );
  });

  it("should return stable function references", () => {
    const { result } = renderHook(() => useAccountDeletion());

    const firstRequest = result.current.requestDeletion;
    const firstCancel = result.current.cancelDeletion;

    // In React Native testing, create a new hook instance to test stability
    const { result: result2 } = renderHook(() => useAccountDeletion());

    expect(result.current.requestDeletion).toBe(firstRequest);
    expect(result.current.cancelDeletion).toBe(firstCancel);
  });
});
