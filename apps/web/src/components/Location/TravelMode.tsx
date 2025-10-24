'use client';
import { ArrowPathIcon, CheckCircleIcon, GlobeAltIcon, MapPinIcon, } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { logger } from '@pawfectmatch/core';
;
import React, { useEffect, useState } from 'react';
export const TravelMode = ({ isActive, onToggle, onLocationChange }) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const popularLocations = [
        {
            id: '1',
            city: 'New York',
            country: 'United States',
            coordinates: { lat: 40.7128, lng: -74.006 },
            timezone: 'America/New_York',
            flag: '🇺🇸',
        },
        {
            id: '2',
            city: 'London',
            country: 'United Kingdom',
            coordinates: { lat: 51.5074, lng: -0.1278 },
            timezone: 'Europe/London',
            flag: '🇬🇧',
        },
        {
            id: '3',
            city: 'Tokyo',
            country: 'Japan',
            coordinates: { lat: 35.6762, lng: 139.6503 },
            timezone: 'Asia/Tokyo',
            flag: '🇯🇵',
        },
        {
            id: '4',
            city: 'Paris',
            country: 'France',
            coordinates: { lat: 48.8566, lng: 2.3522 },
            timezone: 'Europe/Paris',
            flag: '🇫🇷',
        },
        {
            id: '5',
            city: 'Sydney',
            country: 'Australia',
            coordinates: { lat: -33.8688, lng: 151.2093 },
            timezone: 'Australia/Sydney',
            flag: '🇦🇺',
        },
        {
            id: '6',
            city: 'Toronto',
            country: 'Canada',
            coordinates: { lat: 43.6532, lng: -79.3832 },
            timezone: 'America/Toronto',
            flag: '🇨🇦',
        },
        {
            id: '7',
            city: 'Berlin',
            country: 'Germany',
            coordinates: { lat: 52.52, lng: 13.405 },
            timezone: 'Europe/Berlin',
            flag: '🇩🇪',
        },
        {
            id: '8',
            city: 'Dubai',
            country: 'United Arab Emirates',
            coordinates: { lat: 25.2048, lng: 55.2708 },
            timezone: 'Asia/Dubai',
            flag: '🇦🇪',
        },
        {
            id: '9',
            city: 'Singapore',
            country: 'Singapore',
            coordinates: { lat: 1.3521, lng: 103.8198 },
            timezone: 'Asia/Singapore',
            flag: '🇸🇬',
        },
        {
            id: '10',
            city: 'Los Angeles',
            country: 'United States',
            coordinates: { lat: 34.0522, lng: -118.2437 },
            timezone: 'America/Los_Angeles',
            flag: '🇺🇸',
        },
    ];
    useEffect(() => {
        if (searchQuery) {
            const filtered = popularLocations.filter((location) => location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location.country.toLowerCase().includes(searchQuery.toLowerCase()));
            setSuggestions(filtered);
        }
        else {
            setSuggestions(popularLocations);
        }
    }, [searchQuery]);
    const handleLocationSelect = async (location) => {
        setIsLoading(true);
        setSelectedLocation(location);
        try {
            // Simulate API call to update location
            await new Promise((resolve) => setTimeout(resolve, 1000));
            onLocationChange(location);
        }
        catch (error) {
            logger.error('Failed to update location:', { error });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleToggle = () => {
        if (!isActive && !selectedLocation) {
            // If activating travel mode without a location, select first popular location
            handleLocationSelect(popularLocations[0]);
        }
        onToggle(!isActive);
    };
    return (<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <GlobeAltIcon className={`h-6 w-6 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}/>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Travel Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isActive
            ? 'Swipe pets from around the world'
            : 'Enable to swipe pets from other locations'}
            </p>
          </div>
        </div>

        <button onClick={handleToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
      </div>

      {isActive && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
          {/* Current Location */}
          {selectedLocation && (<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400"/>
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Currently swiping in:
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    {selectedLocation.flag} {selectedLocation.city}, {selectedLocation.country}
                  </p>
                </div>
              </div>
            </div>)}

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search for a location
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search cities..." className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"/>
            </div>
          </div>

          {/* Location Suggestions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Popular Destinations
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {suggestions.map((location) => (<motion.button key={location.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleLocationSelect(location)} disabled={isLoading} className={`p-3 rounded-lg text-left transition-colors ${selectedLocation?.id === location.id
                    ? 'bg-pink-100 dark:bg-pink-900 border-2 border-pink-500'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{location.flag}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{location.city}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {location.country}
                        </p>
                      </div>
                    </div>
                    {isLoading && selectedLocation?.id === location.id && (<ArrowPathIcon className="h-4 w-4 text-pink-600 animate-spin"/>)}
                  </div>
                </motion.button>))}
            </div>
          </div>

          {/* Travel Mode Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              How Travel Mode Works
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Swipe pets from your selected location</li>
              <li>• Your profile shows your current travel location</li>
              <li>• Matches can see you're traveling</li>
              <li>• Location updates automatically based on timezone</li>
            </ul>
          </div>
        </motion.div>)}
    </div>);
};
//# sourceMappingURL=TravelMode.jsx.map