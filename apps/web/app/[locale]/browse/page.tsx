'use client';

import PremiumLayout from '@/components/Layout/PremiumLayout';
import LikeAnimation, { MatchAnimation } from '@/components/UI/LikeAnimation';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import { petsAPI } from '@/services/api';
import { logger } from '@pawfectmatch/core';
import {
    AdjustmentsHorizontalIcon,
    ArrowPathIcon,
    ChatBubbleLeftRightIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
    UserIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BrowsePet {
  _id: string;
  name: string;
  age: number;
  breed: string;
  species: string;
  bio?: string;
  photos: Array<{ url: string; isPrimary: boolean }>;
  location?: {
    coordinates: [number, number];
    address?: {
      city?: string;
      state?: string;
    };
  };
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export default function BrowsePage() {
  // Data state
  const [pets, setPets] = useState<BrowsePet[]>([]);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isPassing, setIsPassing] = useState(false);
  
  // Error & Success states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  
  // Modal & UI states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [actionType, setActionType] = useState<'like' | 'chat' | null>(null);
  const [likedPets, setLikedPets] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    breed: '',
    species: '',
    location: '',
    maxDistance: 25,
    minAge: 0,
    maxAge: 20,
    size: '',
    energyLevel: '',
    familyFriendly: false
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch pets on mount and when filters change
  useEffect(() => {
    loadPets();
  }, [filters]); // Re-load when filters change

  const loadPets = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build advanced query with filters
      const queryParams: any = {
        limit: 20,
        page: 1,
        ...(filters.breed && { breed: filters.breed }),
        ...(filters.species && { species: filters.species }),
        ...(filters.location && { location: filters.location }),
        ...(filters.maxDistance && { maxDistance: filters.maxDistance }),
        ...((filters.minAge > 0 || filters.maxAge < 20) && { 
          minAge: filters.minAge, 
          maxAge: filters.maxAge 
        }),
        ...(filters.size && { size: filters.size }),
        ...(filters.energyLevel && { energyLevel: filters.energyLevel }),
        ...(filters.familyFriendly && { familyFriendly: 'true' })
      };

      const response = await petsAPI.discoverPets(queryParams) as any;
      
      if (response.success && response.data?.pets) {
        const fetchedPets = response.data.pets as BrowsePet[];
        
        if (fetchedPets.length === 0) {
          setError('No pets available at the moment. Check back soon!');
        } else {
          setPets(fetchedPets);
        }
      } else {
        setError('Unable to load pets. Please try again.');
      }
    } catch (err: any) {
      logger.error('Failed to load pets:', err);
      setError(err.message || 'Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPet = pets[currentPetIndex];

  const handleLike = async () => {
    if (!currentPet) return;
    
    setIsLiking(true);
    setError(null);
    
    try {
      const response = await petsAPI.likePet(currentPet._id) as any;
      
      // ✨ Show elite like animation with confetti
      setLikedPets(prev => [...prev, currentPet._id]);
      setShowLikeAnimation(true);
      
      // Check if it's a match
      if (response.data?.isMatch) {
        // 🎉 Show massive match celebration!
        setShowMatchAnimation(true);
        setTimeout(() => {
          window.location.href = `./matches`;
        }, 3000); // Give time for celebration animation
        return;
      }
      
      // Move to next pet after brief delay
      setTimeout(() => {
        moveToNextPet();
      }, 800);
      
    } catch (err: any) {
      logger.error('Failed to like pet:', err);
      setError(err.message || 'Failed to like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handlePass = async () => {
    if (!currentPet) return;
    
    setIsPassing(true);
    setError(null);
    
    try {
      await petsAPI.passPet(currentPet._id);
      moveToNextPet();
    } catch (err: any) {
      logger.error('Failed to pass pet:', err);
      setError(err.message || 'Failed to pass. Please try again.');
    } finally {
      setIsPassing(false);
    }
  };

  const moveToNextPet = () => {
    setCurrentPhotoIndex(0);
    
    if (currentPetIndex >= pets.length - 1) {
      // Reached end, try to load more
      loadPets();
      setCurrentPetIndex(0);
    } else {
      setCurrentPetIndex(prev => prev + 1);
    }
  };

  const handleChat = () => {
    setActionType('chat');
    setShowLoginModal(true);
  };

  const handleLoginSuccess = () => {
    if (actionType === 'chat' && currentPet) {
      window.location.href = `./chat/${currentPet._id}`;
    }
    setShowLoginModal(false);
    setActionType(null);
  };

  const nextPhoto = () => {
    if (!currentPet) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % currentPet.photos.length);
  };

  const prevPhoto = () => {
    if (!currentPet) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + currentPet.photos.length) % currentPet.photos.length);
  };

  const handleSwipeEnd = () => {
    if (Math.abs(dragOffset.x) > 100 && !isLiking && !isPassing) {
      if (dragOffset.x > 0) {
        // Swiped right - Like
        handleLike();
      } else {
        // Swiped left - Pass
        handlePass();
      }
    }
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const getLocationString = (pet: BrowsePet): string => {
    if (pet.location?.address?.city && pet.location?.address?.state) {
      return `${pet.location.address.city}, ${pet.location.address.state}`;
    }
    return 'Location unknown';
  };

  const getOwnerInitials = (pet: BrowsePet): string => {
    return `${pet.owner.firstName[0]}${pet.owner.lastName[0]}`.toUpperCase();
  };

  const getOwnerName = (pet: BrowsePet): string => {
    return `${pet.owner.firstName} ${pet.owner.lastName}`;
  };

  const getPrimaryPhoto = (pet: BrowsePet): string => {
    const primary = pet.photos.find(p => p.isPrimary);
    return primary?.url || pet.photos[0]?.url || '/images/placeholder-pet.jpg';
  };

  return (
    <PremiumLayout>
      {/* Page Header */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            <span className="mr-1">🐾</span>
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Browse Pets</span>
          </h1>
          {!isLoading && pets.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <span className="text-sm text-white/70">
                {currentPetIndex + 1} of {pets.length}
              </span>
            </div>
          )}
        </div>

        {/* Ultra-Premium Filter Panel */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <PremiumButton
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "glass" : "gradient"}
            size="lg"
            icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}
            className="w-full"
            magneticEffect
          >
            {showFilters ? 'Hide Filters' : 'Advanced Filters & Search'}
          </PremiumButton>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <PremiumCard className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MagnifyingGlassIcon className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-bold text-gray-800">Breed & Species Search</h3>
                </div>
                
                {/* Breed Search */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Breed Search</label>
                  <input
                    type="text"
                    placeholder="Search breeds (e.g., Shiba Inu, Golden Retriever)"
                    value={filters.breed}
                    onChange={(e) => setFilters(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Species Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Species</label>
                  <select
                    value={filters.species}
                    onChange={(e) => setFilters(prev => ({ ...prev, species: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Species</option>
                    <option value="dog">🐕 Dogs Only</option>
                    <option value="cat">🐱 Cats Only</option>
                    <option value="bird">🦜 Birds Only</option>
                    <option value="rabbit">🐰 Rabbits Only</option>
                    <option value="small-animal">🐭 Small Animals</option>
                  </select>
                </div>

                {/* Age Range */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Age Range</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={filters.minAge}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAge: parseInt(e.target.value) }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={0}>Any Age</option>
                      <option value={1}>1+ years</option>
                      <option value={2}>2+ years</option>
                      <option value={3}>3+ years</option>
                      <option value={5}>5+ years</option>
                    </select>
                    <span className="text-gray-500">to</span>
                    <select
                      value={filters.maxAge}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={20}>Any Age</option>
                      <option value={1}>1 year</option>
                      <option value={2}>2 years</option>
                      <option value={3}>3 years</option>
                      <option value={5}>5 years</option>
                      <option value={10}>10 years</option>
                    </select>
                  </div>
                </div>

                {/* Size Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['small', 'medium', 'large', 'extra-large'].map(size => (
                      <button
                        key={size}
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          size: prev.size === size ? '' : size 
                        }))}
                        className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                          filters.size === size 
                            ? 'bg-purple-500 text-white border-purple-500' 
                            : 'bg-white border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Energy Level</label>
                  <select
                    value={filters.energyLevel}
                    onChange={(e) => setFilters(prev => ({ ...prev, energyLevel: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Any Energy Level</option>
                    <option value="low">🐌 Low Energy</option>
                    <option value="moderate">🚶 Moderate</option>
                    <option value="high">🚀 High Energy</option>
                    <option value="very-high">⚡ Very High</option>
                  </select>
                </div>

                {/* Family Friendly */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="familyFriendly"
                    checked={filters.familyFriendly}
                    onChange={(e) => setFilters(prev => ({ ...prev, familyFriendly: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="familyFriendly" className="text-sm font-semibold text-gray-700">
                    👨‍👩‍👧‍👦 Family Friendly Only
                  </label>
                </div>

                {/* Apply Filters Button */}
                <PremiumButton
                  onClick={() => setCurrentPetIndex(0)}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  magneticEffect
                >
                  Apply Filters & Search
                </PremiumButton>
              </PremiumCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" variant="holographic" className="mb-6" />
            <p className="text-lg text-white/80 font-semibold">Finding perfect pets for you...</p>
            <p className="text-sm text-white/60 mt-2">This will just take a moment</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-500/30 border-2 border-red-500/60 text-red-100 p-4 rounded-xl backdrop-blur-md shadow-lg mb-4"
          >
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold mb-1">Unable to Load Pets</p>
                <p className="text-sm text-red-200">{error}</p>
                <PremiumButton
                  size="sm"
                  onClick={loadPets}
                  className="mt-3 bg-white/20 border-2 border-white/50 hover:bg-white/30 font-semibold"
                  icon={<ArrowPathIcon className="w-4 h-4" />}
                >
                  Retry
                </PremiumButton>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-green-500/30 border-2 border-green-500/60 text-green-100 p-4 rounded-xl backdrop-blur-md shadow-lg mb-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6 flex-shrink-0" />
                <p className="font-bold text-lg">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && !error && pets.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Pets Available</h3>
            <p className="text-white/70 mb-6">
              Check back soon for new pets looking for playdates and friends!
            </p>
            <PremiumButton
              onClick={loadPets}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl"
              icon={<ArrowPathIcon className="w-5 h-5" />}
            >
              Refresh
            </PremiumButton>
          </div>
        )}

        {/* Pet Card */}
        {!isLoading && !error && currentPet && (
          <div className="relative">
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => !isLiking && !isPassing && setIsDragging(true)}
              onDrag={(_: any, info: any) => !isLiking && !isPassing && setDragOffset({ x: info.offset.x, y: info.offset.y })}
              onDragEnd={handleSwipeEnd}
              animate={{ 
                x: dragOffset.x,
                rotate: dragOffset.x * 0.1,
                scale: isDragging ? 0.95 : 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`${isLiking || isPassing ? 'cursor-wait' : 'cursor-grab active:cursor-grabbing'}`}
            >
              <PremiumCard className="overflow-hidden" variant="glass" hover glow>
              {/* Photo Carousel */}
              <div className="relative h-96 bg-gradient-to-b from-black/10 to-black/30">
                <img
                  src={currentPet.photos[currentPhotoIndex]?.url || getPrimaryPhoto(currentPet)}
                  alt={currentPet.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-pet.jpg';
                  }}
                />
                
                {/* Photo Navigation */}
                {currentPet.photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
                  >
                    →
                  </button>
                  
                  {/* Photo Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {currentPet.photos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Like Status */}
              {likedPets.includes(currentPet._id) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 right-4 border border-white/30 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
                  style={{
                    background: 'rgba(236, 72, 153, 0.2)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                  }}
                >
                  ❤️ Liked!
                </motion.div>
              )}

              {/* Processing Overlay */}
              {(isLiking || isPassing) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center">
                    <LoadingSpinner size="lg" variant="holographic" className="mb-3" />
                    <p className="text-white font-semibold">
                      {isLiking ? 'Sending like...' : 'Passing...'}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Pet Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentPet.name}</h2>
                  <p className="text-white/70">
                    {currentPet.age} year old {currentPet.breed}
                  </p>
                  <p className="text-sm text-white/60 flex items-center gap-1">
                    📍 {getLocationString(currentPet)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {currentPet.owner.avatar || getOwnerInitials(currentPet)}
                  </div>
                  <p className="text-xs text-white/60 mt-1">{getOwnerName(currentPet)}</p>
                </div>
              </div>

              <p className="text-white/80 mb-6">{currentPet.bio || 'No bio available.'}</p>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center items-center">
                <PremiumButton
                  variant="outline"
                  size="lg"
                  onClick={handlePass}
                  disabled={isPassing || isLiking}
                  loading={isPassing}
                  className="flex-1 bg-red-500/40 border-2 border-red-500/80 text-white hover:bg-red-500/60 hover:border-red-500 backdrop-blur-md shadow-lg hover:shadow-red-500/50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    {isPassing ? <LoadingSpinner size="sm" /> : <XMarkIcon className="w-6 h-6" />}
                    <span>{isPassing ? 'Passing...' : 'Pass'}</span>
                  </div>
                </PremiumButton>
                
                <PremiumButton
                  variant="outline"
                  size="lg"
                  onClick={handleLike}
                  disabled={isLiking || isPassing}
                  loading={isLiking}
                  className="flex-1 bg-pink-500/40 border-2 border-pink-500/80 text-white hover:bg-pink-500/60 hover:border-pink-500 backdrop-blur-md shadow-lg hover:shadow-pink-500/50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    {isLiking ? (
                      <LoadingSpinner size="sm" />
                    ) : likedPets.includes(currentPet._id) ? (
                      <HeartSolid className="w-6 h-6" />
                    ) : (
                      <HeartIcon className="w-6 h-6" />
                    )}
                    <span>{isLiking ? 'Liking...' : likedPets.includes(currentPet._id) ? 'Liked' : 'Like'}</span>
                  </div>
                </PremiumButton>
                
                <PremiumButton
                  variant="outline"
                  size="lg"
                  onClick={handleChat}
                  disabled={isLiking || isPassing}
                  className="flex-1 bg-blue-500/40 border-2 border-blue-500/80 text-white hover:bg-blue-500/60 hover:border-blue-500 backdrop-blur-md shadow-lg hover:shadow-blue-500/50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                    <span>Chat</span>
                  </div>
                </PremiumButton>
              </div>
            </div>
            </PremiumCard>
          </motion.div>

          {/* Swipe Indicators */}
          {isDragging && (
            <>
              <motion.div
                className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white px-4 py-2 rounded-full font-bold text-lg border border-white/30 shadow-xl"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: dragOffset.x < -50 ? 1 : 0,
                  scale: dragOffset.x < -50 ? 1 : 0.8
                }}
              >
                PASS
              </motion.div>
              <motion.div
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white px-4 py-2 rounded-full font-bold text-lg border border-white/30 shadow-xl"
                style={{
                  background: 'rgba(236, 72, 153, 0.2)',
                  backdropFilter: 'blur(16px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: dragOffset.x > 50 ? 1 : 0,
                  scale: dragOffset.x > 50 ? 1 : 0.8
                }}
              >
                LIKE
              </motion.div>
            </>
            )}
          </div>
        )}

        {/* Instructions */}
        {!isLoading && !error && currentPet && (
          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              💡 <strong>Tip:</strong> Swipe left to pass, right to like, or use buttons below
            </p>
          </div>
        )}
      </div>

      {/* ✨ Elite Like Animation with Confetti */}
      <LikeAnimation 
        show={showLikeAnimation} 
        onComplete={() => setShowLikeAnimation(false)} 
      />

      {/* 🎉 Match Celebration Animation */}
      <MatchAnimation 
        show={showMatchAnimation} 
        onComplete={() => setShowMatchAnimation(false)} 
      />

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div>
              <PremiumCard className="max-w-md w-full p-8 text-center" variant="glass">
                <div className="mb-6">
                  {actionType === 'like' ? (
                    <HeartIcon className="w-16 h-16 mx-auto text-white mb-4" />
                  ) : (
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-white mb-4" />
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {actionType === 'like' ? 'Like This Pet?' : 'Start Chatting?'}
                  </h3>
                  <p className="text-white/70">
                    {actionType === 'like' 
                      ? 'Create an account to like pets and see who liked you back!'
                      : 'Sign up to start chatting with pet owners and arrange meetups!'
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <PremiumButton
                    size="lg"
                    href="./register"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold shadow-xl border-none"
                    icon={<UserIcon className="w-6 h-6" />}
                  >
                    Sign Up Free
                  </PremiumButton>
                  
                  <PremiumButton
                    variant="outline"
                    size="lg"
                    href="./login"
                    className="w-full bg-white/20 border-2 border-white/80 text-white hover:bg-white/30 hover:border-white font-semibold backdrop-blur-md"
                    icon={<SparklesIcon className="w-6 h-6" />}
                  >
                    Already have an account? Login
                  </PremiumButton>
                  
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="w-full text-white/80 hover:text-white text-sm transition-colors py-2 font-medium"
                    aria-label="Continue browsing without signing up"
                  >
                    Continue browsing
                  </button>
                </div>
              </PremiumCard>
          </div>
        </div>
      )}
    </PremiumLayout>
  );
}
