import { useCallback, useEffect, useState } from 'react';

import { _adminAPI } from '../../../../services/api';
import { errorHandler } from '../../../../services/errorHandler';

export interface Verification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'identity' | 'pet_ownership' | 'veterinary' | 'breeder';
  status: 'pending' | 'approved' | 'rejected' | 'requires_info';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documents: {
    id: string;
    type: 'photo_id' | 'pet_registration' | 'vet_certificate' | 'breeder_license' | 'other';
    url: string;
    name: string;
  }[];
  notes?: string;
  rejectionReason?: string;
  additionalInfoRequested?: string;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
}

export const useAdminVerifications = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'pending' | 'high_priority' | 'all'>('pending');
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

  const handleFilterChange = useCallback((newFilter: 'pending' | 'high_priority' | 'all') => {
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
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to reject verification'),
          {
            component: 'AdminVerificationsScreen',
            action: 'rejectVerification',
          },
        );
      }
    },
    [loadVerifications],
  );

  const handleRequestInfo = useCallback(
    async (verificationId: string, message: string) => {
      try {
        // TODO: Implement requestVerificationInfo method in adminAPI
        const response = await _adminAPI.getVerificationDetails(verificationId);
        if (response?.success) {
          await loadVerifications(true);
          setSelectedVerification(null);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to request info'),
          {
            component: 'AdminVerificationsScreen',
            action: 'requestVerificationInfo',
          },
        );
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
