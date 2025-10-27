'use client';

import { useState } from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export function AdminHeader() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-admin-dark-light border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-admin-primary"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <BellIcon className="h-6 w-6 text-gray-300" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <UserCircleIcon className="h-8 w-8 text-gray-300" />
              <div className="text-left">
                <div className="text-sm font-medium text-gray-100">Admin User</div>
                <div className="text-xs text-gray-400">superadmin</div>
              </div>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-admin-dark-light border border-gray-700 rounded-lg shadow-lg z-50">
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700">
                  Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700">
                  Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 border-t border-gray-700">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
