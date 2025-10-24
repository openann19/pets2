/**
 * 🎯 OPTIMIZED SWIPE CARD COMPONENT
 * Modular, performant swipe card with lazy loading and error boundaries
 */
import React, { Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwipeCardCore } from './SwipeCardCore';
import { SwipeCardOverlay } from './SwipeCardOverlay';
import { SwipeCardActions } from './SwipeCardActions';
import { SwipeCardInfo } from './SwipeCardInfo';
import { LazyImage } from '../../Performance/LazyImage';
import { withErrorBoundary } from '../../providers/AppErrorBoundary';
// Lazy load heavy components
const SwipeCardPremiumEffects = lazy(() => import('./SwipeCardPremiumEffects').then(module => ({ default: module.SwipeCardPremiumEffects })));
const SwipeCardComponent = ({ pet, onSwipe, onCardClick, style, dragConstraints, hapticFeedback = true, soundEffects = true, premiumEffects = true, }) => {
    return (<motion.div className="relative w-full h-full" style={style} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
      {/* Core Swipe Functionality */}
      <SwipeCardCore pet={pet} onSwipe={onSwipe} onCardClick={onCardClick} style={style} dragConstraints={dragConstraints}/>

      {/* Overlay Effects */}
      <SwipeCardOverlay x={0} // Will be connected to motion values
     y={0} // Will be connected to motion values
     premiumEffects={premiumEffects}/>

      {/* Action Buttons */}
      <SwipeCardActions onLike={() => onSwipe('like')} onPass={() => onSwipe('pass')} onSuperLike={() => onSwipe('superlike')} hapticFeedback={hapticFeedback} soundEffects={soundEffects} premiumEffects={premiumEffects}/>

      {/* Pet Information */}
      <SwipeCardInfo pet={pet} onCardClick={onCardClick}/>

      {/* Premium Effects (Lazy Loaded) */}
      {premiumEffects && (<Suspense fallback={null}>
          <SwipeCardPremiumEffects pet={pet}/>
        </Suspense>)}
    </motion.div>);
};
// Export with error boundary
export const SwipeCard = withErrorBoundary(SwipeCardComponent, {
    level: 'component',
    fallback: (<div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
      <p className="text-gray-500">Unable to load pet card</p>
    </div>),
});
export default SwipeCard;
//# sourceMappingURL=index.jsx.map
//# sourceMappingURL=index.jsx.map