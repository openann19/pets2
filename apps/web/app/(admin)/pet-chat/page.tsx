/**
 * Admin Pet Chat Management Page
 * Comprehensive admin interface for managing pet-centric chat features
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { EnhancedCard, EnhancedButton, LoadingSkeleton } from '@/components/admin/UIEnhancements';
import { logger } from '@pawfectmatch/core';

interface PetChatStats {
  totalPetProfilesShared: number;
  totalPlaydateProposals: number;
  totalHealthAlerts: number;
  totalCompatibilityShares: number;
  playdateAcceptanceRate: number;
  averageCompatibilityScore: number;
  topPetBreeds: Record<string, number>;
  topVenues: Record<string, number>;
  healthAlertTypes: Record<string, number>;
}

interface ModerationItem {
  id: string;
  matchId: string;
  messageType: string;
  sender: {
    id: string;
    name: string;
  };
  content: string;
  sentAt: string;
  data: any;
  moderationStatus: string;
}

export default function AdminPetChatPage() {
  const [stats, setStats] = useState<PetChatStats | null>(null);
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'moderation' | 'reports'>('overview');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'delete' | 'flag'>('approve');
  const [moderationReason, setModerationReason] = useState('');
  const [isModerating, setIsModerating] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'all' | 'playdate' | 'health_alert' | 'content'>('all');
  const [queueStatus, setQueueStatus] = useState<'pending' | 'reviewed' | 'approved' | 'rejected'>('pending');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Load stats
      const statsParams = new URLSearchParams();
      if (dateRange.start) statsParams.append('startDate', dateRange.start);
      if (dateRange.end) statsParams.append('endDate', dateRange.end);

      const statsResponse = await fetch(`/api/admin/pet-chat/stats?${statsParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!statsResponse.ok) {
        throw new Error(`Failed to load stats: ${statsResponse.statusText}`);
      }

      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.data);
      } else {
        throw new Error(statsData.message || 'Failed to load statistics');
      }

      // Load moderation queue
      const queueParams = new URLSearchParams();
      if (queueFilter !== 'all') queueParams.append('type', queueFilter);
      if (queueStatus) queueParams.append('status', queueStatus);

      const queueResponse = await fetch(`/api/admin/pet-chat/moderation-queue?${queueParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!queueResponse.ok) {
        throw new Error(`Failed to load queue: ${queueResponse.statusText}`);
      }

      const queueData = await queueResponse.json();
      if (queueData.success) {
        setModerationQueue(queueData.data.items || []);
      } else {
        throw new Error(queueData.message || 'Failed to load moderation queue');
      }
    } catch (error) {
      logger.error('Failed to load pet chat admin data', { error });
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, queueFilter, queueStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleModerate = async () => {
    if (!selectedItem) return;

    try {
      setIsModerating(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      let endpoint = '';
      if (selectedItem.messageType === 'playdate_proposal') {
        endpoint = `/api/admin/pet-chat/playdate/${selectedItem.matchId}/${selectedItem.id}/moderate`;
      } else if (selectedItem.messageType === 'health_alert') {
        endpoint = `/api/admin/pet-chat/health-alert/${selectedItem.matchId}/${selectedItem.id}/moderate`;
      } else {
        endpoint = `/api/admin/pet-chat/moderate/${selectedItem.matchId}/${selectedItem.id}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: moderationAction,
          reason: moderationReason.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to moderate: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        await loadData();
        setSelectedItem(null);
        setModerationReason('');
        setModerationAction('approve');
      } else {
        throw new Error(data.message || 'Failed to moderate item');
      }
    } catch (error) {
      logger.error('Failed to moderate item', { error });
      setError(error instanceof Error ? error.message : 'Failed to moderate item');
    } finally {
      setIsModerating(false);
    }
  };

  const handleExport = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await fetch('/api/admin/pet-chat/export', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pet-chat-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      logger.error('Failed to export data', { error });
      setError(error instanceof Error ? error.message : 'Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pet Chat Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage pet-centric chat features, moderation, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <EnhancedButton
            onClick={handleExport}
            variant="secondary"
            icon={<ArrowDownTrayIcon className="w-4 h-4" />}
          >
            Export Data
          </EnhancedButton>
          <EnhancedButton onClick={loadData} variant="primary" icon={<ArrowPathIcon className="w-4 h-4" />}>
            Refresh
          </EnhancedButton>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <EnhancedCard className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        </EnhancedCard>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'moderation', label: 'Moderation Queue', icon: ShieldCheckIcon },
            { id: 'reports', label: 'Reports', icon: ClipboardDocumentListIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pet Profiles Shared
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalPetProfilesShared.toLocaleString()}
                </p>
              </div>
              <UserGroupIcon className="w-12 h-12 text-blue-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Playdate Proposals
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalPlaydateProposals.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stats.playdateAcceptanceRate.toFixed(1)}% acceptance rate
                </p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-green-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Health Alerts
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalHealthAlerts.toLocaleString()}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Compatibility
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.averageCompatibilityScore.toFixed(0)}%
                </p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-purple-500" />
            </div>
          </EnhancedCard>

          {/* Top Breeds */}
          <EnhancedCard className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Pet Breeds
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.topPetBreeds)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([breed, count]) => (
                  <div key={breed} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{breed}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </EnhancedCard>

          {/* Top Venues */}
          <EnhancedCard className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Venues
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.topVenues)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([venue, count]) => (
                  <div key={venue} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">{venue}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* Moderation Queue Tab */}
      {selectedTab === 'moderation' && (
        <div className="space-y-4">
          {/* Filters */}
          <EnhancedCard className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Type
                </label>
                <select
                  value={queueFilter}
                  onChange={(e) => setQueueFilter(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="playdate">Playdate Proposals</option>
                  <option value="health_alert">Health Alerts</option>
                  <option value="content">Content</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Status
                </label>
                <select
                  value={queueStatus}
                  onChange={(e) => setQueueStatus(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </EnhancedCard>

          {moderationQueue.length === 0 ? (
            <EnhancedCard>
              <div className="text-center py-12">
                <ShieldCheckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No items in moderation queue
                </p>
              </div>
            </EnhancedCard>
          ) : (
            moderationQueue.map((item) => (
              <EnhancedCard key={item.id} hover>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.messageType}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {item.moderationStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      From: <span className="font-medium">{item.sender.name}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sent: {new Date(item.sentAt).toLocaleString()}
                    </p>
                    <p className="text-gray-900 dark:text-white mt-2 break-words">{item.content}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <EnhancedButton
                      onClick={() => setSelectedItem(item)}
                      variant="secondary"
                      size="sm"
                      icon={<EyeIcon className="w-4 h-4" />}
                    >
                      View
                    </EnhancedButton>
                    <EnhancedButton
                      onClick={() => {
                        setSelectedItem(item);
                        setModerationAction('approve');
                      }}
                      variant="primary"
                      size="sm"
                    >
                      Approve
                    </EnhancedButton>
                    <EnhancedButton
                      onClick={() => {
                        setSelectedItem(item);
                        setModerationAction('reject');
                      }}
                      variant="danger"
                      size="sm"
                    >
                      Reject
                    </EnhancedButton>
                  </div>
                </div>
              </EnhancedCard>
            ))
          )}
        </div>
      )}

      {/* Moderation Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <EnhancedCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Moderate Content
              </h3>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setModerationReason('');
                  setModerationAction('approve');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action
                </label>
                <select
                  value={moderationAction}
                  onChange={(e) => setModerationAction(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="delete">Delete</option>
                  <option value="flag">Flag for Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason {moderationAction === 'reject' || moderationAction === 'delete' ? '(required)' : '(optional)'}
                </label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter moderation reason..."
                  required={moderationAction === 'reject' || moderationAction === 'delete'}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <EnhancedButton
                  onClick={() => {
                    setSelectedItem(null);
                    setModerationReason('');
                    setModerationAction('approve');
                  }}
                  variant="secondary"
                  disabled={isModerating}
                >
                  Cancel
                </EnhancedButton>
                <EnhancedButton
                  onClick={handleModerate}
                  variant={moderationAction === 'reject' || moderationAction === 'delete' ? 'danger' : 'primary'}
                  disabled={isModerating || (moderationAction !== 'approve' && !moderationReason.trim())}
                  loading={isModerating}
                >
                  Submit
                </EnhancedButton>
              </div>
            </div>
          </EnhancedCard>
        </div>
      )}
    </div>
  );
}

