/**
 * Admin Reports Hook
 * Extracts business logic for AdminReportsScreen
 */

import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { _adminAPI } from '../../../../services/api';
import { errorHandler } from '../../../../services/errorHandler';
import type { ReportFilter, ReportPriorityFilter, ReportTypeFilter, UserReport } from '../types';

export const useAdminReports = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportFilter>('pending');
  const [typeFilter, setTypeFilter] = useState<ReportTypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<ReportPriorityFilter>('all');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);

  const loadReports = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        const response = await _adminAPI.getReports({
          page: 1,
          limit: 50,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          search: searchQuery || undefined,
        });

        if (response?.success && response.data) {
          const reportsData = (response.data as { reports: unknown[] }).reports || [];
          setReports(reportsData as UserReport[]);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to load reports'),
          {
            component: 'AdminReportsScreen',
            action: 'loadReports',
          },
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, typeFilter, priorityFilter, searchQuery],
  );

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const updateReportStatus = useCallback(
    async (reportId: string, status: string, notes?: string) => {
      try {
        const response = await _adminAPI.updateReportStatus(reportId, status, notes);

        if (response?.success) {
          setReports((prev) =>
            prev.map((r) =>
              r.id === reportId
                ? {
                    ...r,
                    status: status as UserReport['status'],
                    resolvedAt: status === 'resolved' ? new Date().toISOString() : r.resolvedAt,
                    resolutionNotes: notes,
                  }
                : r,
            ),
          );

          Alert.alert('Success', 'Report status updated successfully');
          setSelectedReport(null);
          void loadReports(true);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error('Failed to update report status'),
          {
            component: 'AdminReportsScreen',
            action: 'updateReportStatus',
            metadata: { reportId, status },
          },
        );
        Alert.alert('Error', 'Failed to update report status. Please try again.');
      }
    },
    [loadReports],
  );

  return {
    reports,
    loading,
    refreshing,
    searchQuery,
    statusFilter,
    typeFilter,
    priorityFilter,
    selectedReport,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,
    setPriorityFilter,
    setSelectedReport,
    loadReports,
    updateReportStatus,
  };
};
