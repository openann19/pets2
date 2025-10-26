/**
 * useBlockedUsersScreen Tests
 * Comprehensive unit tests for blocked users functionality
 */

import { renderHook, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { matchesAPI } from "../../../services/api";
import { useBlockedUsersScreen } from "../useBlockedUsersScreen";

// Mock dependencies
jest.mock("../../../services/api");
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

const mockMatchesAPI = matchesAPI as jest.Mocked<typeof matchesAPI>;

describe("useBlockedUsersScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty blocked users list", () => {
      const { result } = renderHook(() => useBlockedUsersScreen());
      
      expect(result.current.blockedUsers).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.refreshing).toBe(false);
    });
  });

  describe("loadBlockedUsers", () => {
    it("should load blocked users successfully", async () => {
      const mockUsers = [
        { _id: "1", name: "User 1", email: "user1@test.com" },
        { _id: "2", name: "User 2", email: "user2@test.com" },
      ];
      
      mockMatchesAPI.getBlockedUsers.mockResolvedValue(mockUsers as any);

      const { result } = renderHook(() => useBlockedUsersScreen());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.blockedUsers).toHaveLength(2);
      expect(mockMatchesAPI.getBlockedUsers).toHaveBeenCalled();
    });

    it("should handle API errors gracefully", async () => {
      mockMatchesAPI.getBlockedUsers.mockRejectedValue(
        new Error("API Error")
      );

      const { result } = renderHook(() => useBlockedUsersScreen());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to load blocked users. Please try again."
      );
    });
  });

  describe("refreshBlockedUsers", () => {
    it("should refresh blocked users list", async () => {
      const mockUsers = [{ _id: "1", name: "User 1", email: "user1@test.com" }];
      mockMatchesAPI.getBlockedUsers.mockResolvedValue(mockUsers as any);

      const { result } = renderHook(() => useBlockedUsersScreen());

      await waitFor(() => expect(result.current.loading).toBe(false));

      result.current.refreshBlockedUsers();

      await waitFor(() => expect(result.current.refreshing).toBe(false));
      expect(mockMatchesAPI.getBlockedUsers).toHaveBeenCalledTimes(2);
    });
  });

  describe("unblockUser", () => {
    it("should unblock user successfully", async () => {
      mockMatchesAPI.unblockUser.mockResolvedValue(undefined);
      mockMatchesAPI.getBlockedUsers.mockResolvedValue([] as any);

      const { result } = renderHook(() => useBlockedUsersScreen());

      await result.current.unblockUser("user123");

      expect(mockMatchesAPI.unblockUser).toHaveBeenCalledWith("user123");
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "User has been unblocked"
      );
    });

    it("should handle unblock errors", async () => {
      mockMatchesAPI.unblockUser.mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() => useBlockedUsersScreen());

      await result.current.unblockUser("user123");

      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Failed to unblock user. Please try again."
      );
    });
  });
});

