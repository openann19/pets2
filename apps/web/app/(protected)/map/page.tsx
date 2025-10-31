/**
 * MapScreen - Web Version
 * Identical to mobile MapScreen structure
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScreenShell } from '@/src/components/layout/ScreenShell';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, MapPinIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function MapPage() {
  const router = useRouter();
  const { t } = useTranslation('map');

  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  React.useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  return (
    <ScreenShell
      header={
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  aria-label="Back"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {t('pet_activity_map', 'Pet Activity Map')}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {t('real_time_locations', 'Real-time locations')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="relative h-full">
        {/* Map Container */}
        <div className="absolute inset-0">
          {userLocation ? (
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${userLocation.lat},${userLocation.lng}&zoom=13`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <div className="text-center">
                <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Filters"
          >
            <FunnelIcon className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={() => {
              // Center map on user location
            }}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="My Location"
          >
            <MapPinIcon className="w-6 h-6 text-purple-600" />
          </button>
          <button
            onClick={() => {
              // Create activity
            }}
            className="p-3 bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-colors text-white"
            aria-label="Create Activity"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </ScreenShell>
  );
}
