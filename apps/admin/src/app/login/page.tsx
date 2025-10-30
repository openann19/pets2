'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // TODO: Implement actual authentication
    // For now, accept any credentials and set a mock session
    localStorage.setItem('admin-token', 'mock-token');
    localStorage.setItem('admin-session', JSON.stringify({
      id: '1',
      email: credentials.email,
      role: 'superadmin',
    }));

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-admin-dark flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-admin-dark-light p-8 rounded-lg border border-gray-700">
          <h1 className="text-3xl font-bold mb-2">PawfectMatch Admin</h1>
          <p className="text-gray-400 mb-8">Sign in to continue</p>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-admin-primary"
                placeholder="admin@pawfectmatch.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-2 bg-admin-dark border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-admin-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-admin-primary hover:bg-admin-primary-dark rounded-lg text-white font-medium transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-sm text-gray-400 text-center">
            <p>Use: admin@pawfectmatch.com / Admin123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
