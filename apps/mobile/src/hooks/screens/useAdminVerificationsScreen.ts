/**
 * Admin Verifications Screen Hook
 * Manages pet verification requests and approvals
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import type { AdminScreenProps } from '../../navigation/types';
import { useErrorHandler } from '../useErrorHandler';
import { _adminAPI as adminAPI } from '../../services/adminAPI';

interface VerificationDocument {
  id: string;
  type: 'vaccination' | 'license' | 'ownership' | 'vet_record' | 'other';
  url: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
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
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
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
  navigation: AdminScreenProps<'AdminVerifications'>['navigation'];
}

export interface AdminVerificationsScreenState {
  // Data
  requests: VerificationRequest[];
  selectedRequest: VerificationRequest | null;
  stats: VerificationStats;

  // Filters
  statusFilter: 'all' | 'pending' | 'under_review' | 'approved' | 'rejected';
  priorityFilter: 'all' | 'high' | 'medium' | 'low';
  searchQuery: string;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessingAction: boolean;

  // Actions
  onRefresh: () => Promise<void>;
  onStatusFilterChange: (
    status: 'all' | 'pending' | 'under_review' | 'approved' | 'rejected',
  ) => void;
  onPriorityFilterChange: (priority: 'all' | 'high' | 'medium' | 'low') => void;
  onSearchChange: (query: string) => void;
  onRequestSelect: (request: VerificationRequest) => void;
  onRequestClose: () => void;
  onApproveRequest: (requestId: string, notes?: string) => Promise<void>;
  onRejectRequest: (requestId: string, reason: string, notes?: string) => Promise<void>;
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
  const { handleNetworkError } = useErrorHandler();

  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [stats, setStats] = useState<VerificationStats>({
    totalPending: 0,
    highPriority: 0,
    reviewedToday: 0,
    approvedThisWeek: 0,
    rejectedThisWeek: 0,
  });

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'under_review' | 'approved' | 'rejected'
  >('pending');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Load verification requests from API - replace mock data with real API calls
  const loadVerificationRequests = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        if (!options?.force) {
          setIsLoading(true);
        }

        // Call real API endpoint
        const response = await adminAPI.getVerifications({
          page: 1,
          limit: 50,
          status: statusFilter !== 'all' ? statusFilter : null,
        });

        if (response.success && response.data) {
          // Map API response to VerificationRequest format
          const mappedRequests: VerificationRequest[] = response.data.verifications.map((verification: any) => ({
            id: verification._id || verification.id,
            petId: verification.petId?._id || verification.petId || '',
            petName: verification.petId?.name || verification.petName || 'Unknown Pet',
            petBreed: verification.petId?.breed || verification.petBreed || 'Unknown',
            petSpecies: verification.petId?.species || verification.petSpecies || 'unknown',
            ownerId: verification.ownerId?._id || verification.ownerId || '',
            ownerName: verification.ownerId?.firstName && verification.ownerId?.lastName
              ? `${verification.ownerId.firstName} ${verification.ownerId.lastName}`
              : verification.ownerId?.email || verification.ownerName || 'Unknown Owner',
            ownerEmail: verification.ownerId?.email || verification.ownerEmail || '',
            submittedAt: new Date(verification.submittedAt || verification.createdAt),
            documents: (verification.documents || []).map((doc: any) => ({
              id: doc._id || doc.id,
              type: doc.type || 'other',
              url: doc.url || '',
              uploadedAt: new Date(doc.uploadedAt || doc.createdAt),
              verifiedAt: doc.verifiedAt ? new Date(doc.verifiedAt) : undefined,
              status: doc.status || 'pending',
              rejectionReason: doc.rejectionReason,
            })),
            status: verification.status === 'approved' ? 'approved' : verification.status === 'rejected' ? 'rejected' : verification.status === 'under_review' ? 'under_review' : 'pending',
            priority: verification.priority || 'medium',
            assignedAdmin: verification.assignedAdmin?._id || verification.assignedAdmin || undefined,
            ...(verification.reviewedAt ? { reviewedAt: new Date(verification.reviewedAt) } : {}),
            ...(verification.reviewNotes ? { reviewNotes: verification.reviewNotes } : {}),
          }));

          // Calculate stats from response
          const mappedStats: VerificationStats = {
            totalPending: mappedRequests.filter((r) => r.status === 'pending').length,
            highPriority: mappedRequests.filter((r) => r.priority === 'high').length,
            reviewedToday: mappedRequests.filter((r) => r.reviewedAt && new Date(r.reviewedAt).toDateString() === new Date().toDateString()).length,
            approvedThisWeek: mappedRequests.filter((r) => r.status === 'approved' && new Date(r.submittedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
            rejectedThisWeek: mappedRequests.filter((r) => r.status === 'rejected' && new Date(r.submittedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
          };

          setRequests(mappedRequests);
          setStats(mappedStats);

          logger.info('Admin verification requests loaded from API', {
            count: mappedRequests.length,
            stats: mappedStats,
          });
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load verification requests');
        logger.error('Failed to load admin verification requests', { error: err });
        handleNetworkError(err, 'admin.verifications.load');
        
        // Fallback to empty state on error
        setRequests([]);
        setStats({
          totalPending: 0,
          highPriority: 0,
          reviewedToday: 0,
          approvedThisWeek: 0,
          rejectedThisWeek: 0,
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [statusFilter, handleNetworkError],
  );

  useEffect(() => {
    void loadVerificationRequests();
  }, [loadVerificationRequests]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((request) => {
      // Status filter
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && request.priority !== priorityFilter) return false;

      // Search filter
      if (query.length > 0) {
        const searchableText = [
          request.petName,
          request.petBreed,
          request.ownerName,
          request.ownerEmail,
        ]
          .join(' ')
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

  const onPriorityFilterChange = useCallback((priority: typeof priorityFilter) => {
    setPriorityFilter(priority);
  }, []);

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
        // Call real API endpoint
        const response = await adminAPI.approveVerification(requestId, notes);

        if (response.success) {
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? {
                    ...req,
                    status: 'approved' as const,
                    reviewedAt: new Date(),
                    ...(notes ? { reviewNotes: notes } : {}),
                  }
                : req,
            ),
          );

          if (selectedRequest?.id === requestId) {
            setSelectedRequest((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'approved',
                    reviewedAt: new Date(),
                    ...(notes ? { reviewNotes: notes } : {}),
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

          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          logger.info('Verification request approved via API', { requestId, notes });
        } else {
          throw new Error('Failed to approve verification');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to approve request');
        logger.error('Failed to approve verification request', {
          error: err,
          requestId,
        });
        handleNetworkError(err, 'admin.verifications.approve');
        Alert.alert('Error', 'Failed to approve verification request. Please try again.');
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
        // Call real API endpoint
        const response = await adminAPI.rejectVerification(requestId, reason, notes);

        if (response.success) {
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? {
                    ...req,
                    status: 'rejected' as const,
                    reviewedAt: new Date(),
                    ...(notes ? { reviewNotes: notes } : {}),
                    documents: req.documents.map((doc) => ({
                      ...doc,
                      status: 'rejected' as const,
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
                    status: 'rejected',
                    reviewedAt: new Date(),
                    ...(notes ? { reviewNotes: notes } : {}),
                    documents: prev.documents.map((doc) => ({
                      ...doc,
                      status: 'rejected',
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

          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          logger.info('Verification request rejected via API', {
            requestId,
            reason,
            notes,
          });
        } else {
          throw new Error('Failed to reject verification');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to reject request');
        logger.error('Failed to reject verification request', {
          error: err,
          requestId,
        });
        handleNetworkError(err, 'admin.verifications.reject');
        Alert.alert('Error', 'Failed to reject verification request. Please try again.');
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
                  assignedAdmin: 'current-admin',
                  status: 'under_review' as const,
                }
              : req,
          ),
        );

        logger.info('Verification request assigned', { requestId });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to assign request');
        logger.error('Failed to assign verification request', {
          error: err,
          requestId,
        });
        handleNetworkError(err, 'admin.verifications.assign');
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
