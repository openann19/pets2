'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export function EventViewer() {
  const [filters, setFilters] = useState({
    app: 'all',
    userId: '',
    sessionId: '',
    type: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['events', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (filters.app !== 'all') params.append('app', filters.app);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.sessionId) params.append('sessionId', filters.sessionId);
      if (filters.type) params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await axiosInstance.get(`/admin/events?${params}`);
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Viewer</h1>
        <p className="text-gray-400 mt-2">View events from mobile + web apps</p>
      </div>

      {/* Filters */}
      <div className="bg-admin-dark-light rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">App</label>
            <select
              value={filters.app}
              onChange={(e) => setFilters({ ...filters, app: e.target.value })}
              className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-gray-300"
            >
              <option value="all">All Apps</option>
              <option value="mobile">Mobile</option>
              <option value="web">Web</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Event Type</label>
            <input
              type="text"
              placeholder="e.g., chat.message.sent"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">User ID</label>
            <input
              type="text"
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Session ID</label>
            <input
              type="text"
              placeholder="Session ID"
              value={filters.sessionId}
              onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
              className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-admin-dark-light rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-admin-dark border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">App</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Event Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data?.events?.map((event: any) => (
                <tr key={event.id} className="hover:bg-admin-dark">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-300">
                      {event.app}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {event.userId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(event.ts).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-admin-primary hover:underline text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">
            Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, data.pagination.total)} of {data.pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-admin-dark-light border border-gray-600 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.pagination.pages}
              className="px-4 py-2 bg-admin-dark-light border border-gray-600 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}