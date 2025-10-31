/**
 * Adoption Manager Page
 * Main hub for adoption listings and applications
 * Matches mobile AdoptionManagerScreen structure
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, PlusIcon, ClipboardDocumentListIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { adoptionAPI } from '@/services/adoptionAPI';
import type { AdoptionApplication } from '@/services/adoptionAPI';
import { useTheme } from '@/theme';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import { AdoptionApplicationForm } from '@/components/Adoption/AdoptionApplicationForm';

export default function AdoptionManagerPage() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'applications'>('listings');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'listings') {
          const data = await adoptionAPI.getListings();
          setListings(data);
        } else {
          const data = await adoptionAPI.getApplications();
          setApplications(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

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
              <div className="flex items-center gap-2">
                <HeartIcon className="w-6 h-6" style={{ color: theme.colors.primary }} />
                <h1 className="text-xl font-bold" style={{ color: theme.colors.onSurface }}>
                  Adoption Center
                </h1>
              </div>
            </div>
            <Link
              href="/adoption/create"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.onPrimary,
              }}
            >
              <PlusIcon className="w-5 h-5" />
              Create Listing
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'listings'
                  ? 'border-b-2'
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                color: activeTab === 'listings' ? theme.colors.primary : theme.colors.onMuted,
                borderBottomColor: activeTab === 'listings' ? theme.colors.primary : 'transparent',
              }}
            >
              Available Pets
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'applications'
                  ? 'border-b-2'
                  : 'opacity-60 hover:opacity-80'
              }`}
              style={{
                color: activeTab === 'applications' ? theme.colors.primary : theme.colors.onMuted,
                borderBottomColor: activeTab === 'applications' ? theme.colors.primary : 'transparent',
              }}
            >
              My Applications
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
                style={{ borderColor: theme.colors.primary }} />
              <p style={{ color: theme.colors.onMuted }}>Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div 
            className="rounded-lg p-6 text-center"
            style={{ 
              backgroundColor: theme.colors.surface,
              color: theme.colors.danger,
            }}
          >
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
              className="mt-4 px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: theme.colors.onPrimary,
              }}
            >
              Retry
            </button>
          </div>
        ) : activeTab === 'listings' ? (
          listings.length === 0 ? (
            <div 
              className="rounded-xl p-12 text-center"
              style={{ 
                backgroundColor: theme.colors.surface,
              }}
            >
              <HeartIcon className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: theme.colors.onMuted }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.onSurface }}>
                No Pets Available
              </h2>
              <p style={{ color: theme.colors.onMuted }}>
                Check back soon for new adoption listings!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((pet: any) => (
                <motion.div
                  key={pet._id || pet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                  onClick={() => router.push(`/adoption/${pet._id || pet.id}`)}
                >
                  {pet.photos?.[0] && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={pet.photos[0]} 
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2" style={{ color: theme.colors.onSurface }}>
                      {pet.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm mb-2" style={{ color: theme.colors.onMuted }}>
                      <span>{pet.breed || 'Mixed'}</span>
                      <span>•</span>
                      <span>{pet.age} {pet.age === 1 ? 'year' : 'years'} old</span>
                    </div>
                    {pet.description && (
                      <p className="text-sm line-clamp-2 mb-4" style={{ color: theme.colors.onMuted }}>
                        {pet.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: theme.colors.primary + '20',
                          color: theme.colors.primary,
                        }}
                      >
                        Available
                      </span>
                      <ArrowRightIcon className="w-5 h-5" style={{ color: theme.colors.onMuted }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          applications.length === 0 ? (
            <div 
              className="rounded-xl p-12 text-center"
              style={{ 
                backgroundColor: theme.colors.surface,
              }}
            >
              <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: theme.colors.onMuted }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.onSurface }}>
                No Applications Yet
              </h2>
              <p style={{ color: theme.colors.onMuted }}>
                Browse available pets and submit an application to get started!
              </p>
              <Link
                href="/adoption"
                className="inline-block mt-6 px-6 py-3 rounded-lg font-medium"
                style={{ 
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.onPrimary,
                }}
              >
                Browse Pets
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                  onClick={() => router.push(`/adoption/applications/${application._id}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: theme.colors.onSurface }}>
                        Application for Pet #{application.petId}
                      </h3>
                      <p className="text-sm" style={{ color: theme.colors.onMuted }}>
                        Submitted {new Date(application.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === 'approved' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  {application.notes && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.colors.onMuted }}>
                      {application.notes}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.colors.onMuted }}>
                      View Details
                    </span>
                    <ArrowRightIcon className="w-5 h-5" style={{ color: theme.colors.onMuted }} />
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

