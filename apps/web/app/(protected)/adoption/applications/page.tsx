/**
 * Adoption Applications Page
 * View and manage adoption applications
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { adoptionAPI } from '@/services/adoptionAPI';
import type { AdoptionApplication } from '@/services/adoptionAPI';
import { useTheme } from '@/theme';

export default function AdoptionApplicationsPage() {
  const router = useRouter();
  const theme = useTheme();
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await adoptionAPI.getApplications();
        setApplications(data);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
            style={{ borderColor: theme.colors.primary }} />
          <p style={{ color: theme.colors.onMuted }}>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: theme.colors.bg,
        color: theme.colors.onSurface,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: theme.colors.onSurface }}>
          My Adoption Applications
        </h1>
        
        {applications.length === 0 ? (
          <div 
            className="rounded-xl p-12 text-center"
            style={{ 
              backgroundColor: theme.colors.surface,
            }}
          >
            <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: theme.colors.onMuted }} />
            <p style={{ color: theme.colors.onMuted }}>
              No applications found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application._id}
                className="rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                style={{ 
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                }}
                onClick={() => router.push(`/adoption/applications/${application._id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold" style={{ color: theme.colors.onSurface }}>
                      Application #{application._id.slice(-8)}
                    </h3>
                    <p className="text-sm" style={{ color: theme.colors.onMuted }}>
                      Status: {application.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

