'use client';
import { BellAlertIcon, BellIcon, BellSlashIcon, CalendarIcon, MagnifyingGlassIcon, SpeakerWaveIcon, UserIcon, } from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '../UI/toast';
;
export const NotificationManagement = ({ onBack }) => {
    const toast = useToast();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showTestModal, setShowTestModal] = useState(false);
    const [testForm, setTestForm] = useState({
        title: '',
        body: '',
        type: 'admin_test',
    });
    const fetchNotificationData = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                ...(searchTerm && { search: searchTerm }),
            });
            const response = await fetch(`/api/admin/enhanced-features/notifications?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}`,
                },
            });
            const result = await response.json();
            if (result.success === true) {
                setData(result.data);
            }
        }
        catch (error) {
            logger.error('Failed to fetch notification data:', { error });
        }
        finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm]);
    useEffect(() => {
        void fetchNotificationData();
    }, [fetchNotificationData]);
    const handleUpdatePreferences = async (userId, updates) => {
        try {
            const response = await fetch(`/api/admin/enhanced-features/notifications/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(updates),
            });
            const result = await response.json();
            if (result.success === true) {
                toast.success('Preferences Updated', 'Notification preferences saved successfully.');
                setShowEditModal(false);
                setSelectedUser(null);
                void fetchNotificationData();
            }
            else {
                toast.error('Update Failed', result.message || 'Unable to update preferences.');
            }
        }
        catch (error) {
            logger.error('Failed to update preferences:', { error });
            toast.error('Update Failed', 'An error occurred. Please try again.');
        }
    };
    const handleSendTestNotification = async (userId) => {
        try {
            const response = await fetch(`/api/admin/enhanced-features/notifications/test/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify(testForm),
            });
            const result = await response.json();
            if (result.success === true) {
                toast.success('Test Sent', 'Test notification delivered successfully.');
                setShowTestModal(false);
                setTestForm({ title: '', body: '', type: 'admin_test' });
            }
            else {
                toast.error('Send Failed', result.message || 'Unable to send test notification.');
            }
        }
        catch (error) {
            logger.error('Failed to send test notification:', { error });
            toast.error('Send Failed', 'An error occurred. Please try again.');
        }
    };
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        void fetchNotificationData();
    };
    const getStatusIcon = (enabled) => enabled ? (<BellIcon className="w-5 h-5 text-green-500"/>) : (<BellSlashIcon className="w-5 h-5 text-red-500"/>);
    const getFrequencyColor = (frequency) => {
        switch (frequency) {
            case 'instant':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'batched':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'daily':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"/>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          ← Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Smart Notifications Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user notification preferences and settings
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => {
            setSearchTerm(e.target.value);
        }} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
          </div>
          <button type="submit" className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* Stats */}
      {data ? (<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <BellIcon className="w-6 h-6 text-green-600 dark:text-green-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Enabled Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.stats.enabledUsers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <BellAlertIcon className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quiet Hours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.stats.quietHoursEnabled}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <SpeakerWaveIcon className="w-6 h-6 text-purple-600 dark:text-purple-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Sound Enabled
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.preferences.filter((p) => p.sound).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.pagination.total}
                </p>
              </div>
            </div>
          </div>
        </div>) : null}

      {/* Preferences List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notification Preferences
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Types
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quiet Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.preferences.map((preference) => (<motion.tr key={preference._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                        {preference.userId.avatar ? (<img src={preference.userId.avatar} alt="" className="w-10 h-10 rounded-full object-cover"/>) : (<UserIcon className="w-5 h-5 text-pink-600 dark:text-pink-400"/>)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {preference.userId.firstName} {preference.userId.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {preference.userId.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(preference.enabled)}
                      <span className={`text-sm font-medium ${preference.enabled ? 'text-green-600' : 'text-red-600'}`}>
                        {preference.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFrequencyColor(preference.frequency)}`}>
                      {preference.frequency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {preference.matches ? (<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Matches
                        </span>) : null}
                      {preference.messages ? (<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Messages
                        </span>) : null}
                      {preference.likes ? (<span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                          Likes
                        </span>) : null}
                      {preference.reminders ? (<span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Reminders
                        </span>) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {preference.quietHours.enabled ? (<span className="text-sm text-gray-900 dark:text-white">
                          {preference.quietHours.start} - {preference.quietHours.end}
                        </span>) : (<span className="text-sm text-gray-500 dark:text-gray-400">Disabled</span>)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => {
                setSelectedUser(preference);
                setShowEditModal(true);
            }} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => {
                setSelectedUser(preference);
                setShowTestModal(true);
            }} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors">
                        Test
                      </button>
                    </div>
                  </td>
                </motion.tr>))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.pages > 1 ? (<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} results
              </p>
              <div className="flex space-x-2">
                <button onClick={() => {
                setCurrentPage((prev) => Math.max(1, prev - 1));
            }} disabled={currentPage === 1} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                  Previous
                </button>
                <button onClick={() => {
                setCurrentPage((prev) => Math.min(data.pagination.pages, prev + 1));
            }} disabled={currentPage === data.pagination.pages} className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700">
                  Next
                </button>
              </div>
            </div>
          </div>) : null}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser ? (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Notification Preferences
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {selectedUser.userId.firstName} {selectedUser.userId.lastName}
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Notifications
                </span>
                <input type="checkbox" checked={selectedUser.enabled} onChange={(e) => {
                setSelectedUser((prev) => prev ? { ...prev, enabled: e.target.checked } : null);
            }} className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"/>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Matches
                </span>
                <input type="checkbox" checked={selectedUser.matches} onChange={(e) => {
                setSelectedUser((prev) => prev ? { ...prev, matches: e.target.checked } : null);
            }} className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"/>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Messages
                </span>
                <input type="checkbox" checked={selectedUser.messages} onChange={(e) => {
                setSelectedUser((prev) => prev ? { ...prev, messages: e.target.checked } : null);
            }} className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"/>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Likes</span>
                <input type="checkbox" checked={selectedUser.likes} onChange={(e) => {
                setSelectedUser((prev) => (prev ? { ...prev, likes: e.target.checked } : null));
            }} className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"/>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reminders
                </span>
                <input type="checkbox" checked={selectedUser.reminders} onChange={(e) => {
                setSelectedUser((prev) => prev ? { ...prev, reminders: e.target.checked } : null);
            }} className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"/>
              </div>

              <div>
                <label htmlFor="frequency-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency
                </label>
                <select id="frequency-select" value={selectedUser.frequency} onChange={(e) => {
                setSelectedUser((prev) => prev ? { ...prev, frequency: e.target.value } : null);
            }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                  <option value="instant">Instant</option>
                  <option value="batched">Batched</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound</span>
                <input type="checkbox" checked={selectedUser.sound} onChange={(e) => {
                setSelectedUser((prev) => (prev ? { ...prev, sound: e.target.checked } : null));
            }} className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"/>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vibration
                </span>
                <input type="checkbox" checked={selectedUser.vibration} onChange={(e) => {
                setSelectedUser((prev) => prev ? { ...prev, vibration: e.target.checked } : null);
            }} className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"/>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button onClick={() => {
                setShowEditModal(false);
            }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleUpdatePreferences(selectedUser.userId._id, selectedUser)} className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>) : null}

      {/* Test Modal */}
      {showTestModal && selectedUser ? (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Send Test Notification
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Send a test notification to {selectedUser.userId.firstName}{' '}
              {selectedUser.userId.lastName}
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="test-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input id="test-title" type="text" value={testForm.title} onChange={(e) => {
                setTestForm((prev) => ({ ...prev, title: e.target.value }));
            }} placeholder="Test Notification" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>

              <div>
                <label htmlFor="test-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea id="test-message" value={testForm.body} onChange={(e) => {
                setTestForm((prev) => ({ ...prev, body: e.target.value }));
            }} placeholder="This is a test notification from the admin console" rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"/>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button onClick={() => {
                setShowTestModal(false);
            }} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleSendTestNotification(selectedUser.userId._id)} className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                Send Test
              </button>
            </div>
          </div>
        </div>) : null}
    </div>);
};
//# sourceMappingURL=NotificationManagement.jsx.map