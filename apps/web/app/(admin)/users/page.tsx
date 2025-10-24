'use client';

import {
  EnhancedButton,
  EnhancedCard,
  EnhancedDataTable,
  EnhancedDropdown,
  EnhancedInput,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import { api } from '@/services/api';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';

interface User extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'suspended' | 'banned' | 'pending';
  role: 'user' | 'premium' | 'admin';
  verified: boolean;
  createdAt: string;
  lastLogin: string;
  petCount: number;
  matchCount: number;
  avatar?: string;
}


const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
  { value: 'pending', label: 'Pending' },
];

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'user', label: 'User' },
  { value: 'premium', label: 'Premium' },
  { value: 'admin', label: 'Admin' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, _setPage] = useState(1);
  const [_totalPages, setTotalPages] = useState(1);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.request<{ success: boolean; data: { users: User[]; pagination: { pages: number } } }>(
          '/admin/users',
          {
            method: 'GET',
            params: {
              page,
              limit: 20,
              search: searchTerm || undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              role: selectedRole !== 'all' ? selectedRole : undefined,
              sortBy,
              sortDirection
            }
          }
        );

        if (response.success) {
          setUsers(response.data.users);
          setTotalPages(response.data.pagination.pages);
        }
      } catch (error) {
        logger.error('Failed to fetch users:', { error });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [page, searchTerm, selectedStatus, selectedRole, sortBy, sortDirection]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortDirection(direction);

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      let aValue: string | number | boolean = a[key as keyof User] as string | number | boolean;
      let bValue: string | number | boolean = b[key as keyof User] as string | number | boolean;

      if (key === 'createdAt' || key === 'lastLogin') {
        aValue = new Date(String(aValue)).getTime();
        bValue = new Date(String(bValue)).getTime();
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setUsers(sortedUsers);
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await api.request(`/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' })
      });
      setUsers(
        users.map((user) => (user.id === userId ? { ...user, status: 'suspended' as const } : user)),
      );
    } catch (error) {
      logger.error('Failed to suspend user:', { error });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await api.request(`/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      setUsers(
        users.map((user) => (user.id === userId ? { ...user, status: 'active' as const } : user)),
      );
    } catch (error) {
      logger.error('Failed to activate user:', { error });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.request(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      logger.error('Failed to delete user:', { error });
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      banned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: User['role']) => {
    const colors = {
      user: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const columns = [
    {
      key: 'user',
      label: 'User',
      sortable: false,
      render: (_value: unknown, row: User) => (
        <div className="flex items-center space-x-3">
          <img
            src={
              row.avatar ||
              `https://ui-avatars.com/api/?name=${row.firstName}+${row.lastName}&background=8B5CF6&color=fff`
            }
            alt={`${row.firstName} ${row.lastName}`}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: unknown) => getStatusBadge(value as User['status']),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (value: unknown) => getRoleBadge(value as User['role']),
    },
    {
      key: 'verified',
      label: 'Verified',
      sortable: true,
      render: (value: unknown) => (
        <div className="flex items-center">
          {value ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: 'petCount',
      label: 'Pets',
      sortable: true,
      render: (value: unknown) => (
        <span className="text-sm text-gray-900 dark:text-white">{value as number}</span>
      ),
    },
    {
      key: 'matchCount',
      label: 'Matches',
      sortable: true,
      render: (value: unknown) => (
        <span className="text-sm text-gray-900 dark:text-white">{value as number}</span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (value: unknown) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(value as string).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value: unknown, row: User) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => logger.info('View user:', { userId: row.id })}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label={`View ${row.firstName} ${row.lastName}`}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => logger.info('Edit user:', { userId: row.id })}
            className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
            aria-label={`Edit ${row.firstName} ${row.lastName}`}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          {row.status === 'active' ? (
            <button
              onClick={() => handleSuspendUser(row.id)}
              className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              aria-label={`Suspend ${row.firstName} ${row.lastName}`}
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => handleActivateUser(row.id)}
              className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              aria-label={`Activate ${row.firstName} ${row.lastName}`}
            >
              <CheckCircleIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteUser(row.id)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            aria-label={`Delete ${row.firstName} ${row.lastName}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton
          variant="card"
          count={3}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage platform users and their accounts
          </p>
        </div>

        <EnhancedButton
          onClick={() => logger.info('Create new user')}
          variant="primary"
          icon={<PlusIcon className="h-5 w-5" />}
          ariaLabel="Create new user"
        >
          Add User
        </EnhancedButton>
      </div>

      {/* Filters */}
      <EnhancedCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <EnhancedInput
            label="Search Users"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or email..."
            icon={<MagnifyingGlassIcon className="h-5 w-5" />}
          />

          <EnhancedDropdown
            label="Status"
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
          />

          <EnhancedDropdown
            label="Role"
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
          />

          <div className="flex items-end">
            <EnhancedButton
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedRole('all');
              }}
              variant="ghost"
              icon={<FunnelIcon className="h-5 w-5" />}
              ariaLabel="Clear filters"
            >
              Clear Filters
            </EnhancedButton>
          </div>
        </div>
      </EnhancedCard>

      {/* Users Table */}
      <EnhancedCard className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h3>
        </div>

        <EnhancedDataTable<User>
          data={filteredUsers}
          columns={columns}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
        />
      </EnhancedCard>
    </div>
  );
}
