import React from 'react';
/**
 * Loading skeleton for SwipeStack component
 * Production-ready with proper animations and accessibility
 */
export const SwipeStackSkeleton = () => {
    return (<div className="relative w-full h-full max-w-sm mx-auto" role="status" aria-label="Loading pets">
      {[0, 1, 2].map((index) => (<div key={index} className="absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden" style={{
                transform: `translateY(${index * 8}px) scale(${1 - index * 0.05})`,
                zIndex: 10 - index,
                opacity: 1 - index * 0.2,
            }}>
          {/* Image skeleton */}
          <div className="relative h-96 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"/>
          </div>

          {/* Content skeleton */}
          <div className="p-6 space-y-4">
            {/* Title skeleton */}
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded-lg w-3/4 animate-pulse"/>
              <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"/>
            </div>

            {/* Tags skeleton */}
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"/>
              <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"/>
              <div className="h-6 bg-gray-200 rounded-full w-14 animate-pulse"/>
            </div>

            {/* Description skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full animate-pulse"/>
              <div className="h-4 bg-gray-100 rounded w-5/6 animate-pulse"/>
              <div className="h-4 bg-gray-100 rounded w-4/6 animate-pulse"/>
            </div>

            {/* Action buttons skeleton */}
            <div className="flex justify-center gap-4 pt-4">
              <div className="h-14 w-14 bg-gray-200 rounded-full animate-pulse"/>
              <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"/>
              <div className="h-14 w-14 bg-gray-200 rounded-full animate-pulse"/>
            </div>
          </div>
        </div>))}

      <span className="sr-only">Loading pets...</span>

      {/* Add shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>);
};
export default SwipeStackSkeleton;
//# sourceMappingURL=SwipeStackSkeleton.jsx.map
//# sourceMappingURL=SwipeStackSkeleton.jsx.map