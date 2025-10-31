'use client';

/**
 * Enhanced Pet Profile Page
 * Comprehensive pet management with health passport, availability, and verification
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { usePetProfile } from '@/hooks/domains/pet';
import { useToast } from '@/components/ui/toast';
import { PersonalityCard } from '@/components/Personality/PersonalityCard';
import PetProfileEditor from '@/components/Profile/PetProfileEditor';
import HealthPassport from '@/components/Pet/HealthPassport';
import PetAvailability from '@/components/Pet/PetAvailability';
import PetVerification from '@/components/Pet/PetVerification';
import {
  ArrowLeftIcon,
  CalendarIcon,
  Cog6ToothIcon,
  HeartIcon,
  MapPinIcon,
  ShieldCheckIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { motion } from 'framer-motion';

export default function PetProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const petId = id as string;
  const toast = useToast();
  const { pet, loading, error, updatePet } = usePetProfile(petId);
  const [activeTab, setActiveTab] = useState<'profile' | 'health' | 'availability' | 'verification'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updatedPet: any) => {
    setIsSaving(true);
    try {
      await updatePet(updatedPet);
      toast.success('Profile Saved', 'Pet profile updated successfully!');
    } catch (error) {
      logger.error('Error saving pet profile:', { error });
      toast.error('Save Failed', 'Unable to save pet profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-24 mt-4" />
          <div className="w-2/3 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-full h-[400px] mt-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Pet</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Link
            href="/pawfiles"
            className="inline-flex items-center space-x-2 text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Pawfiles</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pet Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We couldn't find the pet you're looking for.
          </p>
          <Link
            href="/pawfiles"
            className="inline-flex items-center space-x-2 text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Pawfiles</span>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: HeartIcon },
    { id: 'health', label: 'Health', icon: BeakerIcon },
    { id: 'availability', label: 'Availability', icon: CalendarIcon },
    { id: 'verification', label: 'Verification', icon: ShieldCheckIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/pawfiles"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Pawfiles</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                {pet.name}'s Profile
                {pet.verified && (
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full flex items-center gap-1">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {pet.breed || pet.species?.charAt(0).toUpperCase() + pet.species?.slice(1)}
                {pet.age && ` • ${pet.age} ${pet.ageUnit || 'years'} old`}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => router.push(`/matches?pet=${petId}`)}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center mb-2">
              <HeartIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Matches</span>
          </button>

          <button
            onClick={() => router.push('/calendar')}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Calendar</span>
          </button>

          <button
            onClick={() => router.push(`/map?pet=${petId}`)}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-2">
              <MapPinIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Playgrounds</span>
          </button>

          <Link
            href={`/pets/${petId}/settings`}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex items-center justify-center mb-2">
              <Cog6ToothIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Settings</span>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <>
              {/* Personality Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <PersonalityCard
                  petId={petId}
                  petName={pet.name || 'Pet'}
                  breed={pet.breed}
                  age={pet.age}
                  personalityTags={pet.personality as string[]}
                  description={pet.description}
                  onPersonalityGenerated={(personality) => {
                    logger.info('Personality generated:', { personality });
                  }}
                />
              </motion.div>

              {/* Profile Editor */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <PetProfileEditor pet={pet} onSave={handleSave} isLoading={isSaving} />
              </motion.div>
            </>
          )}

          {activeTab === 'health' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <HealthPassport petId={petId} petName={pet.name} />
            </motion.div>
          )}

          {activeTab === 'availability' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PetAvailability petId={petId} />
            </motion.div>
          )}

          {activeTab === 'verification' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PetVerification petId={petId} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

