'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  PlusIcon,
  PencilIcon,
  PhotoIcon,
  HeartIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import PremiumLayout from '@/components/Layout/PremiumLayout';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import SafeImage from '@/components/UI/SafeImage';
import { PREMIUM_VARIANTS, STAGGER_CONFIG } from '@/constants/animations';
import { useUserPets, useDeletePet } from '@/hooks/api-hooks';

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  size: string;
  photos: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  intent: string;
  stats: {
    views: number;
    likes: number;
    matches: number;
  };
  isActive: boolean;
  createdAt: string;
}

export default function MyPetsPage() {
  const { data: pets, isLoading, refetch } = useUserPets();
  const deletePet = useDeletePet();

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getSpeciesEmoji = (species: string) => {
    const emojis: Record<string, string> = {
      dog: '🐕',
      cat: '🐱',
      bird: '🐦',
      rabbit: '🐰',
      other: '🐾'
    };
    return emojis[species] || '🐾';
  };

  const getIntentColor = (intent: string) => {
    const colors: Record<string, string> = {
      adoption: 'bg-green-100 text-green-800 border-green-200',
      mating: 'bg-pink-100 text-pink-800 border-pink-200',
      playdate: 'bg-blue-100 text-blue-800 border-blue-200',
      all: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[intent] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getIntentLabel = (intent: string) => {
    const labels: Record<string, string> = {
      adoption: 'For Adoption',
      mating: 'Seeking Mates',
      playdate: 'Playdates',
      all: 'Open to All'
    };
    return labels[intent] || intent;
  };

  const handleDeletePet = async (petId: string) => {
    setDeletingId(petId);
    try {
      await deletePet.mutateAsync(petId);
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      console.error('Error deleting pet:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <PremiumLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" variant="holographic" />
          </div>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          variants={PREMIUM_VARIANTS.fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">My Pets</h1>
              <p className="text-gray-600 mt-1">Manage your pet profiles and find perfect matches</p>
            </div>
            <Link href="/pets/new">
              <PremiumButton
                variant="gradient"
                size="lg"
                glow
                magneticEffect
                haptic
                icon={<PlusIcon className="w-5 h-5" />}
              >
                Add New Pet
              </PremiumButton>
            </Link>
          </div>
        </motion.div>

        {/* Empty State */}
        {(!pets || pets.length === 0) && (
          <motion.div
            variants={PREMIUM_VARIANTS.scale}
            initial="initial"
            animate="animate"
            className="text-center py-16"
          >
            <PremiumCard variant="glass" className="max-w-md mx-auto p-8">
              <div className="text-6xl mb-4">🐾</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Pets Yet</h2>
              <p className="text-gray-600 mb-6">
                Start building your pet's profile to find amazing matches and new friends!
              </p>
              <Link href="/pets/new">
                <PremiumButton
                  variant="gradient"
                  size="lg"
                  glow
                  magneticEffect
                  icon={<PlusIcon className="w-5 h-5" />}
                >
                  Create Your First Pet Profile
                </PremiumButton>
              </Link>
            </PremiumCard>
          </motion.div>
        )}

        {/* Pets Grid */}
        {pets && pets.length > 0 && (
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: STAGGER_CONFIG.normal }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pets.map((pet: Pet) => (
              <motion.div
                key={pet._id}
                variants={PREMIUM_VARIANTS.fadeInUp}
              >
                <PremiumCard
                  variant="glass"
                  hover
                  tilt
                  glow
                  className="overflow-hidden"
                >
                  {/* Pet Photo */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                    {pet.photos && pet.photos.length > 0 ? (
                      <SafeImage
                        src={pet.photos.find(p => p.isPrimary)?.url || pet.photos[0].url}
                        alt={`${pet.name} - ${pet.breed}`}
                        className="w-full h-full object-cover"
                        fallback={
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            {getSpeciesEmoji(pet.species)}
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {getSpeciesEmoji(pet.species)}
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getIntentColor(pet.intent)}`}>
                        {getIntentLabel(pet.intent)}
                      </span>
                    </div>

                    {/* Photo count */}
                    {pet.photos && pet.photos.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <PhotoIcon className="w-3 h-3 mr-1" />
                        {pet.photos.length}
                      </div>
                    )}
                  </div>

                  {/* Pet Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                        <p className="text-gray-600">{pet.breed}</p>
                      </div>
                      <span className="text-2xl">{getSpeciesEmoji(pet.species)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Age:</span> {pet.age} years
                      </div>
                      <div>
                        <span className="font-medium">Size:</span> {pet.size}
                      </div>
                      <div>
                        <span className="font-medium">Gender:</span> {pet.gender}
                      </div>
                      <div>
                        <span className="font-medium">Species:</span> {pet.species}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {pet.stats?.views || 0}
                        </div>
                        <div className="flex items-center text-pink-600">
                          <HeartIcon className="w-4 h-4 mr-1" />
                          {pet.stats?.likes || 0}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link href={`./pets/${pet._id}`} className="flex-1">
                        <PremiumButton
                          variant="ghost"
                          size="sm"
                          className="w-full"
                        >
                          <EyeIcon className="w-4 h-4 mr-2" />
                          View
                        </PremiumButton>
                      </Link>

                      <Link href={`./pets/${pet._id}/edit`} className="flex-1">
                        <PremiumButton
                          variant="ghost"
                          size="sm"
                          className="w-full"
                        >
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Edit
                        </PremiumButton>
                      </Link>

                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(pet._id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Delete pet"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </PremiumButton>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-md w-full"
              >
                <PremiumCard variant="glass" className="p-6">
                  <div className="flex items-center mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Delete Pet Profile</h3>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this pet profile? This action cannot be undone and will remove all matches and messages associated with this pet.
                  </p>

                  <div className="flex space-x-3">
                    <PremiumButton
                      variant="ghost"
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </PremiumButton>

                    <PremiumButton
                      variant="gradient"
                      onClick={() => handleDeletePet(deleteConfirm)}
                      disabled={deletingId === deleteConfirm}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      {deletingId === deleteConfirm ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Deleting...</span>
                        </>
                      ) : (
                        <>
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </PremiumButton>
                  </div>
                </PremiumCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PremiumLayout>
  );
}
