'use client';

import { AdjustmentsHorizontalIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, MapPinIcon as MapPinSolid } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import AIMapFeatures from '@/components/Map/AIMapFeatures';
import MapView from '@/components/Map/MapView';
import { useAuthStore } from '@/lib/auth-store';
import { geofencingService } from '@/services/GeofencingService';

interface MapFilters {
  showMyPets: boolean;
  showMatches: boolean;
  showNearby: boolean;
  activityTypes: string[];
  radius: number;
}

interface MapStats {
  totalPets: number;
  activePets: number;
  nearbyMatches: number;
  recentActivity: number;
}

const MapPage: React.FC = () => {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<MapFilters>({
    showMyPets: true,
    showMatches: true,
    showNearby: true,
    activityTypes: ['walking', 'playing', 'park'],
    radius: 5
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<MapStats>({
    totalPets: 0,
    activePets: 0,
    nearbyMatches: 0,
    recentActivity: 0
  });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pins, setPins] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize geofencing and location services
  useEffect(() => {
    const initializeServices = async (): Promise<void> => {
      try {
        const initialized = await geofencingService.initialize();
        if (!initialized) return;
        console.log('🗺️ Geofencing service initialized');

        geofencingService.subscribe('map-page', (data: any) => {
          setUserLocation({ latitude: data.location.lat, longitude: data.location.lng });
        });
      } catch (e) {
        console.warn('Geofencing init skipped in dev:', e);
      }
    };
    
    const handleNotification = (event: CustomEvent) => {
      setNotifications(prev => [event.detail, ...prev].slice(0, 10));
    };
    
    initializeServices();
    window.addEventListener('geofence-notification', handleNotification as EventListener);

    return () => {
      geofencingService.unsubscribe('map-page');
      window.removeEventListener('geofence-notification', handleNotification as EventListener);
    };
  }, []);

  // Simulated real-time stats updates
  useEffect(() => {
    const updateStats = () => {
      setStats({
        totalPets: Math.floor(Math.random() * 50) + 20,
        activePets: pins.length,
        nearbyMatches: Math.floor(Math.random() * 8) + 2,
        recentActivity: Math.floor(Math.random() * 12) + 3
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, [pins.length]);

  const toggleFilter = (key: keyof Omit<MapFilters, 'activityTypes' | 'radius'>) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleActivity = (activity: string) => {
    setFilters(prev => ({
      ...prev,
      activityTypes: prev.activityTypes.includes(activity)
        ? prev.activityTypes.filter(a => a !== activity)
        : [...prev.activityTypes, activity]
    }));
  };

  const activityTypes = [
    { id: 'walking', label: 'Walking', icon: '🚶', color: 'bg-blue-500' },
    { id: 'playing', label: 'Playing', icon: '🎾', color: 'bg-green-500' },
    { id: 'grooming', label: 'Grooming', icon: '✂️', color: 'bg-purple-500' },
    { id: 'vet', label: 'Vet Visit', icon: '🏥', color: 'bg-red-500' },
    { id: 'park', label: 'Dog Park', icon: '🏞️', color: 'bg-emerald-500' },
    { id: 'other', label: 'Other', icon: '📍', color: 'bg-gray-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-pink-200/50 dark:border-purple-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl">
                <MapPinSolid className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Pet Activity Map
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time pet locations and activities
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {stats.activePets}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Active Now</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.nearbyMatches}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Nearby Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.recentActivity}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Recent Activity</div>
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Filters Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-pink-200/50 dark:border-purple-800/50 p-6 overflow-y-auto"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Map Filters
              </h3>

              {/* Quick Filters */}
              <div className="space-y-4 mb-8">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Show on Map</h4>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showMyPets}
                    onChange={() => toggleFilter('showMyPets')}
                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">My Pets</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showMatches}
                    onChange={() => toggleFilter('showMatches')}
                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">My Matches</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showNearby}
                    onChange={() => toggleFilter('showNearby')}
                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Nearby Pets</span>
                </label>
              </div>

              {/* Activity Types */}
              <div className="space-y-4 mb-8">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity Types</h4>
                <div className="grid grid-cols-2 gap-2">
                  {activityTypes.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => toggleActivity(activity.id)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        filters.activityTypes.includes(activity.id)
                          ? `${activity.color} text-white border-transparent shadow-lg`
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-purple-600'
                      }`}
                    >
                      <div className="text-lg mb-1">{activity.icon}</div>
                      <div className="text-xs font-medium">{activity.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Radius Slider */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Radius: {filters.radius} km
                </h4>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={filters.radius}
                  onChange={(e) => setFilters(prev => ({ ...prev, radius: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapView filters={filters} />
          
          {/* AI Map Features */}
          <AIMapFeatures 
            pins={pins} 
            userLocation={userLocation}
            onInsightClick={(insight) => {
              console.log('AI Insight clicked:', insight);
              // Handle insight click - could navigate to location, show details, etc.
            }}
          />
          
          {/* Floating Action Buttons */}
          <div className="absolute bottom-4 right-4 space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
            >
              <HeartSolid className="h-5 w-5 text-pink-500" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500" />
            </motion.button>
          </div>

          {/* Mobile Stats Overlay */}
          <div className="md:hidden absolute bottom-4 left-4 right-4">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 border border-pink-200/50 dark:border-purple-800/50">
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
                    {stats.activePets}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {stats.nearbyMatches}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {stats.recentActivity}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Activity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200/50 dark:border-gray-700/50 z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Location Alerts
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border ${
                          notification.read 
                            ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                            notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {notification.type === 'zone_enter' ? '📍' :
                             notification.type === 'zone_exit' ? '🚪' :
                             notification.type === 'match_nearby' ? '💖' : '🔔'}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      setNotifications([]);
                      geofencingService.clearNotifications();
                    }}
                    className="w-full mt-6 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapPage;
