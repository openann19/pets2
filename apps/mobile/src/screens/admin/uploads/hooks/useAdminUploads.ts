/**
 * Admin Uploads Hook
 * Manages business logic for admin uploads screen
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { _adminAPI } from '../../../../services/api';
import { errorHandler } from '../../../../services/errorHandler';
import type { Upload, UploadFilter } from '../types';

export const useAdminUploads = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<UploadFilter>('pending');
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);

  const loadUploads = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        const response = await _adminAPI.getUploads({
          filter,
          search: searchQuery,
          limit: 50,
        });

        if (response?.success && response.data) {
          const uploads = (response.data as any)?.uploads || response.data;
          setUploads(Array.isArray(uploads) ? uploads : []);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to load uploads'),
          {
            component: 'AdminUploadsScreen',
            action: 'loadUploads',
          },
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, searchQuery],
  );

  useEffect(() => {
    void loadUploads();
  }, [loadUploads]);

  const handleUploadAction = useCallback(
    async (uploadId: string, action: 'approve' | 'reject', reason?: string) => {
      try {
        const response = await _adminAPI.moderateUpload({
          uploadId,
          action,
          ...(reason && { reason }),
        });

        if (response?.success) {
          setUploads((prev) =>
            prev.map((upload) => {
              if (upload.id !== uploadId) return upload;

              const updated: Upload = {
                ...upload,
                status: action === 'approve' ? 'approved' : 'rejected',
                reviewedAt: new Date().toISOString(),
              };

              if (action === 'reject' && reason) {
                updated.rejectionReason = reason;
              }

              return updated;
            }),
          );

          Alert.alert('Success', `Upload ${action}d successfully`);
          setSelectedUpload(null);

          // Reload uploads to get latest data
          await loadUploads(true);
        } else {
          throw new Error(response?.message || `Failed to ${action} upload`);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error(`Failed to ${action} upload`),
          {
            component: 'AdminUploadsScreen',
            action: 'handleUploadAction',
            metadata: { uploadId, action },
          },
        );
        Alert.alert('Error', `Failed to ${action} upload. Please try again.`);
      }
    },
    [loadUploads],
  );

  const handleRejectWithReason = useCallback(
    (upload: Upload) => {
      Alert.prompt(
        'Reject Upload',
        'Please provide a reason for rejection:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: (reason) => {
              if (reason?.trim()) {
                void handleUploadAction(upload.id, 'reject', reason.trim());
              }
            },
          },
        ],
        'plain-text',
        '',
        'default',
      );
    },
    [handleUploadAction],
  );

  return {
    uploads,
    loading,
    refreshing,
    searchQuery,
    filter,
    selectedUpload,
    setSearchQuery,
    setFilter,
    setSelectedUpload,
    loadUploads,
    handleUploadAction,
    handleRejectWithReason,
  };
};
