'use client';
import React, { useState, useEffect, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, FunnelIcon, MagnifyingGlassIcon, HeartIcon, XMarkIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import UltraPremiumFilterPanel from '../Filter/UltraPremiumFilterPanel';
import SwipeCard from '../Pet/SwipeCard';
import MatchModal from '../Pet/MatchModal';
import LoadingSpinner from '../UI/LoadingSpinner';
import PremiumButton from '../UI/PremiumButton';
import PremiumLayout from '../Layout/PremiumLayout';
import { petsAPI } from '../../services/api';
import { useAuthStore } from '../../lib/auth-store';
import { Pet, FilterState, SwipeParams, MatchData, ApiResponse } from '../../types';
export default function SwipePageWithFilters() {
    const { user } = useAuthStore();
    const [pets, setPets] = useState([]);
    const [currentPetIndex, setCurrentPetIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLiking, setIsLiking] = useState(false);
    const [isPassing, setIsPassing] = useState(false);
    const [lastMatch, setLastMatch] = useState(null);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    // Filter states
    const [filtersApplied, setFiltersApplied] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        species: [],
        breeds: [],
        ages: { min: 0, max: 20 },
        sizes: [],
        genders: [],
        colors: [],
        temperaments: [],
        energyLevels: [],
        trainability: [],
        familyFriendly: [],
        petFriendly: [],
        strangerFriendly: [],
        apartmentFriendly: null,
        houseSafe: null,
        yardRequired: null,
        groomingNeeds: [],
        exerciseNeeds: [],
        barkiness: [],
        healthStatus: [],
        vaccinationStatus: [],
        availability: [],
        locationRadius: 25,
        sortBy: 'relevance',
        sortDirection: 'desc',
        resultLimit: 20,
        premiumFeatures: {
            trending: false,
            verified: false,
            featured: false,
            aiRecommended: false
        }
    });
    // Load pets with current filters
    const loadPets = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                limit: 20,
                page: 1
            };
            // Apply filters to API params
            if (activeFilters.species.length > 0) {
                params.species = activeFilters.species.join(',');
            }
            if (activeFilters.breeds.length > 0) {
                params.breeds = activeFilters.breeds.join(',');
            }
            if (activeFilters.ages.min > 0 || activeFilters.ages.max < 20) {
                params.ageRange = `${activeFilters.ages.min}-${activeFilters.ages.max}`;
            }
            if (activeFilters.sizes.length > 0) {
                params.sizes = activeFilters.sizes.join(',');
            }
            if (activeFilters.genders.length > 0) {
                params.gender = activeFilters.genders.join(',');
            }
            if (activeFilters.temperaments.length > 0) {
                params.temperament = activeFilters.temperaments.join(',');
            }
            if (activeFilters.energyLevels.length > 0) {
                params.energyLevel = activeFilters.energyLevels.join(',');
            }
            if (activeFilters.apartmentFriendly !== null) {
                params.apartmentFriendly = activeFilters.apartmentFriendly.toString();
            }
            if (activeFilters.locationRadius !== 25) {
                params.maxDistance = activeFilters.locationRadius;
            }
            if (activeFilters.sortBy !== 'relevance') {
                params.sortBy = activeFilters.sortBy;
            }
            // Premium features
            if (activeFilters.premiumFeatures.featured) {
                params.boostFeature = 'true';
            }
            if (activeFilters.premiumFeatures.verified) {
                params.verifiedOnly = 'true';
            }
            const response = await petsAPI.getSwipeablePets(params);
            if (response.success && response.data?.pets) {
                const fetchedPets = response.data.pets;
                setPets(fetchedPets);
                setCurrentPetIndex(0);
                if (fetchedPets.length === 0) {
                    setError('No pets match your current filters. Try adjusting your preferences!');
                }
            }
            else {
                setError('Unable to load pets. Please try again.');
            }
        }
        catch (err) {
            logger.error('Failed to load pets:', { error });
            const errorMessage = err instanceof Error ? err.message : 'Network error. Please check your connection.';
            setError(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    }, [activeFilters]);
    useEffect(() => {
        loadPets();
    }, [loadPets]);
    const handleSwipe = async (action) => {
        const currentPet = pets[currentPetIndex];
        if (!currentPet)
            return;
        const loadingState = action === 'pass' ? setIsPassing : setIsLiking;
        loadingState(true);
        try {
            let response;
            if (action === 'like') {
                response = await petsAPI.likePet(currentPet._id);
            }
            else if (action === 'pass') {
                response = await petsAPI.passPet(currentPet._id);
            }
            else if (action === 'superlike') {
                response = await petsAPI.superLikePet(currentPet._id);
            }
            if (response?.data?.isMatch) {
                setLastMatch(response.data);
                setShowMatchModal(true);
            }
            // Remove current pet and move to next
            setPets(prev => prev.filter((_, index) => index !== currentPetIndex));
            // If we removed a pet but current index is now out of bounds, go to previous
            if (currentPetIndex >= pets.length - 1) {
                setCurrentPetIndex(Math.max(0, currentPetIndex - 1));
            }
        }
        catch (error) {
            logger.error('Swipe error:', { error });
        }
        finally {
            loadingState(false);
        }
    };
    const applyFilters = (newFilters) => {
        setActiveFilters(newFilters);
        setFiltersApplied(Object.values(newFilters).some(value => Array.isArray(value) ? value.length > 0 :
            typeof value === 'object' ? Object.values(value).some(Boolean) :
                Boolean(value)));
    };
    const getFilterCount = () => {
        let count = 0;
        Object.entries(activeFilters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                count += value.length;
            }
            else if (typeof value === 'boolean') {
                count += 1;
            }
            else if (typeof value === 'object' && value !== null) {
                count += Object.values(value).filter(Boolean).length;
            }
        });
        return count;
    };
    const currentPet = pets[currentPetIndex];
    const hasPreviousPet = currentPetIndex > 0;
    const hasNextPet = currentPetIndex < pets.length - 1;
    return (<PremiumLayout>
      <div className="min-h-screen bg-transparent flex flex-col">
        {/* Enhanced Premium Header */}
        <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Left Section */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Ultra-Pet Discovery
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Advanced matching with AI-powered filters
                </p>
              </div>
              
              {/* Right Section */}
              <div className="flex items-center gap-4">
                {false && (<span className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold rounded-full">
                    <SparklesIcon className="w-3.5 h-3.5"/>
                    ULTRA-PREMIUM
                  </span>)}
                
                {/* Filter Button */}
                <motion.button onClick={() => setShowFilters(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`relative px-4 py-2 rounded-xl font-medium transition-all ${filtersApplied
            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
            : 'bg-white/10 hover:bg-white/20 text-gray-600 dark:text-gray-400 border border-gray-200/50'}`}>
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="w-4 h-4"/>
                    <span>Filters</span>
                    {getFilterCount() > 0 && (<span className="bg-white text-pink-600 text-xs px-2 py-0.5 rounded-full font-bold">
                        {getFilterCount()}
                      </span>)}
                  </div>
                </motion.button>
                
                {/* Queue Stats */}
                <div className="text-right">
                  <p className="text-xs text-gray-500">Your Queue</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{pets.length} pets</p>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Swipe Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
          {/* Navigation Arrows */}
          <AnimatePresence>
            {hasPreviousPet && (<motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onClick={() => setCurrentPetIndex(prev => Math.max(0, prev - 1))} className="absolute left-4 z-20 p-3 bg-white/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ChevronLeftIcon className="w-6 h-6 text-gray-700"/>
              </motion.button>)}
          </AnimatePresence>

          <AnimatePresence>
            {hasNextPet && (<motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onClick={() => setCurrentPetIndex(prev => Math.min(pets.length - 1, prev + 1))} className="absolute right-4 z-20 p-3 bg-white/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ChevronRightIcon className="w-6 h-6 text-gray-700"/>
              </motion.button>)}
          </AnimatePresence>

          {/* Main Swipe Content */}
          <div className="relative w-full max-w-lg">
            {isLoading && !currentPet ? (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <LoadingSpinner size="lg" variant="holographic"/>
                <p className="mt-4 text-lg text-white/80 font-semibold">
                  Finding perfect matches...
                </p>
              </motion.div>) : error ? (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="text-red-500 text-lg font-semibold">{error}</div>
                <button onClick={() => loadPets()} className="mt-4 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                  Retry
                </button>
              </motion.div>) : !currentPet ? (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-white mb-4">You've seen all pets!</h2>
                <p className="text-white/80 mb-6">Great job exploring!</p>
                <PremiumButton onClick={() => loadPets()} variant="glass" size="lg" icon={<SparklesIcon className="w-5 h-5"/>}>
                  Refresh with New Pets
                </PremiumButton>
              </motion.div>) : (<AnimatePresence mode="wait">
                <motion.div key={currentPet._id} initial={{ scale: 0.9, opacity: 0, rotateY: 10 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} exit={{ scale: 0.9, opacity: 0, rotateY: -10 }} transition={{ duration: 0.4, type: "spring" }}>
                  <SwipeCard pet={currentPet} onSwipe={handleSwipe}/>
                </motion.div>
              </AnimatePresence>)}

          {/* Pet Navigation Indicator */}
          {pets.length > 1 && (<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
              {pets.map((_, index) => (<button key={index} onClick={() => setCurrentPetIndex(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentPetIndex
                    ? 'bg-pink-500 scale-125'
                    : 'bg-white/50 hover:bg-white/70'}`}/>))}
            </div>)}
        </div>

        {/* Ultra-Premium Action Buttons */}
        {currentPet && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex justify-center items-center gap-4 sm:gap-6 lg:gap-8 pb-8">
            {/* Pass Button */}
            <motion.button onClick={() => handleSwipe('pass')} disabled={isPassing || isLoading} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`w-16 h-16 rounded-full border-2 shadow-lg transition-all flex items-center justify-center ${isPassing
                ? 'border-gray-400 bg-gray-100'
                : 'border-red-400 bg-white/10 hover:bg-red-500/20 hover:border-red-500'}`}>
              <XMarkIcon className={`w-8 h-8 ${isPassing ? 'text-gray-400' : 'text-red-500'}`}/>
            </motion.button>

            {/* Super Like Button (Premium) */}
            {false && (<motion.button onClick={() => handleSwipe('superlike')} disabled={isLoading} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 border-2 border-blue-400 shadow-xl hover:shadow-blue-500/50 transition-all flex items-center justify-center relative">
                <StarIcon className="w-10 h-10 text-white"/>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-4 h-4 text-white"/>
                </div>
              </motion.button>)}

            {/* Like Button */}
            <motion.button onClick={() => handleSwipe('like')} disabled={isLiking || isLoading} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`w-16 h-16 rounded-full border-2 shadow-lg transition-all flex items-center justify-center ${isLiking
                ? 'border-gray-400 bg-gray-100'
                : 'border-pink-400 bg-white/10 hover:bg-pink-500/20 hover:border-pink-500'}`}>
              <HeartSolidIcon className={`w-8 h-8 ${isLiking ? 'text-gray-400' : 'text-pink-500'}`}/>
            </motion.button>
          </motion.div>)}
      </div>

      {/* Ultra-Premium Filter Panel */}
      <UltraPremiumFilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} onApply={applyFilters} defaultFilters={activeFilters}/>

      {/* Match Modal */}
      {showMatchModal && lastMatch && (<MatchModal isOpen={showMatchModal} onClose={() => {
                setShowMatchModal(false);
                setLastMatch(null);
            }} matchId={lastMatch.matchId || lastMatch._id || ''} currentUserPet={lastMatch.pets?.[0]} matchedPet={lastMatch.pets?.[1]} matchedUser={lastMatch.users?.[1]}/>)}
      </div>
    </PremiumLayout>);
}
//# sourceMappingURL=SwipePageWithFilters.jsx.map