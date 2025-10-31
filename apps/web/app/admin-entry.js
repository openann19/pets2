'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@pawfectmatch/core';

/**
 * Simple Admin Entry Component
 * Used as a bridge to the admin panel until everything is fixed
 */
export default function AdminEntry() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, we're just hardcoding credentials
      // In a real app, this would make an API call
      if (
        (credentials.email === 'admin@pawfectmatch.com' && credentials.password === 'Admin123!') ||
        (credentials.email === 'moderator@pawfectmatch.com' &&
          credentials.password === 'Moderator123!') ||
        (credentials.email === 'support@pawfectmatch.com' &&
          credentials.password === 'Support123!') ||
        (credentials.email === 'analyst@pawfectmatch.com' &&
          credentials.password === 'Analyst123!') ||
        (credentials.email === 'billing@pawfectmatch.com' && credentials.password === 'Billing123!')
      ) {
        // Simple mock token for demo
        localStorage.setItem('auth-token', 'demo-token-123');

        // Store user role based on email
        let role = 'user';
        if (credentials.email.includes('admin@')) role = 'administrator';
        if (credentials.email.includes('moderator@')) role = 'moderator';
        if (credentials.email.includes('support@')) role = 'support';
        if (credentials.email.includes('analyst@')) role = 'analyst';
        if (credentials.email.includes('billing@')) role = 'billing_admin';

        // Store mock user
        localStorage.setItem(
          'user',
          JSON.stringify({
            _id: '12345',
            email: credentials.email,
            firstName: role.charAt(0).toUpperCase() + role.slice(1),
            lastName: 'User',
            role,
          }),
        );

        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
      logger.error('Admin entry login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
          <p className="text-gray-600 dark:text-gray-400">Access the PawfectMatch Admin Panel</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="admin@pawfectmatch.com"
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 dark:text-gray-300 mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Admin123!"
              required
            />
          </div>

          <div className="mb-4">
            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Demo Accounts:</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              admin@pawfectmatch.com / Admin123!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              moderator@pawfectmatch.com / Moderator123!
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
