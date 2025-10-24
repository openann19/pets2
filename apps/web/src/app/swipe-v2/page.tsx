/**
 * 🎯 SwipeCardV2 Demo Page
 * Showcase the new pixel-perfect swipe card design
 */
'use client';
import { motion, AnimatePresence } from 'framer-motion'
import { logger } from '@pawfectmatch/core';
;
import React, { useState, useCallback } from 'react';
import SwipeCardV2, {} from '@/components/Pet/SwipeCardV2';
import { generateMockPetCardData } from '@/utils/petCardAdapter';
export default function SwipeV2Page() {
    const [currentPetIndex, setCurrentPetIndex] = useState(0);
    const [pets] = useState(() => 
    Array.from({ length: 10 }, generateMockPetCardData));
    const [swipeHistory, setSwipeHistory] = useState<Array<{ petId: string; action: string; timestamp: Date }>>([]);
    const currentPet = pets[currentPetIndex];
    const handleSwipe = (action, petId) => {
        // Add to swipe history
        setSwipeHistory(prev => [...prev, {
                petId,
                action,
                timestamp: new Date(),
            }]);
        // Move to next pet
        if (currentPetIndex < pets.length - 1) {
            setTimeout(() => {
                setCurrentPetIndex(prev => prev + 1);
            }, 300);
        }
        else {
            // Reset to first pet when we reach the end
            setTimeout(() => {
                setCurrentPetIndex(0);
            }, 300);
        }
    };
    const handleCardClick = useCallback(() => {
        logger.info('Card clicked:', { name: currentPet?.name });
    }, [currentPet]);
    const resetDemo = useCallback(() => {
        setCurrentPetIndex(0);
        setSwipeHistory([]);
    }, []);
    // Create stable handlers for preview card
    const handlePreviewSwipe = useCallback(() => {
        // Empty function for preview card
    }, []);
    const handlePreviewClick = useCallback(() => {
        // Empty function for preview card
    }, []);
    return (<div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 SwipeCardV2 Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Pixel-perfect Tinder-style swipe card with 8px grid system
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {swipeHistory.filter(s => s.action === 'like').length}
              </div>
              <div className="text-sm text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {swipeHistory.filter(s => s.action === 'pass').length}
              </div>
              <div className="text-sm text-gray-500">Passes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {swipeHistory.filter(s => s.action === 'superlike').length}
              </div>
              <div className="text-sm text-gray-500">Super Likes</div>
            </div>
          </div>

          <button onClick={resetDemo} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Reset Demo
          </button>
        </div>

        {/* Card Stack */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            <AnimatePresence mode="wait">
              {currentPet !== undefined && (<motion.div 
        key={currentPet.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8, x: 300 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                  <SwipeCardV2 pet={currentPet} onSwipe={handleSwipe} onCardClick={handleCardClick} hapticFeedback={true} soundEffects={false}/>
                </motion.div>)}
            </AnimatePresence>

            {/* Next Card Preview */}
            {currentPetIndex < pets.length - 1 && (<motion.div className="absolute inset-0 -z-10 scale-95 opacity-50" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.2 }}>
                <SwipeCardV2 
        pet={pets[currentPetIndex + 1]} onSwipe={handlePreviewSwipe} onCardClick={handlePreviewClick} hapticFeedback={false} soundEffects={false}/>
              </motion.div>)}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">How to Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400">⇦</span>
                </div>
                <span>Swipe left or tap X to pass</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400">♡</span>
                </div>
                <span>Swipe right or tap heart to like</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400">⭐</span>
                </div>
                <span>Swipe up or tap star for super like</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Swipes */}
        {swipeHistory.length > 0 && (<div className="mt-8">
            <h3 className="text-lg font-semibold text-center mb-4">Recent Swipes</h3>
            <div className="max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg max-h-48 overflow-y-auto">
                {swipeHistory.slice(-5).reverse().map((swipe, index) => {
                const pet = pets.find(p => p.id === swipe.petId);
                const actionColors = {
                    like: 'text-green-600',
                    pass: 'text-red-600',
                    superlike: 'text-blue-600',
                };
                const actionIcons = {
                    like: '♡',
                    pass: '⇦',
                    superlike: '⭐',
                };
                return (<div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg ${actionColors[swipe.action]}`}>
                          {actionIcons[swipe.action]}
                        </span>
                        <span className="font-medium">{pet?.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {swipe.timestamp.toLocaleTimeString()}
                      </span>
                    </div>);
            })}
              </div>
            </div>
          </div>)}
      </div>
    </div>);
}
//# sourceMappingURL=page.jsx.map