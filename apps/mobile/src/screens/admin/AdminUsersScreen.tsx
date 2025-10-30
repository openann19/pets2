import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { useCallback, useMemo } from 'react';
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
import { useAdminUsersScreen } from '../../hooks/useAdminUsersScreen';
import type { AdminScreenProps } from '../../navigation/types';

const FILTER_BUTTON_HIT_SLOP = {
  top: 8,
  bottom: 8,
  left: 12,
  right: 12,
} as const;

const AdminUsersScreen = ({ navigation }: AdminScreenProps<'AdminUsers'>) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;
  const state = useAdminUsersScreen({ navigation });

  const { filters, onStatusChange, users, keyExtractor, getItemLayout } = state;

  const filterHandlers = useMemo(() => {
    return filters.reduce<Record<string, () => void>>((acc, filter) => {
      acc[filter.value] = () => {
        onStatusChange(filter.value);
      };
      return acc;
    }, {});
  }, [filters, onStatusChange]);

  const renderItem = useCallback(
    ({ item }: { item: AdminUserListItemViewModel }) => (
      <AdminUserListItem
        data={item}
        colors={theme.colors}
        onSelect={item.onSelect}
        onPrimaryAction={item.onPrimaryAction}
        onSecondaryAction={item.onSecondaryAction}
      />
    ),
    [theme],
  );

  return (
    <ErrorBoundary>
      <SafeAreaView
        style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])}
      >
        <View style={styles.header}>
          <View>
            <Text style={StyleSheet.flatten([styles.title, { color: colors.onSurface }])}>
              {state.title}
            </Text>
            <Text style={StyleSheet.flatten([styles.description, { color: colors.onMuted }])}>
              {state.description}
            </Text>
          </View>
          <TouchableOpacity
            style={StyleSheet.flatten([styles.backButton, { borderColor: colors.border }])}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={state.onBackPress}
          >
            <Text style={StyleSheet.flatten([styles.backButtonText, { color: colors.onSurface }])}>
              Back
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <View
            style={StyleSheet.flatten([styles.searchContainer, { borderColor: colors.border }])}
          >
            <TextInput
              value={state.searchQuery}
              onChangeText={state.onSearchChange}
              placeholder="Search users by name or email"
              placeholderTextColor={colors.onMuted}
              style={StyleSheet.flatten([styles.searchInput, { color: colors.onSurface }])}
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
                  testID={`filter-${filter.value}-button`}
                  onPress={filterHandlers[filter.value]}
                  style={StyleSheet.flatten([
                    styles.filterButton,
                    {
                      backgroundColor: isActive ? colors.primary : 'transparent',
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ])}
                  hitSlop={FILTER_BUTTON_HIT_SLOP}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${filter.label}`}
                  accessibilityState={{ selected: isActive }}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.filterText,
                      { color: isActive ? colors.onPrimary : colors.onSurface },
                    ])}
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
            <Text style={StyleSheet.flatten([styles.bulkStatusText, { color: colors.onSurface }])}>
              Performing bulk action...
            </Text>
          </View>
        ) : null}

        {state.selectedCount > 0 ? (
          <View
            style={StyleSheet.flatten([styles.bulkActions, { backgroundColor: colors.surface }])}
          >
            <Text style={StyleSheet.flatten([styles.bulkSummary, { color: colors.onSurface }])}>
              {state.selectedCount} selected
            </Text>
            <View style={styles.bulkButtons}>
              <TouchableOpacity
                style={StyleSheet.flatten([styles.bulkButton, { borderColor: colors.warning }])}
                testID="bulk-suspend-button"
                accessibilityLabel="Suspend selected users"
                accessibilityRole="button"
                onPress={state.onBulkSuspend}
              >
                <Text
                  style={StyleSheet.flatten([styles.bulkButtonText, { color: colors.warning }])}
                >
                  Suspend
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={StyleSheet.flatten([styles.bulkButton, { borderColor: colors.success }])}
                testID="bulk-activate-button"
                accessibilityLabel="Activate selected users"
                accessibilityRole="button"
                onPress={state.onBulkActivate}
              >
                <Text
                  style={StyleSheet.flatten([styles.bulkButtonText, { color: colors.success }])}
                >
                  Activate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.bulkButton,
                  { borderColor: theme.colors.danger },
                ])}
                testID="bulk-ban-button"
                accessibilityLabel="Ban selected users"
                accessibilityRole="button"
                onPress={state.onBulkBan}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.bulkButtonText,
                    { color: theme.colors.danger },
                  ])}
                >
                  Ban
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <FlatList
          data={users}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={state.isRefreshing}
              onRefresh={state.onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            state.isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                />
                <Text style={StyleSheet.flatten([styles.emptyText, { color: colors.onMuted }])}>
                  Loading users...
                </Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={StyleSheet.flatten([styles.emptyText, { color: colors.onMuted }])}>
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
    controls: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    searchContainer: {
      borderWidth: 1,
      borderRadius: theme.radii.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    searchInput: {
      fontSize: theme.typography.body.size * 0.9375,
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: 1,
    },
    filterText: {
      fontSize: theme.typography.body.size * 0.8125,
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
    bulkActions: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      elevation: 1,
    },
    bulkSummary: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.sm,
    },
    bulkButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    bulkButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bulkButtonText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
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
