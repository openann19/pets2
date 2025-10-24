'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipe } from '../../../src/hooks/useSwipe';
import SwipeCard from '../../../src/components/Pet/SwipeCard';
import MatchModal from '../../../src/components/Pet/MatchModal';
import { HeartIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../../../src/components/UI/LoadingSpinner';

export default function SwipePage() {
  const { pets, isLoading, error, loadPets, swipePet, refreshPets } = useSwipe();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<any>(null);

  useEffect(() => {
    loadPets();
  }, []);

  const onSwipe = async (direction: 'like' | 'pass' | 'superlike') => {
    const currentPet = pets[currentIndex];
    if (!currentPet) return;

    try {
      const result = await swipePet(currentPet._id, direction);
      if (result?.isMatch) {
        setMatchedPet(currentPet);
        setShowMatchModal(true);
      }
      
      // Move to next pet
      if (currentIndex >= pets.length - 2) {
        loadPets(); // Load more pets when running low
      }
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Swipe failed:', error);
    }
  };

  if (isLoading && pets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading pets</p>
          <button
            onClick={() => refreshPets()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentPet = pets[currentIndex];

  if (!currentPet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No more pets to swipe!</h2>
          <p className="text-gray-600 mb-8">Check back later for more matches</p>
          <button
            onClick={() => refreshPets()}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Discover Pets</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentIndex + 1} / {pets.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Swipe Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPet.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SwipeCard pet={currentPet} onSwipe={onSwipe} />
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => onSwipe('pass')}
              className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow group"
            >
              <XMarkIcon className="h-8 w-8 text-red-500 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => onSwipe('superlike')}
              className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow group"
            >
              <StarIcon className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => onSwipe('like')}
              className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow group"
            >
              <HeartIcon className="h-8 w-8 text-green-500 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && matchedPet && (
        <MatchModal
          pet={matchedPet}
          onClose={() => {
            setShowMatchModal(false);
            setMatchedPet(null);
          }}
        />
      )}
    </div>
  );
}
