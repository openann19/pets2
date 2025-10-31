/**
 * Admin Reports Screen
 * Production-ready implementation for managing user reports
 * REFACTORED: Extracted hooks and components for better maintainability
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { AdminScreenProps } from '../../navigation/types';
import { ReportCard, ReportModal, SearchAndFilters, EmptyState } from './reports/components';
import { useAdminReports } from './reports/hooks';

export default function AdminReportsScreen({
  navigation,
}: AdminScreenProps<'AdminReports'>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const {
    reports,
    loading,
    refreshing,
    searchQuery,
    statusFilter,
    selectedReport,
    setSearchQuery,
    setStatusFilter,
    setSelectedReport,
    loadReports,
    updateReportStatus,
  } = useAdminReports();

  const renderReport = useCallback(
    ({ item }: { item: typeof reports[0] }) => (
      <ReportCard
        report={item}
        onPress={() => setSelectedReport(item)}
      />
    ),
    [setSelectedReport],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          testID="AdminReportsScreen-button-back"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          User Reports
        </Text>
      </View>

      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onFilterChange={setStatusFilter}
      />

      {/* Reports List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onMuted }]}>
            Loading reports...
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadReports(true)}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={<EmptyState />}
        />
      )}

      {/* Report Detail Modal */}
      <ReportModal
        visible={selectedReport !== null}
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpdateStatus={updateReportStatus}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      marginEnd: theme.spacing.lg,
    },
    headerTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.body.size,
    },
    listContainer: {
      padding: theme.spacing.lg,
    },
  });
