'use client';

import LoadingSpinner from '@/src/components/UI/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAuthDisabled } from '../../src/config/dev';
import { useAuthStore } from '../../src/lib/auth-store';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthDisabled() && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isAuthDisabled() && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" variant="gradient" />
      </div>
    );
  }

  if (!isAuthDisabled() && !isAuthenticated) {
    return null;
  }

  // In development, always render children
  return <>{children}</>;
}
