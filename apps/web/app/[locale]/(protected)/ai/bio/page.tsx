'use client';

import React from 'react';
import { BioGenerator } from '@/components/AI/BioGenerator';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, SparklesIcon, BeakerIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { SPRING_CONFIG, PREMIUM_VARIANTS } from '@/constants/animations';

export default function AiBioPage() {
  return (
    <div className="min-h-screen bg-mesh-gradient">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_CONFIG}
        className="glass-light shadow-premium sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ x: -5 }}
              transition={SPRING_CONFIG}
            >
              <Link
                href="/dashboard"
                className="flex items-center text-white hover:text-white/80 transition-colors font-medium"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center gap-2 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(255, 255, 255, 0.3)",
                    "0 0 30px rgba(255, 255, 255, 0.5)",
                    "0 0 20px rgba(255, 255, 255, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <BeakerIcon className="h-4 w-4" />
                AI-Powered Feature
              </motion.div>
              
              <motion.div
                className="flex items-center gap-2 bg-yellow-400/90 text-yellow-900 px-4 py-2 rounded-full text-sm font-bold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <SparklesIcon className="h-4 w-4" />
                Premium
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Content */}
      <motion.div 
        className="py-12"
        variants={PREMIUM_VARIANTS.fadeInUp}
        initial="initial"
        animate="animate"
      >
        <BioGenerator />
      </motion.div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-lg mb-2">Match Optimization</h3>
            <p className="text-gray-600 text-sm">
              AI-generated bios increase match rates by up to 73% based on our analysis of successful profiles.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="font-bold text-lg mb-2">Smart Suggestions</h3>
            <p className="text-gray-600 text-sm">
              Our AI learns from millions of pet profiles to suggest the perfect words for your furry friend.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-lg">
            <div className="text-4xl mb-3">📸</div>
            <h3 className="font-bold text-lg mb-2">Photo Intelligence</h3>
            <p className="text-gray-600 text-sm">
              Upload a photo and let AI analyze breed, age, and personality traits automatically.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
