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
  PhotoIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';

interface Upload extends Record<string, unknown> {
  id: string;
  userId: string;
  userName: string;
  petId?: string;
  petName?: string;
  url: string;
  type: 'photo' | 'video' | 'document';
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  size: number;
  mimeType: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

const filterOptions = [
  { value: 'all', label: 'All Uploads' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
};

export default function UploadsPage() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);

  const loadUploads = async (force = false): Promise<void> => {
    try {
      if (force) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch('/api/admin/uploads', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        setUploads(data.uploads || []);
      } else {
        setUploads([]);
      }
    } catch (error: unknown) {
      logger.error('Error loading uploads:', { error });
      setUploads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadUploads();
  }, []);

  const handleRefresh = async (): Promise<void> => {
    await loadUploads(true);
  };

  const handleUploadAction = async (
    uploadId: string,
    action: 'approve' | 'reject' | 'delete',
    reason?: string,
  ): Promise<void> => {
    try {
      await fetch(`/api/admin/uploads/${uploadId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }).catch(() => null);

      setUploads((prev) =>
        prev.map((upload) => {
          if (upload.id === uploadId) {
            switch (action) {
              case 'approve':
                return { ...upload, status: 'approved', reviewedAt: new Date().toISOString() };
              case 'reject':
                return {
                  ...upload,
                  status: 'rejected',
                  reviewedAt: new Date().toISOString(),
                  rejectionReason: reason,
                };
              case 'delete':
                return { ...upload, status: 'deleted' };
              default:
                return upload;
            }
          }
          return upload;
        }),
      );

      if (selectedUpload?.id === uploadId) {
        setSelectedUpload(null);
      }
    } catch (error: unknown) {
      logger.error('Error performing upload action:', { error });
    }
  };

  const filteredUploads = uploads.filter((upload) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !upload.userName.toLowerCase().includes(query) &&
        !upload.petName?.toLowerCase().includes(query) &&
        !upload.url.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    if (filter !== 'all') {
      return upload.status === filter;
    }

    return upload.status !== 'deleted';
  });

  const columns = [
    {
      key: 'preview',
      label: 'Preview',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const upload = row as Upload;
        return (
        <div className="flex items-center">
          {upload.type === 'photo' ? (
            <img
              src={upload.url}
              alt={upload.petName || 'Upload'}
              className="h-12 w-12 rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
          ) : (
            <PhotoIcon className="h-12 w-12 text-gray-400" />
          )}
        </div>
      );
      },
    },
    {
      key: 'user',
      label: 'User',
      render: (_value: unknown, row: Record<string, unknown>) => (row as Upload).userName,
    },
    {
      key: 'pet',
      label: 'Pet',
      render: (_value: unknown, row: Record<string, unknown>) => (row as Upload).petName || 'N/A',
    },
    {
      key: 'type',
      label: 'Type',
      render: (_value: unknown, row: Record<string, unknown>) => (
        <span className="capitalize">{(row as Upload).type}</span>
      ),
    },
    {
      key: 'size',
      label: 'Size',
      render: (_value: unknown, row: Record<string, unknown>) => formatFileSize((row as Upload).size),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const upload = row as Upload;
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          deleted: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[upload.status]}`}
          >
            {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'created',
      label: 'Created',
      render: (_value: unknown, row: Record<string, unknown>) => new Date((row as Upload).createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Record<string, unknown>) => {
        const upload = row as Upload;
        return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedUpload(upload)}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="View upload"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          {upload.status === 'pending' && (
            <>
              <button
                onClick={() => handleUploadAction(upload.id, 'approve')}
                className="rounded-md p-1 text-green-400 hover:text-green-600 dark:hover:text-green-300"
                aria-label="Approve upload"
              >
                <CheckCircleIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  const reason = prompt('Rejection reason:');
                  if (reason) {
                    handleUploadAction(upload.id, 'reject', reason);
                  }
                }}
                className="rounded-md p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                aria-label="Reject upload"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </>
          )}
          {upload.status !== 'deleted' && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this upload?')) {
                  handleUploadAction(upload.id, 'delete');
                }
              }}
              className="rounded-md p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
              aria-label="Delete upload"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review and manage user uploads
          </p>
        </div>
        <EnhancedButton
          onClick={handleRefresh}
          disabled={refreshing}
          variant="primary"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </EnhancedButton>
      </div>

      {/* Search and Filters */}
      <EnhancedCard className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <EnhancedInput
              type="text"
              placeholder="Search uploads..."
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

      {/* Uploads Table */}
      <EnhancedCard className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Uploads ({filteredUploads.length})
        </h2>
        {filteredUploads.length === 0 ? (
          <div className="py-12 text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No uploads found</p>
          </div>
        ) : (
          <EnhancedDataTable
            data={filteredUploads}
            columns={columns}
          />
        )}
      </EnhancedCard>

      {/* Upload Detail Modal */}
      {selectedUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <EnhancedCard className="max-w-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Upload Details
              </h2>
              <button
                onClick={() => setSelectedUpload(null)}
                className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              {selectedUpload.type === 'photo' && (
                <div>
                  <img
                    src={selectedUpload.url}
                    alt={selectedUpload.petName || 'Upload'}
                    className="max-h-96 w-full rounded-lg object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User</p>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedUpload.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pet</p>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedUpload.petName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</p>
                  <p className="mt-1 text-gray-900 dark:text-white capitalize">
                    {selectedUpload.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Size</p>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {formatFileSize(selectedUpload.size)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                  <p className="mt-1 text-gray-900 dark:text-white capitalize">
                    {selectedUpload.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</p>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {new Date(selectedUpload.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedUpload.rejectionReason && (
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Rejection Reason
                  </p>
                  <p className="mt-1 text-red-600 dark:text-red-400">
                    {selectedUpload.rejectionReason}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <EnhancedButton
                onClick={() => setSelectedUpload(null)}
                variant="secondary"
              >
                Close
              </EnhancedButton>
              {selectedUpload.status === 'pending' && (
                <>
                  <EnhancedButton
                    onClick={() => {
                      handleUploadAction(selectedUpload.id, 'approve');
                    }}
                    variant="primary"
                  >
                    Approve
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) {
                        handleUploadAction(selectedUpload.id, 'reject', reason);
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

