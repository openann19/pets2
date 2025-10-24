'use client';

import { useEffect, useState } from 'react';

export default function SimpleAdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  // Check auth on page load
  useEffect(() => {
    const token = localStorage.getItem('auth-token');
    const role = localStorage.getItem('user-role');
    const email = localStorage.getItem('user-email');

    if (!token || !role) {
      window.location.href = '/admin';
      return;
    }

    setUserRole(role);
    setUserEmail(email);
    setIsAuthorized(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user-email');
    window.location.href = '/admin';
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome, Admin!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Role: {userRole} | Email: {userEmail}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">Users</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">15,420</p>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400">↑ 12.5%</span> from last month
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">Pets</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">18,950</p>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400">↑ 8.3%</span> from last month
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="text-lg font-medium text-purple-800 dark:text-purple-200 mb-2">
                Matches
              </h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">45,670</p>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400">↑ 15.2%</span> from last month
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center border-b border-gray-100 dark:border-gray-700 pb-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{i}</span>
                    </div>
                    <div>
                      <p className="font-medium">Activity {i}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(Date.now() - i * 3600000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Database Connection</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Server</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>WebSocket Service</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Authentication</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rate Limiting</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Admin Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
              <h3 className="font-medium">User Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View, edit, and manage users
              </p>
            </button>
            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View detailed metrics and reports
              </p>
            </button>
            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
              <h3 className="font-medium">Security</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Monitor security alerts and logs
              </p>
            </button>
            <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left">
              <h3 className="font-medium">Billing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage subscriptions and payments
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
