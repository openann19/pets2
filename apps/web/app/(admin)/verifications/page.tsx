'use client';

import {
  EnhancedCard,
  EnhancedButton,
  EnhancedInput,
  EnhancedDropdown,
  EnhancedDataTable,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import {
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';

interface Verification extends Record<string, unknown> {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'user' | 'pet' | 'document';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documents: Array<{
    id: string;
    url: string;
    type: string;
  }>;
  notes?: string;
  rejectionReason?: string;
}

const filterOptions = [
  { value: 'all', label: 'All Verifications' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);

  const loadVerifications = async (force = false): Promise<void> => {
    try {
      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch('/api/admin/verifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        setVerifications(data.verifications || []);
      } else {
        setVerifications([]);
      }
    } catch (error: unknown) {
      logger.error('Error loading verifications:', { error });
      setVerifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadVerifications();
  }, []);

  const handleRefresh = async (): Promise<void> => {
    await loadVerifications(true);
  };

  const handleVerificationAction = async (
    verificationId: string,
    action: 'approve' | 'reject',
    notes?: string,
  ): Promise<void> => {
    try {
      await fetch(`/api/admin/verifications/${verificationId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      }).catch(() => null);

      setVerifications((prev) =>
        prev.map((verification) => {
          if (verification.id === verificationId) {
            return {
              ...verification,
              status: action === 'approve' ? ('approved' as const) : ('rejected' as const),
              reviewedAt: new Date().toISOString(),
              notes,
            };
          }
          return verification;
        }),
      );

      if (selectedVerification?.id === verificationId) {
        setSelectedVerification(null);
      }
    } catch (error: unknown) {
      logger.error('Error performing verification action:', { error });
    }
  };

  const filteredVerifications = verifications.filter((verification) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !verification.userName.toLowerCase().includes(query) &&
        !verification.userEmail.toLowerCase().includes(query) &&
        !verification.id.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    if (filter !== 'all') {
      return verification.status === filter;
    }

    return true;
  });

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const verification = row as Verification;
        return (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{verification.userName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{verification.userEmail}</p>
        </div>
      );
      },
    },
    {
      key: 'type',
      label: 'Type',
      render: (_value: unknown, row: Record<string, unknown>) => (
        <span className="capitalize">{(row as Verification).type}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const verification = row as Verification;
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          expired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[verification.status]}`}
          >
            {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'submitted',
      label: 'Submitted',
      render: (_value: unknown, row: Record<string, unknown>) =>
        new Date((row as Verification).submittedAt).toLocaleDateString(),
    },
    {
      key: 'documents',
      label: 'Documents',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const verification = row as Verification;
        return (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {verification.documents.length} file{verification.documents.length !== 1 ? 's' : ''}
        </span>
      );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const verification = row as Verification;
        return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedVerification(verification)}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="View verification"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          {verification.status === 'pending' && (
            <>
              <button
                onClick={() => handleVerificationAction(verification.id, 'approve')}
                className="rounded-md p-1 text-green-400 hover:text-green-600 dark:hover:text-green-300"
                aria-label="Approve verification"
              >
                <CheckCircleIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Rejection reason:');
                  if (reason) {
                    handleVerificationAction(verification.id, 'reject', reason);
                  }
                }}
                className="rounded-md p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                aria-label="Reject verification"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton
          variant="card"
          count={3}
        />
      </div>
    );
  }

  const pendingCount = verifications.filter((v) => v.status === 'pending').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verification Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review and manage user verifications
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {pendingCount > 0 && (
            <div className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              {pendingCount} pending
            </div>
          )}
          <EnhancedButton
            onClick={handleRefresh}
            disabled={refreshing}
            variant="primary"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </EnhancedButton>
        </div>
      </div>

      {/* Search and Filters */}
      <EnhancedCard className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <EnhancedInput
              type="text"
              placeholder="Search verifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <EnhancedDropdown
              value={filter}
              onChange={(value) => setFilter(value)}
              options={filterOptions}
              className="pl-10"
            />
          </div>
        </div>
      </EnhancedCard>

      {/* Verifications Table */}
      <EnhancedCard className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Verifications ({filteredVerifications.length})
        </h2>
        {filteredVerifications.length === 0 ? (
          <div className="py-12 text-center">
            <CheckBadgeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              No verifications found
            </p>
          </div>
        ) : (
          <EnhancedDataTable
            data={filteredVerifications}
            columns={columns}
          />
        )}
      </EnhancedCard>

      {/* Verification Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <EnhancedCard className="max-w-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Verification Details
              </h2>
              <button
                onClick={() => setSelectedVerification(null)}
                className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User</p>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedVerification.userName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedVerification.userEmail}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</p>
                  <p className="mt-1 text-gray-900 dark:text-white capitalize">
                    {selectedVerification.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <p className="mt-1 text-gray-900 dark:text-white capitalize">
                    {selectedVerification.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</p>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {new Date(selectedVerification.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Documents ({selectedVerification.documents.length})
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {selectedVerification.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View {doc.type}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {selectedVerification.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="mt-1 rounded-md bg-gray-50 p-3 text-gray-900 dark:bg-gray-800 dark:text-white">
                    {selectedVerification.notes}
                  </p>
                </div>
              )}

              {selectedVerification.rejectionReason && (
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Rejection Reason
                  </p>
                  <p className="mt-1 text-red-600 dark:text-red-400">
                    {selectedVerification.rejectionReason}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <EnhancedButton
                onClick={() => setSelectedVerification(null)}
                variant="secondary"
              >
                Close
              </EnhancedButton>
              {selectedVerification.status === 'pending' && (
                <>
                  <EnhancedButton
                    onClick={() => {
                      handleVerificationAction(selectedVerification.id, 'approve');
                    }}
                    variant="primary"
                  >
                    Approve
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) {
                        handleVerificationAction(selectedVerification.id, 'reject', reason);
                      }
                    }}
                    variant="danger"
                  >
                    Reject
                  </EnhancedButton>
                </>
              )}
            </div>
          </EnhancedCard>
        </div>
      )}
    </div>
  );
}

