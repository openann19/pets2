'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
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
      // Mock authentication for demo
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
        // Store mock token and user data
        localStorage.setItem('auth-token', 'demo-admin-token');

        // Determine role from email
        let role = 'user';
        if (credentials.email.includes('admin@')) role = 'administrator';
        if (credentials.email.includes('moderator@')) role = 'moderator';
        if (credentials.email.includes('support@')) role = 'support';
        if (credentials.email.includes('analyst@')) role = 'analyst';
        if (credentials.email.includes('billing@')) role = 'billing_admin';

        localStorage.setItem('user-role', role);
        localStorage.setItem('user-email', credentials.email);

        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError('Invalid credentials. Please try the demo accounts.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your admin account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="admin@pawfectmatch.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Admin123!"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isLoading
                  ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              } transition-colors`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            Demo Accounts
          </h2>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong>Administrator:</strong>
              <div>admin@pawfectmatch.com / Admin123!</div>
            </div>
            <div>
              <strong>Moderator:</strong>
              <div>moderator@pawfectmatch.com / Moderator123!</div>
            </div>
            <div>
              <strong>Support:</strong>
              <div>support@pawfectmatch.com / Support123!</div>
            </div>
            <div>
              <strong>Analyst:</strong>
              <div>analyst@pawfectmatch.com / Analyst123!</div>
            </div>
            <div>
              <strong>Billing Admin:</strong>
              <div>billing@pawfectmatch.com / Billing123!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
