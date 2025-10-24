'use client';

import { BulkActions } from '@/components/admin/BulkActions';
import { AnimatedButton } from '@/components/UI/animated-button';
import { GlassCard } from '@/components/UI/glass-card';
import { useToast } from '@/components/UI/toast';
import { useConfetti } from '@/hooks/useConfetti';
import { useModerationShortcuts } from '@/hooks/useKeyboardShortcuts';
import { logger } from '@/services/logger';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Search,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
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
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
  queue: {
    total: number;
    byStatus: {
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  performance: {
    avgReviewTime: number;
    todayReviewed: number;
  };
}

export default function EnhancedModerationDashboard() {
  const toast = useToast();
  const [queue, setQueue] = useState<ModerationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const { fireworks, burst } = useConfetti();

  const currentItem = queue[currentIndex];

  // Bulk action handlers
  const handleBulkApprove = useCallback(async () => {
    if (selectedItems.size === 0) return;

    try {
      setActionLoading(true);
      const itemIds = Array.from(selectedItems);

      await Promise.all(
        itemIds.map((id) =>
          fetch(`/api/moderation/${id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ notes: 'Bulk approved' }),
          })
        )
      );

      setQueue((prev) => prev.filter((item) => !selectedItems.has(item._id)));
      setSelectedItems(new Set());
      fireworks();
    } catch (error) {
      logger.error('Bulk approve failed', { error });
    } finally {
      setActionLoading(false);
    }
  }, [selectedItems, fireworks]);

  const handleBulkReject = useCallback(async () => {
    if (selectedItems.size === 0) return;

    const reason = prompt('Rejection reason:');
    if (!reason) return;

    try {
      setActionLoading(true);
      const itemIds = Array.from(selectedItems);

      await Promise.all(
        itemIds.map((id) =>
          fetch(`/api/moderation/${id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ reason, category: 'bulk', notes: 'Bulk rejected' }),
          })
        )
      );

      setQueue((prev) => prev.filter((item) => !selectedItems.has(item._id)));
      setSelectedItems(new Set());
    } catch (error) {
      logger.error('Bulk reject failed', { error });
    } finally {
      setActionLoading(false);
    }
  }, [selectedItems]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === queue.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(queue.map((item) => item._id)));
    }
  }, [queue, selectedItems.size]);

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  // Enhanced keyboard shortcuts
  useModerationShortcuts({
    approve: () => {
      if (selectedItems.size > 0) {
        void handleBulkApprove();
      } else if (currentItem) {
        void handleApprove();
      }
    },
    reject: () => {
      if (selectedItems.size > 0) {
        void handleBulkReject();
      } else if (currentItem) {
        void handleRejectPrompt();
      }
    },
    next: () => navigateNext(),
    previous: () => navigatePrevious(),
    bulkSelect: () => handleSelectAll(),
    search: () => document.getElementById('moderation-search')?.focus(),
  });

  useEffect(() => {
    void loadQueue();
    void loadStats();
  }, [filter]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/moderation/queue?status=${filter}&limit=50`, {
        credentials: 'include',
      });
      if (response.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await response.json();

      if (data.success) {
        setQueue(data.items);
        setCurrentIndex(0);
      }
    } catch (error) {
      logger.error('Failed to load moderation queue', { error });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/moderation/stats', { credentials: 'include' });
      if (response.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      logger.error('Failed to load stats', { error });
    }
  };

  const handleApprove = async () => {
    if (!currentItem) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/moderation/${currentItem._id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes: 'Approved by moderator' }),
      });

      const data = await response.json();

      if (data.success) {
        burst();
        toast.success('Photo approved!', 'The content has been approved and is now visible.');
        removeCurrentItem();
      } else {
        toast.error('Failed to approve photo', data.message || 'Please try again.');
      }
    } catch (error) {
      logger.error('Failed to approve photo', { error });
      toast.error('Failed to approve photo', 'An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string, category: string) => {
    if (!currentItem) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/moderation/${currentItem._id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason, category, notes: `Rejected as ${category}` }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Photo rejected', 'The content has been removed from moderation queue.');
        removeCurrentItem();
      } else {
        toast.error('Failed to reject photo', data.message || 'Please try again.');
      }
    } catch (error) {
      logger.error('Failed to reject photo', { error });
      toast.error('Failed to reject photo', 'An error occurred. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPrompt = () => {
    const category = prompt('Rejection category (explicit/violence/self-harm/spam/other):');
    const reason = prompt('Rejection reason:');

    if (category && reason) {
      void handleReject(reason, category);
    }
  };

  const handleQuickReject = (category: string) => {
    const reasons: Record<string, string> = {
      explicit: 'Explicit or inappropriate content',
      violence: 'Violent or disturbing content',
      'self-harm': 'Self-harm or dangerous content',
      spam: 'Spam or irrelevant content',
      other: 'Violates community guidelines',
    };

    const reason = reasons[category] ?? reasons['other'] ?? 'Violates community guidelines';
    void handleReject(reason, category);
  };

  const removeCurrentItem = () => {
    setQueue((prev) => prev.filter((_, i) => i !== currentIndex));
    if (currentIndex >= queue.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const navigatePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const navigateNext = () => {
    setCurrentIndex((prev) => Math.min(queue.length - 1, prev + 1));
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'from-red-500 to-red-600',
      high: 'from-orange-500 to-orange-600',
      medium: 'from-yellow-500 to-yellow-600',
      low: 'from-blue-500 to-blue-600',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <GlassCard variant="heavy" blur="xl" className="p-12">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white text-lg">Loading moderation queue...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">
        <GlassCard variant="heavy" blur="xl" className="p-12 text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Queue Empty!</h2>
          <p className="text-white/70 mb-8">All items have been reviewed. Great work!</p>
          <AnimatedButton onClick={() => void loadQueue()} size="lg">
            <Sparkles className="h-5 w-5 mr-2" />
            Refresh Queue
          </AnimatedButton>
        </GlassCard>
      </div>
    );
  }

  const filteredQueue = queue.filter((item) =>
    searchQuery
      ? item.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.userId.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      {/* Enhanced Header with Stats */}
      <div className="max-w-7xl mx-auto mb-6">
        <GlassCard variant="medium" blur="lg" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Zap className="h-8 w-8 text-yellow-400" />
                Enhanced Moderation
              </h1>
              <p className="text-white/70">AI-powered content review dashboard</p>
            </div>

            {/* Real-time Stats */}
            <div className="flex gap-4">
              <GlassCard variant="light" className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats?.performance?.avgReviewTime || 0}s
                    </div>
                    <div className="text-xs text-white/60">Avg Review Time</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard variant="light" className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {stats?.performance?.todayReviewed || 0}
                    </div>
                    <div className="text-xs text-white/60">Reviewed Today</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
              <input
                id="moderation-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user name or email... (Ctrl+F)"
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="flex gap-2">
              <AnimatedButton
                variant={filter === 'pending' ? 'primary' : 'ghost'}
                onClick={() => setFilter('pending')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Pending ({stats?.queue?.byStatus?.pending || 0})
              </AnimatedButton>
              <AnimatedButton variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>
                <Eye className="h-4 w-4 mr-2" />
                All
              </AnimatedButton>
            </div>

            <GlassCard variant="light" className="px-4 py-3">
              <span className="text-white font-medium">
                {currentIndex + 1} / {filteredQueue.length}
              </span>
            </GlassCard>
          </div>
        </GlassCard>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
        {/* Left: Enhanced Photo Preview */}
        <div className="col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem._id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <GlassCard variant="medium" blur="lg" className="overflow-hidden">
                {/* Priority Badge */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                  <div
                    className={`px-4 py-2 rounded-full bg-gradient-to-r ${getPriorityColor(currentItem.priority)} text-white font-bold text-sm flex items-center gap-2`}
                  >
                    <Sparkles className="h-4 w-4" />
                    {currentItem.priority.toUpperCase()} PRIORITY
                  </div>
                  <span className="text-sm text-white/60">
                    {new Date(currentItem.uploadedAt).toLocaleString()}
                  </span>
                </div>

                {/* Photo with Glassmorphic Overlay */}
                <div className="relative bg-black" style={{ minHeight: '500px' }}>
                  <Image
                    src={currentItem.photoUrl}
                    alt="Under review"
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-contain"
                    priority
                  />

                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(currentItem._id)}
                        onChange={() => toggleItemSelection(currentItem._id)}
                        className="w-5 h-5 rounded border-2 border-white/50 bg-white/10 checked:bg-brand-primary"
                      />
                      <span className="text-white text-sm font-medium">Select</span>
                    </label>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="px-6 py-4 flex items-center gap-3">
                  <AnimatedButton
                    onClick={() => void handleApprove()}
                    disabled={actionLoading}
                    variant="primary"
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Approve (A)
                  </AnimatedButton>

                  <AnimatedButton
                    onClick={() => void handleQuickReject('explicit')}
                    disabled={actionLoading}
                    variant="secondary"
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    size="lg"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Reject (R)
                  </AnimatedButton>
                </div>

                {/* Quick Reject with Glassmorphism */}
                <div className="px-6 py-4 border-t border-white/10">
                  <p className="text-sm text-white/70 mb-3 font-medium">Quick Reject:</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'explicit', label: 'Explicit', color: 'red' },
                      { key: 'violence', label: 'Violence', color: 'orange' },
                      { key: 'self-harm', label: 'Self-Harm', color: 'red' },
                      { key: 'spam', label: 'Spam', color: 'yellow' },
                    ].map((option) => (
                      <AnimatedButton
                        key={option.key}
                        onClick={() => void handleQuickReject(option.key)}
                        variant="ghost"
                        size="sm"
                        className={`bg-${option.color}-500/20 hover:bg-${option.color}-500/30 text-${option.color}-300`}
                      >
                        {option.label}
                      </AnimatedButton>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="px-6 py-4 border-t border-white/10 flex justify-between">
                  <AnimatedButton
                    onClick={navigatePrevious}
                    disabled={currentIndex === 0}
                    variant="ghost"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </AnimatedButton>
                  <AnimatedButton
                    onClick={navigateNext}
                    disabled={currentIndex === queue.length - 1}
                    variant="ghost"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </AnimatedButton>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Enhanced Details */}
        <div className="space-y-6">
          {/* Photo Details */}
          <GlassCard variant="medium" blur="lg" className="p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              Photo Details
            </h3>

            <div className="space-y-3">
              {[
                {
                  label: 'Dimensions',
                  value: `${currentItem.imageMetadata.width} × ${currentItem.imageMetadata.height}`,
                },
                { label: 'Format', value: currentItem.imageMetadata.format.toUpperCase() },
                {
                  label: 'File Size',
                  value: `${(currentItem.imageMetadata.fileSize / 1024 / 1024).toFixed(2)} MB`,
                },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-white/60">{item.label}:</span>
                  <span className="text-sm font-medium text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* User Context */}
          <GlassCard variant="medium" blur="lg" className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">User Context</h3>

            <div className="space-y-3">
              {[
                { label: 'User', value: currentItem.userId.name },
                { label: 'Account Age', value: `${currentItem.userHistory.accountAge} days` },
                { label: 'Total Uploads', value: currentItem.userHistory.totalUploads },
                {
                  label: 'Approved',
                  value: currentItem.userHistory.approvedUploads,
                  color: 'text-green-400',
                },
                {
                  label: 'Rejected',
                  value: currentItem.userHistory.rejectedUploads,
                  color: 'text-red-400',
                },
                {
                  label: 'Trusted User',
                  value: currentItem.userHistory.isTrustedUser ? 'Yes ✓' : 'No',
                  color: currentItem.userHistory.isTrustedUser ? 'text-green-400' : 'text-white/60',
                },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-white/60">{item.label}:</span>
                  <span className={`text-sm font-medium ${item.color || 'text-white'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Keyboard Shortcuts */}
          <GlassCard variant="light" blur="md" className="p-6 bg-blue-500/20">
            <h3 className="text-sm font-bold text-blue-300 mb-3">⌨️ Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm text-blue-200">
              {[
                { key: 'A', action: 'Approve' },
                { key: 'R', action: 'Reject' },
                { key: '← →', action: 'Navigate' },
                { key: 'Ctrl+A', action: 'Select All' },
                { key: 'Ctrl+F', action: 'Search' },
              ].map((shortcut) => (
                <div key={shortcut.key} className="flex justify-between">
                  <span>{shortcut.action}:</span>
                  <kbd className="px-2 py-1 bg-blue-400/30 rounded font-mono text-xs">{shortcut.key}</kbd>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Guidelines */}
          <GlassCard variant="light" blur="md" className="p-6 bg-red-500/20">
            <h3 className="text-sm font-bold text-red-300 mb-3">⚠️ Watch For</h3>
            <div className="space-y-1 text-sm text-red-200">
              {[
                'Explicit or sexual content',
                'Violence or disturbing images',
                'Self-harm content',
                'Drugs or illegal activities',
                'Hate symbols or offensive content',
                'Spam or irrelevant photos',
              ].map((guideline) => (
                <div key={guideline}>• {guideline}</div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Bulk Actions Floating Toolbar */}
      <BulkActions
        selectedCount={selectedItems.size}
        onApprove={() => void handleBulkApprove()}
        onReject={() => void handleBulkReject()}
        onClear={() => setSelectedItems(new Set())}
        isLoading={actionLoading}
      />
    </div>
  );
}
