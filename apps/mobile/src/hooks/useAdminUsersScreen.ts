import { logger } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useErrorHandler } from './useErrorHandler';
import type { AdminScreenProps } from '../navigation/types';
import {
  fetchAdminUsers,
  invalidateAdminUsersCache,
  performAdminUserAction,
  type AdminUserAction,
  type AdminUserStatus,
  type AdminUserSummary,
} from '../services/adminUsersService';
import type {
  AdminUserListItemProps,
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
  keyExtractor: (item: AdminUserListItemViewModel) => string;
  getItemLayout: (
    data: ArrayLike<AdminUserListItemViewModel> | null | undefined,
    index: number,
  ) => { length: number; offset: number; index: number };
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

export const useAdminUsersScreen = ({
  navigation,
}: UseAdminUsersScreenParams): AdminUsersScreenState => {
  const { handleNetworkError, handleOfflineError } = useErrorHandler();
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminUsersStatusFilter>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [actionState, setActionState] = useState<{
    type: 'single' | 'bulk';
    id?: string;
  } | null>(null);
  const handlerCache = useRef<Map<string, CachedHandlers>>(new Map());

  const clearHandlerCache = useCallback(() => {
    handlerCache.current.clear();
  }, []);

  const loadUsers = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        if (!options?.force) {
          setIsLoading(true);
        }
        if (options?.force) {
          invalidateAdminUsersCache();
        }

        const response = await fetchAdminUsers();
        setUsers(response.users);
        setSelectedUserIds(new Set());
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Failed to load users');
        if (isOfflineError(err)) {
          handleOfflineError('admin.users.load', () => {
            void loadUsers(options);
          });
        } else {
          handleNetworkError(err, 'admin.users.load', () => {
            void loadUsers(options);
          });
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleNetworkError, handleOfflineError],
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

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

  const updateUserStatusLocal = useCallback((userId: string, status: AdminUserStatus) => {
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
  }, []);

  const handleSingleAction = useCallback(
    async (user: AdminUserSummary, action: AdminUserAction) => {
      try {
        setActionState({ type: 'single', id: user.id });
        await performAdminUserAction(user.id, action);
        updateUserStatusLocal(user.id, actionToStatus(action, user.status));
        clearHandlerCache();
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(`Failed to ${action} user`);
        if (isOfflineError(err)) {
          handleOfflineError(`admin.users.${action}`, () => {
            void handleSingleAction(user, action);
          });
        } else {
          handleNetworkError(err, `admin.users.${action}`);
        }
      } finally {
        setActionState(null);
      }
    },
    [clearHandlerCache, handleNetworkError, handleOfflineError, updateUserStatusLocal],
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
    [handlePrimaryAction, handleSecondaryAction, toggleUserSelection],
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

      setActionState({ type: 'bulk' });

      try {
        await Promise.all(
          Array.from(selectedUserIds).map(async (userId) => {
            const user = users.find((item) => item.id === userId);
            if (!user) {
              return;
            }
            await performAdminUserAction(userId, action);
            updateUserStatusLocal(userId, actionToStatus(action, user.status));
          }),
        );
        clearHandlerCache();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => undefined,
        );
      } catch (error: unknown) {
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
