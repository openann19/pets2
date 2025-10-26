/**
 * Admin Uploads Screen Hook
 * Manages content moderation for user-uploaded media
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import type { AdminScreenProps } from "../../navigation/types";
import { useErrorHandler } from "../useErrorHandler";

interface MediaUpload {
  id: string;
  userId: string;
  userName: string;
  petId?: string;
  petName?: string;
  type: "image" | "video" | "document";
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  status: "pending" | "approved" | "rejected" | "flagged";
  moderationReason?: string;
  aiModerationScore?: number;
  manualReviewRequired: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

interface UploadStats {
  totalUploads: number;
  pendingReview: number;
  flaggedContent: number;
  approvedToday: number;
  rejectedToday: number;
  aiModerationRate: number;
}

interface UseAdminUploadsScreenParams {
  navigation: AdminScreenProps<"AdminUploads">["navigation"];
}

export interface AdminUploadsScreenState {
  // Data
  uploads: MediaUpload[];
  selectedUpload: MediaUpload | null;
  stats: UploadStats;

  // Filters
  typeFilter: "all" | "image" | "video" | "document";
  statusFilter: "all" | "pending" | "approved" | "rejected" | "flagged";
  searchQuery: string;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessingAction: boolean;

  // Actions
  onRefresh: () => Promise<void>;
  onTypeFilterChange: (type: "all" | "image" | "video" | "document") => void;
  onStatusFilterChange: (status: "all" | "pending" | "approved" | "rejected" | "flagged") => void;
  onSearchChange: (query: string) => void;
  onUploadSelect: (upload: MediaUpload) => void;
  onUploadClose: () => void;
  onApproveUpload: (uploadId: string) => Promise<void>;
  onRejectUpload: (uploadId: string, reason: string) => Promise<void>;
  onFlagUpload: (uploadId: string, reason: string) => Promise<void>;
  onBulkApprove: (uploadIds: string[]) => Promise<void>;
  onBulkReject: (uploadIds: string[], reason: string) => Promise<void>;
  onBackPress: () => void;
}

/**
 * Hook for admin uploads screen
 * Provides comprehensive content moderation capabilities
 */
export function useAdminUploadsScreen({
  navigation,
}: UseAdminUploadsScreenParams): AdminUploadsScreenState {
  const { handleNetworkError, handleOfflineError } = useErrorHandler();

  const [uploads, setUploads] = useState<MediaUpload[]>([]);
  const [selectedUpload, setSelectedUpload] = useState<MediaUpload | null>(
    null,
  );
  const [selectedUploadIds, setSelectedUploadIds] = useState<Set<string>>(
    new Set(),
  );

  const [stats, setStats] = useState<UploadStats>({
    totalUploads: 0,
    pendingReview: 0,
    flaggedContent: 0,
    approvedToday: 0,
    rejectedToday: 0,
    aiModerationRate: 0,
  });

  const [typeFilter, setTypeFilter] = useState<
    "all" | "image" | "video" | "document"
  >("pending");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "flagged"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Mock data loading - replace with real API calls
  const loadUploads = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        if (!options?.force) {
          setIsLoading(true);
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockUploads: MediaUpload[] = [
          {
            id: "upload1",
            userId: "user1",
            userName: "Alice Johnson",
            petId: "pet1",
            petName: "Buddy",
            type: "image",
            url: "https://example.com/pet1.jpg",
            thumbnailUrl: "https://example.com/pet1_thumb.jpg",
            fileName: "buddy_profile.jpg",
            fileSize: 2048576, // 2MB
            uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: "pending",
            aiModerationScore: 0.85,
            manualReviewRequired: false,
            tags: ["dog", "golden_retriever"],
          },
          {
            id: "upload2",
            userId: "user2",
            userName: "Bob Smith",
            type: "image",
            url: "https://example.com/inappropriate.jpg",
            thumbnailUrl: "https://example.com/inappropriate_thumb.jpg",
            fileName: "cat_photo.jpg",
            fileSize: 1572864, // 1.5MB
            uploadedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            status: "flagged",
            moderationReason: "Inappropriate content detected",
            aiModerationScore: 0.15,
            manualReviewRequired: true,
            tags: ["inappropriate"],
          },
          {
            id: "upload3",
            userId: "user3",
            userName: "Charlie Brown",
            petId: "pet3",
            petName: "Max",
            type: "video",
            url: "https://example.com/max_video.mp4",
            thumbnailUrl: "https://example.com/max_video_thumb.jpg",
            fileName: "max_playing.mp4",
            fileSize: 10485760, // 10MB
            uploadedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: "approved",
            aiModerationScore: 0.95,
            manualReviewRequired: false,
            tags: ["dog", "labrador", "playing"],
          },
        ];

        const mockStats: UploadStats = {
          totalUploads: 1247,
          pendingReview: 23,
          flaggedContent: 5,
          approvedToday: 45,
          rejectedToday: 2,
          aiModerationRate: 87.5,
        };

        setUploads(mockUploads);
        setStats(mockStats);

        logger.info("Admin uploads loaded", {
          count: mockUploads.length,
          stats: mockStats,
        });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to load uploads");
        logger.error("Failed to load admin uploads", { error: err });
        handleNetworkError(err, "admin.uploads.load");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleNetworkError],
  );

  useEffect(() => {
    void loadUploads();
  }, [loadUploads]);

  const filteredUploads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return uploads.filter((upload) => {
      // Type filter
      if (typeFilter !== "all" && upload.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== "all" && upload.status !== statusFilter)
        return false;

      // Search filter
      if (query.length > 0) {
        const searchableText = [
          upload.userName,
          upload.petName,
          upload.fileName,
          ...(upload.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(query);
      }

      return true;
    });
  }, [uploads, typeFilter, statusFilter, searchQuery]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadUploads({ force: true });
  }, [loadUploads]);

  const onTypeFilterChange = useCallback((type: typeof typeFilter) => {
    setTypeFilter(type);
  }, []);

  const onStatusFilterChange = useCallback((status: typeof statusFilter) => {
    setStatusFilter(status);
  }, []);

  const onSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const onUploadSelect = useCallback((upload: MediaUpload) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedUpload(upload);
  }, []);

  const onUploadClose = useCallback(() => {
    setSelectedUpload(null);
  }, []);

  const updateUploadStatus = useCallback(
    (uploadId: string, status: MediaUpload["status"], reason?: string) => {
      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === uploadId
            ? { ...upload, status, moderationReason: reason }
            : upload,
        ),
      );

      if (selectedUpload?.id === uploadId) {
        setSelectedUpload((prev) =>
          prev
            ? {
                ...prev,
                status,
                moderationReason: reason,
              }
            : null,
        );
      }
    },
    [selectedUpload],
  );

  const onApproveUpload = useCallback(
    async (uploadId: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600));

        updateUploadStatus(uploadId, "approved");
        setStats((prev) => ({
          ...prev,
          pendingReview: Math.max(0, prev.pendingReview - 1),
          approvedToday: prev.approvedToday + 1,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        logger.info("Upload approved by admin", { uploadId });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to approve upload");
        logger.error("Failed to approve upload", { error: err, uploadId });
        handleNetworkError(err, "admin.uploads.approve");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [updateUploadStatus, handleNetworkError],
  );

  const onRejectUpload = useCallback(
    async (uploadId: string, reason: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600));

        updateUploadStatus(uploadId, "rejected", reason);
        setStats((prev) => ({
          ...prev,
          pendingReview: Math.max(0, prev.pendingReview - 1),
          rejectedToday: prev.rejectedToday + 1,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        logger.info("Upload rejected by admin", { uploadId, reason });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to reject upload");
        logger.error("Failed to reject upload", { error: err, uploadId });
        handleNetworkError(err, "admin.uploads.reject");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [updateUploadStatus, handleNetworkError],
  );

  const onFlagUpload = useCallback(
    async (uploadId: string, reason: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600));

        updateUploadStatus(uploadId, "flagged", reason);
        setStats((prev) => ({
          ...prev,
          flaggedContent: prev.flaggedContent + 1,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        logger.info("Upload flagged by admin", { uploadId, reason });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to flag upload");
        logger.error("Failed to flag upload", { error: err, uploadId });
        handleNetworkError(err, "admin.uploads.flag");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [updateUploadStatus, handleNetworkError],
  );

  const onBulkApprove = useCallback(
    async (uploadIds: string[]) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        uploadIds.forEach((id) => updateUploadStatus(id, "approved"));

        setStats((prev) => ({
          ...prev,
          pendingReview: Math.max(0, prev.pendingReview - uploadIds.length),
          approvedToday: prev.approvedToday + uploadIds.length,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        logger.info("Bulk upload approval completed", {
          count: uploadIds.length,
        });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to bulk approve uploads");
        logger.error("Failed to bulk approve uploads", {
          error: err,
          count: uploadIds.length,
        });
        handleNetworkError(err, "admin.uploads.bulk.approve");
      } finally {
        setIsProcessingAction(false);
        setSelectedUploadIds(new Set());
      }
    },
    [updateUploadStatus, handleNetworkError],
  );

  const onBulkReject = useCallback(
    async (uploadIds: string[], reason: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        uploadIds.forEach((id) => updateUploadStatus(id, "rejected", reason));

        setStats((prev) => ({
          ...prev,
          pendingReview: Math.max(0, prev.pendingReview - uploadIds.length),
          rejectedToday: prev.rejectedToday + uploadIds.length,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        logger.info("Bulk upload rejection completed", {
          count: uploadIds.length,
          reason,
        });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to bulk reject uploads");
        logger.error("Failed to bulk reject uploads", {
          error: err,
          count: uploadIds.length,
        });
        handleNetworkError(err, "admin.uploads.bulk.reject");
      } finally {
        setIsProcessingAction(false);
        setSelectedUploadIds(new Set());
      }
    },
    [updateUploadStatus, handleNetworkError],
  );

  return {
    // Data
    uploads: filteredUploads,
    selectedUpload,
    stats,

    // Filters
    typeFilter,
    statusFilter,
    searchQuery,

    // UI State
    isLoading,
    isRefreshing,
    isProcessingAction,

    // Actions
    onRefresh,
    onTypeFilterChange,
    onStatusFilterChange,
    onSearchChange,
    onUploadSelect,
    onUploadClose,
    onApproveUpload,
    onRejectUpload,
    onFlagUpload,
    onBulkApprove,
    onBulkReject,
    onBackPress: () => navigation.goBack(),
  };
}

export default useAdminUploadsScreen;
