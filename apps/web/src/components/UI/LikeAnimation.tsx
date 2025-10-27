/**
 * 💖 Like Animation Component
 * Beautiful heart explosion with particles when liking a pet
 */
'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
export default function LikeAnimation({ show, onComplete }) {
    const [particles, setParticles] = useState([]);
    useEffect(() => {
        if (show) {
            // Trigger confetti explosion
            const duration = 2000;
            const animationEnd = Date.now() + duration;
            const randomInRange = (min, max) => {
                return Math.random() * (max - min) + min;
            };
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    if (onComplete)
                        onComplete();
                    return;
                }
                confetti({
                    particleCount: 3,
                    angle: randomInRange(55, 125),
                    spread: randomInRange(50, 70),
                    origin: { x: 0.5, y: 0.5 },
                    colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
                    gravity: 1.2,
                    ticks: 200,
                    decay: 0.94,
                    startVelocity: 30,
                });
            }, 30);
            // Create floating hearts
            const newParticles = Array.from({ length: 12 }, (_, i) => ({
                id: i,
                x: randomInRange(-100, 100),
                y: randomInRange(-100, 100),
            }));
            setParticles(newParticles);
            // Haptic feedback
            if ('vibrate' in navigator) {
                navigator.vibrate([50, 50, 50]);
            }
            return () => { clearInterval(interval); };
        }
    }, [show, onComplete]);
    return (<AnimatePresence>
      {show && (<>
          {/* Central Heart Explosion */}
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
            <motion.div animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
            }} transition={{
                duration: 0.6,
                repeat: 3,
                ease: "easeInOut"
            }} className="text-9xl">
              ❤️
            </motion.div>
          </motion.div>

          {/* Floating Heart Particles */}
          {particles.map((particle) => (<motion.div key={particle.id} initial={{
                    x: '50vw',
                    y: '50vh',
                    scale: 0,
                    opacity: 0
                }} animate={{
                    x: `calc(50vw + ${particle.x}px)`,
                    y: `calc(50vh + ${particle.y}px)`,
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 360]
                }} transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: particle.id * 0.05
                }} className="fixed pointer-events-none z-[9999] text-4xl" style={{ left: 0, top: 0 }}>
              💖
            </motion.div>))}

          {/* Pulsing Ring */}
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{
                scale: [0, 2, 3],
                opacity: [0.8, 0.4, 0]
            }} transition={{ duration: 1.5, ease: "easeOut" }} className="fixed inset-0 pointer-events-none z-[9998] flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-pink-500"/>
          </motion.div>

          {/* Success Text */}
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-[9999]">
            <div className="bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 text-white px-8 py-4 rounded-full shadow-2xl font-bold text-2xl">
              💖 Liked!
            </div>
          </motion.div>
        </>)}
    </AnimatePresence>);
}
/**
 * Match Animation - Even more dramatic!
 */
export function MatchAnimation({ show, onComplete }) {
    useEffect(() => {
        if (show) {
            // Massive confetti explosion for matches!
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
            const randomInRange = (min, max) => {
                return Math.random() * (max - min) + min;
            };
            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) {
                    clearInterval(interval);
                    if (onComplete)
                        onComplete();
                    return;
                }
                const particleCount = 50 * (timeLeft / duration);
                // Burst from left
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#ff006e', '#fb5607', '#ffbe0b'],
                });
                // Burst from right
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#8338ec', '#3a86ff', '#06ffa5'],
                });
            }, 250);
            // Haptic celebration
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100, 50, 200]);
            }
            return () => { clearInterval(interval); };
        }
    }, [show, onComplete]);
    return (<AnimatePresence>
      {show && (<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", damping: 15, stiffness: 300 }} className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center">
          {/* Animated Match Text */}
          <motion.div animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
            }} transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse"
            }} className="text-center">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="text-8xl mb-4">
              🎉
            </motion.div>
            <motion.h1 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", damping: 10 }} className="text-7xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
              It's a Match!
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-2xl text-white font-bold">
              You both liked each other! 💕
            </motion.p>
          </motion.div>
        </motion.div>)}
    </AnimatePresence>);
}
//# sourceMappingURL=LikeAnimation.jsx.map