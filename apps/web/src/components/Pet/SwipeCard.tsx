"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { HeartIcon, XMarkIcon, SparklesIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { SPRING_CONFIG } from '@/constants/animations';
import { Pet } from '@/types';
const SwipeCard = ({ pet, onSwipe, onCardClick, style, dragConstraints, premiumEffects = true, }) => {
    const cardRef = React.useRef(null);
    const [isExiting, setIsExiting] = useState(false);
    const [showParticles] = useState(false);
    // Enhanced motion values for smooth interactions
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-30, 30]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
    // Overlay opacities derived from motion values (no setState on drag)
    const likeOverlayOpacity = useTransform(x, [60, 140], [0, 1]);
    const passOverlayOpacity = useTransform(x, [-140, -60], [1, 0]);
    // const superLikeOverlayOpacity = useTransform(y, [-160, -80], [1, 0]);
    // onDrag not needed; rely on motion values
    const handleDragEnd = (_, info) => {
        const threshold = 100;
        const superThreshold = 120;
        const velocity = info.velocity.x;
        const offset = info.offset.x;
        const yOffset = info.offset.y;
        // Enhanced haptic feedback for swipe actions
        const triggerHaptic = (type = 'medium') => {
            if ('vibrate' in navigator) {
                const patterns = {
                    light: [10],
                    medium: [20],
                    heavy: [30, 10, 30]
                };
                navigator.vibrate(patterns[type]);
            }
        };
        // Check for super like (swipe up) - Enhanced with haptics
        if (yOffset < -superThreshold && Math.abs(offset) < 50) {
            triggerHaptic('heavy');
            setIsExiting(true);
            setTimeout(() => onSwipe('superlike'), 200);
        }
        // Strong swipe or drag beyond threshold - Enhanced with haptics
        else if (Math.abs(velocity) > 500 || Math.abs(offset) > threshold) {
            triggerHaptic('medium');
            setIsExiting(true);
            if (offset > 0 || velocity > 0) {
                setTimeout(() => onSwipe('like'), 200);
            }
            else {
                setTimeout(() => onSwipe('pass'), 200);
            }
        }
        else {
            // Snap back with light haptic
            triggerHaptic('light');
            x.set(0);
            y.set(0);
        }
    };
    const handleButtonClick = (action) => {
        // Enhanced haptic feedback for button clicks
        const triggerHaptic = (type = 'medium') => {
            if ('vibrate' in navigator) {
                const patterns = {
                    light: [10],
                    medium: [20],
                    heavy: [30, 10, 30]
                };
                navigator.vibrate(patterns[type]);
            }
        };
        // Different haptic patterns for different actions
        if (action === 'superlike') {
            triggerHaptic('heavy');
        }
        else {
            triggerHaptic('medium');
        }
        setIsExiting(true);
        setTimeout(() => onSwipe(action), 200);
    };
    // Helper retained for compatibility (not used with motion values)
    // Get primary photo
    const primaryPhoto = pet.photos.find((photo) => photo.isPrimary) || pet.photos[0];
    const photoUrl = primaryPhoto?.url || 'https://via.placeholder.com/400x500?text=No+Photo';
    // Calculate age display
    const ageText = pet.age < 1 ? `${Math.round(pet.age * 12)} months` : `${pet.age} years`;
    // Get owner info
    const owner = typeof pet.owner === 'object' ? pet.owner : null;
    const distance = owner?.location ? '2.5 km away' : 'Location unknown'; // Placeholder distance
    return (<div className="relative">
      {/* Particle effects for premium interactions (kept minimal, gated) */}
      {premiumEffects && showParticles && (<div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(8)].map((_, i) => (<motion.div key={i} className="absolute w-3 h-3 rounded-full" style={{
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.8), rgba(56,189,248,0.6))',
                }} initial={{
                    x: '50%',
                    y: '50%',
                    opacity: 1,
                    scale: 0,
                }} animate={{
                    x: `${50 + (Math.random() - 0.5) * 300}%`,
                    y: `${50 + (Math.random() - 0.5) * 300}%`,
                    opacity: 0,
                    scale: 1,
                }} transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: 'easeOut',
                }}/>))}
        </div>)}

      <motion.div ref={cardRef} drag dragConstraints={dragConstraints} dragElastic={0.15} 
    // Derive overlays from motion values; no state in onDrag
    onDragEnd={handleDragEnd} className="absolute inset-0" style={{
            x,
            y,
            rotate,
            opacity,
            ...style
        }} animate={{
            scale: isExiting ? 0.8 : 1,
            opacity: isExiting ? 0 : 1,
        }} transition={SPRING_CONFIG} whileTap={{ scale: 0.98 }} whileHover={premiumEffects ? {
            scale: 1.02,
            y: -5,
            rotateY: 2,
            transition: { type: "spring", stiffness: 400, damping: 25 }
        } : {}}>
        <div className="w-full h-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing relative transform-gpu" onClick={onCardClick} style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        }}>
        {/* Swipe Indicators - enhanced glassy */}
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

        {/* Main Photo */}
        <div className="relative h-2/3">
          <Image src={photoUrl} alt={pet.name} fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover" priority={false}/>
          
          {/* Photo overlay gradient - enhanced */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
          
          {/* Premium Badge */}
          {pet.featured?.isFeatured && (<div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-lg">
              <SparklesIcon className="w-4 h-4"/>
              <span>Featured</span>
            </div>)}

          {/* Photo indicators */}
          {pet.photos.length > 1 && (<div className="absolute top-4 right-4 flex space-x-1">
              {pet.photos.map((_, index) => (<div key={index} className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-white' : 'bg-white/50'}`}/>))}
            </div>)}

          {/* Basic info overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-2xl font-bold">{pet.name}</h3>
                <p className="text-lg opacity-90">{ageText}</p>
              </div>
              <div className="text-right">
                <span className="text-3xl">{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Details */}
        <div className="h-1/3 p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Breed</p>
                <p className="font-semibold text-white">{pet.breed || 'Mixed'}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Size</p>
                <p className="font-semibold capitalize text-white">{pet.size || 'Medium'}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-white/70">
              <MapPinIcon className="w-4 h-4"/>
              <span className="text-sm">{distance}</span>
            </div>

            {/* Description/Bio */}
            {(pet.description || pet.bio) && (<div>
                <p className="text-white/85 text-sm leading-relaxed">
                  {pet.description || pet.bio}
                </p>
              </div>)}

            {/* Personality Tags (with fallback) */}
            {pet.personalityTags?.length > 0 && (<div>
                <p className="text-white/70 text-sm mb-2">Personality</p>
                <div className="flex flex-wrap gap-2">
                  {pet.personalityTags.slice(0, 4).map((tag, index) => (<span key={index} className="border border-white/10 bg-white/5 text-white/90 px-3 py-1 rounded-full text-xs font-medium">
                      {tag}
                    </span>))}
                  {pet.personalityTags.length > 4 && (<span className="border border-white/10 bg-white/5 text-white/80 px-3 py-1 rounded-full text-xs">
                      +{pet.personalityTags.length - 4} more
                    </span>)}
                </div>
              </div>)}

            {/* Health Info (with fallback) */}
            {pet.healthInfo && (<div className="flex items-center space-x-4 text-sm text-white/70">
                {pet.healthInfo.vaccinated && (<span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    <span>Vaccinated</span>
                  </span>)}
                {pet.healthInfo.spayedNeutered && (<span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-sky-400 rounded-full"></span>
                    <span>Spayed/Neutered</span>
                  </span>)}
              </div>)}
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 sm:space-x-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => {
            e.stopPropagation();
            handleButtonClick('pass');
        }} aria-label="Pass button" className="w-12 h-12 sm:w-14 sm:h-14 border border-white/30 text-white rounded-full flex items-center justify-center shadow-xl transition-all" style={{
            background: 'rgba(239, 68, 68, 0.15)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        }}>
            <XMarkIcon className="w-5 h-5 sm:w-7 sm:h-7"/>
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => {
            e.stopPropagation();
            handleButtonClick('superlike');
        }} aria-label="Superlike button" className="w-10 h-10 sm:w-12 sm:h-12 border border-white/30 text-white rounded-full flex items-center justify-center shadow-xl transition-all" style={{
            background: 'rgba(59, 130, 246, 0.15)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        }}>
            <SparklesIcon className="w-4 h-4 sm:w-6 sm:h-6"/>
          </motion.button>

          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => {
            e.stopPropagation();
            handleButtonClick('like');
        }} aria-label="Like button" className="w-12 h-12 sm:w-14 sm:h-14 border border-white/30 text-white rounded-full flex items-center justify-center shadow-xl transition-all" style={{
            background: 'rgba(236, 72, 153, 0.15)',
            backdropFilter: 'blur(12px) saturate(180%)',
            WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        }}>
            <HeartIcon className="w-5 h-5 sm:w-7 sm:h-7"/>
          </motion.button>
        </div>
      </div>
      </motion.div>
    </div>);
};
export default SwipeCard;
//# sourceMappingURL=SwipeCard.jsx.map