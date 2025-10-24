'use client';

import PremiumButton from '@/components/UI/PremiumButton';
import { useAdminListReports, useAdminUpdateReport } from '@pawfectmatch/core/api';
import { useMemo, useState } from 'react';

export default function AdminReportsPage() {
    const [status, setStatus] = useState('pending');
    const [priority, setPriority] = useState('');
    const [search, setSearch] = useState('');
    const params = useMemo(() => ({ status, priority: priority || undefined, search: search || undefined }), [status, priority, search]);
    const { data, isLoading, refetch } = useAdminListReports(params);
    const { mutateAsync: updateReport } = useAdminUpdateReport();

    const items = data?.data?.items || [];

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Moderation Reports</h1>

            <div className="flex gap-2 items-end">
                <label className="text-sm">Status
                    <select className="block bg-white/10 border border-white/20 rounded p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                        <option value="escalated">Escalated</option>
                        <option value="all">All</option>
                    </select>
                </label>
                <label className="text-sm">Priority
                    <select className="block bg-white/10 border border-white/20 rounded p-2" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="">Any</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </label>
                <label className="text-sm">Search
                    <input className="block bg-white/10 border border-white/20 rounded p-2" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="reason or description" />
                </label>
                <PremiumButton onClick={() => refetch()}>Refresh</PremiumButton>
            </div>

            {isLoading ? (
                <div>Loading…</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="text-left">
                                <th className="p-2">ID</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Category</th>
                                <th className="p-2">Priority</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Reason</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((r: any) => (
                                <tr key={r._id} className="border-t border-white/10">
                                    <td className="p-2">{r._id}</td>
                                    <td className="p-2">{r.type}</td>
                                    <td className="p-2">{r.category}</td>
                                    <td className="p-2">{r.priority}</td>
                                    <td className="p-2">{r.status}</td>
                                    <td className="p-2 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                                    <td className="p-2 flex gap-2">
                                        <PremiumButton variant="outline" onClick={() => updateReport({ id: r._id, updates: { status: 'under_review' } })}>Review</PremiumButton>
                                        <PremiumButton variant="outline" onClick={() => updateReport({ id: r._id, updates: { status: 'resolved', resolution: 'action_taken' } })}>Resolve</PremiumButton>
                                        <PremiumButton variant="outline" onClick={() => updateReport({ id: r._id, updates: { status: 'dismissed', resolution: 'no_violation' } })}>Dismiss</PremiumButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
