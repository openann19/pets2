import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import {
  AdminUserListItem,
  type AdminUserListItemViewModel,
} from '../../components/admin/AdminUserListItem';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdminUsersScreen } from '../../hooks/useAdminUsersScreen';
import type { AdminScreenProps } from '../../navigation/types';

const FILTER_BUTTON_HIT_SLOP = { top: 8, bottom: 8, left: 12, right: 12 } as const;

const AdminUsersScreen = ({ navigation }: AdminScreenProps<'AdminUsers'>) => {
  const { colors } = useTheme();
  const state = useAdminUsersScreen({ navigation });

  const { filters, onStatusChange, users, keyExtractor, getItemLayout } = state;

  const filterHandlers = useMemo(() => {
    return filters.reduce<Record<string, () => void>>((acc, filter) => {
      acc[filter.value] = () => { onStatusChange(filter.value); };
      return acc;
    }, {});
  }, [filters, onStatusChange]);

  const renderItem = useCallback(
    ({ item }: { item: AdminUserListItemViewModel }) => (
      <AdminUserListItem
        data={item}
        colors={colors}
        onSelect={item.onSelect}
        onPrimaryAction={item.onPrimaryAction}
        onSecondaryAction={item.onSecondaryAction}
      />
    ),
    [colors]
  );

  return (
    <ErrorBoundary>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{state.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {state.description}
            </Text>
          </View>
          <TouchableOpacity
            onPress={state.onBackPress}
            style={[styles.backButton, { borderColor: colors.border }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <View style={[styles.searchContainer, { borderColor: colors.border }]}> 
            <TextInput
              value={state.searchQuery}
              onChangeText={state.onSearchChange}
              placeholder="Search users by name or email"
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
              autoCorrect={false}
              accessibilityRole="search"
            />
          </View>

          <View style={styles.filterRow}>
            {filters.map((filter) => {
              const isActive = state.statusFilter === filter.value;
              return (
                <TouchableOpacity
                  key={filter.value}
                  onPress={filterHandlers[filter.value]}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor: isActive ? colors.primary : 'transparent',
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  hitSlop={FILTER_BUTTON_HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: isActive ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {state.isBulkProcessing ? (
          <View style={styles.bulkStatus}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.bulkStatusText, { color: colors.text }]}>
              Performing bulk action...
            </Text>
          </View>
        ) : null}

        {state.selectedCount > 0 ? (
          <View style={[styles.bulkActions, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.bulkSummary, { color: colors.text }]}>
              {state.selectedCount} selected
            </Text>
            <View style={styles.bulkButtons}>
              <TouchableOpacity
                style={[styles.bulkButton, { borderColor: colors.warning }]}
                onPress={state.onBulkSuspend}
                accessibilityRole="button"
              >
                <Text style={[styles.bulkButtonText, { color: colors.warning }]}>Suspend</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bulkButton, { borderColor: colors.success }]}
                onPress={state.onBulkActivate}
                accessibilityRole="button"
              >
                <Text style={[styles.bulkButtonText, { color: colors.success }]}>Activate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bulkButton, { borderColor: colors.error }]}
                onPress={state.onBulkBan}
                accessibilityRole="button"
              >
                <Text style={[styles.bulkButtonText, { color: colors.error }]}>Ban</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <FlatList
          data={users}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          refreshControl={(
            <RefreshControl
              refreshing={state.isRefreshing}
              onRefresh={state.onRefresh}
              tintColor={colors.primary}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            state.isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Loading users...
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  backButtonText: {
    fontWeight: '600',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
  searchContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bulkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  bulkStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bulkActions: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    elevation: 1,
  },
  bulkSummary: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 260,
  },
});

export default AdminUsersScreen;
