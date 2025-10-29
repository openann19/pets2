'use client';

/**
 * PawReels Admin Console
 * Reels management and moderation queue
 */

import { useState } from 'react';
import useSWR from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Reel {
  id: string;
  status: 'draft' | 'rendering' | 'public' | 'flagged' | 'removed';
  mp4_url?: string;
  poster_url?: string;
  created_at: string;
  owner_id: string;
  template_id: string;
  kpi_shares: number;
  kpi_installs: number;
}

interface ModerationFlag {
  id: string;
  reel_id: string;
  kind: string;
  score: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ReelsAdmin() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [moderationView, setModerationView] = useState(false);

  const { data: reels, mutate: mutateReels } = useSWR<Reel[]>(
    `/reels?limit=100&status=${statusFilter === 'all' ? '' : statusFilter}`,
    fetcher
  );

  const { data: flags } = useSWR<ModerationFlag[]>(
    moderationView ? '/moderation/flags?status=pending' : null,
    fetcher
  );

  const handleRemove = async (reelId: string) => {
    if (!confirm('Remove this reel?')) return;

    try {
      await fetch(`${API_URL}/reels/${reelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'removed' }),
      });
      mutateReels();
    } catch (error) {
      console.error('Failed to remove reel:', error);
    }
  };

  const handleApprove = async (flagId: string) => {
    try {
      await fetch(`${API_URL}/moderation/flags/${flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      mutateReels();
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (flagId: string) => {
    try {
      await fetch(`${API_URL}/moderation/flags/${flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      mutateReels();
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">PawReels Admin Console</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setModerationView(false)}
            className={`px-4 py-2 rounded-lg font-medium ${
              !moderationView
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Reels
          </button>
          <button
            onClick={() => setModerationView(true)}
            className={`px-4 py-2 rounded-lg font-medium ${
              moderationView
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Moderation Queue
          </button>
        </div>

        {/* Status Filter */}
        {!moderationView && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('public')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'public'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setStatusFilter('rendering')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'rendering'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Rendering
            </button>
            <button
              onClick={() => setStatusFilter('flagged')}
              className={`px-4 py-2 rounded-lg ${
                statusFilter === 'flagged'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Flagged
            </button>
          </div>
        )}

        {/* Moderation View */}
        {moderationView && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reel ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kind
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flags?.map((flag) => (
                  <tr key={flag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {flag.reel_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {flag.kind}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded ${
                          flag.score > 0.75 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {(flag.score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {flag.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleApprove(flag.id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(flag.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reels Table */}
        {!moderationView && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reels?.map((reel) => (
                  <tr key={reel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {reel.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          reel.status === 'public'
                            ? 'bg-green-100 text-green-800'
                            : reel.status === 'rendering'
                            ? 'bg-yellow-100 text-yellow-800'
                            : reel.status === 'flagged'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {reel.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {reel.kpi_shares || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(reel.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {reel.mp4_url && (
                        <a
                          href={`/preview/${reel.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900 mr-4" rel="noreferrer"
                        >
                          Preview
                        </a>
                      )}
                      <button
                        onClick={() => handleRemove(reel.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

