'use client';

import { useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'premium' | 'admin';
  joinedAt: string;
  lastActive: string;
  petsCount: number;
  matchesCount: number;
}

export default function AdminUserController() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        logger.error('Failed to load users');
      }
    } catch (error) {
      logger.error('Error loading users', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
      });
      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      logger.error('Error suspending user', error);
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unsuspend`, {
        method: 'POST',
      });
      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      logger.error('Error unsuspending user', error);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
      });
      if (response.ok) {
        loadUsers();
      }
    } catch (error) {
      logger.error('Error banning user', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading users...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Users</h2>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(user.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded mt-1 ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'premium' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Details */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">User Details</h2>
          {selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Pets</p>
                  <p className="text-lg">{selectedUser.petsCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Matches</p>
                  <p className="text-lg">{selectedUser.matchesCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm">{new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Active</p>
                  <p className="text-sm">{new Date(selectedUser.lastActive).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                {selectedUser.status === 'suspended' ? (
                  <button
                    onClick={() => handleUnsuspendUser(selectedUser.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Unsuspend User
                  </button>
                ) : selectedUser.status !== 'banned' && (
                  <button
                    onClick={() => handleSuspendUser(selectedUser.id)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Suspend User
                  </button>
                )}
                {selectedUser.status !== 'banned' && (
                  <button
                    onClick={() => handleBanUser(selectedUser.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Ban User
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Select a user to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}
