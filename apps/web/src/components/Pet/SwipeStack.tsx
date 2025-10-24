import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import { Pet, SwipeAction } from '../../types';
import { logger } from '../../services/logger';
const SwipeStack = ({ pets, onSwipe, onMatch, onLoadMore, isLoading = false, onCardClick, }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipedPets, setSwipedPets] = useState(new Set());
    const [isAnimating, setIsAnimating] = useState(false);
    const stackRef = useRef(null);
    // Load more pets when running low
    useEffect(() => {
        if (currentIndex >= pets.length - 2 && onLoadMore && !isLoading) {
            onLoadMore();
        }
    }, [currentIndex, pets.length, onLoadMore, isLoading]);
    const handleSwipe = async (direction) => {
        if (isAnimating || currentIndex >= pets.length)
            return;
        const currentPet = pets[currentIndex];
        if (!currentPet || swipedPets.has(currentPet._id || currentPet.id))
            return;
        setIsAnimating(true);
        setSwipedPets(prev => new Set(prev).add(currentPet._id || currentPet.id));
        try {
            const result = await onSwipe(currentPet._id || currentPet.id, direction);
            if (result.isMatch && result.matchId && onMatch) {
                onMatch(result.matchId);
            }
        }
        catch (error) {
            logger.error('Swipe error', error);
            // Remove from swiped if there was an error
            setSwipedPets(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentPet._id || currentPet.id);
                return newSet;
            });
        }
        // Move to next pet after animation
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setIsAnimating(false);
        }, 300);
    };
    const getVisiblePets = () => {
        return pets.slice(currentIndex, currentIndex + 3);
    };
    const getCardStyle = (index) => {
        const baseZIndex = 10 - index;
        const scale = 1 - (index * 0.05);
        const yOffset = index * 8;
        return {
            zIndex: baseZIndex,
            transform: `scale(${scale}) translateY(${yOffset}px)`,
        };
    };
    const visiblePets = getVisiblePets();
    if (pets.length === 0) {
        return (<div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No pets to discover</h3>
          <p className="text-gray-600">Check back later for new matches!</p>
        </div>
      </div>);
    }
    if (currentIndex >= pets.length) {
        return (<div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">You've seen all pets!</h3>
          <p className="text-gray-600 mb-4">Great job exploring! Check back later for new matches.</p>
          <button onClick={() => {
                setCurrentIndex(0);
                setSwipedPets(new Set());
            }} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200">
            Start Over
          </button>
        </div>
      </div>);
    }
    return (<div ref={stackRef} className="relative w-full h-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-4" style={{ perspective: '1000px' }}>
      <AnimatePresence mode="popLayout">
        {visiblePets.map((pet, stackIndex) => {
            const actualIndex = currentIndex + stackIndex;
            const isCurrentCard = stackIndex === 0;
            return (<motion.div key={`${pet._id || pet.id}-${actualIndex}`} className="absolute inset-0" initial={stackIndex > 0 ? false : { scale: 0.8, opacity: 0 }} animate={{
                    scale: 1 - (stackIndex * 0.05),
                    y: stackIndex * 8,
                    opacity: 1,
                }} exit={{
                    scale: 0.8,
                    opacity: 0,
                    transition: { duration: 0.3 }
                }} transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3,
                }} style={{
                    zIndex: 10 - stackIndex,
                    pointerEvents: isCurrentCard ? 'auto' : 'none',
                }}>
              <SwipeCard pet={pet} onSwipe={handleSwipe} onCardClick={onCardClick ? () => onCardClick(pet) : undefined} dragConstraints={stackRef} style={!isCurrentCard ? { filter: 'brightness(0.8)' } : undefined}/>
            </motion.div>);
        })}
      </AnimatePresence>

      {/* Loading indicator */}
      {isLoading && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 text-gray-600">
          <LoadingSpinner size="sm" color="#EC4899"/>
          <span className="text-sm">Loading more pets...</span>
        </motion.div>)}

      {/* Cards remaining indicator */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-gray-500">
          {Math.max(0, pets.length - currentIndex)} pets remaining
        </p>
      </div>
    </div>);
};
export default SwipeStack;
//# sourceMappingURL=SwipeStack.jsx.map
//# sourceMappingURL=SwipeStack.jsx.map