'use client';

/**
 * Playdate Discovery Page
 * Pet-first playdate matching interface with compatibility-based recommendations
 */

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePlaydateMatching } from '@/hooks/domains/pet';
import { usePets } from '@/hooks/domains/pet';
import { logger } from '@pawfectmatch/core';
import {
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  SparklesIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function PlaydateDiscoveryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pets, loading: petsLoading } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    searchParams.get('pet') || null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    distance?: number;
    playStyles?: string[];
    energy?: number;
    size?: string;
  }>({
    distance: 10,
    energy: undefined,
    size: undefined,
  });

  const {
    matches,
    loading: matchesLoading,
    error: matchesError,
    findMatches,
    createPlaydate,
  } = usePlaydateMatching(selectedPetId || '');

  const selectedPet = pets.find((p) => p._id === selectedPetId);

  useEffect(() => {
    if (selectedPetId && !petsLoading) {
      findMatches(filters);
    }
  }, [selectedPetId, filters, petsLoading]);

  useEffect(() => {
    // Auto-select first pet if none selected
    if (!selectedPetId && pets.length > 0 && !petsLoading) {
      setSelectedPetId(pets[0]._id || pets[0].id);
    }
  }, [pets, selectedPetId, petsLoading]);

  const handleCreatePlaydate = async (
    matchId: string,
    scheduledAt: string,
    venueId?: string
  ) => {
    try {
      // Allow user to select venue or use default
      let selectedVenue = venueId || 'venue-default';
      
      // If no venue provided, try to get nearby venues
      if (!venueId) {
        try {
          const venuesResponse = await fetch('/api/venues/nearby');
          if (venuesResponse.ok) {
            const venues = await venuesResponse.json();
            if (venues.data && venues.data.length > 0) {
              // Use the first nearby venue
              selectedVenue = venues.data[0].id;
            }
          }
        } catch (venueError) {
          logger.warn('Could not fetch nearby venues, using default:', venueError);
        }
      }
      
      await createPlaydate(matchId, {
        scheduledAt,
        venueId: selectedVenue,
        notes: '',
      });
      // Navigate to playdates calendar
      router.push('/playdates');
    } catch (error) {
      logger.error('Error creating playdate:', error);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getSpeciesEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      dog: '🐕',
      cat: '🐱',
      bird: '🐦',
      rabbit: '🐰',
      other: '🐾',
    };
    return emojis[species] ?? '🐾';
  };

  if (petsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Pets Added Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Add a pet profile to start discovering playdate matches!
            </p>
            <Link
              href="/pawfiles"
              className="inline-flex items-center px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
            >
              Add Pet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <SparklesIcon className="w-8 h-8 text-pink-600" />
              <span>Playdate Discovery</span>
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Find perfect playmates for {selectedPet?.name || 'your pet'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Pet Selector */}
            <select
              value={selectedPetId || ''}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {pets.map((pet) => (
                <option key={pet._id || pet.id} value={pet._id || pet.id}>
                  {getSpeciesEmoji(pet.species || 'other')} {pet.name}
                </option>
              ))}
            </select>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filter Matches
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Distance (km)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={filters.distance || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        distance: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Energy Level
                  </label>
                  <select
                    value={filters.energy || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        energy: parseInt(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any</option>
                    <option value="1">Low (1)</option>
                    <option value="2">Low-Medium (2)</option>
                    <option value="3">Medium (3)</option>
                    <option value="4">Medium-High (4)</option>
                    <option value="5">High (5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size
                  </label>
                  <select
                    value={filters.size || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        size: e.target.value || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Any</option>
                    <option value="tiny">Tiny</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {matchesError && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-300">{matchesError}</p>
          </div>
        )}

        {/* Matches Grid */}
        {matchesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Match Header */}
                <div className="relative p-6 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center overflow-hidden">
                        {match.pet2.photos && match.pet2.photos.length > 0 ? (
                          <img
                            src={match.pet2.photos[0].url || match.pet2.photos[0]}
                            alt={match.pet2.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">
                            {getSpeciesEmoji(match.pet2.species || 'other')}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {match.pet2.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {match.pet2.breed || match.pet2.species}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-2xl font-bold ${getCompatibilityColor(
                        match.compatibilityScore
                      )}`}
                    >
                      {match.compatibilityScore}%
                    </div>
                  </div>

                  {/* Compatibility Factors */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4 text-pink-600" />
                      <span>Play: {match.compatibilityFactors.playStyle}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <SparklesIcon className="w-4 h-4 text-yellow-600" />
                      <span>Energy: {match.compatibilityFactors.energy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4 text-blue-600" />
                      <span>{match.distanceKm.toFixed(1)} km away</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4 text-green-600" />
                      <span>Size: {match.compatibilityFactors.size}</span>
                    </div>
                  </div>
                </div>

                {/* Match Details */}
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Recommended Activities
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {match.recommendedActivities.map((activity, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>

                  {match.safetyNotes && match.safetyNotes.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                        Safety Notes:
                      </p>
                      <ul className="text-xs text-yellow-700 dark:text-yellow-400 list-disc list-inside">
                        {match.safetyNotes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const scheduledDate = new Date();
                        scheduledDate.setDate(scheduledDate.getDate() + 7);
                        handleCreatePlaydate(
                          match.id,
                          scheduledDate.toISOString()
                        );
                      }}
                      className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <CalendarIcon className="w-5 h-5" />
                      <span>Schedule Playdate</span>
                    </button>
                    <Link
                      href={`/pets/${match.pet2._id || match.pet2.id}`}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Matches Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Try adjusting your filters or check back later for new playmates!
            </p>
            <button
              onClick={() => setShowFilters(true)}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
            >
              Adjust Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

