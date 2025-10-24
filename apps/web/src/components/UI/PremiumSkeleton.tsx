'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { SPRING_CONFIG } from '@/constants/animations';
export default function PremiumSkeleton({ variant = 'rectangular', width, height, className = '', animation = 'shimmer', count = 1, spacing = 'md', glassmorphism = false, }) {
    // Get spacing classes
    const getSpacingClasses = () => {
        const spacings = {
            none: '',
            sm: 'space-y-2',
            md: 'space-y-4',
            lg: 'space-y-6',
        };
        return spacings[spacing];
    };
    // Get variant classes
    const getVariantClasses = () => {
        const baseClasses = 'skeleton';
        const glassClasses = glassmorphism ? 'backdrop-blur-sm bg-white/20' : '';
        const variants = {
            text: `${baseClasses} h-4 rounded`,
            rectangular: `${baseClasses} rounded-lg`,
            circular: `${baseClasses} rounded-full`,
            card: `${baseClasses} rounded-xl p-4`,
            avatar: `${baseClasses} rounded-full w-12 h-12`,
            button: `${baseClasses} rounded-lg h-10`,
        };
        return `${variants[variant]} ${glassClasses}`;
    };
    // Get animation classes
    const getAnimationClasses = () => {
        const animations = {
            pulse: 'animate-pulse',
            wave: 'animate-wave',
            shimmer: 'animate-shimmer',
            glow: 'animate-glow',
        };
        return animations[animation];
    };
    // Get dimensions
    const getDimensions = () => {
        const style = {};
        if (width) {
            style.width = typeof width === 'number' ? `${width}px` : width;
        }
        if (height) {
            style.height = typeof height === 'number' ? `${height}px` : height;
        }
        return style;
    };
    const skeletonClasses = `${getVariantClasses()} ${getAnimationClasses()} ${className}`;
    const containerClasses = count > 1 ? getSpacingClasses() : '';
    // Single skeleton
    if (count === 1) {
        return (<motion.div className={skeletonClasses} style={getDimensions()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SPRING_CONFIG}/>);
    }
    // Multiple skeletons
    return (<div className={containerClasses}>
      {Array.from({ length: count }).map((_, index) => (<motion.div key={index} className={skeletonClasses} style={getDimensions()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{
                ...SPRING_CONFIG,
                delay: index * 0.1,
            }}/>))}
    </div>);
}
// Predefined skeleton components for common use cases
export const SkeletonCard = ({ className = '' }) => (<div className={`space-y-4 ${className}`}>
    <PremiumSkeleton variant="rectangular" height={200} className="rounded-xl"/>
    <div className="space-y-2">
      <PremiumSkeleton variant="text" width="80%"/>
      <PremiumSkeleton variant="text" width="60%"/>
    </div>
    <div className="flex gap-2">
      <PremiumSkeleton variant="button" width={80}/>
      <PremiumSkeleton variant="button" width={100}/>
    </div>
  </div>);
export const SkeletonProfile = ({ className = '' }) => (<div className={`flex items-center space-x-4 ${className}`}>
    <PremiumSkeleton variant="avatar"/>
    <div className="space-y-2 flex-1">
      <PremiumSkeleton variant="text" width="40%"/>
      <PremiumSkeleton variant="text" width="60%"/>
    </div>
  </div>);
export const SkeletonList = ({ count = 5, className = '' }) => (<div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, index) => (<div key={index} className="flex items-center space-x-4">
        <PremiumSkeleton variant="avatar"/>
        <div className="space-y-2 flex-1">
          <PremiumSkeleton variant="text" width="70%"/>
          <PremiumSkeleton variant="text" width="50%"/>
        </div>
        <PremiumSkeleton variant="button" width={60}/>
      </div>))}
  </div>);
export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (<div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (<PremiumSkeleton key={index} variant="text" height={20}/>))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (<div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (<PremiumSkeleton key={colIndex} variant="text" height={16}/>))}
      </div>))}
  </div>);
//# sourceMappingURL=PremiumSkeleton.jsx.map