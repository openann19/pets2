/**
 * Create Adoption Listing Page
 * Form to create a new adoption listing for a pet
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/theme';
import { AdoptionApplicationForm } from '@/components/Adoption/AdoptionApplicationForm';

export default function CreateAdoptionListingPage() {
  const router = useRouter();
  const theme = useTheme();

  // This page would typically have a form to create an adoption listing
  // For now, we'll show a placeholder that can be expanded
  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: theme.colors.bg,
        color: theme.colors.onSurface,
      }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-50 border-b"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{ color: theme.colors.onSurface }}
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold" style={{ color: theme.colors.onSurface }}>
                Create Adoption Listing
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div 
          className="rounded-xl p-8"
          style={{ 
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <p style={{ color: theme.colors.onMuted }}>
            Adoption listing creation form will be implemented here.
            This should allow pet owners to list their pets for adoption
            with photos, description, medical history, and adoption requirements.
          </p>
        </div>
      </div>
    </div>
  );
}

