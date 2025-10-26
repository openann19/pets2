'use client';
import { AdjustmentsHorizontalIcon, ChevronDownIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { logger } from '@pawfectmatch/core';
;
export const PlaygroundMap = ({ 
// Default to NYC
initialCenter = { lat: 40.712776, lng: -74.005974 }, initialZoom = 13, playgrounds = [], onPlaygroundSelect, onMyLocationClick, onFilterChange, }) => {
    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedPlayground, setSelectedPlayground] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        types: {
            'dog-park': true,
            'pet-friendly-cafe': true,
            'pet-store': true,
            'veterinary': true,
            'grooming': true,
            'boarding': true,
            'beach': true,
            'trail': true,
        },
        ratings: 0, // Minimum rating
        amenities: {
            water: false,
            fenced: false,
            shade: false,
            seating: false,
            parking: false,
            restrooms: false,
        },
        distance: 5, // miles
        favoritesOnly: false,
    });
    // Mock function to simulate map integration
    // In a real app, you'd integrate with Google Maps, Mapbox, Leaflet, etc.
    const simulateMapRender = () => {
        if (mapRef.current) {
            setTimeout(() => {
                setMapLoaded(true);
            }, 1000);
        }
    };
    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            }, (error) => {
                logger.error('Error getting location:', { error });
            });
        }
        // Initialize map
        simulateMapRender();
    }, []);
    // Handle filter changes
    const handleFilterChange = (category, key, value) => {
        const newFilters = {
            ...filters,
            [category]: {
                ...filters[category],
                [key]: value,
            },
        };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };
    // Handle single filter change for non-nested filters
    const handleSingleFilterChange = (key, value) => {
        const newFilters = {
            ...filters,
            [key]: value,
        };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
    };
    // Handle playground selection
    const handlePlaygroundClick = (playground) => {
        setSelectedPlayground(playground);
        onPlaygroundSelect?.(playground);
    };
    // Get icon for playground type
    const getPlaygroundTypeIcon = (type) => {
        switch (type) {
            case 'dog-park':
                return '🐕';
            case 'pet-friendly-cafe':
                return '☕';
            case 'pet-store':
                return '🛍️';
            case 'veterinary':
                return '🏥';
            case 'grooming':
                return '🧼';
            case 'boarding':
                return '🏠';
            case 'beach':
                return '🏖️';
            case 'trail':
                return '🥾';
            default:
                return '📍';
        }
    };
    // Get color for playground type
    const getPlaygroundTypeColor = (type) => {
        switch (type) {
            case 'dog-park':
                return 'bg-green-500';
            case 'pet-friendly-cafe':
                return 'bg-yellow-500';
            case 'pet-store':
                return 'bg-blue-500';
            case 'veterinary':
                return 'bg-red-500';
            case 'grooming':
                return 'bg-purple-500';
            case 'boarding':
                return 'bg-indigo-500';
            case 'beach':
                return 'bg-cyan-500';
            case 'trail':
                return 'bg-lime-500';
            default:
                return 'bg-gray-500';
        }
    };
    // Get readable name for type
    const getReadableTypeName = (type) => {
        switch (type) {
            case 'dog-park':
                return 'Dog Park';
            case 'pet-friendly-cafe':
                return 'Pet-Friendly Cafe';
            case 'pet-store':
                return 'Pet Store';
            case 'veterinary':
                return 'Veterinary';
            case 'grooming':
                return 'Grooming';
            case 'boarding':
                return 'Boarding';
            case 'beach':
                return 'Pet-Friendly Beach';
            case 'trail':
                return 'Pet-Friendly Trail';
            default:
                return type;
        }
    };
    // Rating stars component
    const RatingStars = ({ rating }) => {
        return (<div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (<StarIcon key={star} className={`w-4 h-4 ${star <= rating
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300 dark:text-gray-600'}`}/>))}
      </div>);
    };
    return (<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-[600px] relative">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full bg-gray-100 dark:bg-gray-700 relative" style={{
            backgroundImage: mapLoaded
                ? 'url(https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-74.005974,40.712776,13,0/1200x600?access_token=placeholder)'
                : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
        {/* Loading state */}
        {!mapLoaded && (<div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
            </div>
          </div>)}

        {/* Playground markers (simplified for demo) */}
        {mapLoaded &&
            playgrounds.map((playground) => (<button key={playground.id} className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group`} style={{
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                }} onClick={() => { handlePlaygroundClick(playground); }}>
              <div className={`w-8 h-8 rounded-full ${getPlaygroundTypeColor(playground.type)} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform z-10`}>
                <span>{getPlaygroundTypeIcon(playground.type)}</span>
              </div>
              <div className="mt-1 px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-md text-xs font-medium text-gray-800 dark:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {playground.name}
              </div>
            </button>))}

        {/* User location */}
        {mapLoaded && userLocation && (<div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20" style={{
                top: '50%',
                left: '50%',
            }}>
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-500/30 rounded-full animate-ping"></div>
          </div>)}
      </div>

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button onClick={onMyLocationClick} className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Find my location">
          <MapPinIcon className="w-5 h-5 text-blue-500"/>
        </button>

        <button onClick={() => setShowFilters(!showFilters)} className={`w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${showFilters ? 'text-pink-500' : 'text-gray-600 dark:text-gray-400'}`} aria-label="Toggle filters">
          <AdjustmentsHorizontalIcon className="w-5 h-5"/>
        </button>
      </div>

      {/* Filter panel */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ${showFilters ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              ×
            </button>
          </div>

          {/* Type filters */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Type</h4>
            <div className="space-y-2">
              {Object.keys(filters.types).map((type) => (<div key={type} className="flex items-center">
                  <input type="checkbox" id={`type-${type}`} checked={filters.types[type]} onChange={(e) => { handleFilterChange('types', type, e.target.checked); }} className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700"/>
                  <label htmlFor={`type-${type}`} className="ml-2 text-gray-700 dark:text-gray-300">
                    <span className="mr-2">
                      {getPlaygroundTypeIcon(type)}
                    </span>
                    {getReadableTypeName(type)}
                  </label>
                </div>))}
            </div>
          </div>

          {/* Rating filter */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Minimum Rating</h4>
            <div className="flex items-center space-x-2">
              <input type="range" min="0" max="5" step="1" value={filters.ratings} onChange={(e) => { handleSingleFilterChange('ratings', parseInt(e.target.value)); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
              <span className="text-gray-900 dark:text-white font-medium">
                {filters.ratings === 0 ? 'Any' : filters.ratings}+
              </span>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Any</span>
              <span>5★</span>
            </div>
          </div>

          {/* Amenities filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Amenities</h4>
              <button type="button" className="text-sm text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300" onClick={() => {
            // Create a copy with all amenities set to true
            const newAmenities = {
                water: true,
                fenced: true,
                shade: true,
                seating: true,
                parking: true,
                restrooms: true
            };
            setFilters({
                ...filters,
                amenities: newAmenities
            });
        }}>
                Select All
              </button>
            </div>
            <div className="space-y-2">
              {Object.keys(filters.amenities).map((amenity) => (<div key={amenity} className="flex items-center">
                  <input type="checkbox" id={`amenity-${amenity}`} checked={filters.amenities[amenity]} onChange={(e) => { handleFilterChange('amenities', amenity, e.target.checked); }} className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700"/>
                  <label htmlFor={`amenity-${amenity}`} className="ml-2 text-gray-700 dark:text-gray-300 capitalize">
                    {amenity}
                  </label>
                </div>))}
            </div>
          </div>

          {/* Distance filter */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Distance</h4>
            <div className="flex items-center space-x-2">
              <input type="range" min="1" max="20" step="1" value={filters.distance} onChange={(e) => { handleSingleFilterChange('distance', parseInt(e.target.value)); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
              <span className="text-gray-900 dark:text-white font-medium whitespace-nowrap">
                {filters.distance} mi
              </span>
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span>1 mi</span>
              <span>20 mi</span>
            </div>
          </div>

          {/* Favorites only */}
          <div className="mb-6">
            <div className="flex items-center">
              <input type="checkbox" id="favorites-only" checked={filters.favoritesOnly} onChange={(e) => { handleSingleFilterChange('favoritesOnly', e.target.checked); }} className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-700"/>
              <label htmlFor="favorites-only" className="ml-2 text-gray-700 dark:text-gray-300">
                Favorites only
              </label>
            </div>
          </div>

          {/* Apply button */}
          <button className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors" onClick={() => {
            onFilterChange?.(filters);
            setShowFilters(false);
        }}>
            Apply Filters
          </button>
        </div>
      </div>

      {/* Selected playground detail */}
      {selectedPlayground && (<div className="absolute left-0 bottom-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-1 rounded-full text-xs text-white ${getPlaygroundTypeColor(selectedPlayground.type)}`}>
                  {getReadableTypeName(selectedPlayground.type)}
                </span>
                <RatingStars rating={selectedPlayground.rating}/>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({selectedPlayground.reviews} reviews)
                </span>
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {selectedPlayground.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {selectedPlayground.address}
              </p>

              <div className="flex flex-wrap gap-1">
                {selectedPlayground.amenities.slice(0, 4).map((amenity, index) => (<span key={index} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded">
                    {amenity}
                  </span>))}
                {selectedPlayground.amenities.length > 4 && (<span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded">
                    +{selectedPlayground.amenities.length - 4} more
                  </span>)}
              </div>
            </div>

            <button onClick={() => setSelectedPlayground(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <ChevronDownIcon className="w-5 h-5"/>
            </button>
          </div>
        </div>)}
    </div>);
};
export default PlaygroundMap;
//# sourceMappingURL=PlaygroundMap.jsx.map