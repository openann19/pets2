'use client';
import { useToast } from '@/components/ui/toast';
import { CalendarIcon, FingerPrintIcon, MagnifyingGlassIcon, ShieldCheckIcon, TrashIcon, UserIcon, } from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
export const BiometricManagement = ({ onBack }) => {
    const toast = useToast();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        fetchBiometricData();
    }, [currentPage, searchTerm]);
    const fetchBiometricData = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '20',
                ...(searchTerm && { search: searchTerm }),
            });
            const response = await fetch(`/api/admin/enhanced-features/biometric?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        }
        catch (error) {
            logger.error('Failed to fetch biometric data:', { error });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleRemoveCredential = async (userId) => {
        if (!confirm("Are you sure you want to remove this user's biometric credential?")) {
            return;
        }
        try {
            const response = await fetch(`/api/admin/enhanced-features/biometric/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            const result = await response.json();
            if (result.success) {
                toast.success('Biometric credential removed', 'The user\'s biometric authentication has been disabled.');
                fetchBiometricData();
            }
            else {
                toast.error('Failed to remove credential', result.message || 'Please try again.');
            }
        }
        catch (error) {
            logger.error('Failed to remove credential:', { error });
            toast.error('Failed to remove biometric credential', 'An error occurred. Please try again.');
        }
    };
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchBiometricData();
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
            Biometric Authentication Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user biometric credentials and authentication settings
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
      {data ? (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <FingerPrintIcon className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Credentials
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.pagination.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.credentials.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400"/>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Page</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.pagination.page} / {data.pagination.pages}
                </p>
              </div>
            </div>
          </div>
        </div>) : null}

      {/* Credentials List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Biometric Credentials
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
                  Credential ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usage Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.credentials.map((credential) => (<motion.tr key={credential._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                        {credential.userId.avatar ? (<img src={credential.userId.avatar} alt="" className="w-10 h-10 rounded-full object-cover"/>) : (<UserIcon className="w-5 h-5 text-pink-600 dark:text-pink-400"/>)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {credential.userId.firstName} {credential.userId.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {credential.userId.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {credential.credentialId.substring(0, 20)}...
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {credential.counter}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(credential.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(credential.lastUsed).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleRemoveCredential(credential.userId._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                      <TrashIcon className="w-5 h-5"/>
                    </button>
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
    </div>);
};
//# sourceMappingURL=BiometricManagement.jsx.map