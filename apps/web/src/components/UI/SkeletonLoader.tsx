import React from 'react';
import { motion } from 'framer-motion';
const SkeletonLoader = ({ variant = 'rectangle', width = 'w-full', height = 'h-4', className = '' }) => {
    const pulseAnimation = {
        opacity: [0.4, 0.8, 0.4],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };
    if (variant === 'matchCard') {
        return (<motion.div animate={pulseAnimation} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${className}`} data-testid="skeleton">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            
            <div className="flex-1">
              {/* Name */}
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              {/* Message preview */}
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Time */}
            <div className="h-3 bg-gray-200 rounded w-12 mr-3"></div>
            {/* Action buttons */}
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </motion.div>);
    }
    if (variant === 'message') {
        return (<motion.div animate={pulseAnimation} className={`flex ${className}`} data-testid="skeleton">
        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200">
          <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </motion.div>);
    }
    if (variant === 'avatar') {
        return (<motion.div animate={pulseAnimation} className={`bg-gray-200 rounded-full ${width} ${height} ${className}`} data-testid="skeleton"/>);
    }
    if (variant === 'text') {
        return (<motion.div animate={pulseAnimation} className={`bg-gray-200 rounded ${width} ${height} ${className}`} data-testid="skeleton"/>);
    }
    // Default rectangle
    return (<motion.div animate={pulseAnimation} className={`bg-gray-200 rounded ${width} ${height} ${className}`} data-testid="skeleton"/>);
};
export default SkeletonLoader;
//# sourceMappingURL=SkeletonLoader.jsx.map
//# sourceMappingURL=SkeletonLoader.jsx.map