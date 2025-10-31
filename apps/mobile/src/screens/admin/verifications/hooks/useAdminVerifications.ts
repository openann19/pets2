import { useCallback, useEffect, useState } from 'react';

import { _adminAPI } from '../../../../services/api';
import { errorHandler } from '../../../../services/errorHandler';
import type { Verification, VerificationFilter } from '../types';

export const useAdminVerifications = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<VerificationFilter>('pending');
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);

  const loadVerifications = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        const response = await _adminAPI.getVerifications({
          search: searchQuery,
          limit: 50,
        });

        if (response?.success && response.data) {
          const verifications = (response.data as any)?.verifications || response.data;
          setVerifications(Array.isArray(verifications) ? verifications : []);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to load verifications'),
          {
            component: 'AdminVerificationsScreen',
            action: 'loadVerifications',
          },
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery],
  );

  useEffect(() => {
    void loadVerifications();
  }, [loadVerifications]);

  const handleRefresh = useCallback(() => {
    void loadVerifications(true);
  }, [loadVerifications]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilter: VerificationFilter) => {
    setFilter(newFilter);
  }, []);

  const handleVerificationSelect = useCallback((verification: Verification) => {
    setSelectedVerification(verification);
  }, []);

  const handleApprove = useCallback(
    async (verificationId: string) => {
      try {
        const response = await _adminAPI.approveVerification(verificationId);
        if (response?.success) {
          await loadVerifications(true);
          setSelectedVerification(null);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to approve verification'),
          {
            component: 'AdminVerificationsScreen',
            action: 'approveVerification',
          },
        );
      }
    },
    [loadVerifications],
  );

  const handleReject = useCallback(
    async (verificationId: string, reason: string) => {
      try {
        const response = await _adminAPI.rejectVerification(verificationId, reason);
        if (response?.success) {
          await loadVerifications(true);
          setSelectedVerification(null);
        } else {
          throw new Error(response?.message || 'Failed to reject verification');
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to reject verification'),
          {
            component: 'AdminVerificationsScreen',
            action: 'rejectVerification',
            metadata: { verificationId },
          },
        );
        throw error;
      }
    },
    [loadVerifications],
  );

  const handleRequestInfo = useCallback(
    async (verificationId: string, message: string) => {
      try {
        const response = await _adminAPI.requestVerificationInfo(verificationId, message);
        if (response?.success) {
          await loadVerifications(true);
          setSelectedVerification(null);
        } else {
          throw new Error(response?.message || 'Failed to request info');
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to request info'),
          {
            component: 'AdminVerificationsScreen',
            action: 'requestVerificationInfo',
            metadata: { verificationId },
          },
        );
        throw error;
      }
    },
    [loadVerifications],
  );

  const filteredVerifications = verifications.filter((v) => {
    if (filter === 'pending') {
      return v.status === 'pending';
    }
    if (filter === 'high_priority') {
      return v.priority === 'high';
    }
    return true;
  });

  return {
    verifications: filteredVerifications,
    loading,
    refreshing,
    searchQuery,
    filter,
    selectedVerification,
    loadVerifications,
    handleRefresh,
    handleSearch,
    handleFilterChange,
    handleVerificationSelect,
    handleApprove,
    handleReject,
    handleRequestInfo,
    setSelectedVerification,
  };
};
