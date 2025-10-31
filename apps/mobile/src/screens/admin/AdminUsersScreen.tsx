/**
 * Admin Users Screen
 * REFACTORED: Extracted components for better maintainability
 */

import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { useCallback, useMemo } from 'react';
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
import { ErrorBoundary } from '../../components/ErrorBoundary';
import {
  AdminUserListItem,
  type AdminUserListItemViewModel,
} from '../../components/admin/AdminUserListItem';
import { useAdminUsersScreen, type AdminUsersStatusFilter } from '../../hooks/useAdminUsersScreen';
import type { AdminScreenProps } from '../../navigation/types';
import { BulkActions, SearchAndFilters, UserActionsModal } from './users/components';

const AdminUsersScreen = ({ navigation }: AdminScreenProps<'AdminUsers'>) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const state = useAdminUsersScreen({ navigation });

  const { filters, onStatusChange, users, keyExtractor, getItemLayout } = state;

  const renderItem = useCallback(
    ({ item }: { item: AdminUserListItemViewModel }) => (
      <AdminUserListItem
        data={item}
        colors={theme.colors}
        onSelect={item.onSelect}
        onPrimaryAction={item.onPrimaryAction}
        onSecondaryAction={item.onSecondaryAction}
        {...(item.onMoreActions && { onMoreActions: item.onMoreActions })}
      />
    ),
    [theme],
  );

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>
              {state.title}
            </Text>
            <Text style={[styles.description, { color: theme.colors.onMuted }]}>
              {state.description}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: theme.colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={state.onBackPress}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.onSurface }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        <SearchAndFilters
          searchQuery={state.searchQuery}
          filters={filters}
          activeFilter={state.statusFilter}
          onSearchChange={state.onSearchChange}
          onFilterChange={(value) => onStatusChange(value as AdminUsersStatusFilter)}
        />

        {state.isBulkProcessing ? (
          <View style={styles.bulkStatus}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={[styles.bulkStatusText, { color: theme.colors.onSurface }]}>
              Performing bulk action...
            </Text>
          </View>
        ) : null}

        <BulkActions
          selectedCount={state.selectedCount}
          onSuspend={state.onBulkSuspend}
          onActivate={state.onBulkActivate}
          onBan={state.onBulkBan}
        />

        <UserActionsModal
          visible={state.selectedUserForActions !== null}
          userName={
            state.selectedUserForActions
              ? `${state.selectedUserForActions.firstName} ${state.selectedUserForActions.lastName}`
              : ''
          }
          userEmail={state.selectedUserForActions?.email ?? ''}
          isLoading={state.isActionLoading}
          onClose={state.onCloseActionsModal}
          onDelete={state.onDeleteUser}
          onResetPassword={state.onResetPassword}
        />

        <FlatList
          data={users}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={state.isRefreshing}
              onRefresh={state.onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            state.isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.primary}
                />
                <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
                  Loading users...
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
                  No users match the current filters.
                </Text>
              </View>
            )
          }
          getItemLayout={getItemLayout}
          initialNumToRender={8}
          windowSize={5}
          removeClippedSubviews
        />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.xs,
    },
    description: {
      fontSize: theme.typography.body.size * 0.875,
    },
    backButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: 1,
    },
    backButtonText: {
      fontWeight: theme.typography.h2.weight,
    },
    bulkStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    bulkStatusText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.body.weight,
    },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      paddingTop: theme.spacing.xs,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing['2xl'],
      gap: theme.spacing.sm,
    },
    emptyText: {
      fontSize: theme.typography.body.size * 0.875,
      textAlign: 'center',
      maxWidth: 260,
    },
  });

export default AdminUsersScreen;
