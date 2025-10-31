'use client';

/**
 * Pawfiles Page - Pet-First Management Hub
 * Comprehensive pet management with multi-pet support, quick actions, and pet-first UX
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePets } from '@/hooks/domains/pet';
import { useToast } from '@/components/ui/toast';
import { logger } from '@pawfectmatch/core';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  HeartIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  CalendarIcon as CalendarIconSolid,
  MapPinIcon as MapPinIconSolid,
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedGrid, AnimatedItem, TiltCardV2, useRevealObserver } from '@/components/Animations';

export default function PawfilesPage() {
  const router = useRouter();
  const toast = useToast();
  const { pets, loading, error, createPet, setPrimaryPet, refetch } = usePets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('dog');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Initialize reveal observer
  useRevealObserver();

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

  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      adoption: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      mating: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      playdate: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      all: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    return colors[intent] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getIntentLabel = (intent: string) => {
    const labels: Record<string, string> = {
      adoption: 'For Adoption',
      mating: 'Seeking Mates',
      playdate: 'Playdates',
      all: 'Open to All',
    };
    return labels[intent] ?? intent;
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    try {
      const petData = {
        name: newPetName,
        species: newPetSpecies,
      } as any;
      
      await createPet(petData);
      toast.success('Pet Added', `${newPetName} has been added to your Pawfiles!`);
      setNewPetName('');
      setNewPetSpecies('dog');
      setShowAddModal(false);
    } catch (error) {
      toast.error('Error', 'Failed to add pet. Please try again.');
      logger.error('Error adding pet:', error);
    }
  };

  const handleDeletePet = async (petId: string) => {
    if (deleteConfirm !== petId) {
      setDeleteConfirm(petId);
      return;
    }

    try {
      // Delete pet using API
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete pet');
      }

      toast.success('Pet Removed', 'Pet has been removed from your Pawfiles.');
      setDeleteConfirm(null);
      await refetch();
    } catch (error) {
      toast.error('Error', 'Failed to delete pet. Please try again.');
      logger.error('Error deleting pet:', error);
    }
  };

  const handleSetPrimary = async (petId: string) => {
    try {
      await setPrimaryPet(petId);
      toast.success('Primary Pet Updated', 'Primary pet has been updated.');
    } catch (error) {
      toast.error('Error', 'Failed to set primary pet.');
      logger.error('Error setting primary pet:', error);
    }
  };

  const handleQuickAction = (action: string, petId: string) => {
    switch (action) {
      case 'matches':
        router.push(`/pets/${petId}/matches`);
        break;
      case 'playdates':
        router.push(`/pets/${petId}/playdates`);
        break;
      case 'map':
        router.push(`/map?pet=${petId}`);
        break;
      case 'health':
        router.push(`/pets/${petId}/health`);
        break;
      default:
        break;
    }
  };

  if (loading && pets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
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
              <span>🐾</span>
              <span>Pawfiles</span>
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Manage your pet profiles, health records, and playdate connections
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg flex items-center transition-colors shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            <span>Add Pet</span>
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/map"
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
              <MapPinIconSolid className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Pet-Friendly Map</span>
          </Link>

          <Link
            href="/matches"
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center mb-2">
              <HeartIconSolid className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Find Playmates</span>
          </Link>

          <Link
            href="/calendar"
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
              <CalendarIconSolid className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Playdates</span>
          </Link>

          <Link
            href="/safety"
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mb-2">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Safety Center</span>
          </Link>
        </div>

        {/* Pets Grid */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-2" />
            <p className="text-red-800 dark:text-red-300 font-medium">Error loading pets</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        ) : pets.length > 0 ? (
          <AnimatedGrid columns={3} gap={6} staggerDelay={0.1} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <AnimatedItem key={pet._id || pet.id}>
                <TiltCardV2
                  maxTilt={8}
                  hoverScale={1.02}
                  glareOpacity={0.2}
                  className="reveal reveal-premium"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-shadow">
                    {/* Pet Header */}
                    <Link href={`/pets/${pet._id || pet.id}`} className="block">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {pet.photos && pet.photos.length > 0 ? (
                                <img
                                  src={pet.photos[0]}
                                  alt={pet.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-3xl">{getSpeciesEmoji(pet.species || 'other')}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                {pet.name}
                                {pet.verified && (
                                  <ShieldCheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                )}
                              </h2>
                              <div className="text-gray-600 dark:text-gray-400 text-sm">
                                {pet.breed || pet.species?.charAt(0).toUpperCase() + pet.species?.slice(1)}
                              </div>
                              {pet.age && (
                                <div className="text-gray-500 dark:text-gray-500 text-sm">
                                  {pet.age} {pet.ageUnit || 'years'} old
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Intent Badge */}
                        {pet.intent && (
                          <div className="mb-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(pet.intent)}`}>
                              {getIntentLabel(pet.intent)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Quick Actions */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleQuickAction('matches', pet._id || pet.id)}
                        className="p-2 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 text-gray-600 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400 transition-colors"
                        title="Matches"
                      >
                        <HeartIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleQuickAction('playdates', pet._id || pet.id)}
                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="Playdates"
                      >
                        <CalendarIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleQuickAction('map', pet._id || pet.id)}
                        className="p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                        title="Map"
                      >
                        <MapPinIcon className="w-5 h-5" />
                      </button>
                      <Link
                        href={`/pets/${pet._id || pet.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSetPrimary(pet._id || pet.id)}
                          className="text-xs text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400"
                        >
                          Set as Primary
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeletePet(pet._id || pet.id)}
                        className={`text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors ${
                          deleteConfirm === (pet._id || pet.id) ? 'text-red-600 dark:text-red-400' : ''
                        }`}
                        title={deleteConfirm === (pet._id || pet.id) ? 'Click again to confirm' : 'Delete pet'}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </TiltCardV2>
              </AnimatedItem>
            ))}
          </AnimatedGrid>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Pets Added Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start by adding your first pet profile. Create detailed pawfiles to help find perfect matches,
              track health records, and discover pet-friendly venues.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg inline-flex items-center transition-colors shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Your First Pet
            </button>
          </div>
        )}
      </div>

      {/* Add Pet Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Add New Pet</h2>

                <form onSubmit={handleAddPet}>
                  <div className="mb-4">
                    <label
                      htmlFor="petName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Pet Name*
                    </label>
                    <input
                      type="text"
                      id="petName"
                      value={newPetName}
                      onChange={(e) => setNewPetName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter pet name"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Species*
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['dog', 'cat', 'bird', 'rabbit'].map((species) => (
                        <button
                          key={species}
                          type="button"
                          className={`p-3 rounded-lg border text-center transition-colors ${
                            newPetSpecies === species
                              ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-500 text-pink-800 dark:text-pink-300'
                              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                          onClick={() => setNewPetSpecies(species)}
                        >
                          <div className="text-2xl mb-1">{getSpeciesEmoji(species)}</div>
                          <div className="text-xs capitalize">{species}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium"
                    >
                      Add Pet
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

