/**
 * 🎨 SWIPE CARD OVERLAY COMPONENT
 * Visual feedback and overlay effects for swipe interactions
 */
import React from 'react';
import { motion, useTransform } from 'framer-motion';
import { HeartIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/solid';
export const SwipeCardOverlay = ({ x, y, isLiked = false, isPassed = false, premiumEffects = true, }) => {
    // Overlay opacities based on drag position
    const likeOverlayOpacity = useTransform(x, [60, 140], [0, 1]);
    const passOverlayOpacity = useTransform(x, [-140, -60], [1, 0]);
    const superLikeOverlayOpacity = useTransform(y, [-160, -80], [1, 0]);
    // Icon scales for premium effects
    const likeIconScale = useTransform(x, [60, 140], [0.5, 1.2]);
    const passIconScale = useTransform(x, [-140, -60], [1.2, 0.5]);
    const superLikeIconScale = useTransform(y, [-160, -80], [1.2, 0.5]);
    return (<>
      {/* Like Overlay */}
      <motion.div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 bg-opacity-20 flex items-center justify-center pointer-events-none" style={{ opacity: likeOverlayOpacity }}>
        <motion.div className="text-white text-center" style={{ scale: likeIconScale }}>
          <HeartIcon className="w-24 h-24 mx-auto mb-4"/>
          <div className="text-4xl font-bold">LIKE</div>
        </motion.div>
      </motion.div>

      {/* Pass Overlay */}
      <motion.div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 bg-opacity-20 flex items-center justify-center pointer-events-none" style={{ opacity: passOverlayOpacity }}>
        <motion.div className="text-white text-center" style={{ scale: passIconScale }}>
          <XMarkIcon className="w-24 h-24 mx-auto mb-4"/>
          <div className="text-4xl font-bold">PASS</div>
        </motion.div>
      </motion.div>

      {/* Super Like Overlay */}
      <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 bg-opacity-20 flex items-center justify-center pointer-events-none" style={{ opacity: superLikeOverlayOpacity }}>
        <motion.div className="text-white text-center" style={{ scale: superLikeIconScale }}>
          <SparklesIcon className="w-24 h-24 mx-auto mb-4"/>
          <div className="text-4xl font-bold">SUPER LIKE</div>
        </motion.div>
      </motion.div>

      {/* Premium Particle Effects */}
      {premiumEffects && (<>
          {/* Like Particles */}
          <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: likeOverlayOpacity }}>
            {[...Array(8)].map((_, i) => (<motion.div key={`like-particle-${i}`} className="absolute w-2 h-2 bg-green-400 rounded-full" style={{
                    left: '50%',
                    top: '50%',
                }} animate={{
                    x: [0, (Math.random() - 0.5) * 200],
                    y: [0, (Math.random() - 0.5) * 200],
                    opacity: [1, 0],
                    scale: [1, 0],
                }} transition={{
                    duration: 1,
                    delay: i * 0.1,
                    ease: 'easeOut',
                }}/>))}
          </motion.div>

          {/* Pass Particles */}
          <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: passOverlayOpacity }}>
            {[...Array(6)].map((_, i) => (<motion.div key={`pass-particle-${i}`} className="absolute w-3 h-3 bg-red-400 rounded-full" style={{
                    left: '50%',
                    top: '50%',
                }} animate={{
                    x: [0, (Math.random() - 0.5) * 150],
                    y: [0, (Math.random() - 0.5) * 150],
                    opacity: [1, 0],
                    scale: [1, 0],
                }} transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: 'easeOut',
                }}/>))}
          </motion.div>

          {/* Super Like Particles */}
          <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: superLikeOverlayOpacity }}>
            {[...Array(12)].map((_, i) => (<motion.div key={`superlike-particle-${i}`} className="absolute w-1 h-1 bg-blue-400 rounded-full" style={{
                    left: '50%',
                    top: '50%',
                }} animate={{
                    x: [0, (Math.random() - 0.5) * 300],
                    y: [0, (Math.random() - 0.5) * 300],
                    opacity: [1, 0],
                    scale: [1, 0],
                }} transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    ease: 'easeOut',
                }}/>))}
          </motion.div>
        </>)}
    </>);
};
//# sourceMappingURL=SwipeCardOverlay.jsx.map
//# sourceMappingURL=SwipeCardOverlay.jsx.map