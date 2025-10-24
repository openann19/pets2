/**
 * 🎭 PREMIUM LOADING PAGE
 * Beautiful loading experience with premium animations and brand elements
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, HeartIcon } from '@heroicons/react/24/outline';
import { SPRING_CONFIG } from '@/constants/animations';
import HoloLogo from '@/components/Brand/HoloLogo';

export default function Loading() {
  return (
    <div className="min-h-screen bg-mesh-gradient flex items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${['#ec4899', '#8b5cf6', '#06b6d4', '#10b981'][i % 4]} 0%, transparent 70%)`,
              left: `${10 + i * 12}%`,
              top: `${15 + i * 15}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Premium Loading Content */}
      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={SPRING_CONFIG}
      >
        {/* Animated Logo */}
        <motion.div
          className="mb-8"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <HoloLogo size={64} withText monochrome />
          </div>
          
          <motion.div
            className="px-6 py-2 glass-light rounded-full"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(255, 255, 255, 0.3)",
                "0 0 40px rgba(255, 255, 255, 0.5)",
                "0 0 20px rgba(255, 255, 255, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white font-semibold">PREMIUM</span>
          </motion.div>
        </motion.div>

        {/* Premium Loading Animation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative w-24 h-24 mx-auto">
            {/* Multiple Rotating Rings */}
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="absolute inset-0 border-4 border-transparent rounded-full"
                style={{
                  borderTopColor: ['#ec4899', '#8b5cf6', '#06b6d4'][ring],
                  transform: `scale(${1 + ring * 0.15})`,
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2 - ring * 0.3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
            
            {/* Center Paw */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            >
              <HoloLogo size={32} withText={false} monochrome />
            </motion.div>
          </div>
        </motion.div>

        {/* Loading Messages */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            Finding Your Perfect Match...
          </h2>
          
          <motion.p 
            className="text-white/80"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Our AI is working its magic ✨
          </motion.p>
        </motion.div>

        {/* Loading Progress */}
        <motion.div
          className="mt-8 w-64 mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="glass-light rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute -top-4 -right-4"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1] 
          }}
          transition={{ 
            rotate: { duration: 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity }
          }}
        >
          <div className="w-12 h-12 glass-light rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        <motion.div
          className="absolute -bottom-4 -left-4"
          animate={{ 
            rotate: -360,
            y: [0, -10, 0] 
          }}
          transition={{ 
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="w-10 h-10 glass-light rounded-full flex items-center justify-center">
            <HeartIcon className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
