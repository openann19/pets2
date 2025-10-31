import { logger } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useErrorHandler } from './useErrorHandler';
import { useDebounce } from './usePerformance';
import type { AdminScreenProps } from '../navigation/types';
import {
  deleteAdminUser,
  fetchAdminUsers,
  invalidateAdminUsersCache,
  performAdminUserAction,
  resetAdminUserPassword,
  type AdminUserAction,
  type AdminUserStatus,
  type AdminUserSummary,
  type AdminUsersQuery,
} from '../services/adminUsersService';
import type {
  AdminUserListItemViewModel,
} from '../components/admin/AdminUserListItem';

export type AdminUsersStatusFilter = 'all' | AdminUserStatus;

interface UseAdminUsersScreenParams {
  navigation: AdminScreenProps<'AdminUsers'>['navigation'];
}

interface AdminUsersScreenHandlers {
  onSearchChange: (value: string) => void;
  onStatusChange: (status: AdminUsersStatusFilter) => void;
  onRefresh: () => Promise<void>;
  onBulkSuspend: () => Promise<void>;
  onBulkActivate: () => Promise<void>;
  onBulkBan: () => Promise<void>;
  onBackPress: () => void;
}

export interface AdminUsersScreenState extends AdminUsersScreenHandlers {
  title: string;
  description: string;
  searchQuery: string;
  statusFilter: AdminUsersStatusFilter;
  filters: Array<{ label: string; value: AdminUsersStatusFilter }>;
  selectedCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isBulkProcessing: boolean;
  users: AdminUserListItemViewModel[];
  pagination: {
    page: number;
    total: number;
    pages: number;
    hasMore: boolean;
    isLoadingMore: boolean;
  };
  loadMore: () => Promise<void>;
  keyExtractor: (item: AdminUserListItemViewModel) => string;
  getItemLayout: (
    data: ArrayLike<AdminUserListItemViewModel> | null | undefined,
    index: number,
  ) => { length: number; offset: number; index: number };
  selectedUserForActions: AdminUserSummary | null;
  onDeleteUser: (reason?: string) => Promise<void>;
  onResetPassword: () => Promise<void>;
  onCloseActionsModal: () => void;
  isActionLoading: boolean;
}

const STATUS_FILTERS: Array<{ label: string; value: AdminUsersStatusFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Banned', value: 'banned' },
  { label: 'Pending', value: 'pending' },
];

const STATUS_META: Record<
  AdminUserStatus,
  {
    color: string;
    icon: AdminUserListItemViewModel['statusIcon'];
    label: string;
  }
> = {
  active: { color: '#10B981', icon: 'checkmark-circle', label: 'Active' },
  suspended: { color: '#F59E0B', icon: 'pause-circle', label: 'Suspended' },
  banned: { color: '#EF4444', icon: 'ban', label: 'Banned' },
  pending: { color: '#6B7280', icon: 'time', label: 'Pending' },
};

const actionToStatus = (action: AdminUserAction, current: AdminUserStatus): AdminUserStatus => {
  if (action === 'suspend') return 'suspended';
  if (action === 'ban') return 'banned';
  if (action === 'activate') return 'active';
  if (action === 'unban') return current === 'suspended' ? 'suspended' : 'active';
  return current;
};

const isOfflineError = (error: unknown): boolean => {
  if (
    error instanceof TypeError &&
    error.message.toLowerCase().includes('network request failed')
  ) {
    return true;
  }
  if (error instanceof Error && error.message.toLowerCase().includes('network')) {
    return true;
  }
  return false;
};

const formatCreatedDate = (iso: string): string => {
  try {
    const date = new Date(iso);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } catch {
    return 'Joined recently';
  }
};

interface CachedHandlers {
  onSelect: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

export const useAdminUsersScreen = ({
  navigation,
}: UseAdminUsersScreenParams): AdminUsersScreenState => {
  const { handleNetworkError, handleOfflineError } = useErrorHandler();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const [statusFilter, setStatusFilter] = useState<AdminUsersStatusFilter>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
    limit: DEFAULT_PAGE_SIZE,
  });
  const [actionState, setActionState] = useState<{
    type: 'single' | 'bulk' | 'delete' | 'resetPassword';
    id?: string;
  } | null>(null);
  const [selectedUserForActions, setSelectedUserForActions] = useState<AdminUserSummary | null>(
    null,
  );
  const handlerCache = useRef<Map<string, CachedHandlers>>(new Map());
  const optimisticUpdates = useRef<Map<string, Partial<AdminUserSummary>>>(new Map());
  const retryCountRef = useRef<Map<string, number>>(new Map());
  const previousStatuses = useRef<Map<string, AdminUserStatus>>(new Map());

  const clearHandlerCache = useCallback(() => {
    handlerCache.current.clear();
  }, []);

  const loadUsers = useCallback(
    async (options?: { force?: boolean; append?: boolean; page?: number }) => {
      try {
        if (!options?.append && !options?.force) {
          setIsLoading(true);
        }
        if (options?.append) {
          setIsLoadingMore(true);
        }
        if (options?.force) {
          invalidateAdminUsersCache();
          optimisticUpdates.current.clear();
          retryCountRef.current.clear();
        }

        const query: AdminUsersQuery = {
          page: options?.page ?? (options?.append ? pagination.page + 1 : 1),
          limit: DEFAULT_PAGE_SIZE,
        };
        const trimmedSearch = debouncedSearchQuery.trim();
        if (trimmedSearch) {
          query.search = trimmedSearch;
        }
        if (statusFilter !== 'all') {
          query.status = statusFilter;
        }

        const response = await fetchAdminUsers(query);
        
        if (options?.append) {
          setUsers((prev) => [...prev, ...response.users]);
          setPagination({
            page: response.pagination.page,
            total: response.pagination.total,
            pages: response.pagination.pages,
            limit: response.pagination.limit,
          });
        } else {
          setUsers(response.users);
          setPagination({
            page: response.pagination.page,
            total: response.pagination.total,
            pages: response.pagination.pages,
            limit: response.pagination.limit,
          });
        }
        
        setSelectedUserIds((prev) => {
          const next = new Set(prev);
          prev.forEach((id) => {
            if (!response.users.some((u) => u.id === id)) {
              next.delete(id);
            }
          });
          return next;
        });
        
        retryCountRef.current.clear();
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to load users');
        const retryKey = `load-${debouncedSearchQuery}-${statusFilter}`;
        const retryCount = retryCountRef.current.get(retryKey) ?? 0;
        
        if (retryCount < 3) {
          retryCountRef.current.set(retryKey, retryCount + 1);
          setTimeout(() => {
            void loadUsers(options);
          }, Math.min(1000 * Math.pow(2, retryCount), 5000));
        } else {
          if (isOfflineError(err)) {
            handleOfflineError('admin.users.load', () => {
              retryCountRef.current.delete(retryKey);
              void loadUsers(options);
            });
          } else {
            handleNetworkError(err, 'admin.users.load', () => {
              retryCountRef.current.delete(retryKey);
              void loadUsers(options);
            });
          }
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [handleNetworkError, handleOfflineError, debouncedSearchQuery, statusFilter, pagination.page],
  );

  useEffect(() => {
    void loadUsers();
  }, [debouncedSearchQuery, statusFilter]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || pagination.page >= pagination.pages) {
      return;
    }
    await loadUsers({ append: true });
  }, [loadUsers, isLoadingMore, pagination.page, pagination.pages]);

  const toggleUserSelection = useCallback(async (userId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      logger.warn('Haptics not available', { error });
    }

    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const updateUserStatusLocal = useCallback(
    (userId: string, status: AdminUserStatus, optimistic = false) => {
      if (optimistic) {
        const currentUser = users.find((u) => u.id === userId);
        if (currentUser) {
          previousStatuses.current.set(userId, currentUser.status);
          optimisticUpdates.current.set(userId, { status });
        }
      }
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                status,
              }
            : user,
        ),
      );
    },
    [users],
  );
  
  const rollbackOptimisticUpdate = useCallback((userId: string) => {
    const update = optimisticUpdates.current.get(userId);
    const previousStatus = previousStatuses.current.get(userId);
    
    if (update && previousStatus) {
      optimisticUpdates.current.delete(userId);
      previousStatuses.current.delete(userId);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: previousStatus,
              }
            : user,
        ),
      );
    }
  }, []);

  const handleSingleAction = useCallback(
    async (user: AdminUserSummary, action: AdminUserAction) => {
      const newStatus = actionToStatus(action, user.status);
      const previousStatus = user.status;
      
      try {
        setActionState({ type: 'single', id: user.id });
        
        // Optimistic update
        updateUserStatusLocal(user.id, newStatus, true);
        
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Ignore haptics errors
        }
        
        await performAdminUserAction(user.id, action);
        
        // Confirm the update
        optimisticUpdates.current.delete(user.id);
        clearHandlerCache();
      } catch (error: unknown) {
        // Rollback optimistic update
        rollbackOptimisticUpdate(user.id);
        
        const err = error instanceof Error ? error : new Error(`Failed to ${action} user`);
        if (isOfflineError(err)) {
          handleOfflineError(`admin.users.${action}`, () => {
            void handleSingleAction(user, action);
          });
        } else {
          handleNetworkError(err, `admin.users.${action}`);
          // Restore previous status on error
          updateUserStatusLocal(user.id, previousStatus);
        }
      } finally {
        setActionState(null);
      }
    },
    [
      clearHandlerCache,
      handleNetworkError,
      handleOfflineError,
      updateUserStatusLocal,
      rollbackOptimisticUpdate,
    ],
  );

  const primaryActionForStatus = useCallback((status: AdminUserStatus): AdminUserAction => {
    return status === 'active' ? 'suspend' : 'activate';
  }, []);

  const secondaryActionForStatus = useCallback((status: AdminUserStatus): AdminUserAction => {
    return status === 'banned' ? 'unban' : 'ban';
  }, []);

  const handlePrimaryAction = useCallback(
    (user: AdminUserSummary) => {
      return handleSingleAction(user, primaryActionForStatus(user.status));
    },
    [handleSingleAction, primaryActionForStatus],
  );

  const handleSecondaryAction = useCallback(
    (user: AdminUserSummary) => {
      return handleSingleAction(user, secondaryActionForStatus(user.status));
    },
    [handleSingleAction, secondaryActionForStatus],
  );

  const handleMoreActions = useCallback((user: AdminUserSummary) => {
    setSelectedUserForActions(user);
  }, []);

  const handleDeleteUser = useCallback(
    async (reason?: string) => {
      if (!selectedUserForActions) return;
      try {
        setActionState({ type: 'delete', id: selectedUserForActions.id });
        await deleteAdminUser(selectedUserForActions.id, reason);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => undefined,
        );
        setUsers((prev) => prev.filter((u) => u.id !== selectedUserForActions.id));
        setSelectedUserForActions(null);
        clearHandlerCache();
        Alert.alert('Success', 'User deleted successfully');
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to delete user');
        if (isOfflineError(err)) {
          handleOfflineError('admin.users.delete', () => {
            void handleDeleteUser(reason);
          });
        } else {
          handleNetworkError(err, 'admin.users.delete');
        }
      } finally {
        setActionState(null);
        invalidateAdminUsersCache();
        void loadUsers({ force: true });
      }
    },
    [selectedUserForActions, clearHandlerCache, handleNetworkError, handleOfflineError, loadUsers],
  );

  const handleResetPassword = useCallback(
    async () => {
      if (!selectedUserForActions) return;
      try {
        setActionState({ type: 'resetPassword', id: selectedUserForActions.id });
        const result = await resetAdminUserPassword(selectedUserForActions.id);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => undefined,
        );
        setSelectedUserForActions(null);
        Alert.alert(
          'Password Reset',
          `Temporary password: ${result.temporaryPassword}\n\nPlease copy this password and share it securely with the user.`,
          [{ text: 'OK' }],
        );
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to reset password');
        if (isOfflineError(err)) {
          handleOfflineError('admin.users.resetPassword', () => {
            void handleResetPassword();
          });
        } else {
          handleNetworkError(err, 'admin.users.resetPassword');
        }
      } finally {
        setActionState(null);
      }
    },
    [selectedUserForActions, handleNetworkError, handleOfflineError],
  );

  useEffect(() => {
    clearHandlerCache();
  }, [clearHandlerCache, toggleUserSelection, handlePrimaryAction, handleSecondaryAction]);

  const getHandlersForUser = useCallback(
    (user: AdminUserSummary): CachedHandlers => {
      const existing = handlerCache.current.get(user.id);
      if (existing) {
        return existing;
      }

      const handlers: CachedHandlers = {
        onSelect: () => {
          void toggleUserSelection(user.id);
        },
        onPrimaryAction: () => {
          void handlePrimaryAction(user);
        },
        onSecondaryAction: () => {
          void handleSecondaryAction(user);
        },
      };

      handlerCache.current.set(user.id, handlers);
      return handlers;
    },
    [handlePrimaryAction, handleSecondaryAction, toggleUserSelection, handleMoreActions],
  );

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      const matchesStatus = statusFilter === 'all' ? true : user.status === statusFilter;
      const matchesQuery =
        query.length === 0 ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [users, statusFilter, searchQuery]);

  const listItems = useMemo<AdminUserListItemViewModel[]>(() => {
    return filteredUsers.map((user) => {
      const handlers = getHandlersForUser(user);
      const meta = STATUS_META[user.status];
      const initials =
        `${user.firstName.charAt(0) ?? ''}${user.lastName.charAt(0) ?? ''}`.toUpperCase();
      const isSelected = selectedUserIds.has(user.id);
      const isActionLoading = actionState?.type === 'single' && actionState.id === user.id;

      const primaryAction = primaryActionForStatus(user.status);
      const secondaryAction = secondaryActionForStatus(user.status);

      return {
        id: user.id,
        initials: initials === '' ? 'NA' : initials,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        status: user.status,
        statusLabel: meta.label,
        statusColor: meta.color,
        statusIcon: meta.icon,
        verified: user.verified,
        createdDateLabel: formatCreatedDate(user.createdAt),
        metrics: {
          pets: user.petsCount,
          matches: user.matchesCount,
          messages: user.messagesCount,
        },
        isSelected,
        isActionLoading,
        primaryAction: {
          icon: primaryAction === 'suspend' ? 'pause' : 'play',
          tint: primaryAction === 'suspend' ? '#F59E0B' : '#10B981',
          accessibilityLabel: primaryAction === 'suspend' ? 'Suspend user' : 'Activate user',
        },
        secondaryAction: {
          icon: secondaryAction === 'ban' ? 'ban' : 'checkmark-circle',
          tint: secondaryAction === 'ban' ? '#EF4444' : '#10B981',
          accessibilityLabel: secondaryAction === 'ban' ? 'Ban user' : 'Reinstate user',
        },
        ...handlers,
      };
    });
  }, [
    filteredUsers,
    getHandlersForUser,
    selectedUserIds,
    actionState,
    primaryActionForStatus,
    secondaryActionForStatus,
  ]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleStatusChange = useCallback((value: AdminUsersStatusFilter) => {
    setStatusFilter(value);
  }, []);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadUsers({ force: true });
  }, [loadUsers]);

  const performBulkAction = useCallback(
    async (action: AdminUserAction) => {
      if (selectedUserIds.size === 0) {
        Alert.alert('No users selected', 'Select at least one user to perform this action.');
        return;
      }

      const selectedUsers = users.filter((u) => selectedUserIds.has(u.id));
      const statusMap = new Map(selectedUsers.map((u) => [u.id, u.status]));
      const newStatuses = new Map(
        selectedUsers.map((u) => [u.id, actionToStatus(action, u.status)]),
      );

      setActionState({ type: 'bulk' });

      try {
        // Optimistic updates
        selectedUsers.forEach((user) => {
          const newStatus = newStatuses.get(user.id);
          if (newStatus) {
            updateUserStatusLocal(user.id, newStatus, true);
          }
        });

        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Ignore haptics errors
        }

        // Perform actions with better error handling
        const results = await Promise.allSettled(
          selectedUsers.map(async (user) => {
            const newStatus = newStatuses.get(user.id);
            if (!newStatus) return;
            await performAdminUserAction(user.id, action);
            return { userId: user.id, status: newStatus };
          }),
        );

        // Check for failures and rollback those specific users
        const failedUserIds = new Set<string>();
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            failedUserIds.add(selectedUsers[index]?.id ?? '');
          }
        });

        // Rollback failed users
        failedUserIds.forEach((userId) => {
          const previousStatus = statusMap.get(userId);
          if (previousStatus) {
            rollbackOptimisticUpdate(userId);
            updateUserStatusLocal(userId, previousStatus);
          }
        });

        if (failedUserIds.size > 0 && failedUserIds.size < selectedUsers.length) {
          Alert.alert(
            'Partial Success',
            `${selectedUsers.length - failedUserIds.size} users updated successfully. ${failedUserIds.size} failed.`,
          );
        }

        clearHandlerCache();
        
        // Clear selections on success
        if (failedUserIds.size === 0) {
          setSelectedUserIds(new Set());
        } else {
          // Keep only failed selections
          setSelectedUserIds((prev) => {
            const next = new Set<string>();
            prev.forEach((id) => {
              if (failedUserIds.has(id)) {
                next.add(id);
              }
            });
            return next;
          });
        }
      } catch (error: unknown) {
        // Rollback all optimistic updates on complete failure
        selectedUsers.forEach((user) => {
          rollbackOptimisticUpdate(user.id);
          const previousStatus = statusMap.get(user.id);
          if (previousStatus) {
            updateUserStatusLocal(user.id, previousStatus);
          }
        });

        const err =
          error instanceof Error ? error : new Error(`Failed to ${action} selected users`);
        if (isOfflineError(err)) {
          handleOfflineError(`admin.users.bulk.${action}`, () => {
            void performBulkAction(action);
          });
        } else {
          handleNetworkError(err, `admin.users.bulk.${action}`);
        }
      } finally {
        setActionState(null);
        invalidateAdminUsersCache();
        void loadUsers({ force: true });
      }
    },
    [
      clearHandlerCache,
      handleNetworkError,
      handleOfflineError,
      selectedUserIds,
      updateUserStatusLocal,
      rollbackOptimisticUpdate,
      users,
      loadUsers,
    ],
  );

  const onBulkSuspend = useCallback(() => performBulkAction('suspend'), [performBulkAction]);
  const onBulkActivate = useCallback(() => performBulkAction('activate'), [performBulkAction]);
  const onBulkBan = useCallback(() => performBulkAction('ban'), [performBulkAction]);

  const keyExtractor = useCallback((item: AdminUserListItemViewModel) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<AdminUserListItemViewModel> | null | undefined, index: number) => ({
      length: 152,
      offset: 152 * index,
      index,
    }),
    [],
  );

  return {
    title: 'User Management',
    description: 'Monitor, filter, and moderate the entire user base with precision controls.',
    searchQuery,
    statusFilter,
    filters: STATUS_FILTERS,
    selectedCount: selectedUserIds.size,
    isLoading,
    isRefreshing,
    isBulkProcessing: actionState?.type === 'bulk',
    users: listItems,
    pagination: {
      page: pagination.page,
      total: pagination.total,
      pages: pagination.pages,
      hasMore: pagination.page < pagination.pages,
      isLoadingMore,
    },
    loadMore,
    selectedUserForActions,
    onDeleteUser: handleDeleteUser,
    onResetPassword: handleResetPassword,
    onCloseActionsModal: () => setSelectedUserForActions(null),
    isActionLoading: actionState !== null,
    onSearchChange: handleSearchChange,
    onStatusChange: handleStatusChange,
    onRefresh,
    onBulkSuspend,
    onBulkActivate,
    onBulkBan,
    onBackPress: () => {
      navigation.goBack();
    },
    keyExtractor,
    getItemLayout,
  };
};

export default useAdminUsersScreen;
