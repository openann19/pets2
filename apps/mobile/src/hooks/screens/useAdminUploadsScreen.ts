/**
 * Admin Uploads Screen Hook
 * Manages content moderation for user-uploaded media
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import type { AdminScreenProps } from '../../navigation/types';
import { useErrorHandler } from '../useErrorHandler';

interface MediaUpload {
  id: string;
  userId: string;
  userName: string;
  petId?: string;
  petName?: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
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
  navigation: AdminScreenProps<'AdminUploads'>['navigation'];
}

export interface AdminUploadsScreenState {
  // Data
  uploads: MediaUpload[];
  selectedUpload: MediaUpload | null;
  stats: UploadStats;

  // Filters
  typeFilter: 'all' | 'image' | 'video' | 'document';
  statusFilter: 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';
  searchQuery: string;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessingAction: boolean;

  // Actions
  onRefresh: () => Promise<void>;
  onTypeFilterChange: (type: 'all' | 'image' | 'video' | 'document') => void;
  onStatusFilterChange: (status: 'all' | 'pending' | 'approved' | 'rejected' | 'flagged') => void;
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
  const [selectedUpload, setSelectedUpload] = useState<MediaUpload | null>(null);
  const [selectedUploadIds, setSelectedUploadIds] = useState<Set<string>>(new Set());

  const [stats, setStats] = useState<UploadStats>({
    totalUploads: 0,
    pendingReview: 0,
    flaggedContent: 0,
    approvedToday: 0,
    rejectedToday: 0,
    aiModerationRate: 0,
  });

  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'flagged'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Load uploads from API - replace mock data with real API calls
  const loadUploads = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        if (!options?.force) {
          setIsLoading(true);
        }

        // Call real API endpoint
        const response = await adminAPI.getUploads({
          page: 1,
          limit: 50,
          filter: 'all',
        });

        if (response.success && response.data) {
          // Map API response to MediaUpload format
          const mappedUploads: MediaUpload[] = response.data.uploads.map((upload: any) => ({
            id: upload._id || upload.id,
            userId: upload.userId?._id || upload.userId || '',
            userName:
              upload.userId?.firstName && upload.userId?.lastName
                ? `${upload.userId.firstName} ${upload.userId.lastName}`
                : upload.userId?.email || 'Unknown User',
            petId: upload.petId?._id || upload.petId || undefined,
            petName: upload.petId?.name || undefined,
            type:
              upload.type === 'video' ? 'video' : upload.type === 'document' ? 'document' : 'image',
            url: upload.url || '',
            thumbnailUrl: upload.thumbnailUrl || upload.url,
            fileName: upload.originalName || upload.fileName || 'unknown',
            fileSize: upload.size || 0,
            uploadedAt: new Date(upload.uploadedAt || upload.createdAt),
            status:
              upload.status === 'approved'
                ? 'approved'
                : upload.status === 'rejected'
                  ? 'rejected'
                  : upload.status === 'flagged'
                    ? 'flagged'
                    : 'pending',
            moderationReason: upload.moderationReason || upload.rejectionReason,
            aiModerationScore: upload.aiModerationScore || upload.moderatedScore,
            manualReviewRequired: upload.manualReviewRequired || upload.status === 'flagged',
            tags: upload.tags || [],
            metadata: upload.metadata || {},
          }));

          // Calculate stats from response
          const mockStats: UploadStats = {
            totalUploads: response.data.pagination?.total || mappedUploads.length,
            pendingReview: mappedUploads.filter((u) => u.status === 'pending').length,
            flaggedContent: mappedUploads.filter((u) => u.status === 'flagged').length,
            approvedToday: mappedUploads.filter(
              (u) =>
                u.status === 'approved' &&
                new Date(u.uploadedAt).toDateString() === new Date().toDateString(),
            ).length,
            rejectedToday: mappedUploads.filter(
              (u) =>
                u.status === 'rejected' &&
                new Date(u.uploadedAt).toDateString() === new Date().toDateString(),
            ).length,
            aiModerationRate:
              (mappedUploads.filter((u) => u.aiModerationScore !== undefined).length /
                mappedUploads.length) *
              100,
          };

          setUploads(mappedUploads);
          setStats(mockStats);

          logger.info('Admin uploads loaded from API', {
            count: mappedUploads.length,
            stats: mockStats,
          });
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load uploads');
        logger.error('Failed to load admin uploads', { error: err });
        handleNetworkError(err, 'admin.uploads.load');

        // Fallback to empty state on error
        setUploads([]);
        setStats({
          totalUploads: 0,
          pendingReview: 0,
          flaggedContent: 0,
          approvedToday: 0,
          rejectedToday: 0,
          aiModerationRate: 0,
        });
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
      if (typeFilter !== 'all' && upload.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && upload.status !== statusFilter) return false;

      // Search filter
      if (query.length > 0) {
        const searchableText = [
          upload.userName,
          upload.petName,
          upload.fileName,
          ...(upload.tags || []),
        ]
          .join(' ')
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
    (uploadId: string, status: MediaUpload['status'], reason?: string) => {
      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === uploadId ? { ...upload, status, moderationReason: reason } : upload,
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
        // Call real API endpoint
        const response = await adminAPI.approveUpload(uploadId);

        if (response.success) {
          updateUploadStatus(uploadId, 'approved');
          setStats((prev) => ({
            ...prev,
            pendingReview: Math.max(0, prev.pendingReview - 1),
            approvedToday: prev.approvedToday + 1,
          }));

          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          logger.info('Upload approved by admin via API', { uploadId });
        } else {
          throw new Error('Failed to approve upload');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to approve upload');
        logger.error('Failed to approve upload', { error: err, uploadId });
        handleNetworkError(err, 'admin.uploads.approve');
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

        updateUploadStatus(uploadId, 'rejected', reason);
        setStats((prev) => ({
          ...prev,
          pendingReview: Math.max(0, prev.pendingReview - 1),
          rejectedToday: prev.rejectedToday + 1,
        }));

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        logger.info('Upload rejected by admin', { uploadId, reason });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to reject upload');
        logger.error('Failed to reject upload', { error: err, uploadId });
        handleNetworkError(err, 'admin.uploads.reject');
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

        updateUploadStatus(uploadId, 'flagged', reason);
        setStats((prev) => ({
          ...prev,
          flaggedContent: prev.flaggedContent + 1,
        }));

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        logger.info('Upload flagged by admin', { uploadId, reason });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to flag upload');
        logger.error('Failed to flag upload', { error: err, uploadId });
        handleNetworkError(err, 'admin.uploads.flag');
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

        uploadIds.forEach((id) => {
          updateUploadStatus(id, 'approved');
        });

        setStats((prev) => ({
          ...prev,
          pendingReview: Math.max(0, prev.pendingReview - uploadIds.length),
          approvedToday: prev.approvedToday + uploadIds.length,
        }));

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        logger.info('Bulk upload approval completed', {
          count: uploadIds.length,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to bulk approve uploads');
        logger.error('Failed to bulk approve uploads', {
          error: err,
          count: uploadIds.length,
        });
        handleNetworkError(err, 'admin.uploads.bulk.approve');
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

        uploadIds.forEach((id) => {
          updateUploadStatus(id, 'rejected', reason);
        });

        setStats((prev) => ({
          ...prev,
          pendingReview: Math.max(0, prev.pendingReview - uploadIds.length),
          rejectedToday: prev.rejectedToday + uploadIds.length,
        }));

        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        logger.info('Bulk upload rejection completed', {
          count: uploadIds.length,
          reason,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to bulk reject uploads');
        logger.error('Failed to bulk reject uploads', {
          error: err,
          count: uploadIds.length,
        });
        handleNetworkError(err, 'admin.uploads.bulk.reject');
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
