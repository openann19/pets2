'use client';

import RejectModal from '@/components/moderation/RejectModal';
import { useToast } from '@/components/UI/toast';
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { logger } from '@/services/logger';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface ModerationItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  photoUrl: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  priority: 'normal' | 'high';
  imageMetadata: {
    width: number;
    height: number;
    format: string;
    fileSize: number;
  };
  userHistory: {
    totalUploads: number;
    rejectedUploads: number;
    approvedUploads: number;
    isTrustedUser: boolean;
    accountAge: number;
  };
}

interface ModerationStats {
  pending?: number;
}

//

export default function ModerationDashboard() {
  const [queue, setQueue] = useState<ModerationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const currentItem = queue[currentIndex];
  const { success, error, info } = useToast();

  // Simple API helpers
  const apiBase = (process.env['NEXT_PUBLIC_API_URL'] as string | undefined) || 'http://localhost:3001';
  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('auth-token') || ''}` });
  const getJSON = async <T,>(path: string): Promise<T> => {
    const res = await fetch(`${apiBase}${path}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader() },
    });
    if (res.status === 401) {
      window.location.href = '/admin/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  };
  const postJSON = async <T,>(path: string, body: unknown): Promise<T> => {
    const res = await fetch(`${apiBase}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body ?? {}),
    });
    if (res.status === 401) {
      window.location.href = '/admin/login';
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  };

  // Define loadQueue and loadStats using useCallback
  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJSON<{ success: boolean; items: ModerationItem[] }>(
        `/api/moderation/queue?status=${filter}&limit=50`
      );

      if (data.success) {
        setQueue(data.items);
        setCurrentIndex(0);
      }
    } catch (error) {
      logger.error('Failed to load moderation queue', { error });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadStats = useCallback(async () => {
    try {
      const data = await getJSON<{ success: boolean; stats: ModerationStats }>(
        '/api/moderation/stats'
      );

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      logger.error('Failed to load stats', { error });
    }
  }, []);

  // Real-time queue updates
  useRealtimeFeed({
    userId: 'moderation-queue',
    onUpdate: (data: { type?: string }) => {
      const updateType = data.type;
      if (updateType === 'queue:update') {
        void loadStats();
        info('Queue Updated', 'New items or changes detected');
      }
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (actionLoading || !currentItem) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          handleApprove();
          break;
        case 'r':
          e.preventDefault();
          handleRejectPrompt();
          break;
        case 'arrowleft':
          e.preventDefault();
          navigatePrevious();
          break;
        case 'arrowright':
          e.preventDefault();
          navigateNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [actionLoading, currentIndex]);

  useEffect(() => {
    loadQueue();
    loadStats();
  }, [loadQueue, loadStats]);

  const handleApprove = async () => {
    if (!currentItem) return;

    try {
      setActionLoading(true);
      const data = await postJSON<{ success: boolean; message?: string }>(
        `/api/moderation/${currentItem._id}/approve`,
        { notes: 'Approved by moderator' }
      );

      if (data.success) {
        removeCurrentItem();
        success('Photo Approved', 'The photo has been approved successfully');
      } else {
        error('Approval Failed', data.message || 'Failed to approve photo');
      }
    } catch (err) {
      logger.error('Failed to approve photo', { error: err });
      error('Approval Failed', 'An error occurred while approving the photo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string, category: string) => {
    if (!currentItem) return;

    try {
      setActionLoading(true);
      const data = await postJSON<{ success: boolean; message?: string }>(
        `/api/moderation/${currentItem._id}/reject`,
        { reason, category, notes: `Rejected as ${category}` }
      );

      if (data.success) {
        removeCurrentItem();
        success('Photo Rejected', `Rejected as ${category}`);
      } else {
        error('Rejection Failed', data.message || 'Failed to reject photo');
      }
    } catch (err) {
      logger.error('Failed to reject photo', { error: err });
      error('Rejection Failed', 'An error occurred while rejecting the photo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPrompt = () => {
    setShowRejectModal(true);
  };

  const handleRejectConfirm = (reason: string, category: string) => {
    handleReject(reason, category);
  };

  const removeCurrentItem = () => {
    setQueue(prev => prev.filter((_, i) => i !== currentIndex));
    if (currentIndex >= queue.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const navigatePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const navigateNext = () => {
    setCurrentIndex(prev => Math.min(queue.length - 1, prev + 1));
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  if (loading) {
    return (
      <>
        <RejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleRejectConfirm}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading moderation queue...</p>
          </div>
        </div>
      </>
    );
  }

  if (!currentItem) {
    return (
      <>
        <RejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          onConfirm={handleRejectConfirm}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Queue Empty</h2>
            <p className="text-gray-600 mb-6">No items in moderation queue</p>
            <button
              onClick={loadQueue}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              Refresh Queue
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
      />

      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Photo Moderation</h1>
              <p className="text-gray-600 mt-1">Review and approve user-uploaded photos</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                      ? 'bg-pink-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                      ? 'bg-pink-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  All
                </button>
              </div>

              {/* Stats */}
              {stats && (
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                  <div className="text-sm text-gray-600">Queue Size</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.pending || 0}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Photo Card */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Priority Badge */}
                  <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(currentItem.priority)}`}>
                      {currentItem.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-sm text-gray-500">
                      Uploaded {new Date(currentItem.uploadedAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Photo */}
                  <div className="relative bg-gray-900" style={{ minHeight: '500px' }}>
                    <Image
                      src={currentItem.photoUrl}
                      alt="Under review"
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-contain"
                      priority
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 py-4 bg-gray-50 flex items-center gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve (A)
                    </button>
                    <button
                      onClick={handleRejectPrompt}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject (R)
                    </button>
                  </div>

                  {/* Navigation */}
                  <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={navigatePrevious}
                      disabled={currentIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      {currentIndex + 1} of {queue.length}
                    </span>
                    <button
                      onClick={navigateNext}
                      disabled={currentIndex === queue.length - 1}
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">User Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium text-gray-900">{currentItem.userId.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{currentItem.userId.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Account Age</div>
                    <div className="font-medium text-gray-900">{currentItem.userHistory.accountAge} days</div>
                  </div>
                </div>
              </div>

              {/* User History */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upload History</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Uploads</span>
                    <span className="font-bold text-gray-900">{currentItem.userHistory.totalUploads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved</span>
                    <span className="font-bold text-green-600">{currentItem.userHistory.approvedUploads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rejected</span>
                    <span className="font-bold text-red-600">{currentItem.userHistory.rejectedUploads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-bold ${currentItem.userHistory.isTrustedUser ? 'text-blue-600' : 'text-gray-600'}`}>
                      {currentItem.userHistory.isTrustedUser ? 'Trusted' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Image Metadata */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Image Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions</span>
                    <span className="font-medium text-gray-900">
                      {currentItem.imageMetadata.width} × {currentItem.imageMetadata.height}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format</span>
                    <span className="font-medium text-gray-900">{currentItem.imageMetadata.format.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Size</span>
                    <span className="font-medium text-gray-900">
                      {(currentItem.imageMetadata.fileSize / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">⚠️ Moderation Guidelines</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <div><strong>Reject if:</strong></div>
                  <div>• Explicit or inappropriate content</div>
                  <div>• Violence or disturbing images</div>
                  <div>• Self-harm content</div>
                  <div>• Drugs or illegal activities</div>
                  <div>• Hate symbols or offensive content</div>
                  <div>• Spam or irrelevant photos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
