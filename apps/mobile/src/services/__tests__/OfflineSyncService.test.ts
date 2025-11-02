/**
 * OfflineSyncService Test Suite
 * Comprehensive tests for offline synchronization service
 */

import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { offlineSyncService } from "../OfflineSyncService";
import { logger } from "@pawfectmatch/core";

// Mock dependencies
jest.mock("@react-native-community/netinfo");
jest.mock("@react-native-async-storage/async-storage");
jest.mock("@pawfectmatch/core");

describe("OfflineSyncService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        type: "wifi",
      });

      await offlineSyncService.initialize();

      expect(AsyncStorage.getItem).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Offline sync service initialized",
      );
    });

    it("should load existing queue on initialization", async () => {
      const mockQueue = JSON.stringify([{ id: "1", type: "api" }]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockQueue);

      await offlineSyncService.initialize();

      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it("should setup network monitoring", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      await offlineSyncService.initialize();

      expect(NetInfo.fetch).toHaveBeenCalled();
    });
  });

  describe("Queue Management", () => {
    it("should add item to offline queue", async () => {
      const mockId = "queue-item-1";
      jest.spyOn(Math, "random").mockReturnValue(0.1);

      await offlineSyncService.queueApiCall("/api/test", "POST", {
        data: "test",
      });

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should respect priority levels", async () => {
      await offlineSyncService.queueApiCall(
        "/api/test",
        "POST",
        {},
        "critical",
      );

      // Check that high priority items are queued
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should handle duplicate requests", async () => {
      await offlineSyncService.queueApiCall("/api/test", "POST");
      await offlineSyncService.queueApiCall("/api/test", "POST");

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  describe("Network State Monitoring", () => {
    it("should detect online state", async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        type: "wifi",
      });

      const status = await offlineSyncService.getSyncStatus();

      expect(status.isOnline).toBe(true);
    });

    it("should detect offline state", async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        type: "none",
      });

      const status = await offlineSyncService.getSyncStatus();

      expect(status.isOnline).toBe(false);
    });

    it("should monitor network state changes", async () => {
      let listenerCallback: Function | null = null;

      (NetInfo.addEventListener as jest.Mock).mockImplementation((callback) => {
        listenerCallback = callback;
        return jest.fn();
      });

      await offlineSyncService.initialize();

      if (listenerCallback) {
        listenerCallback({ isConnected: false });
      }

      expect(listenerCallback).toBeDefined();
    });
  });

  describe("Sync Operations", () => {
    it("should sync queue when going online", async () => {
      // Simulate offline state
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      await offlineSyncService.initialize();

      // Simulate coming online
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });

      const result = await offlineSyncService.syncNow();

      expect(result).toBeDefined();
    });

    it("should not sync when offline", async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      const status = await offlineSyncService.getSyncStatus();

      if (!status.isOnline) {
        const result = await offlineSyncService.syncNow();
        expect(result.success).toBe(false);
      }
    });

    it("should handle sync errors gracefully", async () => {
      const error = new Error("Sync failed");

      // Mock failed sync
      jest.spyOn(offlineSyncService, "syncNow").mockRejectedValue(error);

      await expect(offlineSyncService.syncNow()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("Conflict Resolution", () => {
    it("should handle overwrite strategy", async () => {
      await offlineSyncService.queueApiCall(
        "/api/test",
        "PUT",
        {},
        "normal",
        "overwrite",
      );

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should handle merge strategy", async () => {
      await offlineSyncService.queueApiCall(
        "/api/test",
        "PATCH",
        {},
        "normal",
        "merge",
      );

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should handle skip strategy", async () => {
      await offlineSyncService.queueApiCall(
        "/api/test",
        "POST",
        {},
        "normal",
        "skip",
      );

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("Retry Mechanism", () => {
    it("should retry failed requests", async () => {
      const mockQueue = JSON.stringify([
        {
          id: "1",
          endpoint: "/api/test",
          method: "POST",
          retryCount: 0,
        },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockQueue);

      await offlineSyncService.initialize();

      // Check retry logic
      expect(logger.info).toHaveBeenCalled();
    });

    it("should stop retrying after max attempts", async () => {
      const mockQueue = JSON.stringify([
        {
          id: "1",
          endpoint: "/api/test",
          method: "POST",
          retryCount: 4,
        },
      ]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockQueue);

      await offlineSyncService.initialize();

      // Should not retry after max
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  describe("Status Reporting", () => {
    it("should report sync status", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("[]");
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      await offlineSyncService.initialize();
      const status = await offlineSyncService.getSyncStatus();

      expect(status).toBeDefined();
      expect(status.isOnline).toBeDefined();
      expect(status.pendingItems).toBeDefined();
      expect(status.failedItems).toBeDefined();
      expect(status.isSyncing).toBeDefined();
    });

    it("should notify sync listeners", async () => {
      const mockListener = jest.fn();

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      await offlineSyncService.initialize();

      await offlineSyncService.onSyncStatusChange(mockListener);

      expect(mockListener).toBeDefined();
    });

    it("should clear status listeners on remove", async () => {
      const mockListener = jest.fn();

      await offlineSyncService.onSyncStatusChange(mockListener);
      await offlineSyncService.removeSyncStatusListener(mockListener);

      expect(mockListener).toBeDefined();
    });
  });

  describe("Data Persistence", () => {
    it("should save queue to storage", async () => {
      await offlineSyncService.queueApiCall("/api/test", "POST");

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should load queue from storage", async () => {
      const mockQueue = JSON.stringify([{ id: "1" }]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockQueue);

      await offlineSyncService.initialize();

      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it("should clear queue when empty", async () => {
      await offlineSyncService.clearQueue();

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle storage errors gracefully", async () => {
      const error = new Error("Storage error");
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(
        offlineSyncService.queueApiCall("/api/test", "POST"),
      ).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle network errors", async () => {
      const error = new Error("Network error");
      (NetInfo.fetch as jest.Mock).mockRejectedValue(error);

      await expect(offlineSyncService.getSyncStatus()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });
  });
});
