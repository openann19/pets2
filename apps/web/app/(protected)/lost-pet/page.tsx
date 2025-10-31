'use client';

/**
 * Lost Pet Alert Page
 * Emergency lost pet alert broadcasting system
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLostPetAlert } from '@/hooks/domains/pet';
import { usePets } from '@/hooks/domains/pet';
import { logger } from '@pawfectmatch/core';
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  PhotoIcon,
  ClockIcon,
  BellIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function LostPetAlertPage() {
  const router = useRouter();
  const { pets, loading: petsLoading } = usePets();
  const {
    activeAlert,
    createAlert,
    updateAlert,
    reportSighting,
  } = useLostPetAlert();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSightingForm, setShowSightingForm] = useState(false);
  const [formData, setFormData] = useState({
    petId: '',
    lastSeenLocation: {
      lat: 0,
      lng: 0,
      address: '',
    },
    description: '',
    reward: undefined as number | undefined,
    broadcastRadius: 5,
  });

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

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAlert(formData);
      setShowCreateForm(false);
      // Reset form
      setFormData({
        petId: '',
        lastSeenLocation: { lat: 0, lng: 0, address: '' },
        description: '',
        reward: undefined,
        broadcastRadius: 5,
      });
    } catch (error) {
      logger.error('Error creating alert:', error);
    }
  };

  const handleUpdateAlert = async (
    updates: Partial<{
      description: string;
      lastSeenLocation: { lat: number; lng: number; address: string };
      status: 'active' | 'found' | 'cancelled';
    }>
  ) => {
    if (!activeAlert) return;
    try {
      await updateAlert(activeAlert.id, updates);
    } catch (error) {
      logger.error('Error updating alert:', error);
    }
  };

  const handleReportSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlert) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await reportSighting(activeAlert.id, {
        location: {
          lat: parseFloat(formData.get('lat') as string),
          lng: parseFloat(formData.get('lng') as string),
          address: formData.get('address') as string,
        },
        description: formData.get('description') as string,
      });
      setShowSightingForm(false);
      form.reset();
    } catch (error) {
      logger.error('Error reporting sighting:', error);
    }
  };

  // Get location from browser (requires permission)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode using backend API
          let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          
          try {
            const response = await fetch(
              `/api/geocode/reverse?lat=${lat}&lng=${lng}`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.address) {
                address = data.address;
              }
            } else {
              // Fallback: try public geocoding service
              const osmResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
              );
              if (osmResponse.ok) {
                const osmData = await osmResponse.json();
                address = osmData.display_name || address;
              }
            }
          } catch (geocodeError) {
            logger.warn('Reverse geocoding failed, using coordinates:', geocodeError);
          }
          
          setFormData({
            ...formData,
            lastSeenLocation: {
              lat,
              lng,
              address,
            },
          });
        },
        (error) => {
          logger.error('Error getting location:', error);
        }
      );
    }
  };

  if (petsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
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
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <span>Lost Pet Alert</span>
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Broadcast an alert if your pet is missing, or report a sighting
            </p>
          </div>

          {!activeAlert && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <BellIcon className="w-5 h-5" />
              <span>Create Alert</span>
            </button>
          )}
        </div>

        {/* Active Alert Display */}
        {activeAlert ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-red-200 dark:border-red-800 p-6 mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Active Alert
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Created: {new Date(activeAlert.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeAlert.status === 'active'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : activeAlert.status === 'found'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {activeAlert.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Last Seen Location
                </h3>
                <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <MapPinIcon className="w-5 h-5 text-red-600" />
                  <span>{activeAlert.lastSeenLocation.address}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {activeAlert.lastSeenLocation.lat.toFixed(4)},{' '}
                  {activeAlert.lastSeenLocation.lng.toFixed(4)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {activeAlert.description}
                </p>
              </div>

              {activeAlert.reward && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Reward
                  </h3>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${activeAlert.reward}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Broadcast Radius
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {activeAlert.broadcastRadius} km
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleUpdateAlert({ status: 'found' })}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>Mark as Found</span>
              </button>
              <button
                onClick={() => setShowSightingForm(true)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <PhotoIcon className="w-5 h-5" />
                <span>Report Sighting</span>
              </button>
              <button
                onClick={() => handleUpdateAlert({ status: 'cancelled' })}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                Cancel Alert
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center mb-6">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Active Alert
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create an alert if your pet is missing. The alert will be
              broadcast to nearby users to help with the search.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <BellIcon className="w-5 h-5" />
              <span>Create Lost Pet Alert</span>
            </button>
          </div>
        )}

        {/* Create Alert Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Create Lost Pet Alert
                    </h2>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateAlert} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Pet *
                      </label>
                      <select
                        value={formData.petId}
                        onChange={(e) =>
                          setFormData({ ...formData, petId: e.target.value })
                        }
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Choose a pet...</option>
                        {pets.map((pet) => (
                          <option key={pet._id || pet.id} value={pet._id || pet.id}>
                            {getSpeciesEmoji(pet.species || 'other')} {pet.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Seen Location *
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={formData.lastSeenLocation.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastSeenLocation: {
                                ...formData.lastSeenLocation,
                                address: e.target.value,
                              },
                            })
                          }
                          placeholder="Enter address..."
                          required
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <MapPinIcon className="w-5 h-5" />
                          <span>Use Current</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          step="any"
                          value={formData.lastSeenLocation.lat || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastSeenLocation: {
                                ...formData.lastSeenLocation,
                                lat: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          placeholder="Latitude"
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="number"
                          step="any"
                          value={formData.lastSeenLocation.lng || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastSeenLocation: {
                                ...formData.lastSeenLocation,
                                lng: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          placeholder="Longitude"
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Describe your pet, last seen details, distinctive features..."
                        required
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reward (Optional)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.reward || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              reward: parseInt(e.target.value) || undefined,
                            })
                          }
                          placeholder="Amount in $"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Broadcast Radius (km)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={formData.broadcastRadius}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              broadcastRadius: parseInt(e.target.value) || 5,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Create Alert
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Sighting Modal */}
        <AnimatePresence>
          {showSightingForm && activeAlert && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowSightingForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Report Sighting
                    </h2>
                    <button
                      onClick={() => setShowSightingForm(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleReportSighting} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="address"
                        placeholder="Where did you see them?"
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <input
                          type="number"
                          step="any"
                          name="lat"
                          placeholder="Latitude"
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <input
                          type="number"
                          step="any"
                          name="lng"
                          placeholder="Longitude"
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        placeholder="Describe what you saw..."
                        required
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowSightingForm(false)}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Report Sighting
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

