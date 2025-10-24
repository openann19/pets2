'use client';

import { LocationPrivacy } from '@/components/Location/LocationPrivacy';
import { NearbyEvents } from '@/components/Location/NearbyEvents';
import { TravelMode } from '@/components/Location/TravelMode';
import { logger } from '@/services/logger';
import { _useAuthStore as useAuthStore } from '@/stores/auth-store';
import {
  CalendarIcon,
  GlobeAltIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function LocationPage() {
  const { user: _user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'travel' | 'privacy' | 'events'>('travel');
  const [travelModeActive, setTravelModeActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
  } | null>(null);
  const [locationSettings, setLocationSettings] = useState({
    showExactLocation: false,
    showCity: true,
    showCountry: true,
    allowLocationHistory: true,
    shareWithMatches: true,
    shareWithPremium: false,
    locationUpdateFrequency: 'hourly' as 'realtime' | 'hourly' | 'daily' | 'manual',
  });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you'd reverse geocode these coordinates
          setCurrentLocation({
            city: 'New York',
            country: 'United States',
            coordinates: { lat: latitude, lng: longitude },
          });
        },
        (error) => {
          logger.error('Error getting location', { error });
          // Fallback to default location
          setCurrentLocation({
            city: 'New York',
            country: 'United States',
            coordinates: { lat: 40.7128, lng: -74.006 },
          });
        },
      );
    } else {
      // Fallback to default location
      setCurrentLocation({
        city: 'New York',
        country: 'United States',
        coordinates: { lat: 40.7128, lng: -74.006 },
      });
    }
  }, []);

  const handleTravelModeToggle = (active: boolean) => {
    setTravelModeActive(active);
  };

  const handleLocationChange = (location: {
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
  }) => {
    setCurrentLocation(location);
  };

  const handleSettingsChange = (settings: typeof locationSettings) => {
    setLocationSettings(settings);
  };

  const tabs = [
    { id: 'travel', label: 'Travel Mode', icon: GlobeAltIcon },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
    { id: 'events', label: 'Events', icon: CalendarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Location Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your location preferences and discover nearby events
          </p>
        </div>

        {/* Current Location */}
        {currentLocation ? <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <MapPinIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Location
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentLocation.city}, {currentLocation.country}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {currentLocation.coordinates.lat.toFixed(4)},{' '}
                {currentLocation.coordinates.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div> : null}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'travel' | 'privacy' | 'events')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                        ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'travel' && (
            <TravelMode
              isActive={travelModeActive}
              onToggle={handleTravelModeToggle}
              onLocationChange={handleLocationChange}
            />
          )}

          {activeTab === 'privacy' && (
            <LocationPrivacy
              currentSettings={locationSettings}
              onSettingsChange={handleSettingsChange}
            />
          )}

          {activeTab === 'events' && currentLocation ? <NearbyEvents
            userLocation={currentLocation.coordinates}
            onEventSelect={(event) => {
              logger.info('Event selected', { event });
              // Handle event selection
            }}
          /> : null}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('travel')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <GlobeAltIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Enable Travel Mode</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Swipe pets from other locations
              </p>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <ShieldCheckIcon className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Update Privacy</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Control location sharing</p>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <CalendarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Find Events</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Discover nearby pet events</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
