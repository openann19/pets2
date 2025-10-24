/**
 * 🎯 SwipeCardV2 - Rapid Redesign Implementation
 * Pixel-perfect Tinder-style swipe card with 8px grid system
 * Following the comprehensive playbook specifications
 */
'use client';
import { HeartIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { logger } from '@pawfectmatch/core';
;
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import React, { useState, useCallback } from 'react';
// ===== Utility Functions =====
const formatAge = (age) => {
    if (age < 1) {
        return `${Math.round(age * 12)} months`;
    }
    return `${age} years`;
};
const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)}m away`;
    }
    return `${distanceKm} km away`;
};
const getGenderIcon = (gender) => {
    return gender === 'male' ? '♂' : gender === 'female' ? '♀' : '';
};
const _getSpeciesEmoji = (species) => {
    switch (species) {
        case 'dog': return '🐕';
        case 'cat': return '🐱';
        case 'bird': return '🐦';
        case 'rabbit': return '🐰';
        default: return '🐾';
    }
};
// ===== Haptic Feedback =====
const triggerHaptic = (type = 'medium') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        const patterns = {
            light: [8],
            medium: [16],
            heavy: [24, 8, 24]
        };
        navigator.vibrate(patterns[type]);
    }
};
// ===== Sound Effects =====
const playSound = (type = 'pop') => {
    if (typeof window !== 'undefined') {
        try {
            // Create audio context for sound effects
            const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
            if (AudioContextClass === undefined)
                return;
            const audioContext = new AudioContextClass();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            const frequencies = {
                pop: 800,
                swipe: 400,
                match: 1200
            };
            oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
        catch (error) {
            // Silently fail if audio context is not supported
            logger.debug('Audio context not supported:', { error });
        }
    }
};
// ===== Main Component =====
const SwipeCardV2 = ({ pet, onSwipe, onCardClick, className = '', hapticFeedback = true, soundEffects = false, }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    // Motion values for smooth interactions
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-30, 30]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
    // Overlay opacities derived from motion values
    const likeOverlayOpacity = useTransform(x, [60, 140], [0, 1]);
    const passOverlayOpacity = useTransform(x, [-140, -60], [1, 0]);
    const superLikeOverlayOpacity = useTransform(y, [-160, -80], [1, 0]);
    // Handle drag end with proper thresholds
    const handleDragEnd = useCallback((_, info) => {
        const threshold = 100;
        const superThreshold = 120;
        const velocity = info.velocity.x;
        const offset = info.offset.x;
        const yOffset = info.offset.y;
        // Check for super like (swipe up)
        if (yOffset < -superThreshold && Math.abs(offset) < 50) {
            if (hapticFeedback)
                triggerHaptic('heavy');
            if (soundEffects)
                playSound('match');
            setIsExiting(true);
            setTimeout(() => onSwipe('superlike', pet.id), 200);
        }
        // Strong swipe or drag beyond threshold
        else if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
            if (hapticFeedback)
                triggerHaptic('medium');
            if (soundEffects)
                playSound('swipe');
            setIsExiting(true);
            if (offset > 0 || velocity > 0) {
                setTimeout(() => onSwipe('like', pet.id), 200);
            }
            else {
                setTimeout(() => onSwipe('pass', pet.id), 200);
            }
        }
        else {
            // Snap back with light haptic
            if (hapticFeedback)
                triggerHaptic('light');
            x.set(0);
            y.set(0);
        }
    }, [pet.id, onSwipe, hapticFeedback, soundEffects, x, y]);
    // Handle button clicks
    const handleButtonClick = useCallback((action) => {
        if (hapticFeedback) {
            triggerHaptic(action === 'superlike' ? 'heavy' : 'medium');
        }
        if (soundEffects) {
            playSound(action === 'superlike' ? 'match' : 'pop');
        }
        setIsExiting(true);
        setTimeout(() => onSwipe(action, pet.id), 200);
    }, [pet.id, onSwipe, hapticFeedback, soundEffects]);
    const handlePassClick = useCallback((e) => {
        e.stopPropagation();
        handleButtonClick('pass');
    }, [handleButtonClick]);
    const handleSuperLikeClick = useCallback((e) => {
        e.stopPropagation();
        handleButtonClick('superlike');
    }, [handleButtonClick]);
    const handleLikeClick = useCallback((e) => {
        e.stopPropagation();
        handleButtonClick('like');
    }, [handleButtonClick]);
    const handlePhotoClick = useCallback((e, index) => {
        e.stopPropagation();
        setCurrentPhotoIndex(index);
    }, []);
    const createPhotoClickHandler = useCallback((index) => {
        return (e) => handlePhotoClick(e, index);
    }, [handlePhotoClick]);
    // Get primary photo
    const primaryPhoto = pet.photos[currentPhotoIndex] ?? pet.photos[0] ?? 'https://via.placeholder.com/400x500?text=No+Photo';
    return (<div className={`relative mx-auto ${className}`} style={{ maxWidth: '420px' }}>
      {/* Swipe Overlays */}
      <motion.div className="absolute top-6 left-6 z-20 px-5 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-xl border border-white/20 text-white" style={{
            opacity: likeOverlayOpacity,
            background: 'rgba(34, 197, 94, 0.15)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}>
        <div className="flex items-center gap-2">
          <HeartSolidIcon className="w-5 h-5"/>
          <span>LIKE</span>
        </div>
      </motion.div>

      <motion.div className="absolute top-6 right-6 z-20 px-5 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-xl border border-white/20 text-white" style={{
            opacity: passOverlayOpacity,
            background: 'rgba(239, 68, 68, 0.15)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}>
        <div className="flex items-center gap-2">
          <XMarkIcon className="w-5 h-5"/>
          <span>PASS</span>
        </div>
      </motion.div>

      <motion.div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 px-5 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-xl border border-white/20 text-white" style={{
            opacity: superLikeOverlayOpacity,
            background: 'rgba(59, 130, 246, 0.15)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        }}>
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5"/>
          <span>SUPER LIKE</span>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.article drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} dragElastic={0.15} onDragEnd={handleDragEnd} className="relative rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-neutral-900 cursor-grab active:cursor-grabbing" style={{
            x,
            y,
            rotate,
            opacity,
        }} animate={{
            scale: isExiting ? 0.8 : 1,
            opacity: isExiting ? 0 : 1,
        }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
        }} whileTap={{ scale: 0.98 }} whileHover={{
            scale: 1.02,
            y: -5,
            transition: { type: 'spring', stiffness: 400, damping: 25 }
        }} onClick={onCardClick}>
        {/* Photo Section - 4:5 Aspect Ratio */}
        <div className="relative w-full aspect-[4/5]">
          <Image src={primaryPhoto} alt={pet.name} fill sizes="(max-width: 640px) 100vw, 420px" className="object-cover" priority={false}/>
          
          {/* Gradient Overlay - Bottom 30% */}
          <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/60 to-transparent"/>
          
          {/* Photo Indicators */}
          {pet.photos.length > 1 && (<div className="absolute top-4 right-4 flex space-x-1">
              {pet.photos.map((_, index) => (<button key={index} onClick={createPhotoClickHandler(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`}/>))}
            </div>)}
        </div>

        {/* Info Section - 16px padding */}
        <section className="p-4 space-y-1 text-neutral-900 dark:text-neutral-50">
          {/* Heading - Name + Breed + Gender */}
          <div className="flex items-center gap-1 font-semibold text-lg">
            <span>{pet.name}</span>
            <span className="text-neutral-500 dark:text-neutral-400">·</span>
            <span>{pet.breed}</span>
            {pet.gender && (<>
                <span className="text-neutral-500 dark:text-neutral-400">·</span>
                <span className="text-sm">{getGenderIcon(pet.gender)}</span>
              </>)}
          </div>

          {/* Meta Row - Age + Size + Distance */}
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            <span>{formatAge(pet.age)}</span>
            <span className="mx-1">·</span>
            <span className="capitalize">{pet.size}</span>
            <span className="mx-1">·</span>
            <span>{formatDistance(pet.distanceKm)}</span>
          </div>

          {/* Bio - 2-line clamp */}
          <div className="line-clamp-2 text-sm leading-5">
            &ldquo;{pet.bio}&rdquo;
          </div>

          {/* Compatibility Badge */}
          {pet.compatibility !== undefined && pet.compatibility > 0 && (<div className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-xs font-medium">
              <span>★</span>
              <span>Compatibility {pet.compatibility}%</span>
            </div>)}
        </section>

        {/* Action Buttons - 64px icons, 24px gap */}
        <div className="flex justify-center gap-6 py-3 pb-safe">
          {/* Pass Button */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePassClick} aria-label="Pass" className="rounded-full p-4 shadow-md bg-white dark:bg-neutral-800 hover:scale-105 active:scale-95 transition text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <XMarkIcon className="w-6 h-6"/>
          </motion.button>

          {/* Super Like Button */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSuperLikeClick} aria-label="Super Like" className="rounded-full p-4 shadow-md bg-white dark:bg-neutral-800 hover:scale-105 active:scale-95 transition text-sky-500 hover:text-sky-600" transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <SparklesIcon className="w-6 h-6"/>
          </motion.button>

          {/* Like Button */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleLikeClick} aria-label="Like" className="rounded-full p-4 shadow-md bg-white dark:bg-neutral-800 hover:scale-105 active:scale-95 transition text-rose-500 hover:text-rose-600" transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <HeartIcon className="w-6 h-6"/>
          </motion.button>
        </div>
      </motion.article>
    </div>);
};
export default SwipeCardV2;
//# sourceMappingURL=SwipeCardV2.jsx.map