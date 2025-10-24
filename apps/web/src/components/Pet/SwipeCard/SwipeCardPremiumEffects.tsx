/**
 * ✨ SWIPE CARD PREMIUM EFFECTS COMPONENT
 * Advanced visual effects for premium users
 */
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
export const SwipeCardPremiumEffects = ({ pet }) => {
    const [isVisible, setIsVisible] = useState(false);
    const controls = useAnimation();
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
            controls.start({
                opacity: 1,
                scale: 1,
                transition: { duration: 0.5 },
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [controls]);
    if (!isVisible)
        return null;
    return (<motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0, scale: 0.8 }} animate={controls}>
      {/* Floating Hearts */}
      {[...Array(3)].map((_, i) => (<motion.div key={`heart-${i}`} className="absolute text-pink-400 text-2xl" style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
            }} animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
                opacity: [0.7, 1, 0.7],
            }} transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
            }}>
          ♥
        </motion.div>))}

      {/* Sparkle Effects */}
      {[...Array(5)].map((_, i) => (<motion.div key={`sparkle-${i}`} className="absolute text-yellow-400 text-lg" style={{
                left: `${15 + i * 20}%`,
                top: `${80 + i * 5}%`,
            }} animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
                opacity: [0, 1, 0],
            }} transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
            }}>
          ✨
        </motion.div>))}
    </motion.div>);
};
//# sourceMappingURL=SwipeCardPremiumEffects.jsx.map
//# sourceMappingURL=SwipeCardPremiumEffects.jsx.map