'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, SparklesIcon } from '@heroicons/react/24/solid';
export function SplashScreen({ onComplete, className = '' }) {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + Math.random() * 15 + 5;
                if (newProgress >= 100) {
                    setIsComplete(true);
                    clearInterval(interval);
                    // Complete after animation
                    setTimeout(() => {
                        onComplete();
                    }, 1000);
                    return 100;
                }
                return newProgress;
            });
        }, 200);
        return () => clearInterval(interval);
    }, [onComplete]);
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }} className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-500 via-secondary-500 to-purple-600 ${className}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Logo/Icon */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6, type: 'spring' }} className="mb-8">
            <div className="relative">
              {/* Main Icon */}
              <div className="w-32 h-32 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center">
                <HeartIcon className="h-16 w-16 text-primary-500"/>
              </div>
              
              {/* Sparkle Effects */}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} className="absolute -top-2 -right-2">
                <SparklesIcon className="h-8 w-8 text-yellow-400"/>
              </motion.div>
              
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-2 -left-2">
                <SparklesIcon className="h-6 w-6 text-pink-400"/>
              </motion.div>
            </div>
          </motion.div>

          {/* App Name */}
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="text-4xl font-bold text-white mb-2">
            PawfectMatch
          </motion.h1>

          {/* Tagline */}
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="text-lg text-white/80 mb-12">
            Find Your Perfect Pet Companion
          </motion.p>

          {/* Loading Progress */}
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: '100%', opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }} className="w-64 mx-auto">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div className="bg-white rounded-full h-full" style={{ width: `${progress}%` }} transition={{ duration: 0.3, ease: 'easeOut' }}/>
            </div>
            <motion.p className="text-white/60 text-sm mt-2" animate={{ opacity: isComplete ? 0 : 1 }}>
              {Math.round(progress)}% loaded
            </motion.p>
          </motion.div>

          {/* Completion Animation */}
          <AnimatePresence>
            {isComplete && (<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} transition={{ duration: 0.5, type: 'spring' }} className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.6, repeat: 2 }} className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-4">
                    <HeartIcon className="h-10 w-10 text-primary-500"/>
                  </motion.div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-white font-semibold">
                    Ready to match! 🐾
                  </motion.p>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (<motion.div key={i} className="absolute w-2 h-2 bg-white/20 rounded-full" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
            }} animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
            }} transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
            }}/>))}
        </div>
      </motion.div>
    </AnimatePresence>);
}
// iOS-specific splash screen
export function IOSSplashScreen({ onComplete }) {
    return (<SplashScreen onComplete={onComplete} className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"/>);
}
// Android-specific splash screen
export function AndroidSplashScreen({ onComplete }) {
    return (<SplashScreen onComplete={onComplete} className="bg-gradient-to-br from-green-500 via-blue-500 to-purple-500"/>);
}
// Desktop splash screen
export function DesktopSplashScreen({ onComplete }) {
    return (<SplashScreen onComplete={onComplete} className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"/>);
}
//# sourceMappingURL=SplashScreen.jsx.map