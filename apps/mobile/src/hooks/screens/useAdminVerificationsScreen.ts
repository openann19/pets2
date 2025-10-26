/**
 * Admin Verifications Screen Hook
 * Manages pet verification requests and approvals
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import type { AdminScreenProps } from "../../navigation/types";
import { useErrorHandler } from "../useErrorHandler";

interface VerificationDocument {
  id: string;
  type: "vaccination" | "license" | "ownership" | "vet_record" | "other";
  url: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

interface VerificationRequest {
  id: string;
  petId: string;
  petName: string;
  petBreed: string;
  petSpecies: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  submittedAt: Date;
  documents: VerificationDocument[];
  status: "pending" | "under_review" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  assignedAdmin?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

interface VerificationStats {
  totalPending: number;
  highPriority: number;
  reviewedToday: number;
  approvedThisWeek: number;
  rejectedThisWeek: number;
}

interface UseAdminVerificationsScreenParams {
  navigation: AdminScreenProps<"AdminVerifications">["navigation"];
}

export interface AdminVerificationsScreenState {
  // Data
  requests: VerificationRequest[];
  selectedRequest: VerificationRequest | null;
  stats: VerificationStats;

  // Filters
  statusFilter: "all" | "pending" | "under_review" | "approved" | "rejected";
  priorityFilter: "all" | "high" | "medium" | "low";
  searchQuery: string;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessingAction: boolean;

  // Actions
  onRefresh: () => Promise<void>;
  onStatusFilterChange: (status: "all" | "pending" | "under_review" | "approved" | "rejected") => void;
  onPriorityFilterChange: (priority: "all" | "high" | "medium" | "low") => void;
  onSearchChange: (query: string) => void;
  onRequestSelect: (request: VerificationRequest) => void;
  onRequestClose: () => void;
  onApproveRequest: (requestId: string, notes?: string) => Promise<void>;
  onRejectRequest: (
    requestId: string,
    reason: string,
    notes?: string,
  ) => Promise<void>;
  onAssignToMe: (requestId: string) => Promise<void>;
  onBackPress: () => void;
}

/**
 * Hook for admin verifications screen
 * Manages pet verification workflow and approvals
 */
export function useAdminVerificationsScreen({
  navigation,
}: UseAdminVerificationsScreenParams): AdminVerificationsScreenState {
  const { handleNetworkError, handleOfflineError } = useErrorHandler();

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);
  const [stats, setStats] = useState<VerificationStats>({
    totalPending: 0,
    highPriority: 0,
    reviewedToday: 0,
    approvedThisWeek: 0,
    rejectedThisWeek: 0,
  });

  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "under_review" | "approved" | "rejected"
  >("pending");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "high" | "medium" | "low"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Mock data loading - replace with real API calls
  const loadVerificationRequests = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        if (!options?.force) {
          setIsLoading(true);
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockRequests: VerificationRequest[] = [
          {
            id: "ver1",
            petId: "pet1",
            petName: "Buddy",
            petBreed: "Golden Retriever",
            petSpecies: "dog",
            ownerId: "user1",
            ownerName: "Alice Johnson",
            ownerEmail: "alice@example.com",
            documents: [
              {
                id: "doc1",
                type: "vaccination",
                url: "vaccination.pdf",
                uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                status: "pending",
              },
              {
                id: "doc2",
                type: "ownership",
                url: "ownership.jpg",
                uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                status: "pending",
              },
            ],
            status: "pending",
            priority: "high",
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: "ver2",
            petId: "pet2",
            petName: "Whiskers",
            petBreed: "Persian Cat",
            petSpecies: "cat",
            ownerId: "user2",
            ownerName: "Bob Smith",
            ownerEmail: "bob@example.com",
            submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            documents: [
              {
                id: "doc3",
                type: "vet_record",
                url: "vet_record.pdf",
                uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                status: "approved",
                verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              },
            ],
            status: "under_review",
            priority: "medium",
            assignedAdmin: "admin1",
          },
        ];

        const mockStats: VerificationStats = {
          totalPending: 23,
          highPriority: 5,
          reviewedToday: 12,
          approvedThisWeek: 45,
          rejectedThisWeek: 3,
        };

        setRequests(mockRequests);
        setStats(mockStats);

        logger.info("Verification requests loaded", {
          count: mockRequests.length,
          stats: mockStats,
        });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to load verification requests");
        logger.error("Failed to load verification requests", { error: err });
        handleNetworkError(err, "admin.verifications.load");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleNetworkError],
  );

  useEffect(() => {
    void loadVerificationRequests();
  }, [loadVerificationRequests]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((request) => {
      // Status filter
      if (statusFilter !== "all" && request.status !== statusFilter)
        return false;

      // Priority filter
      if (priorityFilter !== "all" && request.priority !== priorityFilter)
        return false;

      // Search filter
      if (query.length > 0) {
        const searchableText = [
          request.petName,
          request.petBreed,
          request.ownerName,
          request.ownerEmail,
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(query);
      }

      return true;
    });
  }, [requests, statusFilter, priorityFilter, searchQuery]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadVerificationRequests({ force: true });
  }, [loadVerificationRequests]);

  const onStatusFilterChange = useCallback((status: typeof statusFilter) => {
    setStatusFilter(status);
  }, []);

  const onPriorityFilterChange = useCallback(
    (priority: typeof priorityFilter) => {
      setPriorityFilter(priority);
    },
    [],
  );

  const onSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const onRequestSelect = useCallback((request: VerificationRequest) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedRequest(request);
  }, []);

  const onRequestClose = useCallback(() => {
    setSelectedRequest(null);
  }, []);

  const onApproveRequest = useCallback(
    async (requestId: string, notes?: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "approved" as const,
                  reviewedAt: new Date(),
                  reviewNotes: notes,
                }
              : req,
          ),
        );

        if (selectedRequest?.id === requestId) {
          setSelectedRequest((prev) =>
            prev
              ? {
                  ...prev,
                  status: "approved",
                  reviewedAt: new Date(),
                  reviewNotes: notes,
                }
              : null,
          );
        }

        setStats((prev) => ({
          ...prev,
          totalPending: Math.max(0, prev.totalPending - 1),
          approvedThisWeek: prev.approvedThisWeek + 1,
          reviewedToday: prev.reviewedToday + 1,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        logger.info("Verification request approved", { requestId, notes });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to approve request");
        logger.error("Failed to approve verification request", {
          error: err,
          requestId,
        });
        handleNetworkError(err, "admin.verifications.approve");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [selectedRequest, handleNetworkError],
  );

  const onRejectRequest = useCallback(
    async (requestId: string, reason: string, notes?: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "rejected" as const,
                  reviewedAt: new Date(),
                  reviewNotes: notes,
                  documents: req.documents.map((doc) => ({
                    ...doc,
                    status: "rejected" as const,
                    rejectionReason: reason,
                  })),
                }
              : req,
          ),
        );

        if (selectedRequest?.id === requestId) {
          setSelectedRequest((prev) =>
            prev
              ? {
                  ...prev,
                  status: "rejected",
                  reviewedAt: new Date(),
                  reviewNotes: notes,
                  documents: prev.documents.map((doc) => ({
                    ...doc,
                    status: "rejected",
                    rejectionReason: reason,
                  })),
                }
              : null,
          );
        }

        setStats((prev) => ({
          ...prev,
          totalPending: Math.max(0, prev.totalPending - 1),
          rejectedThisWeek: prev.rejectedThisWeek + 1,
          reviewedToday: prev.reviewedToday + 1,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        logger.info("Verification request rejected", {
          requestId,
          reason,
          notes,
        });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to reject request");
        logger.error("Failed to reject verification request", {
          error: err,
          requestId,
        });
        handleNetworkError(err, "admin.verifications.reject");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [selectedRequest, handleNetworkError],
  );

  const onAssignToMe = useCallback(
    async (requestId: string) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));

        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  assignedAdmin: "current-admin",
                  status: "under_review" as const,
                }
              : req,
          ),
        );

        logger.info("Verification request assigned", { requestId });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to assign request");
        logger.error("Failed to assign verification request", {
          error: err,
          requestId,
        });
        handleNetworkError(err, "admin.verifications.assign");
      }
    },
    [handleNetworkError],
  );

  return {
    // Data
    requests: filteredRequests,
    selectedRequest,
    stats,

    // Filters
    statusFilter,
    priorityFilter,
    searchQuery,

    // UI State
    isLoading,
    isRefreshing,
    isProcessingAction,

    // Actions
    onRefresh,
    onStatusFilterChange,
    onPriorityFilterChange,
    onSearchChange,
    onRequestSelect,
    onRequestClose,
    onApproveRequest,
    onRejectRequest,
    onAssignToMe,
    onBackPress: () => navigation.goBack(),
  };
}

export default useAdminVerificationsScreen;
